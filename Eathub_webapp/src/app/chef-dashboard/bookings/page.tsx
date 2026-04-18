'use client';

import { useEffect, useState } from 'react';
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
import { fetchChefBookingsByOwner, updateBookingStatus } from '@/services/api';
import type { ChefBooking } from '@/lib/types';
import { MoreHorizontal, Loader2, Calendar, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useHeader } from '@/context/HeaderProvider';

type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
type BookingFilterStatus = 'All' | BookingStatus;
const statusFilters: BookingFilterStatus[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function BookingsTable({ bookings, onStatusUpdate }: { bookings: ChefBooking[], onStatusUpdate: (id: string, status: string) => void }) {
    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No bookings found for this search/category.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Customer</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Contact & Details</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Guests</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Service</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Total</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map(booking => (
                    <TableRow key={booking.id} className="group transition-colors">
                        <TableCell>
                            <div className="font-black text-slate-800">{booking.customerName}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">#{booking.id?.slice(0, 8)}</div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-slate-600 text-xs">{booking.customerPhone || 'N/A'}</span>
                                <Badge variant="secondary" className={cn(
                                    "w-fit font-black text-[9px] uppercase tracking-tighter px-2",
                                    booking.foodPreference === 'Veg' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                        booking.foodPreference === 'Non-Veg' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                                            "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                )}>
                                    {booking.foodPreference || 'Both'}
                                </Badge>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-bold text-slate-800 whitespace-nowrap">
                                {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 italic">
                                {booking.eventTime || 'No Time Set'}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="rounded-md font-bold tracking-tighter bg-white shadow-sm border-slate-200">
                                {booking.guests} Guests
                            </Badge>
                        </TableCell>
                        <TableCell className="py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                            {booking.eventType || booking.serviceName || 'General Hire'}
                        </TableCell>
                        <TableCell>
                            <Badge className="rounded-full px-4 font-black text-[10px] uppercase tracking-wider shadow-sm" variant={booking.status === 'Completed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {booking.isNegotiable ? (
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-primary text-xs uppercase tracking-tighter italic">Negotiable</span>
                                    <span className="text-[9px] font-bold text-muted-foreground/60 opacity-50 decoration-slate-400 line-through">${booking.totalAmount?.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="font-black text-slate-900">${booking.totalAmount?.toFixed(2)}</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-200 p-1 min-w-[150px]">
                                    {booking.status === 'Pending' && (
                                        <DropdownMenuItem className="font-bold text-xs py-2 px-3 rounded-lg" onClick={() => onStatusUpdate(booking.id!, 'Confirmed')}>Accept Booking</DropdownMenuItem>
                                    )}
                                    {booking.status === 'Confirmed' && (
                                        <DropdownMenuItem className="font-bold text-xs py-2 px-3 rounded-lg" onClick={() => onStatusUpdate(booking.id!, 'Completed')}>Mark as Completed</DropdownMenuItem>
                                    )}
                                    {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                                        <DropdownMenuItem className="text-destructive font-bold text-xs py-2 px-3 rounded-lg hover:bg-red-50" onClick={() => onStatusUpdate(booking.id!, 'Cancelled')}>Reject Booking</DropdownMenuItem>
                                    )}
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
    const [bookings, setBookings] = useState<ChefBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<BookingFilterStatus>('All');
    const { toast } = useToast();

    // Connect to Global Header Search
    const { searchQuery, setSearchPlaceholder, setSearchQuery } = useHeader();

    useEffect(() => {
        setSearchPlaceholder("Search bookings by customer, event, ID...");
        return () => {
            setSearchPlaceholder("Search food, restaurants, chefs...");
            setSearchQuery('');
        };
    }, []);

    const loadBookings = async (silent = false) => {
        const ownerId = localStorage.getItem('userId');
        if (!ownerId) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const data = await fetchChefBookingsByOwner(ownerId);
            const sorted = data.sort((a, b) => {
                // Primary sort by CreatedAt (Recent Request first)
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                // Fallback to EventDate
                const dateA = new Date(a.eventDate).getTime();
                const dateB = new Date(b.eventDate).getTime();
                return dateB - dateA;
            });
            setBookings(sorted);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load bookings' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        let reason = '';
        if (status === 'Cancelled') {
            reason = window.prompt('Please provide a reason for rejection/cancellation:') || '';
            if (reason === null) return;
        }

        try {
            await updateBookingStatus(id, status, reason);
            toast({ title: 'Status Updated', description: `Booking is now ${status}` });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as any, statusReason: reason } : b));
        } catch (err) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update status' });
        }
    };

    const filteredBookings = bookings.filter(booking => {
        // Apply Header Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                booking.customerName?.toLowerCase().includes(q) ||
                booking.id?.toLowerCase().includes(q) ||
                booking.eventType?.toLowerCase().includes(q) ||
                booking.serviceName?.toLowerCase().includes(q);

            if (!matchesSearch) return false;
        }

        // Apply Tab Filter
        if (activeTab === 'All') return true;
        return booking.status === activeTab;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">Synchronizing bookings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Chef Bookings</h1>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Manage your culinary event schedule</p>
                </div>
                <Tabs defaultValue="All" value={activeTab} onValueChange={(value) => setActiveTab(value as BookingFilterStatus)} className="w-fit">
                    <TabsList className="bg-slate-100 rounded-xl p-1 h-12 shadow-inner">
                        {statusFilters.map(status => (
                            <TabsTrigger
                                key={status}
                                value={status}
                                className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
                            >
                                {status}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <Card className="border-0 shadow-2xl shadow-slate-300/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight uppercase">Event Queue</CardTitle>
                            <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Showing {filteredBookings.length} {activeTab !== 'All' ? activeTab : 'total'} Results
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadBookings(true)}
                            disabled={refreshing}
                            className="rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary transition-all gap-2 px-5 py-5 active:scale-95"
                        >
                            <RefreshCcw className={cn("h-3 w-3", refreshing && "animate-spin")} />
                            {refreshing ? 'Refreshing...' : 'Sync Data'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <BookingsTable bookings={filteredBookings} onStatusUpdate={handleStatusUpdate} />
                </CardContent>
            </Card>
        </div>
    );
}
