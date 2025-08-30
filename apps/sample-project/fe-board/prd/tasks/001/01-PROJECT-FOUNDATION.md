# Task 01: 프로젝트 기반 구축

## 개요
React 블로그 프로젝트의 기반 구조 설정 및 핵심 인프라 구축

## 목표
- 개발 환경 구성 및 필수 패키지 설치
- TypeScript 타입 정의
- 라우팅 시스템 구축
- 상태 관리 설정

## 선행 조건
- Nx 워크스페이스 구성 완료

## 작업 내용

### 1. 필수 패키지 설치
```bash
# 라우팅 및 상태 관리
pnpm add react-router-dom zustand @tanstack/react-query

# UI 라이브러리
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 폼 관리 및 유효성 검사
pnpm add react-hook-form @hookform/resolvers zod

# 마크다운 및 유틸리티
pnpm add react-markdown remark-gfm rehype-raw rehype-sanitize
pnpm add lucide-react date-fns uuid

# 개발 도구
pnpm add -D @types/uuid @types/react-router-dom

# shadcn/ui 초기 설정
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input badge toast dialog separator textarea select
```

### 2. 프로젝트 폴더 구조
```
src/
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── posts/           # 게시글 관련 컴포넌트
│   └── common/          # 공통 컴포넌트
├── pages/               # 페이지 컴포넌트
├── stores/              # Zustand 스토어
├── hooks/               # 커스텀 훅
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── data/                # 목업 데이터
```

### 3. 핵심 타입 정의
#### `src/types/index.ts`
```typescript
export interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  category?: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  readTime?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  slug: string;
}

export interface PostFormData {
  title: string;
  content: string;
  summary?: string;
  author: string;
  category?: string;
  tags: string[];
  imageUrl?: string;
}

export interface PostCardProps {
  post: Post;
  onClick?: (post: Post) => void;
  showImage?: boolean;
  variant?: 'default' | 'compact';
}

export interface PostStore {
  posts: Post[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### 4. 라우터 설정
#### `src/router/index.tsx`
```typescript
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/components/layout/RootLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 페이지 컴포넌트 지연 로딩
const HomePage = lazy(() => import('@/pages/HomePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const PostCreatePage = lazy(() => import('@/pages/PostCreatePage'));
const PostEditPage = lazy(() => import('@/pages/PostEditPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const withSuspense = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: withSuspense(NotFoundPage)({}),
    children: [
      {
        index: true,
        element: withSuspense(HomePage)({}),
      },
      {
        path: 'posts',
        children: [
          {
            index: true,
            element: withSuspense(HomePage)({}),
          },
          {
            path: 'new',
            element: withSuspense(PostCreatePage)({}),
          },
          {
            path: ':id',
            element: withSuspense(PostDetailPage)({}),
          },
          {
            path: ':id/edit',
            element: withSuspense(PostEditPage)({}),
          },
        ],
      },
      {
        path: 'categories/:categoryId',
        element: withSuspense(CategoryPage)({}),
      },
      {
        path: 'search',
        element: withSuspense(SearchPage)({}),
      },
    ],
  },
]);
```

### 5. Zustand 스토어 설정
#### `src/stores/postStore.ts`
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Post, Category, PostStore } from '@/types';

const usePostStore = create<PostStore>()(
  devtools(
    persist(
      (set, get) => ({
        posts: [],
        categories: [],
        isLoading: false,
        error: null,

        setPosts: (posts) => set({ posts }, false, 'setPosts'),
        
        addPost: (post) => 
          set(
            (state) => ({ 
              posts: [post, ...state.posts],
              error: null 
            }),
            false,
            'addPost'
          ),
        
        updatePost: (id, updates) =>
          set(
            (state) => ({
              posts: state.posts.map((post) =>
                post.id === id ? { ...post, ...updates, updatedAt: new Date() } : post
              ),
              error: null
            }),
            false,
            'updatePost'
          ),
        
        deletePost: (id) =>
          set(
            (state) => ({
              posts: state.posts.map((post) =>
                post.id === id ? { ...post, isDeleted: true } : post
              ),
              error: null
            }),
            false,
            'deletePost'
          ),
        
        setCategories: (categories) => set({ categories }, false, 'setCategories'),
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
      }),
      {
        name: 'post-store',
        partialize: (state) => ({
          posts: state.posts,
          categories: state.categories,
        }),
      }
    ),
    { name: 'PostStore' }
  )
);

export default usePostStore;
```

### 6. 커스텀 훅 생성
#### `src/hooks/usePostStore.ts`
```typescript
import { useMemo } from 'react';
import usePostStore from '@/stores/postStore';

export const usePosts = () => {
  return usePostStore((state) => 
    state.posts.filter((post) => !post.isDeleted)
  );
};

export const usePost = (id: string) => {
  return usePostStore((state) => 
    state.posts.find((post) => post.id === id && !post.isDeleted)
  );
};

export const usePostsByCategory = (categoryId: string) => {
  return usePostStore((state) => 
    state.posts.filter(
      (post) => post.category === categoryId && !post.isDeleted
    )
  );
};

export const useRecentPosts = (limit = 5) => {
  return usePostStore((state) => 
    state.posts
      .filter((post) => !post.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  );
};

export const usePopularTags = (limit = 10) => {
  return usePostStore((state) => {
    const tagCount = state.posts
      .filter((post) => !post.isDeleted)
      .flatMap((post) => post.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  });
};
```

### 7. 기본 레이아웃 컴포넌트
#### `src/components/layout/RootLayout.tsx`
```typescript
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더는 Task 02에서 구현 */}
      <header className="border-b bg-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Simple Blog</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

### 8. 기본 페이지 컴포넌트
#### `src/pages/HomePage.tsx`
```typescript
import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home - Simple Blog</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">최근 게시글</h1>
        <div className="text-center text-muted-foreground">
          게시글 목록이 여기에 표시됩니다. (Task 02에서 구현)
        </div>
      </div>
    </>
  );
}
```

### 9. App.tsx 설정
#### `src/App.tsx`
```typescript
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
```

### 10. 환경 변수 설정
#### `.env.local`
```env
VITE_APP_TITLE=Simple Blog
VITE_APP_DESCRIPTION=Insights, tutorials, and thoughts on modern software development
```

## 완료 기준
- [ ] 모든 필수 패키지 설치 완료
- [ ] shadcn/ui 컴포넌트 설치 완료
- [ ] 폴더 구조 생성 완료
- [ ] 타입 정의 완료
- [ ] 라우터 설정 완료
- [ ] Zustand 스토어 설정 완료
- [ ] 개발 서버 정상 실행 확인
- [ ] 기본 페이지 라우팅 동작 확인

## 예상 소요 시간
4-6시간

## 의존 관계
- 없음 (첫 번째 작업)

## 다음 작업
- 02-CORE-COMPONENTS (핵심 UI 컴포넌트 개발)
