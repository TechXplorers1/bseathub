
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
  TabsContent,
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
import { MoreHorizontal, Loader2, RefreshCcw } from 'lucide-react';
import { OrderDetailsDialog } from '@/components/dashboard/restaurant/OrderDetailsDialog';
import { fetchMyOrders, updateOrderStatus } from '@/services/api';
import type { OrderResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type OrderStatusFilter = 'All' | 'Pending Approval' | 'Approved' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

const statusFilters: OrderStatusFilter[] = ['All', 'Pending Approval', 'Approved', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatusFilter>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load orders.'
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    return order.currentStatusId === activeTab;
  });

  const getBadgeVariant = (status: string) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Cancelled': return 'destructive';
        case 'Pending Approval': return 'outline';
        case 'Approved': return 'secondary';
        case 'Confirmed': return 'secondary';
        default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Order Management</h1>
        <Button onClick={loadOrders} variant="outline" size="sm" className="gap-2 rounded-full font-bold">
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
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs py-2"
            >
                {status}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="mt-6 border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-xl font-bold">Orders List</CardTitle>
                <CardDescription className="font-medium">
                    {loading ? "Syncing with kitchen..." : `Manage ${filteredOrders.length} orders in this category.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-bold animate-pulse text-sm">Fetching real-time orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-2">
                         <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                             <MoreHorizontal className="h-8 w-8 text-muted-foreground/50" />
                         </div>
                         <p className="text-muted-foreground font-black text-lg">No orders found</p>
                         <p className="text-muted-foreground/70 text-sm font-medium">When customers place orders, they will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="py-4 font-black">Order ID & Date</TableHead>
                                    <TableHead className="py-4 font-black">Customer</TableHead>
                                    <TableHead className="py-4 font-black">Status</TableHead>
                                    <TableHead className="py-4 font-black text-right">Amount</TableHead>
                                    <TableHead className="py-4 font-black text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map(order => (
                                    <TableRow key={order.id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="font-black text-sm uppercase tracking-tighter">#{order.id.slice(0, 8)}</div>
                                            <div className="text-xs text-muted-foreground font-bold">{new Date(order.orderPlacedAt || '').toLocaleDateString()}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold">{order.customerName || 'Customer'}</div>
                                            <div className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
                                                {order.deliveryAddress}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={getBadgeVariant(order.currentStatusId)}
                                                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                                            >
                                                {order.currentStatusId}
                                            </Badge>
                                            {order.paymentStatus === 'Paid' && (
                                                <Badge variant="outline" className="ml-2 rounded-full border-green-500 text-green-600 font-black text-[10px]">PAID</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-primary">₹{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl p-2">
                                                    <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="rounded-lg font-bold">View Items</DropdownMenuItem>
                                                    
                                                    {order.currentStatusId === 'Pending Approval' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Approved')} className="text-green-600 font-bold rounded-lg focus:bg-green-50 focus:text-green-600">Approve Order</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="text-destructive font-bold rounded-lg">Reject Order</DropdownMenuItem>
                                                        </>
                                                    )}

                                                    {order.currentStatusId === 'Confirmed' && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Preparing')} className="font-bold rounded-lg text-primary">Start Preparing</DropdownMenuItem>
                                                    )}

                                                    {order.currentStatusId === 'Preparing' && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')} className="font-bold rounded-lg text-primary">Ready for Delivery</DropdownMenuItem>
                                                    )}

                                                    {order.currentStatusId === 'Out for Delivery' && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Delivered')} className="font-bold rounded-lg text-green-600">Mark Delivered</DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuItem className="text-destructive font-bold rounded-lg" onClick={() => handleStatusUpdate(order.id, 'Cancelled')}>Cancel Order</DropdownMenuItem>
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
            // In a real app, Map OrderResponse to ProviderOrder if dialog prop types differ
            // For now passing it directly as they might be compatible enough
            order={selectedOrder as any}
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
         />
      )}
    </div>
  );
}
