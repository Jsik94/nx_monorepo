import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Post, Category, PostStore } from '@/types';

const usePostStore = create<PostStore>()(
  devtools(
    persist(
      (set, get) => ({
        posts: [],
        categories: [],
        isLoading: false,
        error: null,

        setPosts: (posts) => set({ posts }, false, 'setPosts'),
        
        addPost: (post) => 
          set(
            (state) => ({ 
              posts: [post, ...state.posts],
              error: null 
            }),
            false,
            'addPost'
          ),
        
        updatePost: (id, updates) =>
          set(
            (state) => ({
              posts: state.posts.map((post) =>
                post.id === id ? { ...post, ...updates, updatedAt: new Date() } : post
              ),
              error: null
            }),
            false,
            'updatePost'
          ),
        
        deletePost: (id) =>
          set(
            (state) => ({
              posts: state.posts.map((post) =>
                post.id === id ? { ...post, isDeleted: true } : post
              ),
              error: null
            }),
            false,
            'deletePost'
          ),
        
        setCategories: (categories) => set({ categories }, false, 'setCategories'),
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
      }),
      {
        name: 'post-store',
        partialize: (state) => ({
          posts: state.posts,
          categories: state.categories,
        }),
      }
    ),
    { name: 'PostStore' }
  )
);

export default usePostStore;
