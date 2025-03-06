'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/services/AuthService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUserProfile } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    if (user) {
      setName(user.name || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateUserProfile({ name, photoURL });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Your Profile</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  {photoURL ? (
                    <AvatarImage src={photoURL} alt={name} />
                  ) : (
                    <AvatarFallback>{getInitials(name || user.email || 'User')}</AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="opacity-70"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photoURL">Profile Photo URL</Label>
                <Input
                  id="photoURL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-muted-foreground">Enter a URL to an image for your profile photo</p>
              </div>
              
              {message.text && (
                <div className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {message.text}
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Account Type</h3>
              <p className="text-sm text-muted-foreground">
                {user.isSubscribed ? 'Premium Member' : 'Free User'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Account Created</h3>
              <p className="text-sm text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/home')}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
