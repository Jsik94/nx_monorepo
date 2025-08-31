# Zustand Infinite Loop Error 해결 가이드

## 🐛 발생한 이슈

### 에러 메시지
```
usePostStore.ts:51 Warning: The result of getSnapshot should be cached to avoid an infinite loop
```

```
Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

### 발생 위치
- **파일**: `src/hooks/usePostStore.ts`
- **함수**: `useCategoriesWithCount`
- **컴포넌트**: `Sidebar.tsx`

### 발생 원인
Zustand store의 selector에서 매번 새로운 객체 배열을 생성하여 `getSnapshot`이 계속 변경되면서 무한 리렌더링 발생.

```typescript
// ❌ 문제가 되는 코드
export const useCategoriesWithCount = () => {
  return usePostStore((state) => {
    const posts = state.posts.filter((post) => !post.isDeleted);
    
    return state.categories.map((category) => ({  // 매번 새로운 객체 생성!
      ...category,
      postCount: posts.filter((post) => post.category === category.id).length,
    }));
  });
};
```

## 🔧 해결 방법

### 1단계: useMemo를 사용한 메모이제이션
```typescript
// ✅ 해결된 코드
export const useCategoriesWithCount = () => {
  return usePostStore((state) => {
    const posts = state.posts.filter((post) => !post.isDeleted);
    
    // useMemo 대신 Zustand 내부에서 직접 메모이제이션
    const categoriesKey = state.categories.map(c => c.id).join(',');
    const postsKey = posts.map(p => p.id + p.category).join(',');
    
    // 의존성이 변경되지 않으면 같은 참조 반환
    if (state._categoriesWithCountCache?.key === categoriesKey + postsKey) {
      return state._categoriesWithCountCache.value;
    }
    
    const result = state.categories.map((category) => ({
      ...category,
      postCount: posts.filter((post) => post.category === category.id).length,
    }));
    
    // 캐시 저장 (실제로는 store에 저장하지 않고 컴포넌트 레벨에서 처리)
    return result;
  });
};
```

### 2단계: 더 간단한 해결책 - Selector 최적화
```typescript
// ✅ 권장 해결책: shallow comparison 사용
import { shallow } from 'zustand/shallow';

export const useCategoriesWithCount = () => {
  return usePostStore(
    useCallback((state) => {
      const posts = state.posts.filter((post) => !post.isDeleted);
      
      return state.categories.map((category) => ({
        ...category,
        postCount: posts.filter((post) => post.category === category.id).length,
      }));
    }, []),
    shallow
  );
};
```

### 3단계: 최종 해결책 - Store 내부에 캐시된 값 저장
```typescript
// ✅ 최고의 해결책: store에 computed 값 저장
interface PostStore {
  // ... 기존 필드들
  _computedCategoriesWithCount?: Category[];
  _lastPostsHash?: string;
  _lastCategoriesHash?: string;
}

// store 내부에서 computed 값 관리
const usePostStore = create<PostStore>((set, get) => ({
  // ... 기존 코드
  
  // categories나 posts가 변경될 때마다 computed 값 업데이트
  setPosts: (posts) => {
    set({ posts });
    updateComputedCategories();
  },
  
  setCategories: (categories) => {
    set({ categories });
    updateComputedCategories();
  },
}));

function updateComputedCategories() {
  const state = usePostStore.getState();
  const posts = state.posts.filter((post) => !post.isDeleted);
  
  const categoriesWithCount = state.categories.map((category) => ({
    ...category,
    postCount: posts.filter((post) => post.category === category.id).length,
  }));
  
  usePostStore.setState({ _computedCategoriesWithCount: categoriesWithCount });
}
```

## 🚀 적용된 해결책

모든 Zustand selector 훅들을 useMemo로 메모이제이션 적용:

### 수정된 `usePostStore.ts`
```typescript
import { useMemo } from 'react';
import usePostStore from '@/stores/postStore';

// ✅ 모든 훅들을 useMemo로 메모이제이션
export const usePosts = () => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.filter((post) => !post.isDeleted);
  }, [posts]);
};

export const usePost = (id: string) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.find((post) => post.id === id && !post.isDeleted);
  }, [posts, id]);
};

export const usePostsByCategory = (categoryId: string) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.filter(
      (post) => post.category === categoryId && !post.isDeleted
    );
  }, [posts, categoryId]);
};

export const useRecentPosts = (limit = 5) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts
      .filter((post) => !post.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [posts, limit]);
};

export const usePopularTags = (limit = 10) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    const tagCount = posts
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
  }, [posts, limit]);
};

export const useCategoriesWithCount = () => {
  const categories = usePostStore((state) => state.categories);
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    const activePosts = posts.filter((post) => !post.isDeleted);
    
    return categories.map((category) => ({
      ...category,
      postCount: activePosts.filter((post) => post.category === category.id).length,
    }));
  }, [categories, posts]);
};
```

## 📝 교훈

1. **Zustand Selector 주의사항**: selector에서 새로운 객체/배열을 반환하면 참조가 변경되어 무한 리렌더링 발생
2. **메모이제이션 중요성**: 계산된 값은 의존성이 변경될 때만 재계산되도록 메모이제이션 필요
3. **Store 설계**: computed 값은 store 내부에서 관리하거나, 별도 hook에서 useMemo로 처리

## 🔍 디버깅 팁

1. **React DevTools Profiler**: 무한 리렌더링 패턴 확인
2. **Console 경고**: "getSnapshot should be cached" 경고 주의
3. **의존성 배열**: useMemo, useCallback의 의존성 배열 정확히 설정

## ✅ 검증 방법

1. 브라우저 콘솔에서 경고 메시지 없음 확인
2. React DevTools에서 불필요한 리렌더링 없음 확인
3. 페이지 정상 로딩 및 기능 동작 확인

---

**수정 일시**: 2024-01-XX  
**해결 완료**: ✅  
**담당자**: AI Assistant
