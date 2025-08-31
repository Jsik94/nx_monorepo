import { useMemo } from 'react';
import usePostStore from '@/stores/postStore';

export const usePosts = () => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.filter((post) => !post.isDeleted);
  }, [posts]);
};

export const usePost = (id: string) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.find((post) => post.id === id && !post.isDeleted);
  }, [posts, id]);
};

export const usePostsByCategory = (categoryId: string) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts.filter(
      (post) => post.category === categoryId && !post.isDeleted
    );
  }, [posts, categoryId]);
};

export const useRecentPosts = (limit = 5) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    return posts
      .filter((post) => !post.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [posts, limit]);
};

export const usePopularTags = (limit = 10) => {
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    const tagCount = posts
      .filter((post) => !post.isDeleted)
      .flatMap((post) => post.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  }, [posts, limit]);
};

export const useCategoriesWithCount = () => {
  const categories = usePostStore((state) => state.categories);
  const posts = usePostStore((state) => state.posts);
  
  return useMemo(() => {
    const activePosts = posts.filter((post) => !post.isDeleted);
    
    return categories.map((category) => ({
      ...category,
      postCount: activePosts.filter((post) => post.category === category.id).length,
    }));
  }, [categories, posts]);
};
