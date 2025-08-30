# Task 06: 고급 기능 및 최적화

## 개요
게시글 네비게이션, 관련 글 추천, 임시저장, 고급 검색 필터 등 부가 기능 구현

## 목표
- 이전/다음 글 네비게이션
- 관련 글 추천 시스템
- 임시저장 기능
- 고급 검색 필터
- 사용자 경험 개선

## 선행 조건
- Task 05 (반응형 디자인) 완료

## 작업 내용

### 1. 게시글 네비게이션 컴포넌트
#### `src/components/posts/PostNavigation.tsx`
```typescript
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types';

interface PostNavigationProps {
  previousPost?: Post;
  nextPost?: Post;
}

export default function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-8 border-t">
      {/* Previous post */}
      <div className="flex">
        {previousPost ? (
          <Card className="w-full hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Link to={`/posts/${previousPost.id}`} className="block">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전 글</span>
                </div>
                <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                  {previousPost.title}
                </h3>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full" />
        )}
      </div>

      {/* Next post */}
      <div className="flex">
        {nextPost ? (
          <Card className="w-full hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Link to={`/posts/${nextPost.id}`} className="block">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  <span>다음 글</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <h3 className="font-medium line-clamp-2 text-right hover:text-primary transition-colors">
                  {nextPost.title}
                </h3>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full" />
        )}
      </div>
    </div>
  );
}
```

### 2. 관련 글 추천 컴포넌트
#### `src/components/posts/RelatedPosts.tsx`
```typescript
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types';
import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RelatedPostsProps {
  posts: Post[];
  currentPostId: string;
}

export default function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">관련 글</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <Link to={`/posts/${post.id}`}>
              {post.imageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: ko 
                  })}</span>
                </div>
                {post.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {post.summary}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 3. 게시글 상세 훅
#### `src/hooks/usePostDetail.ts`
```typescript
import { useMemo } from 'react';
import { usePost, usePosts } from '@/hooks/usePostStore';

export const usePostDetail = (postId: string) => {
  const post = usePost(postId);
  const allPosts = usePosts();

  const navigation = useMemo(() => {
    if (!post || allPosts.length === 0) {
      return { previousPost: undefined, nextPost: undefined };
    }

    // 게시글을 작성일 기준으로 정렬
    const sortedPosts = [...allPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const currentIndex = sortedPosts.findIndex(p => p.id === postId);
    
    if (currentIndex === -1) {
      return { previousPost: undefined, nextPost: undefined };
    }

    return {
      previousPost: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : undefined,
      nextPost: currentIndex > 0 ? sortedPosts[currentIndex - 1] : undefined,
    };
  }, [post, allPosts, postId]);

  const relatedPosts = useMemo(() => {
    if (!post || allPosts.length === 0) {
      return [];
    }

    // 같은 카테고리 또는 공통 태그가 있는 게시글 찾기
    const related = allPosts
      .filter(p => p.id !== postId)
      .map(p => {
        let score = 0;
        
        // 같은 카테고리면 점수 추가
        if (p.category === post.category) {
          score += 10;
        }
        
        // 공통 태그 개수만큼 점수 추가
        const commonTags = p.tags.filter(tag => post.tags.includes(tag));
        score += commonTags.length * 5;
        
        return { post: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.post);

    return related;
  }, [post, allPosts, postId]);

  return {
    post,
    navigation,
    relatedPosts,
    isLoading: false,
    error: !post ? '게시글을 찾을 수 없습니다.' : null,
  };
};
```

### 4. 임시저장 관리 훅
#### `src/hooks/useDraftStorage.ts`
```typescript
import { useState, useEffect } from 'react';
import { PostFormData } from '@/types';

const DRAFT_STORAGE_KEY = 'blog-post-draft';

export const useDraftStorage = (postId?: string) => {
  const storageKey = postId ? `${DRAFT_STORAGE_KEY}-${postId}` : DRAFT_STORAGE_KEY;
  
  const [draft, setDraft] = useState<Partial<PostFormData> | null>(null);

  // 임시저장된 데이터 로드
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setDraft(parsedDraft);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [storageKey]);

  // 임시저장
  const saveDraft = (data: Partial<PostFormData>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }));
      setDraft(data);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // 임시저장 데이터 삭제
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setDraft(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // 임시저장 데이터 존재 여부
  const hasDraft = draft !== null;

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  };
};
```

### 5. 임시저장 복원 다이얼로그
#### `src/components/editor/DraftRestoreDialog.tsx`
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DraftRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: () => void;
  onDiscard: () => void;
  savedAt?: string;
}

export default function DraftRestoreDialog({
  open,
  onOpenChange,
  onRestore,
  onDiscard,
  savedAt,
}: DraftRestoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임시저장된 글이 있습니다</DialogTitle>
          <DialogDescription>
            {savedAt && (
              <>
                {formatDistanceToNow(new Date(savedAt), { addSuffix: true, locale: ko })}에 
                임시저장된 글이 있습니다.
                <br />
              </>
            )}
            임시저장된 내용을 복원하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onDiscard}>
            새로 작성
          </Button>
          <Button onClick={onRestore}>
            복원하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. 고급 검색 필터 컴포넌트
#### `src/components/search/AdvancedSearchFilters.tsx`
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { useCategoriesWithCount, usePopularTags } from '@/hooks/usePostStore';

interface SearchFilters {
  query: string;
  category?: string;
  author?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
}

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const categories = useCategoriesWithCount();
  const popularTags = usePopularTags(10);

  const addTag = () => {
    if (newTag.trim() && !filters.tags?.includes(newTag.trim())) {
      onFiltersChange({
        tags: [...(filters.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onFiltersChange({
      tags: filters.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const hasActiveFilters = Boolean(
    filters.category || 
    filters.author || 
    filters.tags?.length
  );

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                고급 검색 필터
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    활성
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* 카테고리 필터 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => onFiltersChange({ category: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.postCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 작성자 필터 */}
            <div className="space-y-2">
              <Label htmlFor="author">작성자</Label>
              <Input
                id="author"
                value={filters.author || ''}
                onChange={(e) => onFiltersChange({ author: e.target.value || undefined })}
                placeholder="작성자 이름"
              />
            </div>

            {/* 태그 필터 */}
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="태그 입력"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  추가
                </Button>
              </div>
              
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-4 h-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 인기 태그 제안 */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">인기 태그</Label>
                <div className="flex flex-wrap gap-1">
                  {popularTags.slice(0, 5).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                      onClick={() => {
                        if (!filters.tags?.includes(tag)) {
                          onFiltersChange({
                            tags: [...(filters.tags || []), tag]
                          });
                        }
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>정렬 기준</Label>
                <Select
                  value={filters.sortBy || 'relevance'}
                  onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">관련성</SelectItem>
                    <SelectItem value="date">날짜</SelectItem>
                    <SelectItem value="title">제목</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>정렬 순서</Label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) => onFiltersChange({ sortOrder: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">내림차순</SelectItem>
                    <SelectItem value="asc">오름차순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 액션 버튼 */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters} className="w-full">
                필터 초기화
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
```

### 7. 업데이트된 PostDetailPage
#### `src/pages/PostDetailPage.tsx` (기존 파일 수정)
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePostDetail } from '@/hooks/usePostDetail';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import PostNavigation from '@/components/posts/PostNavigation';
import RelatedPosts from '@/components/posts/RelatedPosts';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { post, navigation, relatedPosts, error } = usePostDetail(id!);

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          게시글을 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-6">
          요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Button onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Simple Blog</title>
        <meta name="description" content={post.summary || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary || post.title} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
      </Helmet>

      <article className="max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </div>

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}</span>
            </div>

            {post.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}분 읽기</span>
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/posts/${post.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>

          <hr />
        </div>

        {/* 대표 이미지 */}
        {post.imageUrl && (
          <div className="mb-8">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-lg"
            />
          </div>
        )}

        {/* 내용 */}
        <MarkdownRenderer content={post.content} />

        {/* 네비게이션 */}
        <PostNavigation
          previousPost={navigation.previousPost}
          nextPost={navigation.nextPost}
        />

        {/* 관련 글 */}
        <RelatedPosts
          posts={relatedPosts}
          currentPostId={post.id}
        />
      </article>
    </>
  );
}
```

### 8. 업데이트된 PostCreatePage (임시저장 기능 포함)
#### `src/pages/PostCreatePage.tsx` (기존 파일 수정)
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { v4 as uuidv4 } from 'uuid';
import PostForm from '@/components/editor/PostForm';
import DraftRestoreDialog from '@/components/editor/DraftRestoreDialog';
import usePostStore from '@/stores/postStore';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { PostFormData, Post } from '@/types';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<PostFormData>>({});
  
  const addPost = usePostStore((state) => state.addPost);
  const { draft, saveDraft, clearDraft, hasDraft } = useDraftStorage();

  // 페이지 로드 시 임시저장 데이터 확인
  useEffect(() => {
    if (hasDraft && draft) {
      setShowDraftDialog(true);
    }
  }, [hasDraft, draft]);

  const handleSubmit = (data: PostFormData) => {
    const newPost: Post = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      readTime: Math.ceil(data.content.length / 1000),
    };

    addPost(newPost);
    clearDraft();
    navigate(`/posts/${newPost.id}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleSaveDraft = (data: Partial<PostFormData>) => {
    saveDraft(data);
  };

  const handleRestoreDraft = () => {
    if (draft) {
      setFormData(draft);
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  return (
    <>
      <Helmet>
        <title>새 글 작성 - Simple Blog</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">새 글 작성</h1>
          <p className="text-muted-foreground mt-2">
            마크다운을 사용하여 글을 작성할 수 있습니다.
          </p>
        </div>

        <PostForm
          initialData={formData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onSaveDraft={handleSaveDraft}
        />
      </div>

      <DraftRestoreDialog
        open={showDraftDialog}
        onOpenChange={setShowDraftDialog}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        savedAt={draft?.savedAt}
      />
    </>
  );
}
```

## 완료 기준
- [ ] 이전/다음 글 네비게이션 완료
- [ ] 관련 글 추천 시스템 완료
- [ ] 임시저장 기능 완료
- [ ] 임시저장 복원 다이얼로그 완료
- [ ] 고급 검색 필터 완료
- [ ] 게시글 상세 페이지 완성

## 예상 소요 시간
8-10시간

## 의존 관계
- Task 05: 반응형 디자인

## 다음 작업
- 07-PERFORMANCE-TESTING (성능 최적화 및 테스트)
