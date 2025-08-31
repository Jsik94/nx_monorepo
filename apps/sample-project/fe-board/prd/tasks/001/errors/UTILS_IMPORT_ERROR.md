# @/utils Import 에러 해결 가이드

## 📋 에러 발생 상황

### 🔍 언제 발생했나?
shadcn/ui sidebar 컴포넌트를 설치한 직후, 개발 서버를 시작했을 때 발생했습니다.

### 🚨 에러 메시지
```
Pre-transform error: Failed to resolve import "@/utils" from "src/components/ui/tooltip.tsx". Does the file exist?
Plugin: vite:import-analysis
File: /home/jsik94/project/monorepo/apps/sample-project/fe-board/src/components/ui/tooltip.tsx:4:19
```

### 💡 에러 발생 원인
1. **상황**: `pnpm dlx shadcn@latest add sidebar` 명령어로 sidebar 관련 컴포넌트들을 설치
2. **문제**: shadcn/ui가 생성한 `tooltip.tsx`, `sheet.tsx` 등의 컴포넌트들이 `@/utils`에서 `cn` 함수를 import하려고 함
3. **원인**: 기존에 `src/utils/cn.ts` 파일은 있지만, components.json에서 utils 경로가 올바르게 설정되지 않음
4. **결과**: Vite가 `@/utils` 경로를 해석하지 못해서 빌드 실패

### 🔧 에러 상황 재현 방법
1. shadcn/ui 컴포넌트를 새로 설치할 때
2. `@/utils` alias가 제대로 설정되지 않은 상태에서
3. `cn` 함수를 import하는 컴포넌트를 사용할 때

## 🛠️ 해결 방법

### 1단계: 현재 utils 파일 구조 확인
기존에 생성된 파일:
- `src/utils/cn.ts` ✅ 존재

### 2단계: components.json 수정
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils/cn"  // ← 이 부분을 수정
  }
}
```

### 3단계: 또는 utils/index.ts 생성
```typescript
// src/utils/index.ts
export * from './cn';
```

## 🔄 적용된 해결책

`src/utils/index.ts` 파일을 생성하여 모든 유틸리티 함수를 export했습니다:

```typescript
// src/utils/index.ts
export * from './cn';
```

이를 통해 shadcn/ui 컴포넌트들이 `@/utils`에서 `cn` 함수를 정상적으로 import할 수 있게 되었습니다.

## 📝 교훈 및 예방법

### 🎯 왜 이런 일이 발생했나?
1. **shadcn/ui의 기본 설정**: shadcn/ui는 기본적으로 `@/utils`에서 유틸리티를 import하도록 설계됨
2. **프로젝트 구조 차이**: 우리 프로젝트는 `src/utils/cn.ts`로 파일을 생성했지만, shadcn/ui는 `src/utils/index.ts`를 기대
3. **alias 설정 불일치**: components.json의 utils alias가 실제 파일 구조와 맞지 않음

### 🛡️ 향후 예방법
1. **shadcn/ui 초기 설정시**: `npx shadcn@latest init` 명령어로 올바른 구조 생성
2. **alias 일관성**: 모든 설정 파일에서 동일한 경로 alias 사용
3. **index 파일 활용**: utils 폴더에 index.ts를 만들어 모든 유틸리티 통합 관리

### ⚠️ 비슷한 에러가 발생할 수 있는 상황
- 새로운 shadcn/ui 컴포넌트 추가시
- TypeScript 경로 설정 변경시
- Vite 설정 수정시
- 모노레포 구조에서 경로 충돌시

## 🚀 해결 후 확인사항
1. 개발 서버가 정상적으로 시작되는가?
2. 모든 shadcn/ui 컴포넌트가 오류 없이 로드되는가?
3. 브라우저에서 사이드바가 정상 표시되는가?
4. TypeScript 타입 에러가 없는가?

---

**에러 발생일**: 2024-01-XX  
**해결 완료**: ✅ 완료  
**담당자**: AI Assistant  
**중요도**: 🔴 높음 (앱 실행 불가)  
**해결 방법**: `src/utils/index.ts` 파일 생성
