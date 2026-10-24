'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Star,
  Clock,
  Loader2,
  RefreshCcw,
  Utensils,
  Receipt,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin
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
import { OrderDetailsDialog } from '@/components/dashboard/restaurant/OrderDetailsDialog';
import { fetchMyOrders, getReviewsForProvider } from '@/services/api';
import type { OrderResponse, ReviewResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function RestaurantDashboardPage() {
  const [displayName, setDisplayName] = useState('Partner');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const name = localStorage.getItem('userName') || localStorage.getItem('restaurantName');
      if (name) setDisplayName(name);

      const restaurantId = localStorage.getItem('restaurantId') || '';
      const [ordersData, reviewsData] = await Promise.all([
        fetchMyOrders(restaurantId),
        getReviewsForProvider(restaurantId, 'Restaurant').catch(() => [] as ReviewResponse[])
      ]);

      const sorted = (ordersData || []).sort(
        (a, b) => new Date(b.orderPlacedAt).getTime() - new Date(a.orderPlacedAt).getTime()
      );
      setOrders(sorted);
      setReviews(reviewsData || []);
    } catch (err) {
      console.error("Dashboard overview load error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrders = orders.filter(o =>
    ['Confirmed', 'Preparing', 'Preparation Completed', 'Out for Delivery', 'Pending Approval'].includes(o.currentStatusId)
  );
  const deliveredOrders = orders.filter(o => o.currentStatusId === 'Delivered');
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Cooking
          </span>
        );
      case 'Preparation Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Ready
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            On the way
          </span>
        );
      case 'Confirmed':
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            New Order
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <Badge variant="secondary" className="rounded-full text-[10px] font-black uppercase">
            {status}
          </Badge>
        );
    }
  };

  const formatOrderTime = (timeString?: string) => {
    if (!timeString) return 'Just now';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
             date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Live overview of incoming orders, kitchen performance, and customer ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="rounded-full font-bold gap-2 text-xs border-border shadow-xs"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
            Refresh Data
          </Button>
          <Button asChild size="sm" className="rounded-full font-bold text-xs bg-primary text-primary-foreground">
            <Link href="/restaurant-dashboard/orders">
              Manage Orders ({activeOrders.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Life-time restaurant earnings"
        />
        <StatCard
          title="Total Orders"
          value={`${orders.length}`}
          icon={ShoppingCart}
          description={`${deliveredOrders.length} fulfilled successfully`}
        />
        <StatCard
          title="Active Kitchen Orders"
          value={`${activeOrders.length}`}
          icon={Clock}
          description="In preparation or transit"
        />
        <StatCard
          title="Avg. Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : "5.0"}
          icon={Star}
          description={`Based on ${reviews.length} customer reviews`}
        />
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* RECENT ORDERS TABLE (Takes 2 cols) */}
        <Card className="lg:col-span-2 border border-border/80 shadow-xl bg-card rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/60 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-black">Recent Orders</CardTitle>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black rounded-full px-2.5">
                  {orders.length} Total
                </Badge>
              </div>
              <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Real-time feed of dishes ordered, kitchen timings, and customer totals.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-bold gap-1.5 h-8">
              <Link href="/restaurant-dashboard/orders">
                View All Orders →
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse text-xs">Syncing recent orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-bold text-foreground">No orders received yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  When food lovers discover your menu and place orders, they will instantly appear here with live dish details and timestamps.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadData(true)}
                  className="rounded-full mt-4 font-bold text-xs"
                >
                  Check Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-border/50 text-[11px] font-black uppercase text-muted-foreground">
                      <TableHead className="px-6 py-3.5">Customer & Order</TableHead>
                      <TableHead className="py-3.5">Dishes Ordered</TableHead>
                      <TableHead className="py-3.5">Order Timing</TableHead>
                      <TableHead className="py-3.5">Status</TableHead>
                      <TableHead className="text-right py-3.5">Earned</TableHead>
                      <TableHead className="text-right px-6 py-3.5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 8).map((order) => {
                      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                      const moreCount = (order.items?.length || 0) - 1;

                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-muted/30 transition-colors border-border/50 cursor-pointer group"
                          onClick={() => setSelectedOrder(order)}
                        >
                          {/* Customer Name and Order ID */}
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customerName || order.id}`}
                                  alt="Avatar"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                                  {(order.customerName || 'C').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">
                                  {order.customerName || 'Food Customer'}
                                </p>
                                <span className="font-mono text-[10px] font-bold text-muted-foreground block">
                                  #{order.id.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Order Items */}
                          <TableCell className="py-4 max-w-[200px]">
                            {firstItem ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "h-2 w-2 rounded-full shrink-0",
                                      firstItem.itemType?.toLowerCase() === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                                    )}
                                  />
                                  <p className="text-xs font-bold text-foreground truncate">
                                    {firstItem.itemName}
                                  </p>
                                  <span className="text-[10px] font-black text-muted-foreground">
                                    x{firstItem.quantity}
                                  </span>
                                </div>
                                {moreCount > 0 && (
                                  <span className="text-[10px] font-bold text-primary block">
                                    +{moreCount} more dish{moreCount > 1 ? 'es' : ''}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Standard Order</span>
                            )}
                          </TableCell>

                          {/* Order Timings */}
                          <TableCell className="py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                              <span>{formatOrderTime(order.orderPlacedAt)}</span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-4">
                            {getStatusBadge(order.currentStatusId)}
                          </TableCell>

                          {/* Earning Amount */}
                          <TableCell className="text-right py-4 font-black text-foreground text-sm">
                            ${order.totalAmount?.toFixed(2)}
                          </TableCell>

                          {/* Action Button */}
                          <TableCell className="text-right px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 w-8 rounded-full p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="View Invoice & Items"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {orders.length > 8 && (
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Showing 8 of {orders.length} recent orders
              </span>
              <Button asChild variant="link" size="sm" className="font-bold text-xs p-0 text-primary">
                <Link href="/restaurant-dashboard/orders">View complete order history →</Link>
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* RECENT FEEDBACK / REVIEWS (Takes 1 col) */}
        <Card className="border border-border/80 shadow-xl bg-card rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/20 border-b border-border/60 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black">Recent Feedback</CardTitle>
              <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{avgRating > 0 ? avgRating.toFixed(1) : "5.0"}</span>
              </div>
            </div>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Customer ratings and reviews for your kitchen dishes.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Star className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-bold text-muted-foreground">No customer reviews yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Positive reviews will appear here as customers rate your fulfilled orders.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 4).map((review) => (
                  <div
                    key={review.id}
                    className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-primary/20">
                          <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                            {(review.customerName || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-foreground">
                          {review.customerName || 'Verified Diner'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3 h-3",
                              s <= Math.round(review.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-muted-foreground italic text-xs leading-relaxed line-clamp-2">
                        "{review.comment}"
                      </p>
                    )}

                    {review.menuItemName && (
                      <Badge variant="outline" className="text-[9px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                        Dish: {review.menuItemName}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {reviews.length > 0 && (
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4">
              <Button variant="ghost" asChild className="w-full text-xs font-bold rounded-xl h-8">
                <Link href="/restaurant-dashboard/feedback">Manage & Reply to Feedback →</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* ── ORDER INVOICE / DETAILS MODAL ── */}
      {selectedOrder && (
        <OrderDetailsDialog
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
