# Task 02: 핵심 UI 컴포넌트 개발

## 개요
블로그의 핵심 UI 컴포넌트 및 목업 데이터 구축

## 목표
- PostCard, Header, Sidebar 등 핵심 컴포넌트 개발
- 샘플 데이터 생성 및 초기화 시스템 구축
- 기본 레이아웃 완성

## 선행 조건
- Task 01 (프로젝트 기반 구축) 완료

## 작업 내용

### 1. 샘플 데이터 생성
#### `src/data/samplePosts.ts`
```typescript
import { Post, Category } from '@/types';
import { subDays, subWeeks } from 'date-fns';

export const sampleCategories: Category[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Programming and software development',
    postCount: 0,
    slug: 'development',
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Step-by-step guides',
    postCount: 0,
    slug: 'tutorial',
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX design topics',
    postCount: 0,
    slug: 'design',
  },
];

export const samplePosts: Post[] = [
  {
    id: '1',
    title: 'The Future of Web Development: What\'s Next in 2024',
    content: `# The Future of Web Development

Web development continues to evolve at a rapid pace. Here are the key trends:

## AI-Powered Development Tools
- GitHub Copilot
- ChatGPT for coding
- Automated testing tools

## React Server Components
React Server Components are changing how we build applications:

\`\`\`jsx
// Server Component example
async function BlogPost({ id }) {
  const post = await fetchPost(id);
  return <article>{post.content}</article>;
}
\`\`\`

## Edge Computing
- Faster response times
- Better user experience
- Global scalability
`,
    summary: 'Explore the latest trends in web development, from AI-powered tools to new frameworks.',
    author: 'Sarah Chen',
    category: 'development',
    tags: ['web-development', 'ai', 'react', 'future-tech'],
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2),
    isDeleted: false,
    readTime: 8,
  },
  {
    id: '2',
    title: 'Building Scalable APIs with Modern Architecture',
    content: `# Building Scalable APIs

Learn how to build APIs that can handle millions of requests.

## Microservices Architecture
Breaking down applications into smaller services:
- Independence
- Scalability
- Technology diversity

## GraphQL vs REST
Understanding when to use each approach.

## Event-Driven Architecture
Using events to decouple services.
`,
    summary: 'Learn about microservices, GraphQL, and event-driven architectures.',
    author: 'Marcus Rodriguez',
    category: 'development',
    tags: ['api', 'microservices', 'graphql', 'architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5),
    isDeleted: false,
    readTime: 12,
  },
  {
    id: '3',
    title: 'TypeScript Tips for React Developers',
    content: `# TypeScript Tips for React

Essential TypeScript patterns for React development.

## Generic Components
\`\`\`typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Hook Typing
Properly typing custom hooks for better DX.
`,
    summary: 'Essential TypeScript concepts for React developers.',
    author: 'Jenny Park',
    category: 'tutorial',
    tags: ['typescript', 'react', 'patterns'],
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    createdAt: subWeeks(new Date(), 1),
    updatedAt: subWeeks(new Date(), 1),
    isDeleted: false,
    readTime: 10,
  },
];
```

### 2. 데이터 초기화 시스템
#### `src/utils/initializeData.ts`
```typescript
import usePostStore from '@/stores/postStore';
import { samplePosts, sampleCategories } from '@/data/samplePosts';

export const initializeData = () => {
  const postStore = usePostStore.getState();
  
  if (postStore.posts.length > 0) {
    return;
  }

  console.log('Initializing sample data...');
  postStore.setCategories(sampleCategories);
  postStore.setPosts(samplePosts);
  console.log('Sample data initialized');
};

export const resetData = () => {
  const postStore = usePostStore.getState();
  postStore.setPosts([]);
  postStore.setCategories([]);
  initializeData();
};
```

#### `src/hooks/useInitializeData.ts`
```typescript
import { useEffect } from 'react';
import { initializeData } from '@/utils/initializeData';

export const useInitializeData = () => {
  useEffect(() => {
    initializeData();
  }, []);
};
```

### 3. PostCard 컴포넌트
#### `src/components/posts/PostCard.tsx`
```typescript
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCardProps } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function PostCard({ 
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
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {showImage && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
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
            <span>{formatDistanceToNow(new Date(post.createdAt), { 
              addSuffix: true, 
              locale: ko 
            })}</span>
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
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
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
    return <div onClick={handleClick}>{content}</div>;
  }

  return (
    <Link to={`/posts/${post.id}`}>
      {content}
    </Link>
  );
}
```

### 4. PostGrid 컴포넌트
#### `src/components/posts/PostGrid.tsx`
```typescript
import { Post } from '@/types';
import PostCard from './PostCard';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          showImage={showImages}
        />
      ))}
    </div>
  );
}
```

### 5. Header 컴포넌트
#### `src/components/layout/Header.tsx`
```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
        
        <form onSubmit={handleSearch} className="flex items-center justify-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              type="search"
              placeholder="Search articles..." 
              className="pl-10 w-80 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              Write
            </Link>
          </Button>
        </form>
      </div>
    </header>
  );
}
```

### 6. Sidebar 컴포넌트
#### `src/components/layout/Sidebar.tsx`
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
    <aside className="w-80 bg-white p-6 border-l hidden lg:block">
      <div className="space-y-8">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <nav className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
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
                <Link to={`/posts/${post.id}`} className="block group">
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
                  className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### 7. 업데이트된 RootLayout
#### `src/components/layout/RootLayout.tsx`
```typescript
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useInitializeData } from '@/hooks/useInitializeData';

export default function RootLayout() {
  useInitializeData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}
```

### 8. 업데이트된 HomePage
#### `src/pages/HomePage.tsx`
```typescript
import { Helmet } from 'react-helmet-async';
import { usePosts } from '@/hooks/usePostStore';
import PostGrid from '@/components/posts/PostGrid';

export default function HomePage() {
  const posts = usePosts();

  return (
    <>
      <Helmet>
        <title>Home - Simple Blog</title>
        <meta name="description" content="최신 블로그 게시글을 확인하세요." />
      </Helmet>
      
      <div>
        <h1 className="text-3xl font-bold mb-8">최근 게시글</h1>
        <PostGrid posts={posts} />
      </div>
    </>
  );
}
```

### 9. 공통 컴포넌트들
#### `src/components/common/LoadingSpinner.tsx`
```typescript
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}
```

### 10. useCategoriesWithCount 훅 추가
#### `src/hooks/usePostStore.ts` (기존 파일에 추가)
```typescript
export const useCategoriesWithCount = () => {
  return usePostStore((state) => {
    const posts = state.posts.filter((post) => !post.isDeleted);
    
    return state.categories.map((category) => ({
      ...category,
      postCount: posts.filter((post) => post.category === category.id).length,
    }));
  });
};
```

## 완료 기준
- [ ] 모든 핵심 UI 컴포넌트 개발 완료
- [ ] 샘플 데이터 생성 및 초기화 완료
- [ ] 홈페이지에서 게시글 목록 정상 표시
- [ ] 사이드바 카테고리 및 태그 정상 동작
- [ ] 헤더 검색 기능 기본 동작 확인
- [ ] 반응형 레이아웃 기본 동작 확인

## 예상 소요 시간
6-8시간

## 의존 관계
- Task 01: 프로젝트 기반 구축

## 다음 작업
- 03-POST-FEATURES (게시글 상세 및 작성/수정 기능)
