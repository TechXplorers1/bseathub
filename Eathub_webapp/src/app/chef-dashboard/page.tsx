'use client';

import {
  DollarSign,
  CalendarCheck,
  Star,
  Clock,
  Loader2,
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from "react";
import {
  fetchChefBookingsByOwner,
  fetchChefEarningsByOwner,
  getReviewsForOwner,
  fetchChefProfileByOwner
} from '@/services/api';
import type { ChefBooking, ReviewResponse } from '@/lib/types';

export default function ChefDashboardPage() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    upcomingBookings: 0,
    pendingRequests: 0,
    avgRating: 0,
    reviewCount: 0
  });
  const [bookings, setBookings] = useState<ChefBooking[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);

  useEffect(() => {
    const ownerId = localStorage.getItem("user-id");
    const name = localStorage.getItem("userName");

    if (name) setDisplayName(name);

    if (!ownerId) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [bookingsData, earningsData, reviewsData] = await Promise.all([
          fetchChefBookingsByOwner(ownerId),
          fetchChefEarningsByOwner(ownerId),
          getReviewsForOwner(ownerId, 'Chef')
        ]);

        // Calculate Stats
        const now = new Date();
        const upcoming = bookingsData.filter(b =>
          b.status === 'Accepted' && new Date(b.eventDate) >= now
        ).length;

        const pending = bookingsData.filter(b => b.status === 'Pending').length;

        const avg = reviewsData.length > 0
          ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
          : 0;

        setStats({
          totalEarnings: earningsData,
          upcomingBookings: upcoming,
          pendingRequests: pending,
          avgRating: avg,
          reviewCount: reviewsData.length
        });

        setBookings(bookingsData.slice(0, 5)); // Top 5 recent
        setReviews(reviewsData.slice(0, 3));   // Top 3 recent feedback
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Welcome back, {displayName || 'Chef'}!
          </h1>
          <p className="text-muted-foreground">
            Here's the live overview of your culinary business.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          description="Lifetime revenue"
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookings.toString()}
          icon={CalendarCheck}
          description="Confirmed events"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests.toString()}
          icon={Clock}
          description="Needs your attention"
        />
        <StatCard
          title="Avg. Rating"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          description={`Based on ${stats.reviewCount} reviews`}
        />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                A summary of your most recent bookings.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 rounded-full px-4">
              <Link href="/chef-dashboard/bookings">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex border">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {booking.customerName?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-bold">
                            {booking.customerName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.eventDate).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge
                          className="rounded-full font-bold uppercase text-[10px]"
                          variant={
                            booking.status === 'Completed' || booking.status === 'Accepted'
                              ? 'default'
                              : booking.status === 'Cancelled' || booking.status === 'Rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black">
                        ${booking.totalAmount?.toLocaleString() || '0'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <CalendarCheck className="h-10 w-10 mb-2 opacity-20" />
                <p>No bookings found yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>
              Latest reviews from your clients.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {review.customerName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold leading-none">
                      {review.customerName}
                    </p>
                    <div className="flex items-center text-[10px] text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-1 font-bold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center">
                <Star className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No reviews yet.<br />Your rating will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

