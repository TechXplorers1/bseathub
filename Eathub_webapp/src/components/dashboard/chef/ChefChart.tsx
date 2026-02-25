
'use client'

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface ChefChartProps {
  data: any[];
  dataKey: string;
  type: 'bar' | 'line';
}

export function ChefChart({ data, dataKey, type }: ChefChartProps) {
  const ChartComponent = (type === 'bar' ? BarChart : LineChart) as any;
  const ChartElement = (type === 'bar' ? Bar : Line) as any;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => type === 'line' ? `$${value}` : `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <ChartElement dataKey={dataKey} fill="hsl(var(--primary))" stroke="hsl(var(--primary))" radius={type === 'bar' ? [4, 4, 0, 0] : undefined} />
      </ChartComponent>
    </ResponsiveContainer>
  )
}
