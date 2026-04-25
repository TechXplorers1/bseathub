'use client';
import { useEffect, useState } from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ShoppingCart,
  Star,
  Clock,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchMyOrders, getReviewsForProvider } from '@/services/api';
import type { OrderResponse, ReviewResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function RestaurantDashboardPage() {
  const [displayName, setDisplayName] = useState('User');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setDisplayName(name);

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersData, reviewsData] = await Promise.all([
          fetchMyOrders(),
          getReviewsForProvider(localStorage.getItem('restaurantId') || '', 'Restaurant').catch(() => [])
        ]);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => ['Confirmed', 'Preparing', 'Preparation Completed'].includes(o.currentStatusId)).length;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground font-medium">
            Here's a live look at your restaurant's performance today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Life-time earnings"
        />
        <StatCard
          title="Total Orders"
          value={`${orders.length}`}
          icon={ShoppingCart}
          description="Orders processed"
        />
        <StatCard
          title="Active Orders"
          value={`${pendingOrdersCount}`}
          icon={Clock}
          description="Currently in progress"
        />
        <StatCard
          title="Avg. Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          description={`Based on ${reviews.length} reviews`}
        />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
        <Card className="xl:col-span-2 border-none shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center bg-muted/30 border-b border-border/50">
            <div className="grid gap-1">
              <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
              <CardDescription className="font-medium text-muted-foreground/80">
                A live summary of your incoming orders.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-2 rounded-full font-bold">
              <Link href="/restaurant-dashboard/orders">
                View All
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse text-sm">Syncing orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-muted-foreground font-black">No orders yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-black px-6 py-4">Customer Details</TableHead>
                    <TableHead className="text-right font-black py-4">Earning</TableHead>
                    <TableHead className="hidden sm:table-cell font-black py-4">Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-right font-black px-6 py-4">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors border-border/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customerName}`} alt="Avatar" />
                            <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-black text-sm">{order.customerName}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">{order.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tight"
                        >
                          {order.currentStatusId}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-xs font-bold text-muted-foreground px-6 py-4">
                        {new Date(order.orderPlacedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-xl font-bold">Recent Feedback</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Latest reviews from your customers.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 font-bold">No feedback yet</p>
            ) : (
              <div className="grid gap-8">
                {reviews.slice(0, 3).map(review => (
                  <div key={review.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500">
                    <Avatar className="h-10 w-10 shrink-0 border border-primary/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customerName}`} alt="Avatar" />
                      <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black leading-none">{review.customerName}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("w-2.5 h-2.5", i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {reviews.length > 3 && (
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4">
              <Button variant="ghost" asChild className="w-full text-xs font-bold gap-2">
                <Link href="/restaurant-dashboard/feedback">View All Feedback</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
