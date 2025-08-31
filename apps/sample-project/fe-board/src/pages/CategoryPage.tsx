import { useParams } from 'react-router-dom';
import { usePostsByCategory, useCategoriesWithCount } from '@/hooks/usePostStore';
import PostGrid from '@/components/posts/PostGrid';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const posts = usePostsByCategory(categoryId || '');
  const categories = useCategoriesWithCount();
  
  const currentCategory = categories.find(cat => cat.id === categoryId);
  const categoryName = currentCategory?.name || categoryId;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{categoryName} 카테고리</h1>
      <p className="text-muted-foreground mb-6">
        총 {posts.length}개의 게시글이 있습니다.
      </p>
      <PostGrid posts={posts} />
    </div>
  );
}
