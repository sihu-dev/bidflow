#!/bin/bash
# ============================================
# FORGE LABS Git Setup Script
# 모든 Claude Code 세션에서 실행
# ============================================

set -e

echo "🔧 FORGE LABS Git Setup Starting..."

# === 1. GPG 서명 비활성화 (Codespaces 호환) ===
git config --global commit.gpgsign false
git config --global tag.gpgsign false
git config --global --unset gpg.program 2>/dev/null || true
git config --local commit.gpgsign false
git config --local tag.gpgsign false
echo "✓ GPG signing disabled"

# === 2. Push/Pull 설정 최적화 ===
git config --global push.default current
git config --global push.autoSetupRemote true
git config --global pull.rebase true
git config --global fetch.prune true
echo "✓ Push/Pull optimized"

# === 3. Core 설정 ===
git config --global core.autocrlf input
git config --global core.editor "code --wait"
git config --global core.pager "less -F -X"
git config --global init.defaultBranch main
echo "✓ Core settings applied"

# === 4. Alias 설정 ===
git config --global alias.st "status --short --branch"
git config --global alias.co "checkout"
git config --global alias.br "branch -vv"
git config --global alias.cm "commit -m"
git config --global alias.lg "log --oneline --graph --decorate -10"
git config --global alias.last "log -1 HEAD --stat"
git config --global alias.unstage "reset HEAD --"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.undo "reset --soft HEAD~1"
git config --global alias.sync "!git fetch origin && git rebase origin/main"
echo "✓ Aliases configured"

# === 5. Diff/Merge 도구 ===
git config --global diff.colorMoved zebra
git config --global merge.conflictstyle diff3
echo "✓ Diff/Merge tools configured"

# === 6. GitHub CLI 확인 ===
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        echo "✓ GitHub CLI authenticated"
    else
        echo "⚠ GitHub CLI not authenticated. Run: gh auth login"
    fi
else
    echo "⚠ GitHub CLI not installed"
fi

# === 7. 연결 테스트 ===
echo ""
echo "🔍 Running connection tests..."
if git fetch origin --dry-run 2>/dev/null; then
    echo "✓ Fetch: OK"
else
    echo "✗ Fetch: FAILED"
fi

if git push --dry-run 2>/dev/null; then
    echo "✓ Push: OK"
else
    echo "✗ Push: FAILED"
fi

echo ""
echo "✅ FORGE LABS Git Setup Complete!"
echo ""
echo "Current configuration:"
echo "  User: $(git config user.name) <$(git config user.email)>"
echo "  Remote: $(git remote get-url origin)"
echo "  Branch: $(git branch --show-current)"
