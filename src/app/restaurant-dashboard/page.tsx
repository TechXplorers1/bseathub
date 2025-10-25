
'use client';

import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ShoppingCart,
  Star,
  Clock,
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
import { StatCard } from '@/components/dashboard/restaurant/StatCard';
import { overviewStats, recentOrders } from '@/lib/restaurant-dashboard-data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function RestaurantDashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's a quick look at your restaurant's performance.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${overviewStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="+18.3% from last month"
        />
        <StatCard
          title="Total Orders"
          value={`+${overviewStats.totalOrders}`}
          icon={ShoppingCart}
          description="+12.5% from last month"
        />
        <StatCard
          title="Pending Orders"
          value={overviewStats.pendingOrders}
          icon={Clock}
          description="Orders needing your attention"
        />
        <StatCard
          title="Avg. Rating"
          value={overviewStats.avgRating.toFixed(1)}
          icon={Star}
          description="Based on 1,204 reviews"
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                A summary of your most recent orders.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/restaurant-dashboard/orders">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={order.customer.avatarUrl} alt="Avatar" />
                          <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{order.customer.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {order.customer.email}
                            </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{order.date}</TableCell>
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
                Latest reviews from your customers.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-start gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Michael Scott</p>
                <p className="text-sm text-muted-foreground">
                  "Best carbonara in the city! World's best boss, world's best pasta."
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026705a" alt="Avatar" />
                <AvatarFallback>JH</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Jim Halpert</p>
                <p className="text-sm text-muted-foreground">
                    "The bruschetta was great. A bit hard to eat while pranking Dwight, but I managed."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
