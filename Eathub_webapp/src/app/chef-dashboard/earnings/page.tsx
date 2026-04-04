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
import { Badge } from '@/components/ui/badge';
import { fetchChefBookingsByOwner, fetchChefEarningsByOwner } from '@/services/api';
import type { ChefBooking } from '@/lib/types';
import { ChefChart } from '@/components/dashboard/chef/ChefChart';
import { Loader2, TrendingUp, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EarningsPage() {
  const [bookings, setBookings] = useState<ChefBooking[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      const ownerId = localStorage.getItem('userId');
      if (!ownerId) return;
      try {
        const [bookingsData, earningsVal] = await Promise.all([
          fetchChefBookingsByOwner(ownerId),
          fetchChefEarningsByOwner(ownerId)
        ]);
        setBookings(bookingsData);
        setTotalEarnings(earningsVal);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load financial data' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const transactionHistory = bookings.filter(b => b.status === 'Completed');
  const thisMonthEarnings = transactionHistory
    .filter(b => new Date(b.eventDate).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Mock trend data based on real bookings
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendData = months.slice(0, new Date().getMonth() + 1).map((m, i) => ({
    month: m,
    earnings: transactionHistory
      .filter(b => new Date(b.eventDate).getMonth() === i)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Calculating your success...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Earnings Overview</h1>
          <p className="text-muted-foreground font-medium">Track your income and transaction history</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Earnings</CardTitle>
            <CardDescription className="text-slate-500">All-time gross revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">${totalEarnings.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white">
          <CardHeader>
            <CardTitle className="text-muted-foreground font-bold text-xs uppercase tracking-widest">This Month</CardTitle>
            <CardDescription>Income for {months[new Date().getMonth()]} {new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-slate-900">${thisMonthEarnings.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white border-dashed border-2 border-slate-100">
          <CardHeader>
            <CardTitle className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Pending Payouts</CardTitle>
            <CardDescription>Bookings marked as completed but unpaid</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-orange-500">
              ${bookings.filter(b => b.status === 'Completed' && b.paymentStatus === 'Unpaid')
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black tracking-tight uppercase">Earnings Trend</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest">Revenue growth over the current year</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ChefChart data={trendData} dataKey="earnings" type="line" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black tracking-tight uppercase">Transaction History</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest">Most recently completed bookings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Service</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Payment</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory.length > 0 ? transactionHistory.map((booking) => (
                <TableRow key={booking.id} className="group transition-colors">
                  <TableCell className="font-black text-slate-800">{booking.customerName}</TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {new Date(booking.eventDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium text-slate-400 italic text-sm">{booking.serviceName || 'Personal Chef'}</TableCell>
                  <TableCell>
                    <Badge variant={booking.paymentStatus === 'Paid' ? 'default' : 'outline'} className="rounded-full px-3 text-[10px] font-black uppercase">
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900 text-lg">${booking.totalAmount?.toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground font-medium">No completed transactions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
