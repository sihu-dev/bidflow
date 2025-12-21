#!/usr/bin/env python3
"""
BIDFLOW Pre-commit Security Check Script

보안 취약점 패턴 탐지 및 시크릿 노출 검사
커밋 전 자동 실행되어 보안 위험을 사전 차단

Usage:
    python3 .claude/scripts/security-check.py [--strict] [--path PATH]
"""

import os
import re
import sys
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict

# 검사 대상 디렉토리
TARGET_DIRS = ["src", "app", "lib", "components", "pages", "api"]

# 검사 제외 패턴
EXCLUDE_PATTERNS = [
    r"node_modules",
    r"\.next",
    r"\.git",
    r"dist",
    r"build",
    r"coverage",
    r"__pycache__",
    r"\.env\.example",
    r"\.sample\.",
]

# 시크릿 패턴 (하드코딩된 비밀 탐지)
SECRET_PATTERNS = [
    # API 키 패턴
    (r'["\']?(?:api[_-]?key|apikey)["\']?\s*[:=]\s*["\'][a-zA-Z0-9_\-]{20,}["\']', "API_KEY"),
    (r'["\']?(?:secret[_-]?key|secretkey)["\']?\s*[:=]\s*["\'][a-zA-Z0-9_\-]{20,}["\']', "SECRET_KEY"),

    # Supabase 패턴
    (r'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*', "JWT_TOKEN"),
    (r'sb[a-zA-Z0-9_-]{20,}', "SUPABASE_KEY"),

    # 비밀번호 패턴
    (r'["\']?password["\']?\s*[:=]\s*["\'][^"\']{8,}["\']', "PASSWORD"),
    (r'["\']?passwd["\']?\s*[:=]\s*["\'][^"\']{8,}["\']', "PASSWORD"),

    # AWS 패턴
    (r'AKIA[0-9A-Z]{16}', "AWS_ACCESS_KEY"),
    (r'["\']?aws[_-]?secret["\']?\s*[:=]\s*["\'][a-zA-Z0-9/+=]{40}["\']', "AWS_SECRET"),

    # Private Key 패턴
    (r'-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----', "PRIVATE_KEY"),
    (r'-----BEGIN OPENSSH PRIVATE KEY-----', "SSH_KEY"),

    # Generic Secret 패턴
    (r'["\']?(?:client[_-]?secret|auth[_-]?token)["\']?\s*[:=]\s*["\'][a-zA-Z0-9_\-]{20,}["\']', "CLIENT_SECRET"),
]

# 취약점 패턴 (OWASP Top 10)
VULNERABILITY_PATTERNS = [
    # SQL Injection
    (r'\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)', "SQL_INJECTION", "HIGH"),
    (r'`.*\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)`', "SQL_INJECTION", "HIGH"),

    # XSS
    (r'dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*[^}]*\}', "XSS_RISK", "MEDIUM"),
    (r'innerHTML\s*=\s*[^;]+', "XSS_RISK", "MEDIUM"),

    # Command Injection
    (r'exec\s*\(\s*[`"\'][^`"\']*\$\{', "COMMAND_INJECTION", "HIGH"),
    (r'spawn\s*\(\s*[`"\'][^`"\']*\$\{', "COMMAND_INJECTION", "HIGH"),

    # Path Traversal
    (r'\.\./', "PATH_TRAVERSAL", "MEDIUM"),
    (r'path\.join\s*\([^)]*req\.(params|query|body)', "PATH_TRAVERSAL", "MEDIUM"),

    # Hardcoded Credentials
    (r'(?:mongodb|postgres|mysql)://[^:]+:[^@]+@', "HARDCODED_DB_CREDS", "HIGH"),

    # Insecure Randomness
    (r'Math\.random\s*\(\s*\)', "INSECURE_RANDOM", "LOW"),

    # eval usage
    (r'\beval\s*\(', "EVAL_USAGE", "HIGH"),

    # Prototype Pollution
    (r'Object\.assign\s*\(\s*\{\s*\}\s*,\s*(?:req|user|data)', "PROTOTYPE_POLLUTION", "MEDIUM"),
]

# 안전하지 않은 패턴 (경고 수준)
WARNING_PATTERNS = [
    (r'console\.log\s*\(', "CONSOLE_LOG", "커밋 전 console.log 제거 권장"),
    (r'TODO|FIXME|HACK|XXX', "TODO_COMMENT", "미완성 코드 확인 필요"),
    (r'debugger\s*;?', "DEBUGGER", "디버거 문 제거 필요"),
    (r'\/\/\s*@ts-ignore', "TS_IGNORE", "타입 오류 해결 권장"),
    (r'any\s*[;,\)]', "ANY_TYPE", "any 타입 사용 최소화"),
]


class SecurityChecker:
    def __init__(self, root_path: str = ".", strict: bool = False):
        self.root_path = Path(root_path)
        self.strict = strict
        self.findings: Dict[str, List[Tuple[str, int, str, str]]] = {
            "CRITICAL": [],
            "HIGH": [],
            "MEDIUM": [],
            "LOW": [],
            "WARNING": [],
        }

    def should_exclude(self, file_path: str) -> bool:
        """제외 패턴에 해당하는지 확인"""
        for pattern in EXCLUDE_PATTERNS:
            if re.search(pattern, file_path):
                return True
        return False

    def scan_file(self, file_path: Path) -> None:
        """단일 파일 스캔"""
        if self.should_exclude(str(file_path)):
            return

        # TypeScript/JavaScript 파일만 검사
        if file_path.suffix not in [".ts", ".tsx", ".js", ".jsx", ".mjs"]:
            return

        try:
            content = file_path.read_text(encoding="utf-8")
            lines = content.split("\n")

            # 시크릿 패턴 검사
            for pattern, secret_type in SECRET_PATTERNS:
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line, re.IGNORECASE):
                        # .env.example 등 예시 파일 제외
                        if "example" in str(file_path).lower():
                            continue
                        self.findings["CRITICAL"].append(
                            (str(file_path), i, secret_type, line.strip()[:100])
                        )

            # 취약점 패턴 검사
            for pattern, vuln_type, severity in VULNERABILITY_PATTERNS:
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line, re.IGNORECASE):
                        self.findings[severity].append(
                            (str(file_path), i, vuln_type, line.strip()[:100])
                        )

            # 경고 패턴 검사 (strict 모드에서만)
            if self.strict:
                for pattern, warn_type, message in WARNING_PATTERNS:
                    for i, line in enumerate(lines, 1):
                        if re.search(pattern, line, re.IGNORECASE):
                            self.findings["WARNING"].append(
                                (str(file_path), i, warn_type, message)
                            )

        except Exception as e:
            print(f"⚠ 파일 읽기 실패: {file_path} - {e}", file=sys.stderr)

    def scan_directory(self) -> None:
        """디렉토리 전체 스캔"""
        for target_dir in TARGET_DIRS:
            dir_path = self.root_path / target_dir
            if dir_path.exists():
                for file_path in dir_path.rglob("*"):
                    if file_path.is_file():
                        self.scan_file(file_path)

    def check_env_files(self) -> None:
        """환경 변수 파일 노출 검사"""
        env_files = [".env", ".env.local", ".env.production"]
        for env_file in env_files:
            env_path = self.root_path / env_file
            if env_path.exists():
                # Git에 추가되어 있는지 확인
                result = subprocess.run(
                    ["git", "ls-files", env_file],
                    capture_output=True,
                    text=True,
                    cwd=self.root_path
                )
                if result.stdout.strip():
                    self.findings["CRITICAL"].append(
                        (env_file, 0, "ENV_FILE_TRACKED",
                         f"{env_file}가 Git에 추가됨 - 즉시 제거 필요!")
                    )

    def check_npm_audit(self) -> None:
        """npm audit 실행 (moderate 이상)"""
        try:
            result = subprocess.run(
                ["npm", "audit", "--audit-level=moderate", "--json"],
                capture_output=True,
                text=True,
                cwd=self.root_path,
                timeout=60
            )
            if result.returncode != 0:
                # 취약점 발견
                self.findings["WARNING"].append(
                    ("package.json", 0, "NPM_VULNERABILITY",
                     "npm audit에서 취약점 발견 - npm audit fix 실행 권장")
                )
        except subprocess.TimeoutExpired:
            pass
        except FileNotFoundError:
            pass

    def print_report(self) -> bool:
        """보고서 출력 및 결과 반환"""
        print("\n" + "=" * 60)
        print("🔒 BIDFLOW 보안 검사 보고서")
        print("=" * 60 + "\n")

        has_critical = False
        has_high = False

        # CRITICAL 출력
        if self.findings["CRITICAL"]:
            has_critical = True
            print("🔴 CRITICAL (즉시 수정 필요):")
            print("-" * 40)
            for file, line, issue_type, detail in self.findings["CRITICAL"]:
                print(f"  [{issue_type}] {file}:{line}")
                print(f"    → {detail[:80]}...")
            print()

        # HIGH 출력
        if self.findings["HIGH"]:
            has_high = True
            print("🟠 HIGH (수정 필요):")
            print("-" * 40)
            for file, line, issue_type, detail in self.findings["HIGH"]:
                print(f"  [{issue_type}] {file}:{line}")
                print(f"    → {detail[:80]}...")
            print()

        # MEDIUM 출력
        if self.findings["MEDIUM"]:
            print("🟡 MEDIUM (검토 권장):")
            print("-" * 40)
            for file, line, issue_type, detail in self.findings["MEDIUM"][:5]:
                print(f"  [{issue_type}] {file}:{line}")
            if len(self.findings["MEDIUM"]) > 5:
                print(f"  ... 외 {len(self.findings['MEDIUM']) - 5}건")
            print()

        # LOW/WARNING 출력 (strict 모드)
        if self.strict and (self.findings["LOW"] or self.findings["WARNING"]):
            print("🟢 LOW/WARNING:")
            print("-" * 40)
            all_low = self.findings["LOW"] + self.findings["WARNING"]
            for file, line, issue_type, detail in all_low[:3]:
                print(f"  [{issue_type}] {file}:{line}")
            if len(all_low) > 3:
                print(f"  ... 외 {len(all_low) - 3}건")
            print()

        # 요약
        total = sum(len(v) for v in self.findings.values())
        print("=" * 60)
        print(f"총 발견: {total}건")
        print(f"  CRITICAL: {len(self.findings['CRITICAL'])}건")
        print(f"  HIGH: {len(self.findings['HIGH'])}건")
        print(f"  MEDIUM: {len(self.findings['MEDIUM'])}건")
        print(f"  LOW: {len(self.findings['LOW'])}건")
        print(f"  WARNING: {len(self.findings['WARNING'])}건")
        print("=" * 60)

        if has_critical:
            print("\n❌ CRITICAL 이슈로 인해 커밋이 차단됩니다.")
            print("   시크릿이 노출되었거나 심각한 보안 취약점이 있습니다.")
            return False
        elif has_high and self.strict:
            print("\n⚠ HIGH 이슈 발견 (strict 모드)")
            print("   --no-strict 옵션으로 경고만 표시할 수 있습니다.")
            return False
        else:
            print("\n✅ 보안 검사 통과")
            return True


def main():
    import argparse

    parser = argparse.ArgumentParser(description="BIDFLOW 보안 검사")
    parser.add_argument("--strict", action="store_true", help="엄격 모드 (경고도 차단)")
    parser.add_argument("--path", default=".", help="검사 경로")
    parser.add_argument("--skip-npm", action="store_true", help="npm audit 건너뛰기")

    args = parser.parse_args()

    checker = SecurityChecker(root_path=args.path, strict=args.strict)

    print("🔍 보안 검사 시작...")

    # 디렉토리 스캔
    checker.scan_directory()

    # 환경 파일 검사
    checker.check_env_files()

    # npm audit (선택적)
    if not args.skip_npm:
        checker.check_npm_audit()

    # 결과 출력
    passed = checker.print_report()

    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
