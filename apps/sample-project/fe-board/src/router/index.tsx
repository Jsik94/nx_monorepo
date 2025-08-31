import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/components/layout/RootLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 페이지 컴포넌트 지연 로딩
const HomePage = lazy(() => import('@/pages/HomePage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const PostCreatePage = lazy(() => import('@/pages/PostCreatePage'));
const PostEditPage = lazy(() => import('@/pages/PostEditPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const withSuspense = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: withSuspense(NotFoundPage)({}),
    children: [
      {
        index: true,
        element: withSuspense(HomePage)({}),
      },
      {
        path: 'posts',
        children: [
          {
            index: true,
            element: withSuspense(HomePage)({}),
          },
          {
            path: 'new',
            element: withSuspense(PostCreatePage)({}),
          },
          {
            path: ':id',
            element: withSuspense(PostDetailPage)({}),
          },
          {
            path: ':id/edit',
            element: withSuspense(PostEditPage)({}),
          },
        ],
      },
      {
        path: 'categories/:categoryId',
        element: withSuspense(CategoryPage)({}),
      },
      {
        path: 'search',
        element: withSuspense(SearchPage)({}),
      },
    ],
  },
]);
