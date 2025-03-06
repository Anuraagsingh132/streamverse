'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import UserProfile from '@/components/auth/user-profile';

const navItems = [
  {
    name: 'Home',
    href: '/home',
  },
  {
    name: 'Movies',
    href: '/movies',
  },
  {
    name: 'TV Shows',
    href: '/tv-shows',
  },
  {
    name: 'New & Popular',
    href: '/new-and-popular',
  },
];

export default function AuthNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <UserProfile />
    </div>
  );
}
