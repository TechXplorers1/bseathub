
'use client';

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        <DashboardStats stats={adminStats} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
        <RegistrationsTable registrations={pendingRegistrations} />
        <OrdersTable orders={allOrders} />
        <BookingsTable bookings={allBookings} />
      </div>
    </div>
  );
}
