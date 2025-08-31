import { Post, Category } from '@/types';
import { subDays, subWeeks } from 'date-fns';

export const sampleCategories: Category[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Programming and software development',
    postCount: 0,
    slug: 'development',
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Step-by-step guides',
    postCount: 0,
    slug: 'tutorial',
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX design topics',
    postCount: 0,
    slug: 'design',
  },
];

export const samplePosts: Post[] = [
  {
    id: '1',
    title: 'The Future of Web Development: What\'s Next in 2024',
    content: `# The Future of Web Development

Web development continues to evolve at a rapid pace. Here are the key trends:

## AI-Powered Development Tools
- GitHub Copilot
- ChatGPT for coding
- Automated testing tools

## React Server Components
React Server Components are changing how we build applications:

\`\`\`jsx
// Server Component example
async function BlogPost({ id }) {
  const post = await fetchPost(id);
  return <article>{post.content}</article>;
}
\`\`\`

## Edge Computing
- Faster response times
- Better user experience
- Global scalability
`,
    summary: 'Explore the latest trends in web development, from AI-powered tools to new frameworks.',
    author: 'Sarah Chen',
    category: 'development',
    tags: ['web-development', 'ai', 'react', 'future-tech'],
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2),
    isDeleted: false,
    readTime: 8,
  },
  {
    id: '2',
    title: 'Building Scalable APIs with Modern Architecture',
    content: `# Building Scalable APIs

Learn how to build APIs that can handle millions of requests.

## Microservices Architecture
Breaking down applications into smaller services:
- Independence
- Scalability
- Technology diversity

## GraphQL vs REST
Understanding when to use each approach.

## Event-Driven Architecture
Using events to decouple services.
`,
    summary: 'Learn about microservices, GraphQL, and event-driven architectures.',
    author: 'Marcus Rodriguez',
    category: 'development',
    tags: ['api', 'microservices', 'graphql', 'architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5),
    isDeleted: false,
    readTime: 12,
  },
  {
    id: '3',
    title: 'TypeScript Tips for React Developers',
    content: `# TypeScript Tips for React

Essential TypeScript patterns for React development.

## Generic Components
\`\`\`typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Hook Typing
Properly typing custom hooks for better DX.
`,
    summary: 'Essential TypeScript concepts for React developers.',
    author: 'Jenny Park',
    category: 'tutorial',
    tags: ['typescript', 'react', 'patterns'],
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    createdAt: subWeeks(new Date(), 1),
    updatedAt: subWeeks(new Date(), 1),
    isDeleted: false,
    readTime: 10,
  },
];
