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
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { menuItems as initialMenuItems } from '@/lib/home-food-dashboard-data';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { AddDishDialog } from '@/components/dashboard/home-food/AddDishDialog';
import { useToast } from '@/hooks/use-toast';
import { addDishToRestaurant } from '@/services/api';
import { useRestaurants } from '@/context/RestaurantProvider';

export type MenuItem = (typeof initialMenuItems)[number];

export default function MenuPage() {
  const { fetchFullRestaurantData, addDishToRestaurant, loading } = useRestaurants();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isAddDishDialogOpen, setIsAddDishDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);

  // Load the Provider ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('userId') || localStorage.getItem('homeFoodId');
    if (storedId) setRestaurantId(storedId);
  }, []);

  // Function to refresh menu data
  const refreshMenu = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchFullRestaurantData(restaurantId);
      setRestaurant(data);

      if (data && data.menu) {
        const allMenuItems = data.menu.flatMap((category: any) =>
          category.items.map((item: any) => ({
            ...item,
            isSpecial: item.isSpecial ?? false,
            status: item.status || 'Available',
          }))
        );
        setMenuItems(allMenuItems);
      }
    } catch (error) {
      console.error("Failed to refresh menu:", error);
    }
  }, [restaurantId, fetchFullRestaurantData]);

  // Initial load of menu
  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  /* ----------------------------- SEARCH LOGIC ----------------------------- */

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;

    const query = searchQuery.toLowerCase();

    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.price.toString().includes(query)
    );
  }, [menuItems, searchQuery]);

  /* ----------------------------- ACTIONS ---------------------------------- */

  const handleToggleSpecial = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSpecial: !item.isSpecial } : item
      )
    );
  };

  const handleToggleStatus = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            status:
              item.status === 'Available'
                ? 'Out of Stock'
                : 'Available',
          }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // page.tsx - Update handleAddDish function
  const handleAddDish = async (newDishData: any) => {
    if (!restaurant || !restaurantId) return;

    try {
      const payload = {
        name: newDishData.name,
        description: newDishData.description,
        price: parseFloat(newDishData.price),
        categoryName: newDishData.category,
        isSpecial: newDishData.isSpecial,
        status: newDishData.status,
        imageUrl: newDishData.imageUrl || ""
      };

      await addDishToRestaurant(restaurantId, payload, 'home-food');

      setIsAddDishDialogOpen(false);
      await refreshMenu();
      toast({ title: "Saved to Database!" });
    } catch (err: any) {
      console.error("DB Save Failed:", err);
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    }
  };

  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>
                Add, edit, or delete your food items.
              </CardDescription>
            </div>

            <div className="flex gap-3 items-center">
              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, status or price..."
                  className="w-[220px] pl-8 lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsAddDishDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Dish
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Special</TableHead>
                <TableHead className="hidden md:table-cell">
                  Price
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMenuItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={item.name}
                        className="aspect-square rounded-md object-cover"
                        height={64}
                        width={64}
                        src={item.imageUrl}
                      />
                    </TableCell>

                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'Available'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.isSpecial && (
                        <Badge variant="default">Special</Badge>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      ${item.price.toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            Actions
                          </DropdownMenuLabel>

                          <DropdownMenuItem>Edit</DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleSpecial(item.id)
                            }
                          >
                            {item.isSpecial
                              ? 'Remove as Special'
                              : 'Mark as Special'}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(item.id)
                            }
                          >
                            {item.status === 'Available'
                              ? 'Mark as Out of Stock'
                              : 'Mark as Available'}
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
        onClose={() => setIsAddDishDialogOpen(false)}
        onAddDish={handleAddDish}
      />
    </>
  );
}
