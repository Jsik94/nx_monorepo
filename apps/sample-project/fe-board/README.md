# 📝 Simple React Blog Platform (fe-board)

## 🚀 프로젝트 개요

현대적인 React 생태계 기술을 활용한 **전문적인 블로그 플랫폼**입니다. shadcn/ui 기반의 세련된 UI/UX와 완벽한 반응형 디자인을 제공합니다.

### 🎯 핵심 특징
- **모던 UI/UX**: shadcn/ui 컴포넌트 시스템 기반
- **완벽한 반응형**: 모바일/태블릿/데스크톱 최적화
- **고성능**: 코드 스플리팅, 메모이제이션 등 최적화 적용
- **타입 안전성**: 완전한 TypeScript 지원
- **확장성**: 백엔드 연동을 고려한 아키텍처

## 🛠️ 기술 스택

### Core Framework
```json
{
  "React": "18.3.1",
  "TypeScript": "5.x",
  "Vite": "6.3.5"
}
```

### UI & Styling
```json
{
  "TailwindCSS": "3.x",
  "shadcn/ui": "latest",
  "Lucide React": "icons",
  "class-variance-authority": "variant system"
}
```

### State Management
```json
{
  "Zustand": "4.x (persist + devtools)",
  "TanStack Query": "5.x",
  "LocalStorage": "데이터 영속성"
}
```

### Routing & Navigation
```json
{
  "React Router": "6.x",
  "Lazy Loading": "코드 스플리팅",
  "Path Aliases": "@/* 경로 별칭"
}
```

### Content Processing
```json
{
  "react-markdown": "마크다운 렌더링",
  "remark-gfm": "GitHub Flavored Markdown",
  "react-syntax-highlighter": "코드 문법 하이라이팅",
  "date-fns": "날짜 처리 (한국어 로케일)"
}
```

### Development Tools
```json
{
  "Nx": "모노레포 도구",
  "pnpm": "패키지 매니저",
  "ESLint": "코드 품질",
  "Jest": "테스팅 프레임워크"
}
```

## 📁 프로젝트 구조

```
fe-board/
├── src/
│   ├── components/          # 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   ├── posts/          # 게시글 관련 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   └── app-sidebar.tsx # 메인 사이드바
│   ├── pages/              # 라우트 페이지
│   ├── hooks/              # 커스텀 훅
│   ├── stores/             # Zustand 상태 관리
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   ├── data/               # 샘플 데이터
│   └── router/             # 라우팅 설정
├── prd/                    # 프로젝트 문서
├── public/                 # 정적 자산
└── 설정 파일들...
```

## 🚀 빠른 시작

### 1. 개발 환경 요구사항
- **Node.js**: 18.x 이상
- **pnpm**: 8.x 이상
- **Nx CLI**: 최신 버전

### 2. 설치 및 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 시작 (루트에서)
pnpm nx serve fe-board

# 또는 fe-board 디렉토리에서
cd apps/sample-project/fe-board
pnpm nx serve
```

### 3. 빌드
```bash
# 프로덕션 빌드
pnpm nx build fe-board

# 빌드 미리보기
pnpm nx preview fe-board
```

## 🎨 주요 기능

### ✅ 구현 완료된 기능

#### 📝 게시글 관리
- **CRUD 작업**: 생성, 조회, 수정, 삭제
- **마크다운 지원**: 풍부한 텍스트 편집
- **카테고리 분류**: 체계적인 콘텐츠 정리
- **태그 시스템**: 유연한 분류 체계

#### 🔍 검색 & 필터링
- **전체 텍스트 검색**: 제목, 내용 검색
- **카테고리별 필터링**: 분류별 조회
- **태그 기반 검색**: 관련 콘텐츠 탐색

#### 🎨 사용자 인터페이스
- **접이식 사이드바**: shadcn/ui Sidebar 컴포넌트
- **반응형 드로어**: 모바일 최적화 네비게이션
- **모던 카드 레이아웃**: 직관적인 콘텐츠 표시
- **다크 모드 준비**: shadcn/ui 테마 시스템

#### ⚡ 성능 최적화
- **코드 스플리팅**: React Router lazy loading
- **메모이제이션**: 불필요한 리렌더링 방지
- **상태 관리 최적화**: Zustand selector 최적화
- **이미지 최적화**: lazy loading 준비

## 🔧 설정 파일 설명

### TypeScript 설정
- `tsconfig.json`: 기본 TypeScript 설정
- `tsconfig.app.json`: 애플리케이션용 설정 (@/* 경로 별칭 포함)
- `tsconfig.spec.json`: 테스트용 설정

### 빌드 도구 설정
- `vite.config.ts`: Vite 번들러 설정 (별칭, 플러그인)
- `tailwind.config.js`: TailwindCSS + shadcn/ui 테마 설정
- `postcss.config.js`: CSS 후처리 설정

### 품질 관리
- `eslint.config.mjs`: 코드 품질 규칙
- `jest.config.ts`: 단위 테스트 설정

### UI 컴포넌트
- `components.json`: shadcn/ui CLI 설정

## 🗄️ 데이터 구조

### Post (게시글)
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
```

### Category (카테고리)
```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
}
```

## 🔌 API 연동 준비사항

### 현재 상태 (Local Storage)
```typescript
// 현재: Zustand + LocalStorage
const usePostStore = create(
  persist(
    (set, get) => ({
      posts: [],
      categories: [],
      // ... store logic
    }),
    { name: 'blog-storage' }
  )
);
```

### 향후 백엔드 연동
```typescript
// 향후: TanStack Query + REST API
const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api.getPosts()
  });
};

const useCreatePost = () => {
  return useMutation({
    mutationFn: (post: PostInput) => api.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });
};
```

## 🚀 향후 확장 계획

### Phase 1: 백엔드 연동 (2-4주)
- **REST API 연동**: TanStack Query 활용
- **실시간 데이터**: WebSocket 또는 Server-Sent Events
- **이미지 업로드**: 파일 관리 시스템
- **사용자 인증**: JWT 기반 인증 시스템

### Phase 2: 고급 기능 (1-2개월)
- **댓글 시스템**: 실시간 댓글 및 대댓글
- **소셜 기능**: 좋아요, 공유, 북마크
- **SEO 최적화**: Next.js 마이그레이션 고려
- **PWA 지원**: 오프라인 읽기, 푸시 알림

### Phase 3: 플랫폼 확장 (3개월+)
- **다중 블로그**: 사용자별 블로그 공간
- **협업 기능**: 실시간 공동 편집
- **분석 대시보드**: 조회수, 인기 글 통계
- **다국어 지원**: i18next 국제화

## 📱 반응형 브레이크포인트

```css
/* TailwindCSS 기본 브레이크포인트 */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
2xl: 1536px /* 초대형 화면 */
```

### 반응형 동작
- **< md (768px)**: 모바일 드로어 사이드바
- **≥ md**: 고정 또는 접이식 사이드바
- **카드 레이아웃**: 화면 크기에 따른 자동 조정

## 🛡️ 성능 및 보안

### 성능 최적화
- **Bundle Size**: Vite 트리 쉐이킹
- **Code Splitting**: 라우트별 지연 로딩
- **Memoization**: React.memo, useMemo 활용
- **Image Optimization**: 준비된 lazy loading

### 보안 고려사항
- **XSS 방지**: react-markdown의 sanitize 옵션
- **CSRF 보호**: 향후 API 연동 시 적용
- **Content Security Policy**: 준비된 설정

## 📚 문서 및 가이드

### 프로젝트 문서
- `prd/prd-001-simple-blog-platform.md`: 메인 PRD
- `prd/tasks/001/README.md`: Task 가이드
- `prd/tasks/001/IMPLEMENTATION_SUMMARY.md`: 구현 요약

### 에러 해결 가이드
- `prd/tasks/001/errors/`: 주요 에러 해결 방법
- Zustand 무한루프, import 경로 에러 등

### 업데이트 기록
- `prd/tasks/001/updates/`: 주요 업데이트 내역
- shadcn/ui 마이그레이션, 사이드바 구현 등

## 🤝 기여 가이드

### 개발 워크플로우
1. **브랜치 전략**: feature/기능명 브랜치 생성
2. **커밋 컨벤션**: feat, fix, docs, style, refactor
3. **타입 체크**: `pnpm nx type-check fe-board`
4. **린트 체크**: `pnpm nx lint fe-board`
5. **테스트**: `pnpm nx test fe-board`

### 코드 스타일
- **컴포넌트**: PascalCase, 함수형 컴포넌트
- **훅**: camelCase, use로 시작
- **타입**: PascalCase, Interface 접두사
- **상수**: UPPER_SNAKE_CASE

## 📞 문의 및 지원

### 개발 환경 문제
- Node.js 버전 확인: `node --version`
- pnpm 캐시 정리: `pnpm cache clean`
- Nx 캐시 정리: `pnpm nx reset`

### 자주 발생하는 이슈
1. **Import 경로 오류**: `@/*` 별칭 설정 확인
2. **TailwindCSS 미적용**: postcss.config.js 확인
3. **타입 에러**: tsconfig.json 설정 점검

---

## 🎯 프로젝트 현황

**현재 상태**: ✅ **MVP 완성** (2024-01-XX)  
**다음 단계**: 🚀 **백엔드 연동 준비 중**  
**기술 부채**: 📊 **최소화됨**  
**확장성**: 🔗 **높음**  

**이 프로젝트는 React 생태계의 최신 기술을 활용한 확장 가능한 블로그 플랫폼입니다. 백엔드가 추가되어도 안정적으로 발전할 수 있는 견고한 프론트엔드 기반을 제공합니다.**
