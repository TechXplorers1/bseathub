'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { allRestaurants, allHomeFoods } from "@/lib/data"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const recentOrders = [
    {
        id: "ORD001",
        restaurant: "The Golden Spoon",
        restaurantId: '1',
        items: ['Spaghetti Carbonara', 'Bruschetta'],
        amount: 32.50,
        status: "Delivered",
        date: "2024-07-22",
    },
    {
        id: "ORD006",
        restaurant: "The Noodle Bar",
        restaurantId: '7',
        items: ['Classic Beef Pho'],
        amount: 28.50,
        status: "Preparing",
        date: "2024-07-23",
    },
    {
        id: "ORD007",
        restaurant: "Pizza Planet",
        restaurantId: '8',
        items: ['Pepperoni Overload'],
        amount: 22.00,
        status: "Confirmed",
        date: "2024-07-23",
    },
    {
        id: "ORD002",
        restaurant: "Sushi Palace",
        restaurantId: '2',
        items: ['California Roll', 'Spicy Tuna Roll', 'Salmon Nigiri'],
        amount: 55.10,
        status: "Delivered",
        date: "2024-07-20",
    },
    {
        id: "ORD003",
        restaurant: "Burger Bonanza",
        restaurantId: '3',
        items: ['Classic Cheeseburger', 'French Fries'],
        amount: 25.00,
        status: "Cancelled",
        date: "2024-07-19",
    },
    {
        id: "ORD004",
        restaurant: "The Green Bowl",
        restaurantId: '6',
        items: ['Cobb Salad'],
        amount: 18.75,
        status: "Delivered",
        date: "2024-07-18",
    },
    {
        id: "ORD005",
        restaurant: "Curry House",
        restaurantId: '5',
        items: ['Chicken Tikka Masala', 'Garlic Naan'],
        amount: 45.20,
        status: "Delivered",
        date: "2024-07-15",
    },
]

const favoriteChefs = allHomeFoods.slice(0,4).map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
}));

type OrderStatus = 'All' | 'Completed' | 'Pending' | 'Confirmed' | 'Cancelled';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>('All');
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);


    const filteredOrders = recentOrders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed') return order.status === 'Delivered';
        if (activeTab === 'Pending') return order.status === 'Preparing';
        if (activeTab === 'Confirmed') return order.status === 'Confirmed';
        if (activeTab === 'Cancelled') return order.status === 'Cancelled';
        return false;
    });
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-4xl">125</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +10% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Spent</CardDescription>
                  <CardTitle className="text-4xl">$2,389</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +25% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Favorites</CardDescription>
                  <CardTitle className="text-4xl">12</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    You discovered 2 new restaurants this month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Eat Hub Pro</CardDescription>
                  <CardTitle className="text-4xl">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Your membership is saving you money!
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                    <Card>
                        <CardHeader className="px-7">
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>
                            A summary of your most recent orders.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
                                <TabsList>
                                    <TabsTrigger value="All">All</TabsTrigger>
                                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                                    <TabsTrigger value="Pending">Pending</TabsTrigger>
                                    <TabsTrigger value="Confirmed">Confirmed</TabsTrigger>
                                    <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                                </TabsList>
                                <TabsContent value={activeTab}>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                            <TableHead>Restaurant</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.map(order => (
                                                <Collapsible asChild key={order.id} open={openOrderId === order.id} onOpenChange={() => setOpenOrderId(openOrderId === order.id ? null : order.id)}>
                                                    <React.Fragment>
                                                        <TableRow className="bg-background">
                                                            <TableCell>
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="hidden h-10 w-10 sm:flex">
                                                                        <AvatarImage src={`https://picsum.photos/seed/${order.restaurantId}/100/100`} alt={order.restaurant} />
                                                                        <AvatarFallback>{order.restaurant.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="font-medium">{order.restaurant}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge 
                                                                    className="text-xs"
                                                                    variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'outline'}
                                                                >
                                                                    {order.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{order.date}</TableCell>
                                                            <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <CollapsibleTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                                                        </Button>
                                                                    </CollapsibleTrigger>
                                                                    {(order.status === 'Preparing' || order.status === 'Confirmed') && (
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        <CollapsibleContent asChild>
                                                            <TableRow>
                                                                <TableCell colSpan={5} className="p-0">
                                                                    <div className="p-4 bg-muted/50">
                                                                        <h4 className="font-semibold mb-2">Order Items:</h4>
                                                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                                            {order.items.map(item => <li key={item}>{item}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        </CollapsibleContent>
                                                    </React.Fragment>
                                                </Collapsible>
                                            ))}
                                        </TableBody>
                                        </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Favorite Home Food</CardTitle>
                                <CardDescription>
                                    Your go-to home kitchens.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allHomeFoods.slice(0,4).map(restaurant => (
                                <div key={restaurant.id} className="flex items-center gap-4">
                                    <Avatar className="hidden h-12 w-12 sm:flex">
                                    <AvatarImage src={`https://picsum.photos/seed/${restaurant.id}/100/100`} alt={restaurant.name} />
                                    <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        {restaurant.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {restaurant.cuisine}
                                    </p>
                                    </div>
                                </div>
                            ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Favorite Restaurants</CardTitle>
                                <CardDescription>
                                    Your most-ordered from spots.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allRestaurants.slice(0,4).map(restaurant => (
                                <div key={restaurant.id} className="flex items-center gap-4">
                                    <Avatar className="hidden h-12 w-12 sm:flex">
                                    <AvatarImage src={`https://picsum.photos/seed/${restaurant.id}/100/100`} alt={restaurant.name} />
                                    <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        {restaurant.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {restaurant.cuisine}
                                    </p>
                                    </div>
                                </div>
                            ))}
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Favorite Chefs</CardTitle>
                            <CardDescription>
                                The culinary artists you love.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoriteChefs.map(chef => (
                            <div key={chef.name} className="flex items-center gap-4">
                                <Avatar className="hidden h-12 w-12 sm:flex">
                                <AvatarImage src={chef.avatarUrl} alt={chef.name} />
                                <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                    {chef.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {chef.specialty}
                                </p>
                                </div>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
    