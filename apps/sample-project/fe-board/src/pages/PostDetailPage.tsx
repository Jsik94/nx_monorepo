import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Edit } from 'lucide-react';
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
  );
}
