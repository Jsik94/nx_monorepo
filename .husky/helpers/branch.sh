#!/bin/bash

# 브랜치 감지 및 패턴 매칭 공통함수
# 현재 브랜치명을 가져와서 브랜치 타입을 결정하는 헬퍼 함수들

# 현재 브랜치명 가져오기
get_current_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

# 브랜치 타입 감지 (feature, hotfix, release, develop, main)
get_branch_type() {
    local branch_name="$1"
    
    # 정확한 브랜치명 매칭
    case "$branch_name" in
        "main")
            echo "main"
            ;;
        "master")
            echo "main"  # master도 main으로 처리
            ;;
        "develop")
            echo "develop"
            ;;
        "development")
            echo "develop"  # development도 develop으로 처리
            ;;
        feature/*)
            echo "feature"
            ;;
        feat/*)
            echo "feature"  # feat도 feature로 처리
            ;;
        hotfix/*)
            echo "hotfix"
            ;;
        release/*)
            echo "release"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# (간소화) 브랜치별 규칙 경로는 사용하지 않습니다.

# 브랜치 정보 출력 (디버깅용)
print_branch_info() {
    local current_branch=$(get_current_branch)
    local branch_type=$(get_branch_type "$current_branch")
    
    echo "🌿 현재 브랜치: $current_branch"
    echo "📋 브랜치 타입: $branch_type"
}

# 티켓 번호 검증 함수
validate_ticket_format() {
    local commit_msg="$1"
    local ticket_pattern='\[([A-Z]+\-[0-9]+)\]'
    
    if [[ $commit_msg =~ $ticket_pattern ]]; then
        return 0  # 티켓 번호가 있음
    else
        return 1  # 티켓 번호가 없음
    fi
}

# (간소화) 티켓 요구사항 체크: 모든 브랜치에서 선택(권장)
check_ticket_requirement() {
    local branch_type="$1"
    local commit_msg="$2"
    if validate_ticket_format "$commit_msg"; then
        echo "✅ 티켓 번호가 포함되었습니다."
    else
        echo "💡 티켓 번호는 선택입니다. 예: [PROJ-123]"
    fi
    return 0
}

# 새로운 커밋 메시지 형식 검증
validate_commit_format() {
    local commit_msg="$1"
    
    # 기본 패턴: type(scope): summary [TICKET]
    # (간소화) scope 권장, 티켓 선택
    local basic_pattern="^(feat|fix|refactor|perf|test|docs|chore)\([^)]+\): .{1,100}( \[[A-Z]+\-[0-9]+\])*$"
    
    # Merge 커밋 패턴
    local merge_pattern="^Merge (branch|pull request)"
    
    # Merge 커밋은 허용
    if [[ $commit_msg =~ $merge_pattern ]]; then
        return 0
    fi
    
    # 기본 패턴 검증
    if [[ $commit_msg =~ $basic_pattern ]]; then
        return 0
    else
        return 1
    fi
}

# 스크립트가 직접 실행될 때 테스트
if [[ "$0" == *"branch.sh"* ]]; then
    echo "=== 브랜치 헬퍼 테스트 ==="
    print_branch_info
    
    echo ""
    echo "=== 커밋 메시지 형식 테스트 ==="
    test_messages=(
        "feat(user-api): 사용자 로그인 기능 추가 [PROJ-123]"
        "fix(auth-service): 인증 오류 수정"
        "docs(readme): 설치 가이드 업데이트 [PROJ-456][PROJ-789]"
        "invalid message"
    )
    
    for msg in "${test_messages[@]}"; do
        echo "메시지: $msg"
        if validate_commit_format "$msg"; then
            echo "  ✅ 형식 유효"
        else
            echo "  ❌ 형식 무효"
        fi
        
        if validate_ticket_format "$msg"; then
            echo "  ✅ 티켓 포함"
        else
            echo "  ❌ 티켓 없음"
        fi
        echo ""
    done
fi
