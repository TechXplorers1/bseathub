'use client';

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
import { providerOrders } from '@/lib/home-food-dashboard-data';
import { MoreHorizontal } from 'lucide-react';

export default function OrdersPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Manage your orders and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {providerOrders.map(order => (
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Accept Order</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Preparing</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Out for Delivery</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
