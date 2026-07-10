'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';

const ADMIN_LINKS = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/products', label: 'Products' },
  { href: '/dashboard/admin/orders', label: 'Orders' },
  { href: '/dashboard/admin/transactions', label: 'Transactions' },
  { href: '/dashboard/admin/wallets', label: 'Wallets' },
  { href: '/dashboard/admin/activity', label: 'Activity Logs' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {ADMIN_LINKS.map((link) => (
        <Link key={link.href} href={link.href}>
          <span
            className={cn(
              'inline-block rounded-md border border-border/60 px-3 py-1.5 text-sm hover:bg-secondary/60',
              pathname === link.href ? 'bg-secondary/60 text-foreground' : 'bg-secondary/30 text-muted-foreground',
            )}
          >
            {link.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
