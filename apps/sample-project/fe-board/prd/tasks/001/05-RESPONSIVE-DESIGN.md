# Task 05: 반응형 디자인

## 개요
모바일, 태블릿, 데스크톱 환경에 최적화된 반응형 디자인 구현

## 목표
- 완전한 반응형 레이아웃 구현
- 모바일 네비게이션 최적화
- 터치 인터페이스 최적화
- 접근성 개선

## 선행 조건
- Task 04 (목록 및 검색 기능) 완료

## 작업 내용

### 1. 반응형 브레이크포인트 설정
#### `src/styles/responsive.css`
```css
/* Tailwind CSS 확장 */
@layer utilities {
  /* 컨테이너 반응형 */
  .container-responsive {
    @apply w-full mx-auto px-4 sm:px-6 lg:px-8;
  }

  /* 터치 타겟 최적화 */
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }
  
  /* 스크롤 성능 최적화 */
  .scroll-smooth {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* 안전 영역 대응 */
  .safe-area-inset {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 애니메이션 감소 모드 지원 */
@media (prefers-reduced-motion: reduce) {
  .respect-motion-preference {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .high-contrast {
    @apply border-2 border-black;
  }
}
```

### 2. 모바일 네비게이션 컴포넌트
#### `src/components/layout/MobileNavigation.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Plus, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCategoriesWithCount, usePopularTags } from '@/hooks/usePostStore';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const categories = useCategoriesWithCount();
  const popularTags = usePopularTags(8);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navigationItems = [
    { icon: Home, label: '홈', href: '/' },
    { icon: Search, label: '검색', href: '/search' },
    { icon: Plus, label: '글 작성', href: '/posts/new' },
  ];

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 touch-target">
            <Menu className="w-5 h-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0 safe-area-inset">
          <div className="h-full flex flex-col">
            {/* 헤더 */}
            <SheetHeader className="p-6 border-b">
              <SheetTitle>
                <Link to="/" className="text-xl font-bold">
                  Simple Blog
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* 메뉴 내용 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {/* 주요 네비게이션 */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* 카테고리 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.id}`}
                      className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                    >
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.postCount}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 인기 태그 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">인기 태그</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                    >
                      <Badge 
                        variant="outline" 
                        className="text-xs hover:bg-primary hover:text-primary-foreground touch-target"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### 3. 반응형 PostCard 개선
#### `src/components/posts/ResponsivePostCard.tsx`
```typescript
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCardProps } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ResponsivePostCard({ 
  post, 
  onClick, 
  showImage = true,
  variant = 'default'
}: PostCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const content = (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full">
      {/* 반응형 이미지 */}
      {showImage && (
        <div className="aspect-video sm:aspect-[4/3] lg:aspect-video bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        {/* 메타 정보 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{post.author}</span>
          </div>
          
          <span className="hidden sm:inline">•</span>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="truncate">
              {formatDistanceToNow(new Date(post.createdAt), { 
                addSuffix: true, 
                locale: ko 
              })}
            </span>
          </div>

          {post.readTime && (
            <>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}분</span>
              </div>
            </>
          )}
        </div>
        
        {/* 제목 */}
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2 sm:mb-3 flex-1">
          {post.title}
        </h3>
        
        {/* 요약 (태블릿 이상에서만 표시) */}
        {post.summary && (
          <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 line-clamp-2 lg:line-clamp-3">
            {post.summary}
          </p>
        )}
        
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-auto">
            {post.tags
              .slice(0, 3) // 모바일에서는 최대 3개만 표시
              .map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={handleClick} className="touch-target">{content}</div>;
  }

  return (
    <Link to={`/posts/${post.id}`} className="block h-full touch-target">
      {content}
    </Link>
  );
}
```

### 4. 반응형 그리드 업데이트
#### `src/components/posts/PostGrid.tsx` (기존 파일 수정)
```typescript
import { Post } from '@/types';
import ResponsivePostCard from './ResponsivePostCard';

interface PostGridProps {
  posts: Post[];
  showImages?: boolean;
}

export default function PostGrid({ posts, showImages = true }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          게시글이 없습니다
        </h3>
        <p className="text-gray-600">
          첫 번째 게시글을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {posts.map((post) => (
        <ResponsivePostCard 
          key={post.id} 
          post={post} 
          showImage={showImages}
        />
      ))}
    </div>
  );
}
```

### 5. 모바일 검색바 컴포넌트
#### `src/components/search/MobileSearchBar.tsx`
```typescript
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MobileSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function MobileSearchBar({
  onSearch,
  placeholder = "검색...",
}: MobileSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="p-2 touch-target"
      >
        <Search className="w-5 h-5" />
        <span className="sr-only">검색</span>
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4 py-2 text-base touch-target"
          autoComplete="off"
          autoFocus
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClear}
        className="p-2 touch-target"
      >
        <X className="w-5 h-5" />
        <span className="sr-only">닫기</span>
      </Button>
    </form>
  );
}
```

### 6. 반응형 Header 업데이트
#### `src/components/layout/Header.tsx` (기존 파일 수정)
```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import MobileSearchBar from '@/components/search/MobileSearchBar';
import MobileNavigation from './MobileNavigation';

export default function Header() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b safe-area-inset">
      {/* 모바일 헤더 */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4">
          <MobileNavigation />
          <Link to="/" className="text-xl font-bold">
            Blog
          </Link>
          <MobileSearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 데스크톱 헤더 */}
      <div className="hidden lg:block py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <Link to="/">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 hover:text-primary transition-colors">
              Blog
            </h1>
          </Link>
          <p className="text-lg text-muted-foreground mb-6">
            Insights, tutorials, and thoughts on modern software development
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-80 max-w-md">
              <SearchSuggestions
                onSelect={handleSearch}
                placeholder="Search articles..."
              />
            </div>
            <Button asChild>
              <Link to="/posts/new">
                <Plus className="w-4 h-4 mr-2" />
                Write
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 7. 반응형 Sidebar 업데이트
#### `src/components/layout/Sidebar.tsx` (기존 파일 수정)
```typescript
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCategoriesWithCount, useRecentPosts, usePopularTags } from '@/hooks/usePostStore';
import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Sidebar() {
  const categories = useCategoriesWithCount();
  const recentPosts = useRecentPosts(5);
  const popularTags = usePopularTags(10);

  return (
    <aside className="w-80 bg-white border-l hidden lg:block safe-area-inset">
      <div className="sticky top-0 p-6 max-h-screen overflow-y-auto scroll-smooth">
        <div className="space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors touch-target"
                >
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.postCount}
                  </Badge>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Recent Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="pb-4 border-b border-gray-100 last:border-0">
                  <Link to={`/posts/${post.id}`} className="block group touch-target">
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(post.createdAt), { 
                        addSuffix: true, 
                        locale: ko 
                      })}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge 
                    variant="outline" 
                    className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors touch-target"
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### 8. 반응형 레이아웃 업데이트
#### `src/components/layout/RootLayout.tsx` (기존 파일 수정)
```typescript
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useInitializeData } from '@/hooks/useInitializeData';

export default function RootLayout() {
  useInitializeData();

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <Header />
      <div className="flex">
        <main className="flex-1 w-full lg:max-w-4xl lg:mx-auto px-4 py-6 lg:py-8">
          <Outlet />
        </main>
        <Sidebar />
      </div>
      
      {/* 모바일 하단 여백 */}
      <div className="h-safe-area-inset-bottom lg:hidden" />
    </div>
  );
}
```

### 9. 반응형 PostListContainer 업데이트
#### `src/components/posts/PostListContainer.tsx` (기존 파일 수정)
```typescript
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePostList } from '@/hooks/usePostList';
import PostGrid from './PostGrid';
import PostSortSelector from './PostSortSelector';
import Pagination from '@/components/common/Pagination';

interface PostListContainerProps {
  title?: string;
  category?: string;
  searchQuery?: string;
  showSorting?: boolean;
  showPagination?: boolean;
  limit?: number;
}

export default function PostListContainer({
  title = "최근 게시글",
  category,
  searchQuery,
  showSorting = true,
  showPagination = true,
  limit = 10,
}: PostListContainerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    posts,
    totalPosts,
    pagination,
    sorting,
  } = usePostList({
    category,
    search: searchQuery,
    limit,
    page: parseInt(searchParams.get('page') || '1'),
  });

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    pagination.setPage(page);
  };

  const handleSortChange = (newSortBy: 'createdAt' | 'updatedAt' | 'title') => {
    sorting.setSortBy(newSortBy);
  };

  const handleOrderChange = () => {
    sorting.setSortOrder(sorting.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {totalPosts > 0 && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              총 {totalPosts}개 게시글
            </p>
          )}
        </div>

        {showSorting && totalPosts > 0 && (
          <div className="w-full sm:w-auto">
            <PostSortSelector
              sortBy={sorting.sortBy}
              sortOrder={sorting.sortOrder}
              onSortChange={handleSortChange}
              onOrderChange={handleOrderChange}
            />
          </div>
        )}
      </div>

      <PostGrid posts={posts} />

      {showPagination && totalPosts > limit && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
```

### 10. 반응형 PostForm 업데이트
#### `src/components/editor/PostForm.tsx` (폼 버튼 그룹 부분만 수정)
```typescript
// ... 기존 코드 유지 ...

      {/* 반응형 버튼 그룹 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6 border-t">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="touch-target">
            취소
          </Button>
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSaveDraft(watchedValues)}
              disabled={!isDirty}
              className="touch-target"
            >
              <Save className="w-4 h-4 mr-2" />
              임시저장
            </Button>
          )}
        </div>
        
        <Button type="submit" disabled={isLoading} className="touch-target">
          {isLoading ? (
            '저장 중...'
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              {isEditing ? '수정' : '발행'}
            </>
          )}
        </Button>
      </div>

// ... 기존 코드 유지 ...
```

## 완료 기준
- [ ] 모바일, 태블릿, 데스크톱 완전 대응
- [ ] 터치 인터페이스 최적화 완료
- [ ] 모바일 네비게이션 정상 동작
- [ ] 반응형 그리드 레이아웃 완료
- [ ] 접근성 개선 완료
- [ ] 안전 영역 대응 완료

## 예상 소요 시간
6-8시간

## 의존 관계
- Task 04: 목록 및 검색 기능

## 다음 작업
- 06-ADVANCED-FEATURES (고급 기능 및 최적화)
