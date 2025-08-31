# shadcn/ui Import 경로 에러 해결 가이드

## 📋 에러 발생 상황

### 🔍 언제 발생했나?
shadcn/ui sidebar 컴포넌트를 설치하고 `@/utils` 에러를 해결한 직후, 개발 서버에서 여전히 import 에러가 발생했습니다.

### 🚨 에러 메시지
```
Internal server error: Failed to resolve import "@/components/hooks/use-mobile" from "src/components/ui/sidebar.tsx". Does the file exist?
Plugin: vite:import-analysis
File: /home/jsik94/project/monorepo/apps/sample-project/fe-board/src/components/ui/sidebar.tsx:6:28
```

### 💡 에러 발생 원인 상세 분석

#### 1. 상황 배경
- `pnpm dlx shadcn@latest add sidebar` 명령어로 sidebar 관련 컴포넌트들을 설치
- shadcn/ui가 자동으로 생성한 `sidebar.tsx` 파일이 기본 템플릿 경로를 사용
- 우리 프로젝트의 실제 폴더 구조와 shadcn 템플릿의 기본 구조가 다름

#### 2. 경로 불일치 문제
**shadcn이 생성한 경로:**
```typescript
import { useIsMobile } from "@/components/hooks/use-mobile"
import { cn } from "@/components/lib/utils"
```

**우리 프로젝트의 실제 구조:**
```
src/
├── hooks/
│   └── use-mobile.tsx      # 실제 위치
├── utils/
│   ├── cn.ts
│   └── index.ts            # 실제 위치
└── components/
    └── ui/
        └── sidebar.tsx
```

#### 3. 왜 이런 차이가 발생했나?
1. **shadcn/ui 기본 템플릿**: `components/hooks/`, `components/lib/` 구조를 가정
2. **우리 프로젝트**: `hooks/`, `utils/` 구조로 설계됨
3. **components.json 설정**: 경로 별칭은 올바르게 설정되었지만, shadcn 템플릿이 다른 구조를 사용

## 🛠️ 해결 방법

### 적용된 해결책
`src/components/ui/sidebar.tsx` 파일의 import 경로를 프로젝트 구조에 맞게 수정:

```typescript
// ❌ shadcn이 생성한 잘못된 경로
import { useIsMobile } from "@/components/hooks/use-mobile"
import { cn } from "@/components/lib/utils"

// ✅ 올바른 경로로 수정
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils"
```

### 확인한 파일 구조
```
✅ src/hooks/use-mobile.tsx              # useIsMobile 훅
✅ src/utils/cn.ts                       # cn 함수
✅ src/utils/index.ts                    # utils export
✅ src/components/ui/sidebar.tsx         # 수정된 sidebar
```

## 🎯 근본 원인 및 교훈

### 🔍 왜 이런 일이 발생했나?

#### 1. shadcn/ui 설치 프로세스의 한계
- shadcn CLI는 프로젝트별 폴더 구조를 완전히 인식하지 못함
- 기본 템플릿 구조(`components/hooks/`, `components/lib/`)를 그대로 사용
- components.json의 aliases 설정만으로는 템플릿 내 세부 경로까지 자동 조정되지 않음

#### 2. 모노레포 환경의 복잡성
- Nx 모노레포 환경에서 경로 해석이 더 복잡함
- 프로젝트마다 다른 폴더 구조를 가질 수 있음
- shadcn/ui가 일반적인 단일 프로젝트 구조를 가정

#### 3. 설정 파일 간의 불일치
```json
// components.json - 올바른 설정
"aliases": {
  "components": "@/components",
  "utils": "@/utils"
}

// 하지만 shadcn 템플릿은 여전히 @/components/lib/utils 사용
```

### 📚 향후 예방법

#### 1. shadcn 컴포넌트 설치 후 체크리스트
- [ ] 새로 설치된 컴포넌트의 import 경로 확인
- [ ] `@/components/hooks/` → `@/hooks/` 경로 수정
- [ ] `@/components/lib/` → `@/utils` 경로 수정
- [ ] TypeScript 에러 및 빌드 에러 확인

#### 2. 프로젝트 초기 설정시 주의사항
```bash
# 1. shadcn init으로 components.json 생성
pnpm dlx shadcn@latest init

# 2. components.json의 aliases 확인 및 수정
# 3. 첫 번째 컴포넌트 설치 후 경로 패턴 확인
# 4. 필요시 일괄 경로 수정
```

#### 3. 일괄 경로 수정 방법
```bash
# 모든 UI 컴포넌트에서 경로 일괄 수정
find src/components/ui -name "*.tsx" -exec sed -i 's/@\/components\/hooks/@\/hooks/g' {} \;
find src/components/ui -name "*.tsx" -exec sed -i 's/@\/components\/lib\/utils/@\/utils/g' {} \;
```

## 🔍 비슷한 에러가 발생할 수 있는 상황

### 1. 새로운 shadcn 컴포넌트 추가시
```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
```
→ 각 컴포넌트마다 import 경로 확인 필요

### 2. 프로젝트 구조 변경시
- `hooks/` 폴더를 `lib/hooks/`로 이동
- `utils/` 폴더를 `lib/utils/`로 이동
→ components.json과 모든 import 경로 동기화 필요

### 3. 모노레포에서 프로젝트 복사시
- 다른 프로젝트의 shadcn 컴포넌트를 복사
- 프로젝트별로 다른 폴더 구조 사용
→ 경로 재확인 및 수정 필요

## ✅ 해결 후 확인사항

1. **개발 서버 정상 시작**: `pnpm nx serve fe-board`
2. **TypeScript 에러 없음**: VSCode에서 빨간줄 없음
3. **브라우저 로딩 성공**: 사이드바 정상 표시
4. **모든 기능 동작**: 사이드바 토글, 메뉴 클릭 등

## 🚀 추가 개선사항

### 1. eslint 규칙 추가
```json
// .eslintrc.json
{
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./src/components/ui/**/*",
            "from": "./src/components/hooks/**/*",
            "message": "Use @/hooks instead of @/components/hooks"
          }
        ]
      }
    ]
  }
}
```

### 2. 프로젝트 문서화
```markdown
# 프로젝트 폴더 구조

src/
├── hooks/          # Custom React hooks
├── utils/          # Utility functions (cn, etc.)
├── components/
│   ├── ui/         # shadcn/ui components
│   └── layout/     # Layout components
└── ...

# shadcn 컴포넌트 추가시 주의사항
- import 경로 확인: @/hooks, @/utils 사용
- components.json aliases와 일치시키기
```

---

**에러 발생일**: 2024-01-XX  
**해결 완료**: ✅ 완료  
**담당자**: AI Assistant  
**중요도**: 🔴 높음 (앱 실행 불가)  
**해결 방법**: sidebar.tsx import 경로 수정  
**예방책**: shadcn 컴포넌트 설치 후 경로 체크리스트 적용
