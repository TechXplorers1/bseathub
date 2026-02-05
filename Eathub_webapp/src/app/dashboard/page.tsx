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
import { allRestaurants, allHomeFoods } from "@/lib/data"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { OrderDetailsDialog } from '@/components/dashboard/OrderDetailsDialog';
import type { Order } from '@/lib/types';

// --- Static Data ---
const recentOrders: Order[] = [
    { id: "ORD001", restaurant: "The Golden Spoon", restaurantId: '1', items: ['Spaghetti Carbonara', 'Bruschetta'], amount: 32.50, status: "Delivered", date: "2024-07-22" },
    { id: "ORD006", restaurant: "The Noodle Bar", restaurantId: '7', items: ['Classic Beef Pho'], amount: 28.50, status: "Preparing", date: "2024-07-23" },
    { id: "ORD007", restaurant: "Pizza Planet", restaurantId: '8', items: ['Pepperoni Overload'], amount: 22.00, status: "Confirmed", date: "2024-07-23" },
    { id: "ORD002", restaurant: "Sushi Palace", restaurantId: '2', items: ['California Roll', 'Spicy Tuna Roll'], amount: 55.10, status: "Delivered", date: "2024-07-20" },
    { id: "ORD003", restaurant: "Burger Bonanza", restaurantId: '3', items: ['Classic Cheeseburger'], amount: 25.00, status: "Cancelled", date: "2024-07-19" },
];

const favoriteChefs = allHomeFoods.slice(0, 4).map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
}));

type OrderStatus = 'All' | 'Completed' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Pickup';

export default function DashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrderStatus>('All');
    const [orders, setOrders] = useState<Order[]>(recentOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // --- Authentication & Role Check ---
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole'); // Assuming you store role on login

            if (!token) {
                router.push('/login');
                return;
            }

            // Simple role check: Only PARTNER, ADMIN, or USER can see this dashboard
            if (userRole !== 'PARTNER' && userRole !== 'ADMIN' && userRole !== 'USER') {
                router.push('/'); // Redirect others to home
                return;
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    const handleCancelOrder = (orderId: string) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        setSelectedOrder(null);
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed') return order.status === 'Delivered';
        if (activeTab === 'Pending') return order.status === 'Preparing';
        if (activeTab === 'Confirmed') return order.status === 'Confirmed';
        if (activeTab === 'Cancelled') return order.status === 'Cancelled';
        if (activeTab === 'Pickup') return order.status === 'Pickup';
        return false;
    });

    // --- Loading Spinner ---
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Orders</CardDescription>
                                    <CardTitle className="text-4xl">125</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">+10% from last month</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Spent</CardDescription>
                                    <CardTitle className="text-4xl">$2,389</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">+25% from last month</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Favorites</CardDescription>
                                    <CardTitle className="text-4xl">12</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">2 new restaurants this month</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-orange-50 border-orange-200">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-orange-800">Eat Hub Pro</CardDescription>
                                    <CardTitle className="text-4xl text-orange-600">Active</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-orange-700 underline cursor-pointer">View benefits</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Orders Table */}
                        <Card>
                            <CardHeader className="px-7">
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Manage your store's latest incoming requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderStatus)}>
                                    <TabsList>
                                        <TabsTrigger value="All">All</TabsTrigger>
                                        <TabsTrigger value="Completed">Completed</TabsTrigger>
                                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                                        <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value={activeTab}>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Restaurant</TableHead>
                                                    <TableHead>Order Item</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredOrders.map(order => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-medium">{order.restaurant}</TableCell>
                                                        <TableCell>{order.items[0]}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'outline'}>
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{order.date}</TableCell>
                                                        <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onSelect={() => setSelectedOrder(order)}>View Order</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {selectedOrder && (
                <OrderDetailsDialog
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onCancelOrder={handleCancelOrder}
                />
            )}
        </div>
    );
}