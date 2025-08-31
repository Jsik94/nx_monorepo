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
