'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/services/AuthService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import AuthModal from './auth-modal';

export default function UserProfile() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const router = useRouter();

  const openLoginModal = () => {
    setAuthView('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthView('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Icons.spinner className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openLoginModal}>
            Sign In
          </Button>
          <Button size="sm" onClick={openRegisterModal}>
            Sign Up
          </Button>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          defaultView={authView}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt={user?.name || ''} />
              <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigateTo('/profile')}>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo('/settings')}>
            <Icons.settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo('/watchlater')}>
            <Icons.bookmark className="mr-2 h-4 w-4" />
            <span>Watchlist</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo('/history')}>
            <Icons.history className="mr-2 h-4 w-4" />
            <span>Watch History</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <Icons.logout className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
