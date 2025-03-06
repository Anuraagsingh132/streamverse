'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './login-form';
import RegisterForm from './register-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultView = 'login',
}: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);

  const handleSuccess = () => {
    onClose();
  };

  const switchToLogin = () => setView('login');
  const switchToRegister = () => setView('register');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' ? 'Sign In' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription>
            {view === 'login'
              ? 'Enter your email and password to sign in to your account'
              : 'Enter your information to create a new account'}
          </DialogDescription>
        </DialogHeader>

        {view === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onRegister={switchToRegister} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onLogin={switchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
