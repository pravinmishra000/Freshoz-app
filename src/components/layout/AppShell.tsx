
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LogOut, LogIn, UserCog, LayoutDashboard, ShoppingBag, Package, Wallet } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartSheet } from '@/components/cart/CartSheet';

const navItems = [
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/orders', label: 'My Orders', icon: Package },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/chat', label: 'Support', icon: MessageSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authUser, appUser, loading, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <Sidebar className="hidden md:flex">
          <SidebarHeader>
            <Link href="/" className="block p-2">
              <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="md:hidden">
                 <Link href="/" className="block">
                    <Logo />
                 </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <CartSheet />
              {loading ? (
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              ) : authUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={authUser.photoURL || `https://picsum.photos/seed/user-avatar/40/40`} data-ai-hint="person face" />
                      <AvatarFallback>{authUser.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {appUser?.role === 'admin' && (
                      <>
                       <DropdownMenuItem asChild>
                         <Link href="/admin/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href="/admin/orders">
                          <UserCog className="mr-2 h-4 w-4" />
                          <span>Manage Orders</span>
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                      </>
                     )}
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="glass-card fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full p-2 shadow-lg md:hidden">
          <div className="flex items-center justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-12 w-12 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}
