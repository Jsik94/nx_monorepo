import { usePosts } from '@/hooks/usePostStore';
import PostGrid from '@/components/posts/PostGrid';

export default function HomePage() {
  const posts = usePosts();

  return (
    <>      
      <div>
        <h1 className="text-3xl font-bold mb-8">Recent Posts</h1>
        <PostGrid posts={posts} />
      </div>
    </>
  );
}
