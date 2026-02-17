'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { AddDishDialog } from '@/components/dashboard/restaurant/AddDishDialog';
import { useRestaurants } from '@/context/RestaurantProvider';
import type { MenuItem as MenuItemType } from '@/lib/types';

type ExtendedMenuItem = MenuItemType & { isSpecial: boolean; status: 'Available' | 'Out of Stock' };

export default function MenuPage() {
  const { getRestaurantById, addDishToRestaurant, loading } = useRestaurants();

  // FIX: Get the actual ID from localStorage (Ensure your Login page sets 'userId' or 'restaurantId')
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]);
  const [isAddDishDialogOpen, setIsAddDishDialogOpen] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('userId'); // or 'restaurantId'
    if (storedId) setRestaurantId(storedId);
  }, []);

  const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;

  useEffect(() => {
    if (restaurant && restaurant.menu) {
      // Flattening nested categories into a single list for the UI table
      const allMenuItems = restaurant.menu.flatMap(category =>
        category.items.map(item => ({
          ...item,
          isSpecial: false,
          status: 'Available' as const
        }))
      );
      setMenuItems(allMenuItems);
    }
  }, [restaurant]);

  const handleAddDish = async (newDishData: any) => {
    if (!restaurantId || !restaurant) return;

    // FIX: The backend needs categoryId (UUID), but the form gives a string name.
    // We find the category UUID from the restaurant's existing menu categories.
    const category = restaurant.menu.find(c => c.name === newDishData.category);

    if (!category) {
      alert("Error: Selected category not found for this restaurant in database.");
      return;
    }

    const payload = {
      name: newDishData.name,
      description: newDishData.description,
      price: newDishData.price,
      categoryId: category.id // Send the UUID to RestaurantService.java
    };

    try {
      await addDishToRestaurant(restaurantId, payload);
    } catch (err) {
      console.error("Failed to add dish", err);
    }
  };

  const handleToggleSpecial = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, isSpecial: !item.isSpecial } : item
    ));
  };

  const handleToggleStatus = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, status: item.status === 'Available' ? 'Out of Stock' : 'Available' } : item
    ));
  }

  if (loading && !restaurantId) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Add, edit, or delete your food items for {restaurant?.name || 'your restaurant'}.</CardDescription>
            </div>
            <Button onClick={() => setIsAddDishDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Dish
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured Item</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No dishes found. Add your first dish to see it here.
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={item.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={`https://picsum.photos/seed/${item.id}/64/64`}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Available' ? 'secondary' : 'outline'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.isSpecial && <Badge variant="default">Featured</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleSpecial(item.id)}>
                            {item.isSpecial ? "Remove Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(item.id)}>
                            {item.status === 'Available' ? "Mark Out of Stock" : "Mark Available"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddDishDialog
        isOpen={isAddDishDialogOpen}
        onClose={() => setIsAddDishDialogOpen(false)}
        onAddDish={handleAddDish}
      />
    </>
  );
}