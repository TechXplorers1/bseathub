'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/* ================= SCHEMA ================= */

const dishSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0.01),
  category: z.string().min(1, "Category required"),
  status: z.enum(['Available', 'Out of Stock', 'Sold Out']),
  isSpecial: z.boolean().default(false),
  image: z.any()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size exceeded.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Invalid image type"
    ),
});

type DishFormValues = z.infer<typeof dishSchema>;

interface AddDishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDish: (data: any) => void;
  initialData?: any;
}

/* ================= COMPONENT ================= */

export function AddDishDialog({
  isOpen,
  onClose,
  onAddDish,
  initialData,
}: AddDishDialogProps) {

  const { toast } = useToast();

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema.extend({
      image: z.any()
        .refine((files) => initialData || (files && files.length > 0), "Image is required.")
        .optional(),
    })),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      status: 'Available',
      isSpecial: false,
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        category: initialData.categoryName || initialData.category || '',
        price: initialData.price,
        status: initialData.status || 'Available',
        isSpecial: initialData.isSpecial || false,
      });
      setImagePreview(initialData.imageUrl || null);
    } else if (!initialData && isOpen) {
      form.reset({
        name: '',
        description: '',
        category: '',
        price: 0,
        status: 'Available',
        isSpecial: false,
      });
      setImagePreview(null);
    }
  }, [initialData, isOpen, form]);

  /* ================= SUBMIT ================= */

  const handleFormSubmit = (data: DishFormValues) => {
    onAddDish({
      ...data,
      id: initialData?.id,
      imageUrl: imagePreview || "",
    } as any);

    form.reset();
    setImagePreview(null);
    onClose();
  };

  /* ================= IMAGE ================= */

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      if (!initialData) setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ================= UI ================= */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background shadow-2xl rounded-xl border-border/50">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {initialData ? 'Edit Dish' : 'Add New Dish'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {initialData ? 'Update your menu item details.' : 'Create a new menu item for your home food.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="space-y-6">
                {/* IMAGE */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Dish Image {initialData && "(Optional)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {imagePreview && (
                  <div className="relative h-48 w-full rounded-xl border border-border/50 overflow-hidden shadow-sm group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  </div>
                )}

                {/* NAME */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Dish Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Chicken Biryani" {...field} className="focus-visible:ring-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DESCRIPTION */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the dish, ingredients, and flavor profile..."
                          {...field}
                          className="min-h-[100px] resize-none focus-visible:ring-primary/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CATEGORY */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Category</FormLabel>

                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-primary/50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="Breakfast">Breakfast</SelectItem>
                          <SelectItem value="Lunch">Lunch</SelectItem>
                          <SelectItem value="Dinner">Dinner</SelectItem>
                          <SelectItem value="Biryani">Biryani</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PRICE + STATUS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="focus-visible:ring-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-primary/50">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            <SelectItem value="Sold Out">Sold Out</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SPECIAL */}
                <FormField
                  control={form.control}
                  name="isSpecial"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/5 p-4 transition-colors hover:bg-accent/10">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold">Today's Special</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Highlight this dish to attract more customers.
                        </p>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-6 w-6 rounded-md border-primary text-primary focus:ring-primary/50 cursor-pointer"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 shrink-0 bg-muted/30 border-t flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="sm:flex-1 h-11">
                Cancel
              </Button>
              <Button type="submit" className="sm:flex-1 h-11 font-semibold shadow-lg shadow-primary/20">
                {initialData ? 'Update Dish' : 'Add Dish'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
