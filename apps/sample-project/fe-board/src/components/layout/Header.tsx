import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative bg-white py-8 md:py-12 border-b">
      {/* Sidebar Toggle Button - Fixed position aligned with sidebar */}
      <div className="absolute top-6 left-6 z-10">
        <SidebarTrigger className="h-8 w-8 md:h-10 md:w-10" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center">
        <Link to="/">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 hover:text-primary transition-colors">
            Blog
          </h1>
        </Link>
        <p className="text-lg text-muted-foreground mb-6">
          Insights, tutorials, and thoughts on modern software development
        </p>
        
        <form onSubmit={handleSearch} className="flex items-center justify-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              type="search"
              placeholder="Search articles..." 
              className="pl-10 w-80 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              Write
            </Link>
          </Button>
        </form>
        </div>
      </div>
    </header>
  );
}
