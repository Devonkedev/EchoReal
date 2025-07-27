import { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Profile() {
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    friendShares: true,
    musicRecommendations: false,
    weeklyInsights: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareAnalytics: false,
    allowFriendRequests: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-medium mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="PST (UTC-8)" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Healing Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="favoriteGenres">Favorite Music Genres</Label>
                    <Input id="favoriteGenres" placeholder="Pop, Classical, Ambient..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="journalTime">Preferred Journal Time</Label>
                    <Input id="journalTime" defaultValue="Evening (8:00 PM)" />
                  </div>
                </div>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Daily Journal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to write in your journal
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReminders}
                    onCheckedChange={(value) => handleNotificationChange('dailyReminders', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Friend Shares</Label>
                    <p className="text-sm text-muted-foreground">
                      When friends share entries or songs with you
                    </p>
                  </div>
                  <Switch
                    checked={notifications.friendShares}
                    onCheckedChange={(value) => handleNotificationChange('friendShares', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Music Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      New healing songs based on your mood
                    </p>
                  </div>
                  <Switch
                    checked={notifications.musicRecommendations}
                    onCheckedChange={(value) => handleNotificationChange('musicRecommendations', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your emotional journey
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyInsights}
                    onCheckedChange={(value) => handleNotificationChange('weeklyInsights', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Profile Visible to Friends</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow friends to see your profile information
                    </p>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(value) => handlePrivacyChange('profileVisible', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Share Anonymous Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareAnalytics}
                    onCheckedChange={(value) => handlePrivacyChange('shareAnalytics', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others send you friend requests
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowFriendRequests}
                    onCheckedChange={(value) => handlePrivacyChange('allowFriendRequests', value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Account Security</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline">Change Password</Button>
                  <Button variant="outline">Enable Two-Factor Auth</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your journal entries, mood data, and music preferences
                  </p>
                  <Button variant="outline">Download Data</Button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium mb-2">Data Backup</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last backup: January 20, 2025 at 3:22 PM
                  </p>
                  <Button variant="outline">Create Backup</Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium mb-2 text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}