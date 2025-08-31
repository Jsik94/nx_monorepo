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
