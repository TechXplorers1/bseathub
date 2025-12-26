
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChefChart } from '@/components/dashboard/chef/ChefChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { servicePopularity, bookingTrends } from '@/lib/chef-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

export default function AnalyticsPage() {
  const chartConfig = {
    bookings: {
      label: 'Bookings',
    },
    privateDinner: {
      label: 'Private Dinner',
      color: 'hsl(var(--primary))',
    },
    eventCatering: {
      label: 'Event Catering',
      color: 'hsl(var(--secondary))',
    },
    cookingClass: {
      label: 'Cooking Class',
      color: 'hsl(var(--accent))',
    },
  };
  
  const servicePopularityData = servicePopularity.map(service => ({
    ...service,
    name: service.name,
    bookings: service.value,
    fill: chartConfig[service.name.toLowerCase().replace(' ', '') as keyof typeof chartConfig]?.color || 'hsl(var(--muted-foreground))',
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChefChart data={bookingTrends} dataKey="bookings" type="bar" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Popularity</CardTitle>
            <CardDescription>A breakdown of your most popular services.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={servicePopularityData}
                  dataKey="bookings"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6">
          <Card>
          <CardHeader>
              <CardTitle>Top Services by Bookings</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {servicePopularity.map((service) => (
                  <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right">
                      {service.value}
                      </TableCell>
                  </TableRow>
                  ))}
              </TableBody>
              </Table>
          </CardContent>
          </Card>
      </div>
    </div>
  );
}
