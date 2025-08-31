export interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  category?: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  readTime?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  slug: string;
}

export interface PostFormData {
  title: string;
  content: string;
  summary?: string;
  author: string;
  category?: string;
  tags: string[];
  imageUrl?: string;
}

export interface PostCardProps {
  post: Post;
  onClick?: (post: Post) => void;
  showImage?: boolean;
  variant?: 'default' | 'compact';
}

export interface PostStore {
  posts: Post[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
