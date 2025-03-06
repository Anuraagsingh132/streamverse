'use client';

import { useState } from 'react';
import { useAuthStore } from '@/services/AuthService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegister?: () => void;
}

export default function LoginForm({ onSuccess, onRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, loginWithGoogle, error: authError, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    
    try {
      setIsLoading(true);
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    clearError();
    
    try {
      setIsLoading(true);
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {(error || authError) && (
            <div className="text-sm text-red-500">{error || authError}</div>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="underline underline-offset-4 hover:text-primary"
          onClick={onRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
}
