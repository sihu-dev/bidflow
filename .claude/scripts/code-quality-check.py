#!/usr/bin/env python3
"""
BIDFLOW PostToolUse Hook - 코드 품질 검사
Write/Edit 도구 실행 후 자동으로 코드 품질을 검사합니다.
"""
import json
import sys
import os
import re
import subprocess
from pathlib import Path

# ANSI 색상 코드
RED = '\033[91m'
YELLOW = '\033[93m'
GREEN = '\033[92m'
RESET = '\033[0m'

def log_error(msg: str):
    print(f"{RED}[ERROR]{RESET} {msg}", file=sys.stderr)

def log_warning(msg: str):
    print(f"{YELLOW}[WARNING]{RESET} {msg}", file=sys.stderr)

def log_success(msg: str):
    print(f"{GREEN}[OK]{RESET} {msg}", file=sys.stderr)


class CodeQualityChecker:
    """코드 품질 검사기"""

    # 보안 위험 패턴
    SECURITY_PATTERNS = {
        r'(?i)(api_key|apiKey|api_secret|password|passwd|secret|token)\s*[=:]\s*["\'][^\s"\']{8,}["\']':
            '하드코딩된 자격증명 발견',
        r'eval\s*\(':
            '위험한 eval() 사용',
        r'dangerouslySetInnerHTML':
            'XSS 취약점 가능성 (dangerouslySetInnerHTML)',
        r'innerHTML\s*=':
            'XSS 취약점 가능성 (innerHTML)',
        r'exec\s*\(|execSync\s*\(':
            '명령 인젝션 위험 (exec)',
        r'child_process':
            '쉘 명령 실행 코드 발견',
    }

    # 코드 품질 경고 패턴
    QUALITY_PATTERNS = {
        r':\s*any\b':
            'TypeScript any 타입 사용 (unknown 권장)',
        r'console\.(log|warn|error)\(':
            '콘솔 로그 (프로덕션 제거 필요)',
        r'TODO|FIXME|HACK|XXX':
            '미완료 작업 표시 발견',
        r'\.catch\s*\(\s*\)':
            '빈 catch 블록 (에러 처리 필요)',
    }

    # 모노크롬 디자인 위반 패턴 (컬러풀한 Tailwind 클래스)
    COLOR_VIOLATIONS = {
        r'(text|bg|border)-(indigo|purple|blue|green|red|yellow|pink|orange|teal|cyan|emerald|violet|fuchsia|rose|amber|lime|sky)-\d+':
            '모노크롬 디자인 위반 - 컬러풀한 색상 사용'
    }

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.issues = []
        self.warnings = []

    def read_file(self) -> str:
        """파일 읽기"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            log_error(f"파일 읽기 실패: {e}")
            return ""

    def check_security(self, content: str):
        """보안 취약점 검사"""
        for pattern, message in self.SECURITY_PATTERNS.items():
            if re.search(pattern, content):
                self.issues.append(f"[SECURITY] {message}")

    def check_quality(self, content: str):
        """코드 품질 검사"""
        for pattern, message in self.QUALITY_PATTERNS.items():
            matches = re.findall(pattern, content)
            if matches:
                self.warnings.append(f"[QUALITY] {message} ({len(matches)}건)")

    def check_monochrome_design(self, content: str):
        """모노크롬 디자인 시스템 준수 검사"""
        for pattern, message in self.COLOR_VIOLATIONS.items():
            matches = re.findall(pattern, content)
            if matches:
                unique_colors = set(matches)
                self.warnings.append(
                    f"[DESIGN] {message}: {', '.join(str(c) for c in list(unique_colors)[:5])}"
                )

    def run_typecheck(self) -> bool:
        """TypeScript 타입 체크"""
        if not self.file_path.endswith(('.ts', '.tsx')):
            return True

        try:
            result = subprocess.run(
                ['npx', 'tsc', '--noEmit', self.file_path],
                capture_output=True,
                timeout=30,
                cwd=os.path.dirname(self.file_path) or '.'
            )
            if result.returncode != 0:
                self.issues.append(f"[TYPECHECK] TypeScript 오류 발견")
                return False
        except subprocess.TimeoutExpired:
            self.warnings.append("[TYPECHECK] 타임아웃")
        except FileNotFoundError:
            pass  # tsc not available
        return True

    def run_lint(self) -> bool:
        """ESLint 실행"""
        if not self.file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
            return True

        try:
            result = subprocess.run(
                ['npx', 'eslint', '--max-warnings', '0', self.file_path],
                capture_output=True,
                timeout=30,
                cwd=os.path.dirname(self.file_path) or '.'
            )
            if result.returncode != 0:
                self.warnings.append("[LINT] ESLint 경고/오류 발견")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return True

    def run(self) -> tuple[list, list]:
        """전체 검사 실행"""
        content = self.read_file()
        if not content:
            return [], []

        # 패턴 기반 검사
        self.check_security(content)
        self.check_quality(content)

        # TSX/JSX 파일만 디자인 검사
        if self.file_path.endswith(('.tsx', '.jsx')):
            self.check_monochrome_design(content)

        return self.issues, self.warnings


def main():
    """메인 함수"""
    try:
        # Hook 입력 읽기
        input_data = json.load(sys.stdin)

        # 도구 정보 추출
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        file_path = tool_input.get('file_path', '')

        # Write/Edit 도구만 처리
        if tool_name not in ['Write', 'Edit']:
            sys.exit(0)

        # 파일 경로 확인
        if not file_path or not os.path.exists(file_path):
            sys.exit(0)

        # 코드 파일만 검사
        code_extensions = ('.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go')
        if not file_path.endswith(code_extensions):
            sys.exit(0)

        # 검사 실행
        checker = CodeQualityChecker(file_path)
        issues, warnings = checker.run()

        # 결과 출력
        file_name = os.path.basename(file_path)

        if issues:
            log_error(f"코드 품질 검사 실패: {file_name}")
            for issue in issues:
                log_error(f"  {issue}")
            # Exit code 2 = 블로킹 (Claude에게 수정 요청)
            sys.exit(2)

        if warnings:
            log_warning(f"코드 품질 경고: {file_name}")
            for warning in warnings:
                log_warning(f"  {warning}")
            # Exit code 0 = 경고만 (계속 진행)
        else:
            log_success(f"코드 품질 검사 통과: {file_name}")

        sys.exit(0)

    except json.JSONDecodeError:
        log_error("Hook 입력 파싱 실패")
        sys.exit(1)
    except Exception as e:
        log_error(f"Hook 오류: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
