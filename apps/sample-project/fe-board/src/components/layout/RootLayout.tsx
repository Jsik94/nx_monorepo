import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { useInitializeData } from '@/hooks/useInitializeData';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from './Header';

export default function RootLayout() {
  useInitializeData();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
