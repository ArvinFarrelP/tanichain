'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Leaf,
  ListOrdered,
  LogOut,
  Menu,
  Package,
  Receipt,
  Shield,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuthStore, AuthUser } from '../../store/authStore';
import { cn } from '../../lib/utils';

function navLinksFor(user: AuthUser) {
  const links = [{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard }];

  if (user.role === 'FARMER') {
    links.push({ href: '/dashboard/products', label: 'My Products', icon: Package });
  } else {
    links.push({ href: '/products', label: 'Marketplace', icon: ShoppingBag });
  }

  links.push({ href: '/dashboard/orders', label: 'Orders', icon: ListOrdered });
  links.push({ href: '/dashboard/transactions', label: 'Transactions', icon: Receipt });
  links.push({ href: '/dashboard/profile', label: 'Profile', icon: User });

  if (user.role === 'ADMIN') {
    links.push({ href: '/dashboard/admin', label: 'Admin', icon: Shield });
  }

  return links;
}

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearSession } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links = navLinksFor(user);

  return (
    <header className="border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            TaniChain
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground',
                  pathname === link.href && 'bg-secondary/60 text-foreground',
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">{user.role}</Badge>
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.fullName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
            title="Log out"
            aria-label="Log out"
            className="hidden lg:inline-flex"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            title="Menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 lg:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  pathname === link.href && 'bg-secondary/60 text-foreground',
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                clearSession();
                router.push('/login');
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
