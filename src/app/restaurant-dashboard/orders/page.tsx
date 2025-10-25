
'use client';

import { useState } from 'react';
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
import { providerOrders } from '@/lib/restaurant-dashboard-data';
import type { ProviderOrder } from '@/lib/restaurant-dashboard-data';
import { MoreHorizontal } from 'lucide-react';
import { OrderDetailsDialog } from '@/components/dashboard/restaurant/OrderDetailsDialog';

type OrderStatus = 'All' | 'Pending' | 'Completed' | 'Cancelled' | 'Preparing' | 'Out for Delivery';

const statusFilters: OrderStatus[] = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled'];

function OrdersTable({ orders, onSelectOrder }: { orders: ProviderOrder[]; onSelectOrder: (order: ProviderOrder) => void; }) {
    const [allOrders, setAllOrders] = useState<ProviderOrder[]>(orders);

    const handleStatusUpdate = (orderId: string, status: ProviderOrder['status']) => {
        setAllOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
    };

    if (orders.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No orders found for this category.</p>
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allOrders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {order.customer.email}
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => onSelectOrder(order)}>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Preparing')}>Mark as Preparing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')}>Mark as Out for Delivery</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Completed')}>Mark as Completed</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, 'Cancelled')}>Cancel Order</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<ProviderOrder | null>(null);
  
  const filteredOrders = providerOrders.filter(order => {
    if (activeTab === 'All') return true;
    return order.status === activeTab;
  });

  return (
    <>
    <Tabs defaultValue="All" onValueChange={(value) => setActiveTab(value as OrderStatus)}>
      <div className="flex items-center">
        <TabsList>
          {statusFilters.map(status => (
            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
          ))}
        </TabsList>
      </div>
      <Card className="mt-4">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Manage your orders and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value={activeTab}>
                <OrdersTable orders={filteredOrders} onSelectOrder={setSelectedOrder} />
            </TabsContent>
          </CardContent>
        </Card>
    </Tabs>
     {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
