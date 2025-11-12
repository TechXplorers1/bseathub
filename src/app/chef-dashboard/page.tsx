
'use client';

import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  CalendarCheck,
  Star,
  Clock,
  Book,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { StatCard } from '@/components/dashboard/chef/StatCard';
import { overviewStats, recentBookings } from '@/lib/chef-dashboard-data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ChefDashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Chef Maria!</h1>
          <p className="text-muted-foreground">
            Here's what's cooking in your dashboard.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`$${overviewStats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          description="+15.2% from last month"
        />
        <StatCard
          title="Upcoming Bookings"
          value={overviewStats.upcomingBookings}
          icon={CalendarCheck}
          description="In the next 30 days"
        />
        <StatCard
          title="Pending Requests"
          value="2"
          icon={Clock}
          description="Awaiting your confirmation"
        />
        <StatCard
          title="Avg. Rating"
          value={overviewStats.avgRating.toFixed(1)}
          icon={Star}
          description="Based on 65 reviews"
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                A summary of your most recent bookings and requests.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/chef-dashboard/bookings">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={booking.customer.avatarUrl} alt="Avatar" />
                          <AvatarFallback>{booking.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{booking.customer.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.eventDate}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={booking.status === 'Completed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${booking.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
             <CardDescription>
                Latest reviews from your clients.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-start gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=alice" alt="Avatar" />
                <AvatarFallback>AW</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Alice Wonderland</p>
                <p className="text-sm text-muted-foreground">
                  "Chef Maria was incredible! The food was out of this world..."
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=bruce" alt="Avatar" />
                <AvatarFallback>BW</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Bruce Wayne</p>
                <p className="text-sm text-muted-foreground">
                    "The catering for our gala was flawless. Exceeded all expectations."
                </p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=peter" alt="Avatar" />
                <AvatarFallback>PP</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Peter Parker</p>
                <p className="text-sm text-muted-foreground">
                    "Great cooking class! Learned a lot and had a ton of fun."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
