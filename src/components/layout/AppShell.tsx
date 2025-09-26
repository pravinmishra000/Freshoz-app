'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Home, MapPin, User, ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';

const navItems = [
  { href: '/', label: 'Products', icon: Home },
  { href: '/track-order', label: 'Track Order', icon: MapPin },
  { href: '/earnings', label: 'Earnings', icon: BarChart2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full">
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
                      isActive={pathname === item.href}
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

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="md:hidden">
                <Logo />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person face" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        <nav className="glass-card fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full p-2 shadow-lg md:hidden">
          <div className="flex items-center justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-12 w-12 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors',
                  pathname === item.href
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
