# Task 04: 목록 및 검색 기능

## 개요
게시글 목록 조회, 필터링, 정렬, 페이지네이션 및 검색 기능 구현

## 목표
- 게시글 목록 기능 완성
- 카테고리별 필터링
- 검색 기능 구현
- 페이지네이션 및 정렬
- 실시간 검색 제안

## 선행 조건
- Task 03 (게시글 핵심 기능) 완료

## 작업 내용

### 1. 게시글 목록 훅 개발
#### `src/hooks/usePostList.ts`
```typescript
import { useState, useMemo } from 'react';
import { usePosts, usePostsByCategory } from '@/hooks/usePostStore';
import { Post } from '@/types';

export interface PostListFilters {
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const usePostList = (filters: PostListFilters = {}) => {
  const [currentPage, setCurrentPage] = useState(filters.page || 1);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || 'desc');

  const allPosts = usePosts();
  const categoryPosts = usePostsByCategory(filters.category || '');

  const filteredPosts = useMemo(() => {
    let posts: Post[] = filters.category ? categoryPosts : allPosts;

    // 검색 필터링
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      posts = posts.filter((post) => {
        const searchableText = `${post.title} ${post.content} ${post.summary || ''} ${post.tags.join(' ')}`.toLowerCase();
        return searchableText.includes(query);
      });
    }

    // 정렬
    const sortedPosts = [...posts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedPosts;
  }, [allPosts, categoryPosts, filters.search, filters.category, sortBy, sortOrder]);

  // 페이지네이션
  const limit = filters.limit || 10;
  const totalPages = Math.ceil(filteredPosts.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages,
    totalPosts: filteredPosts.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    setPage: setCurrentPage,
  };

  const sorting = {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  };

  return {
    posts: paginatedPosts,
    totalPosts: filteredPosts.length,
    pagination,
    sorting,
  };
};
```

### 2. 페이지네이션 컴포넌트
#### `src/components/common/Pagination.tsx`
```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        이전
      </Button>

      {visiblePages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {visiblePages[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        다음
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

### 3. 정렬 컴포넌트
#### `src/components/posts/PostSortSelector.tsx`
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface PostSortSelectorProps {
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'createdAt' | 'updatedAt' | 'title') => void;
  onOrderChange: () => void;
}

export default function PostSortSelector({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderChange,
}: PostSortSelectorProps) {
  const sortOptions = [
    { value: 'createdAt', label: '작성일' },
    { value: 'updatedAt', label: '수정일' },
    { value: 'title', label: '제목' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onOrderChange}
        className="px-3"
      >
        <ArrowUpDown className="w-4 h-4" />
        {sortOrder === 'desc' ? '내림차순' : '오름차순'}
      </Button>
    </div>
  );
}
```

### 4. 게시글 목록 컨테이너
#### `src/components/posts/PostListContainer.tsx`
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {totalPosts > 0 && (
            <p className="text-muted-foreground mt-1">총 {totalPosts}개 게시글</p>
          )}
        </div>

        {showSorting && totalPosts > 0 && (
          <PostSortSelector
            sortBy={sorting.sortBy}
            sortOrder={sorting.sortOrder}
            onSortChange={handleSortChange}
            onOrderChange={handleOrderChange}
          />
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

### 5. 검색 기능 훅
#### `src/hooks/useSearch.ts`
```typescript
import { useState, useMemo } from 'react';
import { usePosts, usePopularTags } from '@/hooks/usePostStore';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const allPosts = usePosts();
  const popularTags = usePopularTags(10);

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return allPosts.filter((post) => {
      const searchableText = `${post.title} ${post.content} ${post.summary || ''} ${post.tags.join(' ')}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    });
  }, [allPosts, query]);

  // 제목 제안
  const titleSuggestions = useMemo(() => {
    if (query.length < 2) return [];
    
    return allPosts
      .filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(post => post.title);
  }, [allPosts, query]);

  // 작성자 제안
  const authorSuggestions = useMemo(() => {
    if (query.length < 2) return [];
    
    return [...new Set(
      allPosts
        .filter(post => 
          post.author.toLowerCase().includes(query.toLowerCase())
        )
        .map(post => post.author)
    )].slice(0, 3);
  }, [allPosts, query]);

  // 태그 제안
  const tagSuggestions = useMemo(() => {
    if (query.length < 1) return [];
    
    return popularTags.filter(tag =>
      tag.toLowerCase().includes(query.toLowerCase())
    );
  }, [popularTags, query]);

  return {
    query,
    setQuery,
    searchResults,
    titleSuggestions,
    authorSuggestions,
    tagSuggestions,
  };
};
```

### 6. 검색 제안 컴포넌트
#### `src/components/search/SearchSuggestions.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Hash, User } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

interface SearchSuggestionsProps {
  onSelect: (query: string) => void;
  placeholder?: string;
}

export default function SearchSuggestions({
  onSelect,
  placeholder = "게시글 검색...",
}: SearchSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const {
    query,
    setQuery,
    titleSuggestions,
    authorSuggestions,
    tagSuggestions,
  } = useSearch();

  // 검색 히스토리 로드
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('search-history') || '[]');
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const newHistory = [
        searchQuery,
        ...searchHistory.filter(item => item !== searchQuery)
      ].slice(0, 5);
      
      setSearchHistory(newHistory);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSelect = (selectedQuery: string) => {
    onSelect(selectedQuery);
    saveToHistory(selectedQuery);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSelect(query);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandList>
            {/* 검색 히스토리 */}
            {searchHistory.length > 0 && !query && (
              <CommandGroup heading="최근 검색">
                {searchHistory.map((historyItem) => (
                  <CommandItem 
                    key={historyItem}
                    onSelect={() => handleSelect(historyItem)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    {historyItem}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* 게시글 제목 제안 */}
            {titleSuggestions.length > 0 && (
              <CommandGroup heading="게시글">
                {titleSuggestions.map((title) => (
                  <CommandItem
                    key={title}
                    onSelect={() => handleSelect(title)}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    {title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* 작성자 제안 */}
            {authorSuggestions.length > 0 && (
              <CommandGroup heading="작성자">
                {authorSuggestions.map((author) => (
                  <CommandItem
                    key={author}
                    onSelect={() => handleSelect(author)}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    {author}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* 태그 제안 */}
            {tagSuggestions.length > 0 && (
              <CommandGroup heading="태그">
                {tagSuggestions.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => handleSelect(`#${tag}`)}
                    className="flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4 text-gray-400" />
                    #{tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query && titleSuggestions.length === 0 && authorSuggestions.length === 0 && tagSuggestions.length === 0 && (
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### 7. 업데이트된 Header 컴포넌트
#### `src/components/layout/Header.tsx` (기존 파일 수정)
```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchSuggestions from '@/components/search/SearchSuggestions';

export default function Header() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-white py-8 md:py-12 border-b">
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
    </header>
  );
}
```

### 8. 카테고리 페이지
#### `src/pages/CategoryPage.tsx`
```typescript
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCategoriesWithCount } from '@/hooks/usePostStore';
import PostListContainer from '@/components/posts/PostListContainer';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const categories = useCategoriesWithCount();
  
  const currentCategory = categories.find(cat => cat.id === categoryId);
  const categoryName = currentCategory?.name || categoryId;

  return (
    <>
      <Helmet>
        <title>{categoryName} - Simple Blog</title>
        <meta name="description" content={`${categoryName} 카테고리의 게시글 목록`} />
      </Helmet>
      
      <PostListContainer
        title={`${categoryName} 카테고리`}
        category={categoryId}
        showSorting={true}
        showPagination={true}
        limit={10}
      />
    </>
  );
}
```

### 9. 검색 페이지
#### `src/pages/SearchPage.tsx`
```typescript
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PostListContainer from '@/components/posts/PostListContainer';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <>
      <Helmet>
        <title>
          {query ? `검색: ${query}` : '검색'} - Simple Blog
        </title>
        <meta 
          name="description" 
          content={query ? `"${query}" 검색 결과` : '블로그 게시글 검색'} 
        />
      </Helmet>
      
      <PostListContainer
        title={query ? `"${query}" 검색 결과` : '검색'}
        searchQuery={query}
        showSorting={true}
        showPagination={true}
        limit={10}
      />
    </>
  );
}
```

### 10. 업데이트된 HomePage
#### `src/pages/HomePage.tsx` (기존 파일 수정)
```typescript
import { Helmet } from 'react-helmet-async';
import PostListContainer from '@/components/posts/PostListContainer';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home - Simple Blog</title>
        <meta name="description" content="최신 블로그 게시글을 확인하세요." />
      </Helmet>
      
      <PostListContainer
        title="최근 게시글"
        showSorting={true}
        showPagination={true}
        limit={10}
      />
    </>
  );
}
```

## 완료 기준
- [ ] 게시글 목록 조회 기능 완료
- [ ] 카테고리별 필터링 완료
- [ ] 검색 기능 완료
- [ ] 실시간 검색 제안 완료
- [ ] 정렬 기능 완료
- [ ] 페이지네이션 완료
- [ ] 검색 히스토리 관리 완료

## 예상 소요 시간
6-8시간

## 의존 관계
- Task 03: 게시글 핵심 기능

## 다음 작업
- 05-RESPONSIVE-DESIGN (반응형 디자인)
