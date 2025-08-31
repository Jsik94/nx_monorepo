import { useSearchParams } from 'react-router-dom';
import { usePosts } from '@/hooks/usePostStore';
import PostGrid from '@/components/posts/PostGrid';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const allPosts = usePosts();

  const filteredPosts = allPosts.filter((post) => {
    if (!query.trim()) return false;
    const searchableText = `${post.title} ${post.content} ${post.summary || ''} ${post.tags.join(' ')}`.toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {query ? `"${query}" 검색 결과` : '검색'}
      </h1>
      
      {query && (
        <p className="text-muted-foreground mb-6">
          총 {filteredPosts.length}개의 게시글을 찾았습니다.
        </p>
      )}
      
      <PostGrid posts={filteredPosts} />
    </div>
  );
}
