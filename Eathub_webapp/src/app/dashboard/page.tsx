
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, Loader2, RefreshCw, UtensilsCrossed, CalendarDays } from "lucide-react"
import { OrderDetailsDialog } from '@/components/dashboard/OrderDetailsDialog';
import { ReviewModal } from '@/components/dashboard/ReviewModal';
import { fetchOrdersByCustomer, fetchUserProfile, fetchCustomerBookings } from '@/services/api';
import type { OrderResponse, ChefBooking } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type OrderStatusFilter = 'All' | 'Delivered' | 'Active' | 'Cancelled';

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrderStatusFilter>('All');
    const [mainTab, setMainTab] = useState<'orders' | 'bookings'>('orders');
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [chefBookings, setChefBookings] = useState<ChefBooking[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        chefHires: 0
    });
    const [reviewModal, setReviewModal] = useState<{
        isOpen: boolean;
        targetId: string;
        targetName: string;
        targetType: 'Restaurant' | 'HomeFood' | 'Chef';
        orderId?: string;
    }>({
        isOpen: false,
        targetId: '',
        targetName: '',
        targetType: 'Chef',
    });

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const profile = await fetchUserProfile();
            const [customerOrders, customerBookings] = await Promise.all([
                fetchOrdersByCustomer(profile.id),
                fetchCustomerBookings(profile.id)
            ]);

            setOrders(customerOrders.sort((a, b) => new Date(b.orderPlacedAt).getTime() - new Date(a.orderPlacedAt).getTime()));
            setChefBookings(customerBookings);

            // Calculate stats
            const total = customerOrders.length;
            const spent = customerOrders
                .filter(o => o.paymentStatus === 'Paid')
                .reduce((acc, o) => acc + o.totalAmount, 0) +
                customerBookings.filter(b => b.paymentStatus === 'Paid').reduce((acc, b) => acc + (b.totalAmount || 0), 0);

            const pending = customerOrders.filter(o =>
                !['Delivered', 'Cancelled'].includes(o.currentStatusId)
            ).length + customerBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length;

            setStats({
                totalOrders: total,
                totalSpent: spent,
                pendingOrders: pending,
                chefHires: customerBookings.length
            });

        } catch (error: any) {
            console.error("Dashboard load error:", error);
            if (error.status === 401) {
                router.push('/login');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error loading dashboard',
                    description: 'Could not fetch your latest orders.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Polling every 30 seconds for status updates
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Delivered') return order.currentStatusId === 'Delivered';
        if (activeTab === 'Cancelled') return order.currentStatusId === 'Cancelled';
        if (activeTab === 'Active') return !['Delivered', 'Cancelled'].includes(order.currentStatusId);
        return false;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse">Syncing your dashboard...</p>
            </div>
        );
    }

    const getStatusBadge = (order: OrderResponse) => {
        const { currentStatusId: status, cancelledBy } = order;
        switch (status) {
            case 'Delivered': return <Badge className="bg-green-500 rounded-full px-3">{status}</Badge>;
            case 'Cancelled':
                const by = cancelledBy || 'User';
                return (
                    <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="rounded-full px-3">{by} Cancelled</Badge>
                        {order.cancellationReason && (
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="h-5 w-5 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                                title="Click to view reason"
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                );
            case 'Pending Approval': return <Badge variant="outline" className="text-orange-600 border-orange-600 rounded-full px-3 animate-pulse">Order Placed</Badge>;
            case 'Approved': return <Badge className="bg-blue-500 rounded-full px-3">Approved</Badge>;
            case 'Confirmed': return <Badge className="bg-indigo-500 rounded-full px-3">Order Confirmed</Badge>;
            default: return <Badge variant="secondary" className="rounded-full px-3">{status}</Badge>;
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/20 pb-12">
            <div className="flex flex-col sm:gap-4 sm:py-8 container mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">Activity Feed</h1>
                        <p className="text-muted-foreground font-medium">Welcome back! Here's what's happening with your meals.</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full font-bold gap-2" onClick={loadData}>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <main className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-md">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Total Orders</CardDescription>
                                    <CardTitle className="text-4xl font-black">{stats.totalOrders}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground font-medium">Life-time meal count</div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-md">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Total Spent</CardDescription>
                                    <CardTitle className="text-4xl font-black">${stats.totalSpent.toLocaleString()}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground font-medium">Invested in good taste</div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg bg-indigo-50 border-indigo-100">
                                <CardHeader className="pb-2">
                                    <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-indigo-600">Chef Hires</CardDescription>
                                    <CardTitle className="text-4xl font-black text-indigo-700">{stats.chefHires}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-indigo-500 font-bold">Culinary event history</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Interaction Area: Tabs for Orders vs Bookings */}
                        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="space-y-6">
                            <TabsList className="bg-muted/50 p-1 h-auto rounded-xl grid grid-cols-2 max-w-md mx-auto shadow-sm">
                                <TabsTrigger value="orders" className="rounded-lg py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                                    <UtensilsCrossed className="mr-2 h-4 w-4" /> Food Orders
                                </TabsTrigger>
                                <TabsTrigger value="bookings" className="rounded-lg py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                                    <CalendarDays className="mr-2 h-4 w-4" /> Chef Bookings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="orders" className="space-y-4 focus-visible:outline-none">
                                {/* Recent Orders Table */}
                                <Card className="border-none shadow-2xl bg-card overflow-hidden">
                                    <CardHeader className="px-7 bg-muted/30 border-b border-border/50">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <CardTitle className="text-2xl font-black">Food Orders</CardTitle>
                                                <CardDescription className="font-bold text-muted-foreground">Manage your restaurant and home-food orders.</CardDescription>
                                            </div>
                                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderStatusFilter)} className="w-auto">
                                                <TabsList className="rounded-full bg-muted/50 p-1 h-auto">
                                                    {(['All', 'Active', 'Delivered', 'Cancelled'] as OrderStatusFilter[]).map(tab => (
                                                        <TabsTrigger
                                                            key={tab}
                                                            value={tab}
                                                            className="rounded-full px-4 py-1.5 text-xs font-bold data-[state=active]:bg-background"
                                                        >
                                                            {tab}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/10">
                                                    <TableRow className="hover:bg-transparent border-border/50">
                                                        <TableHead className="font-black py-4">Source</TableHead>
                                                        <TableHead className="font-black py-4">Items</TableHead>
                                                        <TableHead className="font-black py-4">Status</TableHead>
                                                        <TableHead className="font-black py-4">Date</TableHead>
                                                        <TableHead className="text-right font-black py-4">Amount</TableHead>
                                                        <TableHead className="py-4"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredOrders.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold">
                                                                No orders found in this category.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredOrders.map(order => (
                                                            <TableRow key={order.id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                                                                <TableCell className="font-bold py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-foreground">{order.sourceName}</span>
                                                                        <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">{order.sourceType}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-4">
                                                                    <div className="text-sm font-medium">
                                                                        {order.items && order.items.length > 0 ? (
                                                                            <>
                                                                                {order.items[0].itemName}
                                                                                {order.items.length > 1 && <span className="text-primary font-black ml-1">+{order.items.length - 1} more</span>}
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-muted-foreground italic">No items found</span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-4">
                                                                    {getStatusBadge(order)}
                                                                </TableCell>
                                                                <TableCell className="py-4 text-xs font-bold text-muted-foreground">
                                                                    {new Date(order.orderPlacedAt).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell className="text-right font-black text-foreground py-4">${order.totalAmount.toFixed(2)}</TableCell>
                                                                <TableCell className="text-right py-4">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-48 p-2">
                                                                            <DropdownMenuItem className="font-bold rounded-lg" onClick={() => setSelectedOrder(order)}>View Invoice</DropdownMenuItem>
                                                                            {['Pending Approval', 'Approved', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.currentStatusId) && (
                                                                                <DropdownMenuItem
                                                                                    className="font-bold rounded-lg text-primary"
                                                                                    onClick={() => router.push(`/track-order?orderId=${order.id}`)}
                                                                                >
                                                                                    Live Tracking
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            {order.currentStatusId === 'Cancelled' && (
                                                                                <DropdownMenuItem
                                                                                    className="font-bold rounded-lg text-destructive"
                                                                                    onClick={() => setSelectedOrder(order)}
                                                                                >
                                                                                    Cancellation Info
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="bookings" className="space-y-4 focus-visible:outline-none">
                                {/* Chef Bookings Table */}
                                <Card className="border-none shadow-2xl bg-card overflow-hidden">
                                    <CardHeader className="px-7 bg-indigo-50/30 border-b border-indigo-100/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-2xl font-black text-indigo-900">Chef Bookings</CardTitle>
                                                <CardDescription className="font-bold text-indigo-700/60">Your private culinary event history.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-indigo-50/10">
                                                    <TableRow className="hover:bg-transparent border-indigo-100/50">
                                                        <TableHead className="font-black py-4">Chef Name</TableHead>
                                                        <TableHead className="font-black py-4">Service Type</TableHead>
                                                        <TableHead className="font-black py-4">Guests</TableHead>
                                                        <TableHead className="font-black py-4">Event Date</TableHead>
                                                        <TableHead className="font-black py-4">Status</TableHead>
                                                        <TableHead className="text-right font-black py-4">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {!chefBookings || chefBookings.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold italic">
                                                                No chef bookings found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        chefBookings.map(booking => (
                                                            <TableRow key={booking.id} className="group hover:bg-indigo-50/20 border-indigo-100/50 transition-colors">
                                                                <TableCell className="font-bold py-4 text-slate-800">{booking.chefName}</TableCell>
                                                                <TableCell className="py-4 font-medium italic text-slate-500">
                                                                    {booking.eventType || booking.serviceName || 'General Hire'}
                                                                </TableCell>
                                                                <TableCell className="py-4 font-bold">{booking.guests} Guests</TableCell>
                                                                <TableCell className="py-4 text-xs font-bold text-muted-foreground">
                                                                    {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                                                                </TableCell>
                                                                <TableCell className="py-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <Badge
                                                                            variant={booking.status === 'Completed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                                                                            className="rounded-full px-3 w-fit uppercase text-[10px] font-black"
                                                                        >
                                                                            {booking.status}
                                                                        </Badge>
                                                                        {booking.status === 'Completed' && (
                                                                            <Button 
                                                                                variant="outline" 
                                                                                size="sm" 
                                                                                onClick={() => setReviewModal({
                                                                                    isOpen: true,
                                                                                    targetId: booking.chefId!,
                                                                                    targetName: booking.chefName!,
                                                                                    targetType: 'Chef',
                                                                                    orderId: booking.id
                                                                                })}
                                                                                className="rounded-full px-3 h-7 mt-1 font-black text-[8px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 w-fit"
                                                                            >
                                                                                Rate & Review
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-black text-foreground py-4">
                                                                    {booking.isNegotiable ? (
                                                                        <span className="font-black text-xs uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                                                                            Negotiable
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-black text-slate-900">
                                                                            ${booking.totalAmount?.toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right py-4">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-48 p-2">
                                                                            <DropdownMenuItem className="font-bold rounded-lg" onClick={() => router.push(`/restaurant/${booking.chefId}?chef=${booking.chefName}`)}>
                                                                                Rebook Chef
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem className="font-bold rounded-lg opacity-50 cursor-not-allowed">
                                                                                Download Receipt
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column: Mini Stats or Info */}
                    <div className="space-y-4">
                        <Card className="border-none shadow-xl bg-orange-500 text-white overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-orange-100">EatHub Premium</CardTitle>
                                <CardTitle className="text-3xl font-black">Unlimited Free Delivery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-bold text-orange-50 mb-4 opacity-90">Enjoy zero delivery fees on orders above $199 from your favorite kitchens.</p>
                                <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-black rounded-xl">Upgrade Now</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-black text-xl">Order Tip</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-muted/40 rounded-xl border-l-4 border-primary">
                                    <p className="text-xs font-bold italic leading-relaxed text-muted-foreground">
                                        "Did you know? Home-cooked meals are prepared in small batches, ensuring better quality and taste."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {selectedOrder && (
                <OrderDetailsDialog
                    order={selectedOrder as any}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            <ReviewModal 
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal(p => ({ ...p, isOpen: false }))}
                targetId={reviewModal.targetId}
                targetName={reviewModal.targetName}
                targetType={reviewModal.targetType}
                orderId={reviewModal.orderId}
            />
        </div>
    );
}