
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';

  const onTabChange = (tab: string) => {
    router.push(`/admin/dashboard?tab=${tab}`);
  };


  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="bookings">Chef Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
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
      </TabsContent>
      <TabsContent value="registrations">
        <RegistrationsTable registrations={pendingRegistrations} />
      </TabsContent>
      <TabsContent value="orders">
        <OrdersTable orders={allOrders} />
      </TabsContent>
      <TabsContent value="bookings">
        <BookingsTable bookings={allBookings} />
      </TabsContent>
    </Tabs>
  );
}
