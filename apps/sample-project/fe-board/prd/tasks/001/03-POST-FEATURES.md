# Task 03: 게시글 핵심 기능

## 개요
게시글 상세 조회, 작성, 수정 기능과 마크다운 에디터 구현

## 목표
- 게시글 상세 페이지 구현
- 마크다운 에디터 및 실시간 미리보기
- 게시글 CRUD 기능 완성
- 폼 유효성 검사 및 임시저장

## 선행 조건
- Task 02 (핵심 UI 컴포넌트) 완료

## 작업 내용

### 1. 추가 패키지 설치
```bash
# 마크다운 에디터 관련
pnpm add react-syntax-highlighter
pnpm add -D @types/react-syntax-highlighter

# 폼 검증 (이미 설치되어 있으면 스킵)
pnpm add react-hook-form @hookform/resolvers zod
```

### 2. 마크다운 렌더러 컴포넌트
#### `src/components/common/MarkdownRenderer.tsx`
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2 my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

### 3. 마크다운 에디터 컴포넌트
#### `src/components/editor/MarkdownEditor.tsx`
```typescript
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  List, 
  Quote, 
  Code, 
  Eye,
  Edit
} from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "마크다운으로 작성하세요...",
  height = "400px"
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      before + textToInsert + after + 
      value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }
    }, 0);
  };

  const toolbarActions = [
    {
      icon: Bold,
      label: '볼드',
      action: () => insertText('**', '**', '볼드 텍스트'),
    },
    {
      icon: Italic,
      label: '이탤릭',
      action: () => insertText('*', '*', '이탤릭 텍스트'),
    },
    {
      icon: Link,
      label: '링크',
      action: () => insertText('[', '](url)', '링크 텍스트'),
    },
    {
      icon: Image,
      label: '이미지',
      action: () => insertText('![', '](image-url)', 'alt 텍스트'),
    },
    {
      icon: List,
      label: '목록',
      action: () => insertText('- ', '', '목록 항목'),
    },
    {
      icon: Quote,
      label: '인용',
      action: () => insertText('> ', '', '인용 텍스트'),
    },
    {
      icon: Code,
      label: '코드',
      action: () => insertText('```\n', '\n```', '코드를 입력하세요'),
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex items-center gap-1">
          {toolbarActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={action.action}
              title={action.label}
              className="w-8 h-8 p-0"
            >
              <action.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="ml-auto">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  편집
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  미리보기
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 에디터 영역 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        <TabsContent value="edit" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none font-mono"
            style={{ height }}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="m-0">
          <div 
            className="p-4 overflow-y-auto"
            style={{ height }}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-gray-500 italic">
                미리보기할 내용이 없습니다.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4. 게시글 폼 컴포넌트
#### `src/components/editor/PostForm.tsx`
```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Eye } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import { PostFormData } from '@/types';
import { useCategoriesWithCount } from '@/hooks/usePostStore';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자를 초과할 수 없습니다'),
  content: z.string().min(1, '내용을 입력해주세요'),
  summary: z.string().max(200, '요약은 200자를 초과할 수 없습니다').optional(),
  author: z.string().min(1, '작성자를 입력해주세요'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
});

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => void;
  onCancel: () => void;
  onSaveDraft?: (data: Partial<PostFormData>) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function PostForm({
  initialData,
  onSubmit,
  onCancel,
  onSaveDraft,
  isEditing = false,
  isLoading = false,
}: PostFormProps) {
  const [newTag, setNewTag] = useState('');
  const categories = useCategoriesWithCount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      author: 'Anonymous',
      category: '',
      tags: [],
      imageUrl: '',
      ...initialData,
    },
  });

  const watchedValues = watch();

  // 자동 임시저장 (5초마다)
  useEffect(() => {
    if (!isDirty || !onSaveDraft) return;

    const timer = setInterval(() => {
      onSaveDraft(watchedValues);
    }, 5000);

    return () => clearInterval(timer);
  }, [watchedValues, isDirty, onSaveDraft]);

  const addTag = () => {
    if (newTag.trim() && !watchedValues.tags.includes(newTag.trim())) {
      setValue('tags', [...watchedValues.tags, newTag.trim()], { shouldDirty: true });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedValues.tags.filter(tag => tag !== tagToRemove), { shouldDirty: true });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="게시글 제목을 입력하세요"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* 작성자 */}
      <div className="space-y-2">
        <Label htmlFor="author">작성자 *</Label>
        <Input
          id="author"
          {...register('author')}
          placeholder="작성자 이름을 입력하세요"
        />
        {errors.author && (
          <p className="text-sm text-red-500">{errors.author.message}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div className="space-y-2">
        <Label>카테고리</Label>
        <Select
          value={watchedValues.category}
          onValueChange={(value) => setValue('category', value, { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">카테고리 없음</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 태그 */}
      <div className="space-y-2">
        <Label>태그</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="태그를 입력하고 Enter를 누르세요"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {watchedValues.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedValues.tags.map((tag) => (
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
      </div>

      {/* 이미지 URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">대표 이미지 URL</Label>
        <Input
          id="imageUrl"
          {...register('imageUrl')}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* 요약 */}
      <div className="space-y-2">
        <Label htmlFor="summary">요약</Label>
        <Textarea
          id="summary"
          {...register('summary')}
          placeholder="게시글 요약을 입력하세요 (선택사항)"
          rows={3}
        />
        {errors.summary && (
          <p className="text-sm text-red-500">{errors.summary.message}</p>
        )}
        <p className="text-sm text-gray-500">
          {watchedValues.summary?.length || 0}/200자
        </p>
      </div>

      {/* 내용 */}
      <div className="space-y-2">
        <Label>내용 *</Label>
        <MarkdownEditor
          value={watchedValues.content}
          onChange={(value) => setValue('content', value, { shouldDirty: true })}
          placeholder="마크다운으로 게시글 내용을 작성하세요..."
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-between pt-6 border-t">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSaveDraft(watchedValues)}
              disabled={!isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              임시저장
            </Button>
          )}
        </div>
        
        <Button type="submit" disabled={isLoading}>
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
    </form>
  );
}
```

### 5. 게시글 상세 페이지
#### `src/pages/PostDetailPage.tsx`
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePost } from '@/hooks/usePostStore';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = usePost(id!);

  if (!post) {
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
          <h1 className="text-4xl font-bold leading-tight mb-4">
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
              <span>
                ({formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })})
              </span>
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

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/posts/${post.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>

          <hr className="mt-6" />
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
      </article>
    </>
  );
}
```

### 6. 게시글 작성 페이지
#### `src/pages/PostCreatePage.tsx`
```typescript
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { v4 as uuidv4 } from 'uuid';
import PostForm from '@/components/editor/PostForm';
import usePostStore from '@/stores/postStore';
import { PostFormData, Post } from '@/types';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const addPost = usePostStore((state) => state.addPost);

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
    navigate(`/posts/${newPost.id}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>새 글 작성 - Simple Blog</title>
        <meta name="description" content="새로운 블로그 글을 작성하세요." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">새 글 작성</h1>
          <p className="text-muted-foreground mt-2">
            마크다운을 사용하여 글을 작성할 수 있습니다.
          </p>
        </div>

        <PostForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
```

### 7. 게시글 수정 페이지
#### `src/pages/PostEditPage.tsx`
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePost } from '@/hooks/usePostStore';
import usePostStore from '@/stores/postStore';
import PostForm from '@/components/editor/PostForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PostFormData } from '@/types';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = usePost(id!);
  const updatePost = usePostStore((state) => state.updatePost);

  const handleSubmit = (data: PostFormData) => {
    if (!id) return;
    updatePost(id, data);
    navigate(`/posts/${id}`);
  };

  const handleCancel = () => {
    navigate(`/posts/${id}`);
  };

  if (!post) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const initialData: PostFormData = {
    title: post.title,
    content: post.content,
    summary: post.summary || '',
    author: post.author,
    category: post.category || '',
    tags: post.tags,
    imageUrl: post.imageUrl || '',
  };

  return (
    <>
      <Helmet>
        <title>글 수정: {post.title} - Simple Blog</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">글 수정</h1>
          <p className="text-muted-foreground mt-2">
            "{post.title}" 글을 수정하고 있습니다.
          </p>
        </div>

        <PostForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
        />
      </div>
    </>
  );
}
```

## 완료 기준
- [ ] 게시글 상세 페이지 정상 동작
- [ ] 마크다운 렌더링 정상 동작
- [ ] 마크다운 에디터 및 미리보기 정상 동작
- [ ] 게시글 작성 기능 완료
- [ ] 게시글 수정 기능 완료
- [ ] 폼 유효성 검사 정상 동작
- [ ] 툴바 및 단축키 기능 동작

## 예상 소요 시간
8-10시간

## 의존 관계
- Task 02: 핵심 UI 컴포넌트

## 다음 작업
- 04-LIST-AND-SEARCH (목록 및 검색 기능)
