'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Utensils,
  Store,
  ChefHat,
  Clock,
  Calendar,
  MessageSquare,
  Search,
  Receipt,
  ShoppingBag,
  CheckCircle2,
  Edit3,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  Check,
  Building2,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getReviewsByCustomer,
  fetchOrdersByCustomer,
  fetchCustomerBookings,
  fetchUserProfile,
} from '@/services/api';
import type { ReviewResponse, OrderResponse, ChefBooking } from '@/lib/types';
import { ReviewDialog } from '@/components/dashboard/ReviewDialog';
import { EditReviewDialog } from '@/components/dashboard/EditReviewDialog';
import { OrderDetailsDialog } from '@/components/dashboard/OrderDetailsDialog';

type ProviderFilter = 'ALL' | 'Restaurant' | 'HomeFood' | 'Chef';
type RatingFilter = 'ALL' | '5' | '4' | '3' | 'BELOW_3';
type SortOption = 'NEWEST' | 'OLDEST' | 'RATING_HIGH' | 'RATING_LOW';

export default function UserReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Foodie');

  // Core Data
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [chefBookings, setChefBookings] = useState<ChefBooking[]>([]);

  // Filtering & Search States
  const [activeTab, setActiveTab] = useState<'reviewed' | 'pending'>('reviewed');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProviderFilter>('ALL');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('ALL');
  const [hasReplyOnly, setHasReplyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  // Modals & Dialogs
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderResponse | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [reviewDialogState, setReviewDialogState] = useState<{
    isOpen: boolean;
    order: OrderResponse | null;
  }>({
    isOpen: false,
    order: null,
  });

  // Load User and Reviews
  const loadReviewsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    if (!token && !storedUserId) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      let currentUserId = storedUserId;
      try {
        const profile = await fetchUserProfile();
        if (profile?.id) {
          currentUserId = profile.id;
          setUserId(profile.id);
          setUserName(profile.name || profile.firstName || 'Foodie');
        }
      } catch (err) {
        console.warn('Profile fetch fallback to stored userId:', err);
      }

      if (!currentUserId) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setUserId(currentUserId);

      // Fetch customer reviews, past orders, and chef bookings in parallel
      const [customerReviews, customerOrders, customerBookings] = await Promise.all([
        getReviewsByCustomer(currentUserId).catch(() => [] as ReviewResponse[]),
        fetchOrdersByCustomer(currentUserId).catch(() => [] as OrderResponse[]),
        fetchCustomerBookings(currentUserId).catch(() => [] as ChefBooking[]),
      ]);

      setReviews(customerReviews || []);
      setOrders(customerOrders || []);
      setChefBookings(customerBookings || []);
    } catch (err: any) {
      console.error('Failed to load user review data:', err);
      toast({
        title: 'Error loading reviews',
        description: 'Could not fetch your reviews and order feedback.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  // Map orderId -> OrderResponse for instant lookup of order items & timings
  const ordersMap = useMemo(() => {
    const map = new Map<string, OrderResponse>();
    orders.forEach((o) => map.set(o.id, o));
    return map;
  }, [orders]);

  // Identify unreviewed orders (completed/delivered orders that user has not reviewed)
  const pendingOrders = useMemo(() => {
    const reviewedOrderIds = new Set(
      reviews.map((r) => r.orderId).filter((id): id is string => Boolean(id))
    );

    return orders.filter(
      (order) =>
        order.currentStatusId === 'Delivered' && !reviewedOrderIds.has(order.id)
    );
  }, [orders, reviews]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : '0.0';
    const repliedCount = reviews.filter((r) => Boolean(r.reply)).length;
    const pendingCount = pendingOrders.length;
    return { totalReviews, avgRating, repliedCount, pendingCount };
  }, [reviews, pendingOrders]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const commentMatch = (review.comment || '').toLowerCase().includes(q);
          const itemMatch = (review.menuItemName || '').toLowerCase().includes(q);
          const order = review.orderId ? ordersMap.get(review.orderId) : null;
          const providerMatch = (order?.sourceName || '').toLowerCase().includes(q);
          const orderedItemsMatch =
            order?.items?.some((it) => it.itemName.toLowerCase().includes(q)) ?? false;

          if (!commentMatch && !itemMatch && !providerMatch && !orderedItemsMatch) {
            return false;
          }
        }

        // Provider Type Filter
        if (typeFilter !== 'ALL') {
          if (review.targetType?.toLowerCase() !== typeFilter.toLowerCase()) {
            return false;
          }
        }

        // Rating Filter
        if (ratingFilter !== 'ALL') {
          const r = Math.round(review.rating || 0);
          if (ratingFilter === '5' && r !== 5) return false;
          if (ratingFilter === '4' && r !== 4) return false;
          if (ratingFilter === '3' && r !== 3) return false;
          if (ratingFilter === 'BELOW_3' && r >= 3) return false;
        }

        // Has Reply Only
        if (hasReplyOnly && !review.reply) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'RATING_HIGH') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'RATING_LOW') {
          return (a.rating || 0) - (b.rating || 0);
        }
        return 0;
      });
  }, [reviews, searchQuery, typeFilter, ratingFilter, hasReplyOnly, sortBy, ordersMap]);

  // Handle Review Update Success
  const handleReviewUpdated = (updated: ReviewResponse) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updated.id || (r.orderId && r.orderId === updated.orderId && r.menuItemId === updated.menuItemId) ? updated : r))
    );
  };

  // Star Rating Label Helper
  const getRatingSentiment = (rating: number) => {
    if (rating >= 4.8) return { label: 'Exceptional 🤩', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (rating >= 4.0) return { label: 'Great 😊', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
    if (rating >= 3.0) return { label: 'Good 🙂', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    if (rating >= 2.0) return { label: 'Fair 😐', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
    return { label: 'Poor 😞', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
  };

  // Provider Type Tag Helper
  const getProviderTag = (type: string) => {
    const normalized = (type || '').toLowerCase();
    if (normalized.includes('home')) {
      return {
        label: 'Home Food',
        icon: <Utensils className="w-3.5 h-3.5 text-orange-500" />,
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
        routePrefix: 'home-food'
      };
    }
    if (normalized.includes('chef')) {
      return {
        label: 'Chef Service',
        icon: <ChefHat className="w-3.5 h-3.5 text-indigo-500" />,
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        routePrefix: 'chefs'
      };
    }
    return {
      label: 'Restaurant',
      icon: <Store className="w-3.5 h-3.5 text-rose-500" />,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      routePrefix: 'restaurant'
    };
  };

  // Format Helper for Timings
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-muted/20 pb-20 pt-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* ── TOP BREADCRUMB & HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Activity Feed
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground">Customer Reviews</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
              My Reviews & Feedback
              <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                Personal Log
              </span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1 max-w-2xl">
              Inspect your past ratings, ordered dishes, kitchen timings, and verified responses from restaurants and home chefs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadReviewsData(true)}
              disabled={isRefreshing}
              className="rounded-full font-bold gap-2 text-xs h-9 border-border shadow-sm hover:bg-muted"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-primary')} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="rounded-full font-bold gap-2 text-xs h-9 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
            >
              <Star className="h-3.5 w-3.5 fill-white" />
              Rate New Orders ({metrics.pendingCount})
            </Button>
          </div>
        </div>

        {/* ── OVERVIEW METRICS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Reviews */}
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/80 backdrop-blur-md hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Reviews Given</span>
                <Receipt className="w-4 h-4 text-orange-500" />
              </CardDescription>
              <CardTitle className="text-3xl font-black text-foreground mt-1">
                {isLoading ? <span className="animate-pulse">--</span> : metrics.totalReviews}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground font-medium">
                Meals and culinary experiences reviewed
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/80 backdrop-blur-md hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Average Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </CardDescription>
              <CardTitle className="text-3xl font-black text-foreground mt-1 flex items-baseline gap-1.5">
                {isLoading ? <span className="animate-pulse">--</span> : metrics.avgRating}
                <span className="text-xs font-bold text-muted-foreground">/ 5.0</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground font-medium">
                Your typical satisfaction level
              </p>
            </CardContent>
          </Card>

          {/* Partner Responses */}
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/80 backdrop-blur-md hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Provider Replies</span>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              </CardDescription>
              <CardTitle className="text-3xl font-black text-emerald-600 mt-1">
                {isLoading ? <span className="animate-pulse">--</span> : metrics.repliedCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground font-medium">
                Direct responses from kitchen owners
              </p>
            </CardContent>
          </Card>

          {/* Unreviewed Orders */}
          <Card className={cn(
            "rounded-2xl border shadow-sm transition-all cursor-pointer hover:shadow-md",
            metrics.pendingCount > 0
              ? "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-300"
              : "bg-card/80 border-border/60"
          )}
          onClick={() => setActiveTab('pending')}
          >
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-[11px] font-black uppercase tracking-wider text-orange-600 flex items-center justify-between">
                <span>Pending Reviews</span>
                <Sparkles className="w-4 h-4 text-orange-500 animate-bounce" />
              </CardDescription>
              <CardTitle className="text-3xl font-black text-orange-600 mt-1">
                {isLoading ? <span className="animate-pulse">--</span> : metrics.pendingCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] font-medium text-orange-700/80">
                Delivered meals waiting for your feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── TABS: REVIEWED VS PENDING ── */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="bg-muted/60 p-1.5 rounded-2xl h-auto border border-border/50">
              <TabsTrigger
                value="reviewed"
                className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                Reviewed Orders ({metrics.totalReviews})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-xl px-5 py-2.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                Unreviewed Orders ({metrics.pendingCount})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ══════════════ TAB 1: REVIEWED ORDERS ══════════════ */}
          <TabsContent value="reviewed" className="space-y-6 focus-visible:outline-none">
            {/* Filter Toolbar */}
            <Card className="rounded-2xl border-border/60 shadow-sm p-4 bg-card/60 backdrop-blur-md">
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by restaurant, dish name, or review comment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-background border-border/70 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Provider Type */}
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ProviderFilter)}>
                    <SelectTrigger className="h-10 w-[140px] rounded-xl text-xs font-bold">
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="Restaurant">Restaurants</SelectItem>
                      <SelectItem value="HomeFood">Home Food</SelectItem>
                      <SelectItem value="Chef">Chefs</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Rating Selector */}
                  <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v as RatingFilter)}>
                    <SelectTrigger className="h-10 w-[130px] rounded-xl text-xs font-bold">
                      <SelectValue placeholder="All Stars" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL">All Ratings</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ (5★)</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ (4★)</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ (3★)</SelectItem>
                      <SelectItem value="BELOW_3">⭐-⭐⭐ (&lt; 3★)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sorting */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-10 w-[150px] rounded-xl text-xs font-bold">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="NEWEST">Newest First</SelectItem>
                      <SelectItem value="OLDEST">Oldest First</SelectItem>
                      <SelectItem value="RATING_HIGH">Highest Rating</SelectItem>
                      <SelectItem value="RATING_LOW">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Has Reply Toggle */}
                  <Button
                    type="button"
                    variant={hasReplyOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHasReplyOnly(!hasReplyOnly)}
                    className={cn(
                      'rounded-xl h-10 text-xs font-bold gap-1.5 transition-all',
                      hasReplyOnly
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'text-muted-foreground'
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    With Replies
                  </Button>
                </div>
              </div>
            </Card>

            {/* Reviews List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse text-sm">
                  Loading your review history and order records...
                </p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <Card className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center bg-card/40">
                <div className="h-16 w-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No Reviews Found</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1 mb-6">
                  {searchQuery || typeFilter !== 'ALL' || ratingFilter !== 'ALL' || hasReplyOnly
                    ? 'No reviews match your current filters. Try resetting the search or filter options.'
                    : "You haven't written any food reviews yet. Share your experience with your delivered orders!"}
                </p>
                <div className="flex justify-center gap-3">
                  {searchQuery || typeFilter !== 'ALL' || ratingFilter !== 'ALL' || hasReplyOnly ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('ALL');
                        setRatingFilter('ALL');
                        setHasReplyOnly(false);
                      }}
                      className="rounded-full font-bold"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveTab('pending')}
                      className="rounded-full font-bold bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Review Delivered Orders ({metrics.pendingCount})
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => {
                  const relatedOrder = review.orderId ? ordersMap.get(review.orderId) : null;
                  const providerInfo = getProviderTag(review.targetType);
                  const sentiment = getRatingSentiment(review.rating);
                  const providerName =
                    relatedOrder?.sourceName ||
                    (review.targetType === 'Chef' ? 'Private Chef' : 'Culinary Partner');

                  return (
                    <Card
                      key={review.id}
                      className="rounded-3xl border border-border/70 shadow-md bg-card overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Review Card Header */}
                      <div className="p-6 pb-4 bg-muted/20 border-b border-border/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          {/* Provider & Type Badge */}
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-background border border-border flex items-center justify-center shadow-xs">
                              {providerInfo.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-foreground hover:text-primary transition-colors">
                                  {providerName}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn('rounded-full text-[10px] font-black uppercase tracking-wider', providerInfo.badgeClass)}
                                >
                                  {providerInfo.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                {review.orderId && (
                                  <span className="font-mono font-bold text-foreground/80">
                                    Order #{review.orderId.slice(0, 8)}
                                  </span>
                                )}
                                {relatedOrder && (
                                  <>
                                    <span>•</span>
                                    <span className="font-bold text-foreground">
                                      ${relatedOrder.totalAmount?.toFixed(2)}
                                    </span>
                                  </>
                                )}
                                {review.menuItemName && (
                                  <>
                                    <span>•</span>
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold">
                                      Dish: {review.menuItemName}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Edit Review & Invoice */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingReview(review);
                                setIsEditDialogOpen(true);
                              }}
                              className="rounded-full text-xs font-bold h-8 gap-1.5 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Review
                            </Button>

                            {relatedOrder && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderForInvoice(relatedOrder);
                                  setIsInvoiceOpen(true);
                                }}
                                className="rounded-full text-xs font-bold h-8 text-muted-foreground hover:text-foreground"
                              >
                                <Receipt className="w-3.5 h-3.5 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Review Card Main Content */}
                      <div className="p-6 space-y-6">
                        {/* Rating Row & Review Text */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Stars */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'w-5 h-5',
                                      star <= Math.round(review.rating || 0)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-base font-black text-foreground">
                                {review.rating?.toFixed(1)}
                              </span>
                              <Badge variant="outline" className={cn('text-[11px] font-black rounded-full px-2.5 py-0.5', sentiment.color)}>
                                {sentiment.label}
                              </Badge>
                            </div>

                            {/* Submission Time */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              Reviewed on {formatDateTime(review.createdAt)}
                            </div>
                          </div>

                          {/* Customer Review Comment */}
                          {review.comment ? (
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-foreground font-medium text-sm leading-relaxed">
                              "{review.comment}"
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No written comments provided for this rating.
                            </p>
                          )}
                        </div>

                        {/* ── TIMINGS FEATURE GRID ── */}
                        <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Order & Feedback Timings
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* Placed At */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                                🛒 Order Placed
                              </span>
                              <span className="font-bold text-slate-800">
                                {relatedOrder?.orderPlacedAt ? formatDateTime(relatedOrder.orderPlacedAt) : 'Recorded'}
                              </span>
                            </div>

                            {/* Delivered At */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                                🚚 Delivered At
                              </span>
                              <span className="font-bold text-slate-800">
                                {relatedOrder?.expectedDeliveryAt
                                  ? formatDateTime(relatedOrder.expectedDeliveryAt)
                                  : relatedOrder?.orderPlacedAt
                                  ? 'Delivered on schedule'
                                  : 'Completed'}
                              </span>
                            </div>

                            {/* Reviewed At */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                                ⭐ Feedback Submitted
                              </span>
                              <span className="font-bold text-slate-800">
                                {formatDateTime(review.createdAt)}
                              </span>
                            </div>

                            {/* Provider Response Time */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                                💬 Partner Reply
                              </span>
                              <span className={cn('font-bold', review.reply ? 'text-emerald-700' : 'text-slate-400 italic')}>
                                {review.repliedAt ? formatDateTime(review.repliedAt) : review.reply ? 'Replied' : 'Pending response'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── ORDER ITEMS SECTION ── */}
                        {relatedOrder?.items && relatedOrder.items.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Utensils className="w-3.5 h-3.5 text-primary" />
                                Order Items Included ({relatedOrder.items.length})
                              </h4>
                              {relatedOrder.deliveryAddress && (
                                <span className="text-[11px] text-muted-foreground font-medium truncate max-w-xs hidden sm:inline">
                                  Delivered to: {relatedOrder.deliveryAddress}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {relatedOrder.items.map((item, idx) => {
                                const isTargetedDish =
                                  review.menuItemId === item.itemRefId ||
                                  review.menuItemName === item.itemName;

                                return (
                                  <div
                                    key={idx}
                                    className={cn(
                                      'flex justify-between items-center p-3 rounded-2xl border text-xs transition-all',
                                      isTargetedDish
                                        ? 'bg-amber-500/10 border-amber-400/80 shadow-xs ring-1 ring-amber-400/30'
                                        : 'bg-muted/20 border-border/50 hover:bg-muted/40'
                                    )}
                                  >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        {/* Veg / Non-Veg Indicator */}
                                        <span
                                          className={cn(
                                            'h-2 w-2 rounded-full shrink-0',
                                            item.itemType?.toLowerCase() === 'veg'
                                              ? 'bg-emerald-500'
                                              : 'bg-rose-500'
                                          )}
                                          title={item.itemType || 'Food item'}
                                        />
                                        <p className="font-bold text-foreground truncate">
                                          {item.itemName}
                                        </p>
                                      </div>
                                      {isTargetedDish && (
                                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
                                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                          Rated Dish
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[11px] font-bold text-muted-foreground block">
                                        x{item.quantity}
                                      </span>
                                      <span className="font-black text-foreground">
                                        ${item.totalPrice?.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── PROVIDER REPLY CALLOUT ── */}
                        {review.reply && (
                          <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                                  ✓
                                </div>
                                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                                  Official Response from {providerName}
                                </span>
                              </div>
                              {review.repliedAt && (
                                <span className="text-[10px] font-bold text-emerald-700">
                                  {formatDateTime(review.repliedAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-emerald-950 pl-8 leading-relaxed italic">
                              "{review.reply}"
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ══════════════ TAB 2: UNREVIEWED ORDERS ══════════════ */}
          <TabsContent value="pending" className="space-y-6 focus-visible:outline-none">
            {pendingOrders.length === 0 ? (
              <Card className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center bg-card/40">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1 mb-6">
                  You have reviewed every delivered meal. Thank you for helping restaurants and fellow foodies with your feedback!
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="rounded-full font-bold bg-primary text-primary-foreground"
                >
                  Order Something Tasty
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between text-orange-800 text-xs font-bold">
                  <span>
                    You have <strong className="text-orange-950 font-black">{pendingOrders.length}</strong> delivered order(s) awaiting your feedback.
                  </span>
                  <span className="hidden sm:inline text-[11px] font-medium text-orange-700">
                    Your ratings help kitchen partners improve!
                  </span>
                </div>

                {pendingOrders.map((order) => {
                  const providerInfo = getProviderTag(order.sourceType);

                  return (
                    <Card
                      key={order.id}
                      className="rounded-3xl border border-border/80 shadow-md bg-card overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        {/* Order & Provider Details */}
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-lg font-black text-foreground">
                              {order.sourceName}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn('rounded-full text-[10px] font-black uppercase', providerInfo.badgeClass)}
                            >
                              {providerInfo.label}
                            </Badge>
                            <Badge className="bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                              Delivered
                            </Badge>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-muted-foreground">
                              Ordered Items:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(order.items || []).map((it, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="rounded-lg text-xs font-semibold py-1 px-2.5"
                                >
                                  {it.itemName} ({it.quantity}x)
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Timings */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Ordered: {formatDateTime(order.orderPlacedAt)}
                            </span>
                            <span>•</span>
                            <span className="font-mono font-bold text-foreground">
                              Order #{order.id.slice(0, 8)}
                            </span>
                            <span>•</span>
                            <span className="font-black text-foreground">
                              Total: ${order.totalAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col items-center gap-2.5 w-full md:w-auto shrink-0">
                          <Button
                            onClick={() => setReviewDialogState({ isOpen: true, order })}
                            className="w-full sm:w-auto rounded-full font-bold px-6 h-10 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                          >
                            <Star className="w-4 h-4 mr-1.5 fill-white" />
                            Rate & Review Order
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderForInvoice(order);
                              setIsInvoiceOpen(true);
                            }}
                            className="w-full sm:w-auto rounded-full text-xs font-bold text-muted-foreground hover:text-foreground"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" />
                            View Receipt
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── EDIT REVIEW DIALOG ── */}
        <EditReviewDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingReview(null);
          }}
          review={editingReview}
          onSuccess={handleReviewUpdated}
        />

        {/* ── NEW ORDER REVIEW DIALOG ── */}
        {reviewDialogState.order && (
          <ReviewDialog
            isOpen={reviewDialogState.isOpen}
            onClose={() => {
              setReviewDialogState({ isOpen: false, order: null });
              loadReviewsData(true);
            }}
            targetId={reviewDialogState.order.sourceId}
            targetType={reviewDialogState.order.sourceType as any}
            providerName={reviewDialogState.order.sourceName}
            orderedItems={(reviewDialogState.order.items || []).map((it) => ({
              itemRefId: it.itemRefId || it.id,
              itemName: it.itemName,
            }))}
            orderTotal={reviewDialogState.order.totalAmount}
            orderDate={reviewDialogState.order.orderPlacedAt}
            orderId={reviewDialogState.order.id}
          />
        )}

        {/* ── ORDER INVOICE / DETAILS DIALOG ── */}
        {selectedOrderForInvoice && (
          <OrderDetailsDialog
            isOpen={isInvoiceOpen}
            onClose={() => {
              setIsInvoiceOpen(false);
              setSelectedOrderForInvoice(null);
            }}
            order={selectedOrderForInvoice}
            onOpenReview={(ord) => {
              setIsInvoiceOpen(false);
              setReviewDialogState({ isOpen: true, order: ord });
            }}
          />
        )}
      </div>
    </div>
  );
}
