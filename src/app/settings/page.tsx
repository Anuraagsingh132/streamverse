'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/services/AuthService';
import UserService from '@/services/UserService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoplay: true,
    subtitles: false,
    quality: 'auto',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/settings');
    }
    
    const fetchSettings = async () => {
      if (!isAuthenticated || isLoading) return;
      
      setIsLoadingSettings(true);
      try {
        if (user?.id) {
          const userSettings = await UserService.getUserSettings(user.id);
          
          // Map from UserService.UserSettings to our component settings format
          setSettings({
            darkMode: userSettings.theme === 'dark',
            notifications: userSettings.emailNotifications,
            autoplay: userSettings.autoplay,
            subtitles: false, // Default value as it doesn't exist in UserService settings
            quality: 'auto', // Default value as it doesn't exist in UserService settings
          });
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to load settings');
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, [user, isAuthenticated, isLoading]);

  const handleUpdateSettings = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      // Convert from our component settings to UserService.UserSettings format
      await UserService.updateUserSettings(user.id, {
        theme: settings.darkMode ? 'dark' : 'light',
        emailNotifications: settings.notifications,
        autoplay: settings.autoplay
      });
      setSuccessMessage('Settings updated successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleQualityChange = (quality: string) => {
    setSettings(prev => ({
      ...prev,
      quality
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {(errorMessage || successMessage) && (
        <div className={`p-3 rounded-md text-sm mb-6 ${
          errorMessage 
            ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200' 
            : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
        }`}>
          {errorMessage || successMessage}
        </div>
      )}
      
      <Tabs defaultValue="appearance">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="playback">Playback</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how StreamVerse looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a more comfortable viewing experience at night
                  </p>
                </div>
                <Switch 
                  id="darkMode" 
                  checked={settings.darkMode} 
                  onCheckedChange={() => handleToggleSetting('darkMode')} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="playback">
          <Card>
            <CardHeader>
              <CardTitle>Playback Settings</CardTitle>
              <CardDescription>Customize your video playback experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoplay" className="text-base">Autoplay</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically play videos when the page loads
                  </p>
                </div>
                <Switch 
                  id="autoplay" 
                  checked={settings.autoplay} 
                  onCheckedChange={() => handleToggleSetting('autoplay')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="subtitles" className="text-base">Subtitles</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically show subtitles when available
                  </p>
                </div>
                <Switch 
                  id="subtitles" 
                  checked={settings.subtitles} 
                  onCheckedChange={() => handleToggleSetting('subtitles')} 
                />
              </div>
              
              <div>
                <Label className="text-base mb-2 block">Video Quality</Label>
                <div className="flex flex-wrap gap-2">
                  {['auto', '1080p', '720p', '480p', '360p'].map(quality => (
                    <Button 
                      key={quality}
                      variant={settings.quality === quality ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQualityChange(quality)}
                    >
                      {quality}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select your preferred video quality. Auto will adjust based on your connection.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about new content and updates
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={settings.notifications} 
                  onCheckedChange={() => handleToggleSetting('notifications')} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button onClick={handleUpdateSettings} disabled={isSaving}>
          {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
