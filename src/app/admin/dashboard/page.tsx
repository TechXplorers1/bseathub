'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="bookings">Chef Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 mt-4">
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
    </div>
  );
}
