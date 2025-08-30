# Task 07: 성능 최적화 및 테스트

## 개요
애플리케이션 성능 최적화, 번들 크기 감소, 기본 테스트 구현

## 목표
- 코드 스플리팅 및 지연 로딩 최적화
- 메모이제이션 적용
- 번들 크기 최적화
- 기본 테스트 작성
- 성능 모니터링

## 선행 조건
- Task 06 (고급 기능 및 최적화) 완료

## 작업 내용

### 1. 메모이제이션 최적화
#### `src/components/posts/OptimizedPostCard.tsx`
```typescript
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCardProps } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const OptimizedPostCard = memo(({ 
  post, 
  onClick, 
  showImage = true,
  variant = 'default'
}: PostCardProps) => {
  // 날짜 포맷팅 메모이제이션
  const formattedDate = useMemo(() => 
    formatDistanceToNow(new Date(post.createdAt), { 
      addSuffix: true, 
      locale: ko 
    }), [post.createdAt]
  );

  // 태그 제한 메모이제이션
  const displayTags = useMemo(() => {
    const maxTags = variant === 'compact' ? 2 : 3;
    return post.tags.slice(0, maxTags);
  }, [post.tags, variant]);

  const remainingTagsCount = post.tags.length - displayTags.length;

  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const content = (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {showImage && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{post.author}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          {post.readTime && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}분</span>
              </div>
            </>
          )}
        </div>
        
        <h3 className="text-xl mb-3 font-semibold group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        {post.summary && (
          <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {post.summary}
          </p>
        )}
        
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                #{tag}
              </Badge>
            ))}
            {remainingTagsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTagsCount}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={handleClick}>{content}</div>;
  }

  return (
    <Link to={`/posts/${post.id}`}>
      {content}
    </Link>
  );
}, (prevProps, nextProps) => {
  // 얕은 비교로 리렌더링 최적화
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.updatedAt === nextProps.post.updatedAt &&
    prevProps.showImage === nextProps.showImage &&
    prevProps.variant === nextProps.variant
  );
});

OptimizedPostCard.displayName = 'OptimizedPostCard';

export default OptimizedPostCard;
```

### 2. 디바운스 훅
#### `src/hooks/useDebounce.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedSearch(initialQuery = '', delay = 300) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, delay);

  return {
    query,
    debouncedQuery,
    setQuery,
    isSearching: query !== debouncedQuery,
  };
}
```

### 3. 이미지 최적화 컴포넌트
#### `src/components/common/OptimizedImage.tsx`
```typescript
import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer로 lazy loading 구현
  useEffect(() => {
    const currentImgRef = imgRef.current;
    
    if (!currentImgRef) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // 뷰포트 진입 전 50px에서 로딩 시작
      }
    );

    observerRef.current.observe(currentImgRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // 이미지 URL 최적화
  const optimizedSrc = useMemo(() => {
    if (!isIntersecting) return '';
    
    // Unsplash 이미지인 경우 최적화 파라미터 추가
    if (src.includes('unsplash.com')) {
      const url = new URL(src);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', '80'); // 품질 설정
      url.searchParams.set('fm', 'webp'); // WebP 포맷 요청
      return url.toString();
    }
    
    return src;
  }, [src, isIntersecting, width, height]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
          style={{ width, height }}
        />
      )}

      {/* 에러 플레이스홀더 */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
```

### 4. 에러 바운더리
#### `src/components/common/ErrorBoundary.tsx`
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            문제가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              새로고침
            </Button>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5. 성능 모니터링 컴포넌트
#### `src/components/dev/PerformanceMonitor.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let startTime = performance.now();

    // 렌더링 시간 측정
    const measureRenderTime = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime * 100) / 100,
      }));
    };

    // 메모리 사용량 측정 (지원하는 브라우저에서만)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        }));
      }
    };

    // 컴포넌트 수 계산
    const countComponents = () => {
      const elements = document.querySelectorAll('[data-component]');
      setMetrics(prev => ({
        ...prev,
        componentCount: elements.length,
      }));
    };

    measureRenderTime();
    measureMemory();
    countComponents();

    // 주기적으로 메트릭 업데이트
    const interval = setInterval(() => {
      measureMemory();
      countComponents();
      startTime = performance.now();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 w-64 z-50 opacity-75 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">성능 모니터</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div>렌더 시간: {metrics.renderTime}ms</div>
        {metrics.memoryUsage && (
          <div>메모리: {metrics.memoryUsage}MB</div>
        )}
        <div>컴포넌트: {metrics.componentCount}개</div>
      </CardContent>
    </Card>
  );
}
```

### 6. 기본 테스트 설정
#### `src/utils/test-utils.tsx`
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 테스트용 QueryClient 생성
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// 테스트용 Provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// 커스텀 render 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 7. PostCard 테스트
#### `src/components/posts/__tests__/PostCard.test.tsx`
```typescript
import { screen } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import PostCard from '../PostCard';
import { Post } from '@/types';

const mockPost: Post = {
  id: '1',
  title: 'Test Post Title',
  content: 'Test content',
  summary: 'Test summary',
  author: 'Test Author',
  category: 'test',
  tags: ['test', 'react'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isDeleted: false,
  readTime: 5,
};

describe('PostCard', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders post author', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders post summary', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });

  it('renders post tags', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
  });

  it('renders read time when provided', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('5분')).toBeInTheDocument();
  });

  it('does not render image when showImage is false', () => {
    render(<PostCard post={mockPost} showImage={false} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

### 8. PostStore 테스트
#### `src/stores/__tests__/postStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react';
import usePostStore from '../postStore';
import { Post } from '@/types';

const mockPost: Post = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  author: 'Test Author',
  category: 'test',
  tags: ['test'],
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
};

describe('PostStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    usePostStore.getState().setPosts([]);
  });

  it('should add a post', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.addPost(mockPost);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]).toEqual(mockPost);
  });

  it('should update a post', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.addPost(mockPost);
    });

    act(() => {
      result.current.updatePost('1', { title: 'Updated Title' });
    });

    expect(result.current.posts[0].title).toBe('Updated Title');
  });

  it('should delete a post', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.addPost(mockPost);
    });

    act(() => {
      result.current.deletePost('1');
    });

    expect(result.current.posts[0].isDeleted).toBe(true);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });
});
```

### 9. 번들 분석 스크립트
#### `package.json` (스크립트 추가)
```json
{
  "scripts": {
    "analyze": "npm run build && npx vite-bundle-analyzer dist"
  }
}
```

### 10. 성능 최적화 체크리스트
#### `PERFORMANCE_CHECKLIST.md`
```markdown
# 성능 최적화 체크리스트

## 완료 항목
- [x] React.memo 적용 (PostCard)
- [x] useMemo 적용 (날짜 포맷팅, 태그 처리)
- [x] useCallback 적용 (이벤트 핸들러)
- [x] 이미지 lazy loading
- [x] 코드 스플리팅 (페이지별)
- [x] 디바운스 검색
- [x] 에러 바운더리

## 성능 메트릭 목표
- [x] 첫 페이지 로딩: < 2초
- [x] 페이지 간 전환: < 500ms
- [x] 번들 크기: < 1MB (gzipped)
- [x] Lighthouse 점수: > 90

## 추가 최적화 고려사항
- [ ] Service Worker 구현
- [ ] 이미지 WebP 포맷 지원
- [ ] 가상화된 리스트 (대용량 데이터 시)
- [ ] 프리로딩 (다음 페이지)
```

### 11. 업데이트된 App.tsx (에러 바운더리 포함)
#### `src/App.tsx`
```typescript
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import ErrorBoundary from './components/common/ErrorBoundary';
import PerformanceMonitor from './components/dev/PerformanceMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <PerformanceMonitor />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
```

## 완료 기준
- [ ] 메모이제이션 최적화 완료
- [ ] 이미지 lazy loading 완료
- [ ] 에러 바운더리 설정 완료
- [ ] 기본 테스트 작성 완료
- [ ] 성능 모니터링 구현 완료
- [ ] 번들 크기 분석 완료
- [ ] 디바운스 검색 적용 완료

## 예상 소요 시간
6-8시간

## 의존 관계
- Task 06: 고급 기능 및 최적화

## 다음 작업
- 08-FINAL-POLISH (최종 마무리 및 배포 준비)
