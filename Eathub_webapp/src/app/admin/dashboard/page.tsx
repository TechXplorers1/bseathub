// app/admin/dashboard/page.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { RegistrationsTable } from '@/components/admin/RegistrationsTable';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { BookingsTable } from '@/components/admin/BookingsTable';
import {
  adminStats,
  chartData,
  recentActivities,
  pendingRegistrations,
  allOrders,
  allBookings,
} from '@/lib/admin-data';
// ✅ Removed Tabs import — no more top-level tabs
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const timezones = [
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'UTC',
];

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';
  const settingsTab = searchParams.get('settings_tab') || 'organization';

  // ✅ No onTabChange needed — sidebar handles navigation
  const onSettingsTabChange = (tab: string) => {
    router.push(`/admin/dashboard?tab=settings&settings_tab=${tab}`);
  };

  // Helper to render page title
  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Admin Dashboard';
      case 'registrations': return 'Registrations';
      case 'orders': return 'Orders';
      case 'bookings': return 'Chef Bookings';
      case 'settings': return 'Settings';
      default: return 'Admin';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{getPageTitle()}</h1>

      {/* ✅ Render content based on ?tab=... — NO top tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <DashboardStats stats={adminStats} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <AnalyticsCharts
                revenueData={chartData.revenue}
                signupsData={chartData.signups}
              />
            </div>
            <div className="lg:col-span-2">
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <RegistrationsTable registrations={pendingRegistrations} />
      )}

      {activeTab === 'orders' && (
        <OrdersTable orders={allOrders} />
      )}

      {activeTab === 'bookings' && (
        <BookingsTable bookings={allBookings} />
      )}

      {/* ✅ Settings: Show sub-tabs (horizontal) + content — as in your image */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 🔹 This is the "2nd line tabs" from your image — keep them */}
          <Tabs value={settingsTab} onValueChange={onSettingsTabChange}>
            <TabsList>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="profile">Admin Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="localization">Localization</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="data">Data & Privacy</TabsTrigger>
            </TabsList>

            {/* Organization Tab Content */}
            <TabsContent value="organization">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Manage your legal and brand information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legal-name">Legal Name</Label>
                      <Input id="legal-name" placeholder="Your Company Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax/VAT ID</Label>
                      <Input id="tax-id" placeholder="e.g., EU123456789" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Registered Address</Label>
                    <Textarea
                      id="address"
                      placeholder="123 Business Rd, Suite 100, Commerce City, 12345"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Organization Details</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Admin Profile Tab Content */}
            <TabsContent value="profile">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Profile</CardTitle>
                    <CardDescription>
                      Manage your personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Full Name</Label>
                        <Input id="admin-name" defaultValue="Admin User" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input id="admin-email" type="email" defaultValue="admin@eathub.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-phone">Phone Number</Label>
                      <Input id="admin-phone" type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Profile</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab Content */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication & Security</CardTitle>
                  <CardDescription>
                    Manage security settings for your organization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enforce 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Require two-factor authentication for all admin users.
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Security Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Billing Tab Content */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Payments</CardTitle>
                  <CardDescription>
                    Manage payment processors and payout settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Processors</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect your payment gateways. API Keys and webhooks are required.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-key">Stripe API Key</Label>
                      <Input id="stripe-key" placeholder="sk_test_..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal-key">PayPal Client ID</Label>
                      <Input id="paypal-key" placeholder="A..." />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Billing Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Localization Tab Content */}
            <TabsContent value="localization">
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>
                    Manage localization and formatting settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-language">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Language Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* API Tab Content */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API & Integrations</CardTitle>
                  <CardDescription>
                    Manage API keys, webhooks, and third-party integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Keys</Label>
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <p className="font-mono text-sm truncate">
                        prod_sk_••••••••••••••••••••1234
                      </p>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Enabled Integrations</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span>Stripe</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span>Twilio SMS</span>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span>SendGrid</span>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Integration Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Data & Privacy Tab Content */}
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Manage data retention, exports, and privacy settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention</Label>
                    <Select defaultValue="180">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                        <SelectItem value="1095">1095 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How long to keep operational data like order history.
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label>Anonymous Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect anonymous usage data to improve the platform.
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button>Save Privacy Settings</Button>
                  <Button variant="outline">Export All Data</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}