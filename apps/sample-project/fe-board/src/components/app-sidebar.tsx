import { Link } from 'react-router-dom';
import { Calendar, Hash, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useCategoriesWithCount, useRecentPosts, usePopularTags } from '@/hooks/usePostStore';

export function AppSidebar() {
  const categories = useCategoriesWithCount();
  const recentPosts = useRecentPosts(5);
  const popularTags = usePopularTags(10);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/categories/${category.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.postCount}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Posts */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Posts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentPosts.map((post) => (
                <SidebarMenuItem key={post.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/posts/${post.id}`} className="flex flex-col items-start gap-1 py-2">
                      <div className="font-medium text-sm line-clamp-2 text-left">
                        {post.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Popular Tags */}
        <SidebarGroup>
          <SidebarGroupLabel>Popular Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-wrap gap-2 p-2">
              {popularTags.map((tag) => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge 
                    variant="outline" 
                    className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
