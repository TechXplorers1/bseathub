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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { ChefBooking } from '@/lib/admin-data';
import { Input } from '../ui/input';

interface BookingsTableProps {
  bookings: ChefBooking[];
}

export function BookingsTable({ bookings: initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (bookingId: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
  };
  
  const filteredBookings = bookings.filter(booking => 
    booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.chef.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Chef Bookings</CardTitle>
        <CardDescription>Manage and track all private chef bookings.</CardDescription>
        <Input 
            placeholder="Search by customer or chef..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mt-2"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Chef</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{booking.customer.email}</div>
                </TableCell>
                <TableCell>{booking.chef.name}</TableCell>
                <TableCell>{booking.eventDate}</TableCell>
                <TableCell>{booking.guests}</TableCell>
                <TableCell>
                  <Badge variant={booking.status === 'Completed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'Confirmed')}>Mark as Confirmed</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'Completed')}>Mark as Completed</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'Cancelled')} className="text-destructive">Cancel Booking</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
