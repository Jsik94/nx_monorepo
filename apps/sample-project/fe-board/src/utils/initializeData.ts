import usePostStore from '@/stores/postStore';
import { samplePosts, sampleCategories } from '@/data/samplePosts';

export const initializeData = () => {
  const postStore = usePostStore.getState();
  
  if (postStore.posts.length > 0) {
    return;
  }

  console.log('Initializing sample data...');
  postStore.setCategories(sampleCategories);
  postStore.setPosts(samplePosts);
  console.log('Sample data initialized');
};

export const resetData = () => {
  const postStore = usePostStore.getState();
  postStore.setPosts([]);
  postStore.setCategories([]);
  initializeData();
};
