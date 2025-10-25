'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { HomeFoodChart } from '@/components/dashboard/home-food/HomeFoodChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { topSellingDishes, orderTrends } from '@/lib/home-food-dashboard-data';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <HomeFoodChart />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Selling Dishes</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Dish</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topSellingDishes.map((dish) => (
                    <TableRow key={dish.name}>
                        <TableCell className="font-medium">{dish.name}</TableCell>
                        <TableCell>{dish.orders}</TableCell>
                        <TableCell className="text-right">
                        ${dish.revenue.toFixed(2)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Order Trends & Peak Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {orderTrends.map((trend) => (
                    <div key={trend.day} className="flex items-center justify-between">
                    <span className="font-medium">{trend.day}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Peak Time: {trend.peakTime}</span>
                        <Badge variant={trend.volume === 'High' ? 'default' : trend.volume === 'Medium' ? 'secondary' : 'outline'}>
                        {trend.volume} Volume
                        </Badge>
                    </div>
                    </div>
                ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
