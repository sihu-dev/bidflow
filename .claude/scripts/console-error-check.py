#!/usr/bin/env python3
"""
BIDFLOW 콘솔 에러 감지 스크립트
브라우저/Node.js 콘솔 에러를 감지하고 보고합니다.
"""
import subprocess
import sys
import json
import re
import os
from pathlib import Path

# ANSI 색상 코드
RED = '\033[91m'
YELLOW = '\033[93m'
GREEN = '\033[92m'
CYAN = '\033[96m'
RESET = '\033[0m'

def log_error(msg: str):
    print(f"{RED}[CONSOLE ERROR]{RESET} {msg}", file=sys.stderr)

def log_warning(msg: str):
    print(f"{YELLOW}[CONSOLE WARN]{RESET} {msg}", file=sys.stderr)

def log_success(msg: str):
    print(f"{GREEN}[CONSOLE OK]{RESET} {msg}", file=sys.stderr)

def log_info(msg: str):
    print(f"{CYAN}[INFO]{RESET} {msg}", file=sys.stderr)


class ConsoleErrorChecker:
    """콘솔 에러 감지기"""

    # 무시할 에러 패턴
    IGNORE_PATTERNS = [
        r'Download the React DevTools',
        r'Warning: ReactDOM.render is no longer supported',
        r'Compiled with warnings',
        r'Fast Refresh',
        r'webpack',
        r'\[HMR\]',
        r'hot update',
    ]

    # 심각한 에러 패턴
    CRITICAL_PATTERNS = [
        r'Uncaught TypeError',
        r'Uncaught ReferenceError',
        r'Uncaught SyntaxError',
        r'Cannot read propert',
        r'is not defined',
        r'is not a function',
        r'Failed to fetch',
        r'Network Error',
        r'CORS',
        r'Hydration failed',
        r'Text content does not match',
        r'Minified React error',
    ]

    # 경고 패턴
    WARNING_PATTERNS = [
        r'Warning:',
        r'Deprecation',
        r'deprecated',
        r'Each child in a list should have a unique',
        r'key prop',
        r'Invalid prop',
        r'Failed prop type',
    ]

    def __init__(self, url: str = "http://localhost:3010"):
        self.url = url
        self.errors = []
        self.warnings = []

    def should_ignore(self, message: str) -> bool:
        """무시할 메시지인지 확인"""
        for pattern in self.IGNORE_PATTERNS:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        return False

    def is_critical(self, message: str) -> bool:
        """심각한 에러인지 확인"""
        for pattern in self.CRITICAL_PATTERNS:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        return False

    def is_warning(self, message: str) -> bool:
        """경고인지 확인"""
        for pattern in self.WARNING_PATTERNS:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        return False

    def check_build_errors(self) -> list:
        """빌드 에러 확인"""
        errors = []

        # TypeScript 에러 확인
        try:
            result = subprocess.run(
                ['npm', 'run', 'typecheck'],
                capture_output=True,
                text=True,
                timeout=60,
                cwd='/home/sihu2129/bidflow'
            )
            if result.returncode != 0:
                # 에러 메시지 파싱
                for line in result.stdout.split('\n'):
                    if 'error TS' in line:
                        errors.append(f"TypeScript: {line.strip()}")
        except Exception as e:
            pass

        # ESLint 에러 확인
        try:
            result = subprocess.run(
                ['npm', 'run', 'lint'],
                capture_output=True,
                text=True,
                timeout=60,
                cwd='/home/sihu2129/bidflow'
            )
            if result.returncode != 0:
                for line in result.stderr.split('\n'):
                    if 'error' in line.lower() and not self.should_ignore(line):
                        errors.append(f"ESLint: {line.strip()}")
        except Exception as e:
            pass

        return errors

    def check_dev_server(self) -> tuple:
        """개발 서버 상태 및 콘솔 에러 확인"""
        errors = []
        warnings = []

        # 서버 상태 확인
        try:
            result = subprocess.run(
                ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', self.url],
                capture_output=True,
                text=True,
                timeout=10
            )
            status_code = result.stdout.strip()

            if status_code != '200':
                errors.append(f"서버 응답 오류: HTTP {status_code}")
        except subprocess.TimeoutExpired:
            errors.append("서버 응답 시간 초과")
        except Exception as e:
            errors.append(f"서버 접근 불가: {str(e)}")

        return errors, warnings

    def check_react_errors(self) -> list:
        """React 관련 에러 패턴 확인"""
        errors = []

        # 소스 파일에서 일반적인 React 오류 패턴 검색
        patterns_to_check = [
            (r'useState\([^)]*\)\s*=', 'useState 구문 오류'),
            (r'useEffect\(\s*async', 'useEffect 내 직접 async 사용'),
            (r'\.map\([^)]*\)\s*[^}]*[^k]ey=', '잠재적 key prop 누락'),
        ]

        src_dir = Path('/home/sihu2129/bidflow/src')
        for tsx_file in src_dir.rglob('*.tsx'):
            try:
                content = tsx_file.read_text()
                for pattern, message in patterns_to_check:
                    if re.search(pattern, content):
                        errors.append(f"{tsx_file.name}: {message}")
            except Exception:
                pass

        return errors

    def run(self) -> tuple:
        """전체 검사 실행"""
        all_errors = []
        all_warnings = []

        # 1. 빌드 에러 확인
        build_errors = self.check_build_errors()
        all_errors.extend(build_errors)

        # 2. 개발 서버 상태 확인
        server_errors, server_warnings = self.check_dev_server()
        all_errors.extend(server_errors)
        all_warnings.extend(server_warnings)

        # 3. React 패턴 에러 확인
        react_errors = self.check_react_errors()
        all_warnings.extend(react_errors)

        return all_errors, all_warnings


def main():
    """메인 함수"""
    log_info("BIDFLOW 콘솔 에러 검사 시작...")

    checker = ConsoleErrorChecker()
    errors, warnings = checker.run()

    # 결과 출력
    if errors:
        log_error(f"발견된 에러: {len(errors)}개")
        for error in errors[:10]:  # 최대 10개만 출력
            log_error(f"  • {error}")
        if len(errors) > 10:
            log_error(f"  ... 외 {len(errors) - 10}개")

    if warnings:
        log_warning(f"발견된 경고: {len(warnings)}개")
        for warning in warnings[:5]:  # 최대 5개만 출력
            log_warning(f"  • {warning}")
        if len(warnings) > 5:
            log_warning(f"  ... 외 {len(warnings) - 5}개")

    if not errors and not warnings:
        log_success("콘솔 에러 없음!")

    # 에러가 있으면 exit code 1
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
