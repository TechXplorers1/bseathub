
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
import { allBookings } from '@/lib/chef-dashboard-data';
import type { ChefBooking, BookingStatus } from '@/lib/chef-dashboard-data';
import { MoreHorizontal } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

type BookingFilterStatus = 'All' | BookingStatus;
const statusFilters: BookingFilterStatus[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function BookingsTable({ bookings }: { bookings: ChefBooking[] }) {
    const [allBookingsState, setAllBookingsState] = useState<ChefBooking[]>(bookings);

    const handleStatusUpdate = (bookingId: string, status: ChefBooking['status']) => {
        setAllBookingsState(prevBookings => prevBookings.map(b => b.id === bookingId ? { ...b, status } : b));
    };

    if (bookings.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No bookings found for this category.</p>
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allBookingsState.map(booking => (
                    <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.customer.name}</div>
                        </TableCell>
                        <TableCell>{booking.eventDate}</TableCell>
                        <TableCell>{booking.guests}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>
                            <Badge variant={booking.status === 'Completed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}>{booking.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${booking.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}>Accept Booking</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'Completed')}>Mark as Completed</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>Reject Booking</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingFilterStatus>('All');
  
  const filteredBookings = allBookings.filter(booking => {
    if (activeTab === 'All') return true;
    return booking.status === activeTab;
  });

  return (
    <>
    <Tabs defaultValue="All" onValueChange={(value) => setActiveTab(value as BookingFilterStatus)}>
      <div className="flex items-center">
        <TabsList>
          {statusFilters.map(status => (
            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
          ))}
        </TabsList>
      </div>
      <Card className="mt-4">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              Manage your bookings and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value={activeTab}>
                <BookingsTable bookings={filteredBookings} />
            </TabsContent>
          </CardContent>
        </Card>
    </Tabs>
    </>
  );
}
