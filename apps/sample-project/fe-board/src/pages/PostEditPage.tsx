import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePost } from '@/hooks/usePostStore';
import usePostStore from '@/stores/postStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = usePost(id!);
  const updatePost = usePostStore((state) => state.updatePost);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    author: '',
    tags: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        author: post.author,
        tags: post.tags.join(', '),
        imageUrl: post.imageUrl || '',
      });
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    updatePost(id!, {
      title: formData.title,
      content: formData.content,
      summary: formData.summary || undefined,
      author: formData.author,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: formData.imageUrl || undefined,
      readTime: Math.ceil(formData.content.length / 1000),
    });

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">글 수정</h1>
        <p className="text-muted-foreground mt-2">
          "{post.title}" 글을 수정하고 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="게시글 제목을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">작성자 *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            placeholder="작성자 이름을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">태그</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="태그를 쉼표로 구분하여 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">대표 이미지 URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">요약</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
            placeholder="게시글 요약을 입력하세요 (선택사항)"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용 *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="마크다운으로 게시글 내용을 작성하세요..."
            rows={15}
            required
          />
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            취소
          </Button>
          
          <Button type="submit">
            수정 완료
          </Button>
        </div>
      </form>
    </div>
  );
}
