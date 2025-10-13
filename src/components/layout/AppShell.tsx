

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LogOut, 
  User, 
  LayoutDashboard,
  Package, 
  MessageSquare, 
  Wallet,
  Tag,
  Users,
  ShoppingCart,
  LayoutGrid,
  Coins,
  Heart // Added Heart icon for Wishlist
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
  SidebarInset
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
import { CartSheet } from '../cart/CartSheet';
import { SmartSearchBar } from '../products/SmartSearchBar';
import { CartToast } from '../cart/CartToast';
import FreshozBuddy from '../freshoz/freshoz-buddy';
import { BackButton } from '../freshoz/BackButton';

// Customer navigation items
const customerNavItems = [
  { href: '/products', label: 'Home / Shop', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/orders', label: 'My Orders', icon: Package },
  { href: '/wishlist', label: 'Wishlist', icon: Heart }, // Added Wishlist
  { href: '/offers', label: 'Offers & Discounts', icon: Tag },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/savings', label: 'Savings Hub', icon: Coins },
  { href: '/chat', label: 'Help & Support', icon: MessageSquare },
];

// Admin navigation items
const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders Management', icon: Package },
    { href: '/admin/products', label: 'Products Management', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users / Customers', icon: Users },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authUser, appUser, loading, logout } = useAuth();
  
  const isAdmin = appUser?.role === 'admin';
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/products' || pathname === '/';

  // If it's the login page, render children without the shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const checkActive = (href: string) => {
    if (href === '/products') {
      // Only active if it's exactly /products or starts with /products/ but not /products/category
      return pathname === href || (pathname.startsWith('/products/') && !pathname.startsWith('/products/category'));
    }
     if (href === '/categories') {
      return pathname.startsWith('/categories') || pathname.startsWith('/products/category');
    }
    return pathname.startsWith(href);
  };


  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full flex-row">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link href="/" className="block">
                <Logo />
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={checkActive(item.href)}
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
          <SidebarFooter>
            <SidebarSeparator/>
             {authUser && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/profile" passHref>
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/profile')}
                      tooltip="Profile"
                    >
                      <User />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout} tooltip="Logout">
                      <LogOut/>
                      <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
             )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header */}
          <header className="glass-app-bar sticky top-0 z-20 flex h-auto flex-col items-center gap-2 border-b p-4 backdrop-blur-sm sm:px-6">
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="lg:hidden">
                    <SidebarTrigger className="glass-icon-button !h-12 !w-12" />
                  </div>
                  {!isHomePage && <BackButton />}
                </div>

                <div className="flex flex-1 items-center justify-end gap-2">
                  <div className="w-full max-w-lg hidden lg:block">
                      <SmartSearchBar />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/wallet">
                        <Button variant="ghost" size="icon" className="glass-icon-button">
                            <Wallet className="h-5 w-5 text-positive" />
                        </Button>
                    </Link>
                    {loading ? (
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    ) : authUser ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="glass-icon-button">
                            <User className="h-5 w-5 text-positive" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/profile">
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button asChild variant="outline" className="bg-primary/10 border-primary/20 hover:bg-primary/20">
                        <Link href="/login">
                          <User className="mr-2 h-4 w-4 text-positive" />
                          <span className="text-primary font-semibold">Login</span>
                        </Link>
                      </Button>
                    )}
                    <div className="hidden lg:block">
                      <CartSheet />
                    </div>
                  </div>
                </div>
            </div>
            <div className="w-full px-2 lg:hidden">
                  <SmartSearchBar />
              </div>
          </header>
          
          {/* Main Body */}
          <main className="flex-1 overflow-y-auto px-4 pb-24 md:pb-4">
            {children}
          </main>
            
          {!isAdmin && <CartToast />}
          {!isAdmin && <FreshozBuddy />}
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        {!isAdmin && (
           <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 md:hidden">
            <div className="glass-card flex items-center justify-around gap-2 rounded-full p-2">
              {[ 
                { href: '/products', label: 'Home', icon: Home },
                { href: '/categories', label: 'Categories', icon: LayoutGrid },
                { href: '/wishlist', label: 'Wishlist', icon: Heart },
                { href: '/offers', label: 'Offers', icon: Tag },
                { href: '/checkout', label: 'Cart', icon: ShoppingCart },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-12 w-12 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors',
                    checkActive(item.href)
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
        )}
      </div>
    </SidebarProvider>
  );
}
