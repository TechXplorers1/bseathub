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

import { menuItems as mockMenuItems } from '@/lib/home-food-dashboard-data';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { AddDishDialog } from '@/components/dashboard/home-food/AddDishDialog';
import { OfferDialog } from '@/components/dashboard/OfferDialog';
import { useToast } from '@/hooks/use-toast';
import {
  addHomeFoodDish,
  fetchHomeFoodMenu,
  updateMenuItem,
  deleteMenuItem,
  toggleFeatured,
  updateStatus
} from '@/services/api';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  status: string;
  imageUrl: string;
  isSpecial: boolean;
  description?: string;
  categoryName?: string;
  category?: string;
  isOnOffer?: boolean;
  offerType?: string;
  offerValue?: number;
  offerDescription?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  offerStartTime?: string;
  offerEndTime?: string;
  offerMetaData?: string;
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddDishDialogOpen, setIsAddDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedOfferItem, setSelectedOfferItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [providerId, setProviderId] = useState<string | null>(null);

  // Load the Provider ID on mount
  useEffect(() => {
    const rawId = localStorage.getItem('homeFoodId');
    const id = rawId ? rawId.trim() : null;
    if (id) {
      setProviderId(id);
    } else {
      setMenuItems(mockMenuItems);
      setIsLoading(false);
    }
  }, []);

  // Function to refresh menu data from Backend
  const refreshMenu = useCallback(async () => {
    if (!providerId) return;

    setIsLoading(true);
    try {
      const data = await fetchHomeFoodMenu(providerId);
      if (Array.isArray(data)) {
        const mappedItems = data.map((item: any) => ({
          ...item,
          imageUrl: item.imageId || item.imageUrl || "/placeholder-dish.jpg",
          categoryName: item.category, 
          isSpecial: item.isSpecial ?? false,
          status: item.status || 'Available',
          isOnOffer: item.isOnOffer ?? false,
          offerType: item.offerType,
          offerValue: item.offerValue,
          offerDescription: item.offerDescription,
          offerStartDate: item.offerStartDate,
          offerEndDate: item.offerEndDate,
          offerStartTime: item.offerStartTime,
          offerEndTime: item.offerEndTime
        }));
        setMenuItems(mappedItems);
      }
    } catch (error) {
      console.error("Failed to refresh menu:", error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Could not load menu from server. Showing local data.",
        variant: "destructive"
      });
      setMenuItems(mockMenuItems);
    } finally {
      setIsLoading(false);
    }
  }, [providerId, toast]);

  // Initial load of menu
  useEffect(() => {
    if (providerId) {
      refreshMenu();
    }
  }, [providerId, refreshMenu]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase();
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.status && item.status.toLowerCase().includes(query)) ||
      item.price.toString().includes(query)
    );
  }, [menuItems, searchQuery]);

  const handleToggleSpecial = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFeatured(id, !currentStatus);
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isSpecial: !currentStatus } : item));
      toast({ title: `Marked as ${!currentStatus ? 'Special' : 'Regular'}` });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Available' ? 'Out of Stock' : 'Available';
    try {
      await updateStatus(id, newStatus);
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      toast({ title: `Status updated to ${newStatus}` });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({ title: "Dish Deleted" });
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingDish(item);
    setIsAddDishDialogOpen(true);
  };

  const handleSaveDish = async (formData: any) => {
    if (!providerId) {
      toast({ title: "Error", description: "Provider ID not found. Please log in again.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryName: formData.category,
        isSpecial: formData.isSpecial,
        status: formData.status,
        imageUrl: formData.imageUrl
      };

      if (editingDish) {
        const updated = await updateMenuItem(editingDish.id, payload);
        const mappedUpdated = {
          ...updated,
          imageUrl: updated.imageId || "/placeholder-dish.jpg",
          categoryName: updated.category,
          isSpecial: updated.isSpecial ?? false,
          status: updated.status || 'Available',
        };
        setMenuItems(prev => prev.map(i => i.id === mappedUpdated.id ? { ...i, ...mappedUpdated } : i));
        toast({ title: "Dish Updated!" });
      } else {
        const added = await addHomeFoodDish(providerId, payload);
        const mappedAdded = {
          ...added,
          imageUrl: added.imageId || "/placeholder-dish.jpg",
          categoryName: added.category,
          isSpecial: added.isSpecial ?? false,
          status: added.status || 'Available',
        };
        setMenuItems(prev => [...prev, mappedAdded]);
        toast({ title: "Dish Added!" });
      }

      setIsAddDishDialogOpen(false);
      setEditingDish(null);
    } catch (err: any) {
      console.error("Save Failed:", err);
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
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

      const updated = await updateMenuItem(selectedOfferItem.id, payload);
      setMenuItems(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated, imageUrl: updated.imageId || i.imageUrl } : i));
      
      toast({ title: "Offer saved successfully" });
      setIsOfferDialogOpen(false);
      setSelectedOfferItem(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save offer", variant: "destructive" });
    }
  };

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
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-[220px] pl-8 lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button onClick={() => { setEditingDish(null); setIsAddDishDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Dish
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Today's Special</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading menu...</TableCell>
                  </TableRow>
                ) : filteredMenuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No items found</TableCell>
                  </TableRow>
                ) : (
                  filteredMenuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                          <Image
                            alt={item.name}
                            className="object-cover"
                            fill
                            src={item.imageUrl || "/placeholder-dish.jpg"}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div>
                          {item.name}
                          {item.categoryName && (
                            <div className="text-xs text-muted-foreground font-normal">{item.categoryName}</div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={item.status === 'Available' ? 'secondary' : 'outline'}>{item.status}</Badge>
                      </TableCell>

                      <TableCell>
                        {item.isSpecial && <Badge variant="default" className="mr-1">Special</Badge>}
                        {item.isOnOffer && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                Offer: {item.offerType}
                            </Badge>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">${item.price.toFixed(2)}</TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleSpecial(item.id, item.isSpecial)}>
                              {item.isSpecial ? 'Remove Special' : 'Mark Special'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item.id, item.status)}>
                              {item.status === 'Available' ? 'Out of Stock' : 'Mark Available'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setSelectedOfferItem(item);
                                setIsOfferDialogOpen(true);
                            }}>
                                Offers
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddDishDialog
        isOpen={isAddDishDialogOpen}
        onClose={() => { setIsAddDishDialogOpen(false); setEditingDish(null); }}
        onAddDish={handleSaveDish}
        initialData={editingDish}
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
          isOnOffer: selectedOfferItem.isOnOffer,
          offerType: selectedOfferItem.offerType,
          offerValue: selectedOfferItem.offerValue,
          offerDescription: selectedOfferItem.offerDescription,
          startDate: selectedOfferItem.offerStartDate,
          endDate: selectedOfferItem.offerEndDate,
          startTime: selectedOfferItem.offerStartTime,
          endTime: selectedOfferItem.offerEndTime,
          ...(selectedOfferItem.offerMetaData ? JSON.parse(selectedOfferItem.offerMetaData) : {})
        } : undefined}
      />
    </>
  );
}
