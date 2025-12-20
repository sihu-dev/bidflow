#!/bin/bash
# BIDFLOW Quality Check Script
# 자가 개선 루프에서 사용되는 품질 검사 스크립트

set -e

echo "=========================================="
echo "  BIDFLOW Quality Check"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. TypeScript Check
echo -e "${YELLOW}[1/4] TypeScript 타입 체크...${NC}"
if npm run typecheck 2>&1; then
    echo -e "${GREEN}  ✓ TypeScript 타입 체크 통과${NC}"
else
    echo -e "${RED}  ✗ TypeScript 오류 발견${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. ESLint Check
echo -e "${YELLOW}[2/4] ESLint 검사...${NC}"
if npm run lint 2>&1; then
    echo -e "${GREEN}  ✓ ESLint 검사 통과${NC}"
else
    echo -e "${RED}  ✗ ESLint 오류 발견${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Build Check (optional, comment out for speed)
echo -e "${YELLOW}[3/4] 빌드 테스트 (스킵)...${NC}"
# if npm run build 2>&1; then
#     echo -e "${GREEN}  ✓ 빌드 성공${NC}"
# else
#     echo -e "${RED}  ✗ 빌드 실패${NC}"
#     ERRORS=$((ERRORS + 1))
# fi
echo -e "${GREEN}  ⊘ 스킵됨 (속도 향상)${NC}"
echo ""

# 4. Test Check (if tests exist)
echo -e "${YELLOW}[4/4] 테스트 실행...${NC}"
if [ -f "vitest.config.ts" ] || [ -f "jest.config.js" ]; then
    if npm run test 2>&1; then
        echo -e "${GREEN}  ✓ 테스트 통과${NC}"
    else
        echo -e "${RED}  ✗ 테스트 실패${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${GREEN}  ⊘ 테스트 설정 없음 (스킵)${NC}"
fi
echo ""

# Summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}  모든 품질 검사 통과! ✓${NC}"
    exit 0
else
    echo -e "${RED}  $ERRORS개 오류 발견${NC}"
    exit 1
fi
