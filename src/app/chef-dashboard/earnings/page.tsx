
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { earningsData, recentBookings } from '@/lib/chef-dashboard-data';
import { ChefChart } from '@/components/dashboard/chef/ChefChart';
  
  export default function EarningsPage() {
    const transactionHistory = recentBookings.filter(b => b.status === 'Completed');
    const totalEarnings = transactionHistory.reduce((acc, booking) => acc + booking.total, 0);
  
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Earnings</h1>
  
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
              <CardDescription>All-time gross earnings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">${overviewStats.totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
              <CardDescription>Earnings for July 2024.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">$3,250.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Next Payout</CardTitle>
              <CardDescription>Scheduled for August 1, 2024.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">$1,800.00</p>
            </CardContent>
          </Card>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>Your earnings over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChefChart data={earningsData} dataKey="earnings" type="line" />
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recently completed bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionHistory.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.customer.name}</TableCell>
                    <TableCell>{booking.eventDate}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell className="text-right">${booking.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overviewStats = {
    totalEarnings: 15600,
  };
  
