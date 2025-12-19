#!/bin/bash
# BIDFLOW Session Start Hook

# Set environment variables
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export PROJECT_NAME=BIDFLOW' >> "$CLAUDE_ENV_FILE"
  echo 'export PROJECT_TYPE=bid-automation' >> "$CLAUDE_ENV_FILE"
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
fi

# Output context for Claude
echo "=== BIDFLOW 입찰 자동화 시스템 ==="
echo "경로: $(pwd)"
echo "Git 브랜치: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "최근 커밋: $(git log -1 --oneline 2>/dev/null || echo 'N/A')"
echo ""
echo "핵심 API:"
echo "- TED (EU 공공입찰)"
echo "- 나라장터 (G2B)"
echo "- SAM.gov (미국)"
echo ""
echo "세션 준비 완료!"

exit 0
