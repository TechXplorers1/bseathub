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
import { topSellingDishes, orderTrends, salesPerformance } from '@/lib/home-food-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

export default function AnalyticsPage() {
  const chartConfig = {
    revenue: {
      label: 'Revenue',
    },
    lasagna: {
      label: "Grandma's Lasagna",
      color: 'hsl(var(--chart-1))',
    },
    parmesan: {
      label: 'Chicken Parmesan',
      color: 'hsl(var(--chart-2))',
    },
    garlicBread: {
      label: 'Garlic Bread',
      color: 'hsl(var(--chart-3))',
    },
  };

  const topDishesData = topSellingDishes.map(dish => ({
    name: dish.name,
    revenue: dish.revenue,
    fill: `hsl(var(--chart-${Object.keys(chartConfig).find(key => chartConfig[key as keyof typeof chartConfig].label === dish.name) ? Object.keys(chartConfig).indexOf(Object.keys(chartConfig).find(key => chartConfig[key as keyof typeof chartConfig].label === dish.name)!) : 1}))`,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <HomeFoodChart data={salesPerformance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Dishes by Revenue</CardTitle>
            <CardDescription>A breakdown of your most popular items.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={topDishesData}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
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
  );
}
