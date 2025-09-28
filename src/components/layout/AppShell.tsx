
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogOut, User, LayoutDashboard, UserCog, Package, LayoutGrid, MessageSquare, Wallet } from 'lucide-react';

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
  SidebarSeparator
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
import { SmartSearchBar } from '../products/SmartSearchBar';

const navItems = [
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/chat', label: 'Support', icon: MessageSquare },
];

const bottomNavItems = [
  { href: '/products', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authUser, appUser, loading, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        <header className="glass-app-bar sticky top-0 z-20 flex h-auto flex-col items-center justify-between gap-2 border-b p-4 backdrop-blur-sm sm:px-6">
           <div className="container mx-auto flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="lg:block">
                  <Link href="/" className="block">
                      <Logo />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-full max-w-lg px-2 lg:block hidden">
                    <SmartSearchBar />
                </div>
                <Link href="/wallet">
                    <Button variant="ghost" size="icon" className="glass-icon-button">
                        <Wallet className="h-5 w-5 text-primary" />
                    </Button>
                </Link>
                {loading ? (
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                ) : authUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={authUser.photoURL || `https://picsum.photos/seed/user-avatar/40/40`} data-ai-hint="person face"/>
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
                  <Button asChild variant="ghost" size="icon" className="glass-icon-button">
                    <Link href="/login">
                      <User className="h-5 w-5 text-primary" />
                    </Link>
                  </Button>
                )}
                <SidebarTrigger className="lg:hidden glass-icon-button" />
              </div>
           </div>
           <div className="w-full px-2 lg:hidden">
                <SmartSearchBar />
            </div>
        </header>

         {/* Mobile-only Sidebar */}
        <Sidebar className="lg:hidden" side="right">
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

              {authUser && (
                <>
                  <SidebarSeparator />
                  {appUser?.role === 'admin' && (
                    <>
                       <SidebarMenuItem>
                        <Link href="/admin/dashboard" passHref>
                          <SidebarMenuButton isActive={pathname.startsWith('/admin/dashboard')}>
                            <LayoutDashboard />
                            <span>Dashboard</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Link href="/admin/orders" passHref>
                          <SidebarMenuButton isActive={pathname.startsWith('/admin/orders')}>
                            <UserCog />
                            <span>Manage Orders</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                       <SidebarSeparator />
                    </>
                  )}
                  <SidebarMenuItem>
                    <Link href="/profile" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/profile')}>
                        <User />
                        <span>Profile</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton onClick={logout}>
                      <LogOut />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="glass-card fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full p-2 shadow-lg md:hidden">
          <div className="flex items-center justify-center gap-2">
            {bottomNavItems.map((item) => (
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
             <CartSheet />
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}
