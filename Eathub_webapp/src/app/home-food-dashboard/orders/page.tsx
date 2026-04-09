'use client';

import { useState, useEffect } from 'react';
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, RefreshCcw, ChefHat } from 'lucide-react';
import { OrderDetailsDialog } from '@/components/dashboard/restaurant/OrderDetailsDialog';
import { fetchMyOrders, updateOrderStatus, cancelOrder } from '@/services/api';
import type { OrderResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CancellationReasonDialog } from '@/components/shared/CancellationReasonDialog';
import { useHeader } from '@/context/HeaderProvider';

type OrderStatusFilter = 'All' | 'New' | 'Preparing' | 'Completed' | 'Cancelled';

const statusFilters: OrderStatusFilter[] = ['All', 'New', 'Preparing', 'Completed', 'Cancelled'];

export default function HomeFoodOrdersPage() {
    const [activeTab, setActiveTab] = useState<OrderStatusFilter>('All');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const { toast } = useToast();

    // Connect to Global Search
    const { searchQuery, setSearchPlaceholder, setSearchQuery } = useHeader();

    useEffect(() => {
        setSearchPlaceholder("Search kitchen orders by ID, name, total...");
        return () => {
            setSearchPlaceholder("Search food, restaurants, chefs...");
            setSearchQuery('');
        };
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchMyOrders();
            // Sort recently first
            setOrders(data.sort((a, b) => new Date(b.orderPlacedAt).getTime() - new Date(a.orderPlacedAt).getTime()));
        } catch (err) {
            console.error(err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load home-cooked orders.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await updateOrderStatus(orderId, status);
            toast({
                title: 'Order Updated',
                description: `Order status set to ${status}`
            });
            loadOrders();
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update order status.'
            });
        }
    };

    const handleCancelOrder = async (reason: string) => {
        if (!orderToCancel) return;
        const cancelledBy = localStorage.getItem('userRole') === 'HOME_FOOD' ? 'HomeFood' : 'Kitchen';
        try {
            await cancelOrder(orderToCancel, reason, cancelledBy);
            toast({
                title: 'Kitchen Cancellation Confirmed',
                description: 'The user will see your reason in their tracker.'
            });
            loadOrders();
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to cancel order.'
            });
        } finally {
            setOrderToCancel(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        // Apply Global Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                order.id.toLowerCase().includes(q) ||
                order.customerName?.toLowerCase().includes(q) ||
                order.totalAmount.toString().includes(q) ||
                order.deliveryAddress?.toLowerCase().includes(q);
            
            if (!matchesSearch) return false;
        }

        // Tab Filter
        if (activeTab === 'All') return true;
        if (activeTab === 'New') return order.currentStatusId === 'Confirmed';
        if (activeTab === 'Preparing') return ['Preparing', 'Preparation Completed', 'Out for Delivery'].includes(order.currentStatusId);
        if (activeTab === 'Completed') return order.currentStatusId === 'Delivered';
        if (activeTab === 'Cancelled') return order.currentStatusId === 'Cancelled';
        return false;
    });

    const getStatusLabel = (order: OrderResponse) => {
        const status = order.currentStatusId;
        if (status === 'Cancelled') {
            const by = order.cancelledBy || 'Customer';
            return `${by} Cancelled`;
        }
        switch (status) {
            case 'Pending Approval': return 'New Order';
            case 'Provider Confirmed': return 'New Order';
            case 'Confirmed': return 'New Order';
            case 'Preparing': return 'Kitchen Cooking';
            case 'Preparation Completed': return 'Ready for Dispatch';
            case 'Out for Delivery': return 'Out for Delivery';
            case 'Delivered': return 'Completed';
            default: return status;
        }
    };

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Delivered': return 'default';
            case 'Cancelled': return 'destructive';
            case 'Confirmed': return 'secondary';
            case 'Preparing': return 'secondary';
            case 'Preparation Completed': return 'secondary';
            case 'Out for Delivery': return 'secondary';
            case 'Pending Approval': return 'secondary';
            case 'Provider Confirmed': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <ChefHat className="h-8 w-8 text-primary" />
                    Home Kitchen Orders
                </h1>
                <Button onClick={loadOrders} variant="outline" size="sm" className="gap-2 rounded-full font-bold transition-all hover:border-primary active:scale-95">
                    <RefreshCcw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="All" onValueChange={(value) => setActiveTab(value as OrderStatusFilter)}>
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap justify-start">
                    {statusFilters.map(status => (
                        <TabsTrigger
                            key={status}
                            value={status}
                            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs py-2 transition-all"
                        >
                            {status}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <Card className="mt-6 border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-border/30">
                    <CardHeader className="border-b border-border/10 bg-muted/20">
                        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">Kitchen Dashboard</CardTitle>
                        <CardDescription className="font-semibold text-muted-foreground/80">
                            {loading ? "Syncing orders..." : `You have ${filteredOrders.length} active orders to manage.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-black animate-pulse text-sm uppercase tracking-widest">Loading your kitchen's queue...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-2 rotate-3 transition-transform hover:rotate-0">
                                    <ChefHat className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-muted-foreground font-black text-lg">Your kitchen is currently free.</p>
                                <p className="text-muted-foreground/70 text-sm font-medium">Sit back and relax until the next order arrives!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/30">
                                            <TableHead className="py-4 font-black">ID & Date</TableHead>
                                            <TableHead className="py-4 font-black">Customer Details</TableHead>
                                            <TableHead className="py-4 font-black">Status</TableHead>
                                            <TableHead className="py-4 font-black text-right">Earning</TableHead>
                                            <TableHead className="py-4 font-black text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map(order => (
                                            <TableRow key={order.id} className="group hover:bg-muted/30 border-border/10 transition-colors">
                                                <TableCell className="py-4">
                                                    <div className="font-black text-sm uppercase tracking-tighter">#{order.id.slice(0, 8)}</div>
                                                    <div className="text-xs text-muted-foreground font-bold">{new Date(order.orderPlacedAt || '').toLocaleDateString()}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-sm">{order.customerName || 'Customer'}</div>
                                                    <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px]">
                                                        {order.deliveryAddress}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={getBadgeVariant(order.currentStatusId)}
                                                            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-center"
                                                        >
                                                            {getStatusLabel(order)}
                                                        </Badge>
                                                        {order.paymentStatus === 'Paid' && (
                                                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-tight shrink-0">
                                                                PAID 💰
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-primary">₹{order.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl p-2 bg-card/95 backdrop-blur-md border border-border/50">
                                                            <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="rounded-lg font-bold py-2.5">
                                                                View Order Summary
                                                            </DropdownMenuItem>
                                                            
                                                            <div className="h-px bg-border/40 my-1 mx-2" />

                                                            {(order.currentStatusId === 'Confirmed' || order.currentStatusId === 'Provider Confirmed' || order.currentStatusId === 'Pending Approval') && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                                                                    className="font-black rounded-lg text-primary py-2.5 bg-primary/5 hover:bg-primary/10 transition-colors"
                                                                >
                                                                    👨‍🍳 Start Cooking
                                                                </DropdownMenuItem>
                                                            )}

                                                            {order.currentStatusId === 'Preparing' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(order.id, 'Preparation Completed')}
                                                                    className="font-black rounded-lg text-amber-600 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors"
                                                                >
                                                                    🥘 Mark as Cooked
                                                                </DropdownMenuItem>
                                                            )}

                                                            {order.currentStatusId === 'Preparation Completed' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')}
                                                                    className="font-black rounded-lg text-orange-600 py-2.5 bg-orange-50 hover:bg-orange-100 transition-colors"
                                                                >
                                                                    🎒 Pack & Dispatch
                                                                </DropdownMenuItem>
                                                            )}

                                                            {order.currentStatusId === 'Out for Delivery' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                                                    className="font-black rounded-lg text-green-600 py-2.5 bg-green-50 hover:bg-green-100 transition-colors"
                                                                >
                                                                    🏠 Mark Handed Over
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuItem
                                                                className="text-destructive font-black rounded-lg py-2.5 mt-2 opacity-80 hover:opacity-100 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setOrderToCancel(order.id);
                                                                    setIsCancelDialogOpen(true);
                                                                }}
                                                            >
                                                                🚫 Cancel Order
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Tabs>

            {selectedOrder && (
                <OrderDetailsDialog
                    order={selectedOrder as any}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            <CancellationReasonDialog
                isOpen={isCancelDialogOpen}
                onClose={() => {
                    setIsCancelDialogOpen(false);
                    setOrderToCancel(null);
                }}
                onConfirm={handleCancelOrder}
            />
        </div>
    );
}
