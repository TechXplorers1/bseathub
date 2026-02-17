'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, FolderOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORIES = [
  "American", "Asian", "BBQ", "Bakery", "Banh Mi", "Bowls", "Bread", "Breakfast",
  "Brunch", "Bubble Tea", "Burgers", "Burritos", "Cafe", "Chicken", "Chinese",
  "Coffee", "Comfort Food", "Cookies", "Curry", "Deli", "Desserts", "Drinks",
  "Dumplings", "Enchiladas", "Fajitas", "Fast Food", "Fine Dining", "Gourmet",
  "Greek", "Grill", "Grilled Cheese", "Halal", "Healthy", "Homemade", "Indian",
  "Italian", "Japanese", "Korean", "Lunch", "Margaritas", "Mediterranean",
  "Mexican", "Middle Eastern", "Mughlai", "Noodle", "Noodles", "Pakistani",
  "Pancakes", "Pasta", "Pho", "Pizza", "Ramen", "Salads", "Sandwiches",
  "Seafood", "Smoothies", "Soup", "Spicy", "Steak", "Street Food", "Sushi",
  "Sweets", "Tacos", "Tex-Mex", "Thai", "Vegan", "Vegetarian", "Vietnamese",
  "Waffles", "Wings"
];

const dishSchema = z.object({
  name: z.string().min(3, 'Dish name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.coerce.number().min(0.01, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
  imageUrl: z.string().optional(),
  isSpecial: z.boolean().default(false),
  status: z.enum(['Available', 'Out of Stock']).default('Available'),
});

type DishFormValues = z.infer<typeof dishSchema>;

interface AddDishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDish: (data: DishFormValues) => void;
}

export function AddDishDialog({ isOpen, onClose, onAddDish }: AddDishDialogProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      isSpecial: false,
      status: 'Available',
    },
  });

  const handleFormSubmit = (data: DishFormValues) => {
    onAddDish(data);
    toast({
      title: 'Dish Added!',
      description: `${data.name} has been successfully added to your menu.`,
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 flex flex-col h-[90vh] max-h-[850px]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Add a New Dish</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to your menu.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* We use flex-1 and min-h-0 to force the form to stay within the dialog bounds */}
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-6">

                {/* 1. Dish Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-600 font-semibold">Dish Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spicy Ramen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Price and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-orange-600 font-semibold">Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-orange-600 font-semibold">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-48">
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 3. Image Upload */}
                <div className="space-y-3">
                  <FormLabel className="font-semibold">Dish Image</FormLabel>
                  <div className="flex gap-3">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} />

                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2 h-20 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FolderOpen className="h-5 w-5" />
                      <span className="text-xs sm:text-sm">Upload Folder</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2 h-20 border-dashed"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-xs sm:text-sm">Live Photo</span>
                    </Button>
                  </div>
                </div>

                {/* 4. Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe ingredients, taste, and size..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Item Settings (SPECIAL AND AVAILABILITY) */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Settings</h4>

                  <FormField
                    control={form.control}
                    name="isSpecial"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold">Special Item</FormLabel>
                          <p className="text-[12px] text-muted-foreground">Feature this on your menu</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-slate-50/50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold">Availability</FormLabel>
                          <p className="text-[12px] text-muted-foreground">Current stock status</p>
                        </div>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-[130px] h-9 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 border-t bg-white">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Add Dish</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}