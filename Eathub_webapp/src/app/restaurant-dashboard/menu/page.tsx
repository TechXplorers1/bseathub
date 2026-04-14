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
import { OfferDialog } from '@/components/dashboard/OfferDialog';

import { useRestaurants } from '@/context/RestaurantProvider';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import * as api from "@/services/api";
import { fetchItemsByRestaurant } from '@/services/api';
import { getDisplayImage } from '@/lib/image-utils';

type ExtendedMenuItem = MenuItemType & { isSpecial: boolean; status: 'Available' | 'Out of Stock' };

export default function MenuPage() {
  const { getRestaurantById, fetchFullRestaurantData, addDishToRestaurant, loading } = useRestaurants();
  const { toast } = useToast();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]);
  const [isAddDishDialogOpen, setIsAddDishDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedMenuItem | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedOfferItem, setSelectedOfferItem] = useState<ExtendedMenuItem | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("restaurantId");
    if (id) {
       setRestaurantId(id);
    }
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
        imageUrl: item.imageId || item.imageUrl || "/placeholder-food.jpg",
        imageId: item.imageId,
        description: item.description,
        isOnOffer: item.isOnOffer,
        offerType: item.offerType,
        offerValue: item.offerValue,
        offerDescription: item.offerDescription,
        offerStartDate: item.offerStartDate,
        offerEndDate: item.offerEndDate,
        offerStartTime: item.offerStartTime,
        offerEndTime: item.offerEndTime,
        offerMetaData: item.offerMetaData
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
  }, [restaurantId, refreshMenu]);

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

      // ✅ EDIT MODE
      if (editingItem) {
        const updated = await api.updateMenuItem(editingItem.id, payload) as any;
        const mappedUpdated = {
          ...updated,
          category: updated.category,
          categoryName: updated.category,
          isSpecial: updated.isSpecial ?? false,
          status: updated.status || "Available",
          imageUrl: updated.imageId || "/placeholder-food.jpg"
        };
        setMenuItems(prev => prev.map(i => i.id === mappedUpdated.id ? { ...i, ...mappedUpdated } : i));
        toast({ title: "Dish updated successfully" });
      }
      // ✅ ADD MODE
      else {
        const added = await addDishToRestaurant(restaurantId, payload, "restaurant") as any;
        const mappedAdded = {
          ...added,
          category: added.category,
          categoryName: added.category,
          isSpecial: added.isSpecial ?? false,
          status: added.status || "Available",
          imageUrl: added.imageId || "/placeholder-food.jpg"
        };
        setMenuItems(prev => [...prev, mappedAdded]);
        toast({ title: "Dish added successfully" });
      }

      setEditingItem(null);
      setIsAddDishDialogOpen(false);

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
    const newStatus = item.status === 'Available' ? 'Out of Stock' : 'Available';
    await api.updateStatus(item.id, newStatus);
    setMenuItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i)
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await api.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Deleted", description: "Dish removed successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete dish", variant: "destructive" });
    }
  };

  const handleSaveOffer = async (offerData: any) => {
    if (!selectedOfferItem) return;
    try {
      const payload = {
        ...selectedOfferItem,
        isOnOffer: offerData.isOnOffer,
        offerType: offerData.offerType,
        offerValue: offerData.offerValue,
        offerDescription: offerData.offerDescription,
        offerStartDate: offerData.startDate,
        offerEndDate: offerData.endDate,
        offerStartTime: offerData.startTime,
        offerEndTime: offerData.endTime,
        offerMetaData: JSON.stringify({
            comboItems: offerData.comboItems,
            minOrderValue: offerData.minOrderValue,
            buyX: offerData.buyX,
            getY: offerData.getY,
            planType: offerData.planType
        })
      };

      const updated = await api.updateMenuItem(selectedOfferItem.id, payload) as any;
      
      setMenuItems(prev => prev.map(i => i.id === updated.id ? {
        ...i,
        isOnOffer: updated.isOnOffer,
        offerType: updated.offerType,
        offerValue: updated.offerValue,
        offerDescription: updated.offerDescription,
        offerStartDate: updated.offerStartDate,
        offerEndDate: updated.offerEndDate,
        offerStartTime: updated.offerStartTime,
        offerEndTime: updated.offerEndTime
      } : i));
      
      toast({ title: "Offer saved successfully" });
      setIsOfferDialogOpen(false);
      setSelectedOfferItem(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save offer", variant: "destructive" });
    }
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
                Add, edit, or delete your food items.
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
                        src={getDisplayImage((item as any).imageId || (item as any).imageUrl, 'food-1')}
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
                      {item.isSpecial && <Badge variant="default" className="mr-1">Featured</Badge>}
                      {(item as any).isOnOffer && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          Offer: {(item as any).offerType}
                        </Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedOfferItem(item);
                            setIsOfferDialogOpen(true);
                          }}>
                            Offers
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
      <OfferDialog
        isOpen={isOfferDialogOpen}
        onClose={() => {
          setIsOfferDialogOpen(false);
          setSelectedOfferItem(null);
        }}
        onSave={handleSaveOffer}
        itemName={selectedOfferItem?.name || ""}
        allMenuItems={menuItems.map(i => ({ id: i.id, name: i.name }))}
        initialData={selectedOfferItem ? {
          isOnOffer: (selectedOfferItem as any).isOnOffer,
          offerType: (selectedOfferItem as any).offerType,
          offerValue: (selectedOfferItem as any).offerValue,
          offerDescription: (selectedOfferItem as any).offerDescription,
          startDate: (selectedOfferItem as any).offerStartDate,
          endDate: (selectedOfferItem as any).offerEndDate,
          startTime: (selectedOfferItem as any).offerStartTime,
          endTime: (selectedOfferItem as any).offerEndTime,
          ...(selectedOfferItem.offerMetaData ? JSON.parse(selectedOfferItem.offerMetaData) : {})
        } : undefined}
      />
    </>
  );
}