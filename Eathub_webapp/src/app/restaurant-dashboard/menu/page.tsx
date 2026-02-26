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
import { useState, useEffect, useCallback } from 'react';
import { AddDishDialog, type DishFormValues } from '@/components/dashboard/restaurant/AddDishDialog';

import { useRestaurants } from '@/context/RestaurantProvider';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import * as api from "@/services/api";
import { fetchItemsByRestaurant } from '@/services/api';

type ExtendedMenuItem = MenuItemType & { isSpecial: boolean; status: 'Available' | 'Out of Stock' };

export default function MenuPage() {
  const { getRestaurantById, fetchFullRestaurantData, addDishToRestaurant, loading } = useRestaurants();
  const { toast } = useToast();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]);
  const [isAddDishDialogOpen, setIsAddDishDialogOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<ExtendedMenuItem | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("restaurant") || "{}");

    if (!stored?.id) return;

    const url = `http://localhost:8081/api/v1/menu/restaurants/${stored.id}`;

    fetch(url)
      .then(res => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          ...item,
          isSpecial: item.isSpecial ?? false,
          status: item.status || "Available",
        }));

        setMenuItems(mapped);
      })
      .catch(console.error);

  }, []);
  // Load the Restaurant ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('restaurantId');
    if (storedId) setRestaurantId(storedId);
  }, []);

  // Function to refresh menu data
  const refreshMenu = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const data = await fetchItemsByRestaurant(restaurantId);

      const mappedItems = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        status: item.status ?? "Available",
        isSpecial: item.isSpecial ?? false,
        imageUrl: item.imageUrl || "/placeholder-food.jpg",
        description: item.description,
        category: item.categoryName
      }));

      setMenuItems(mappedItems);
    } catch (error) {
      console.error("Failed to refresh menu:", error);
    }
  }, [restaurantId]);

  // Initial load of menu
  useEffect(() => {
    if (restaurantId) {
      refreshMenu();
    }
  }, [restaurantId]);

  const handleAddDish = async (formData: DishFormValues) => {
    try {
      if (!restaurantId) return;

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryName: formData.category,
        status: formData.status,
        isSpecial: formData.isSpecial,
        imageUrl: formData.imageUrl || ""
      };

      console.log("Payload:", payload);

      // ✅ EDIT MODE
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload);
        toast({ title: "Dish updated successfully" });
      }
      // ✅ ADD MODE
      else {
        await addDishToRestaurant(restaurantId, payload, "restaurant");
        toast({ title: "Dish added successfully" });
      }

      setEditingItem(null);
      setIsAddDishDialogOpen(false);
      await refreshMenu();

    } catch (e) {
      console.error("SAVE DISH ERROR:", e);
    }
  };

  const handleToggleSpecial = async (item: ExtendedMenuItem) => {
    const newValue = !item.isSpecial;

    await api.toggleFeatured(item.id, newValue);

    setMenuItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, isSpecial: newValue } : i)
    );
  };

  const handleToggleStatus = async (item: ExtendedMenuItem) => {
    const newStatus = item.status === 'Available'
      ? 'Out of Stock'
      : 'Available';

    await api.updateStatus(item.id, newStatus);

    setMenuItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i)
    );
  };
  const handleDelete = async (id: string) => {
    await api.deleteMenuItem(id);
    await refreshMenu();
  };

  if (loading && !menuItems.length) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>
                Add, edit, or delete your food items for {restaurant?.name || 'your restaurant'}.
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDishDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Dish
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto scrollbar-hide">
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
                        src={item.imageId ? `/api/images/${item.imageId}` : `https://picsum.photos/seed/${item.id}/64/64`}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddDishDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleSpecial(item)}>
                            {item.isSpecial ? "Remove Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                            {item.status === 'Available' ? "Mark Out of Stock" : "Mark Available"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </DropdownMenuItem>
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
        onClose={() => {
          setIsAddDishDialogOpen(false);
          setEditingItem(null);
        }}
        onAddDish={handleAddDish}
        defaultValues={
          editingItem
            ? {
              name: editingItem.name ?? "",
              description: editingItem.description ?? "",
              price: editingItem.price ?? 0,
              category: editingItem.category ?? "",
              status: editingItem.status ?? "Available",
              isSpecial: editingItem.isSpecial ?? false,
              imageUrl: editingItem.imageId ?? ""
            }
            : undefined
        }
      />
    </>
  );
}