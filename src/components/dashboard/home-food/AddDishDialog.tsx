'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import type { MenuItem } from '@/app/home-food-dashboard/menu/page';

const dishSchema = z.object({
  name: z.string().min(3, 'Dish name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.coerce.number().min(0.01, 'Price must be a positive number.'),
  status: z.enum(['Available', 'Out of Stock']),
});

type DishFormValues = z.infer<typeof dishSchema>;

interface AddDishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDish: (data: Omit<MenuItem, 'id' | 'imageUrl' | 'isSpecial'>) => void;
}

export function AddDishDialog({
  isOpen,
  onClose,
  onAddDish,
}: AddDishDialogProps) {
  const { toast } = useToast();
  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add a New Dish</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to your menu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dish Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grandma's Lasagna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell your customers about this delicious dish..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 18.00" {...field} />
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Dish</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}