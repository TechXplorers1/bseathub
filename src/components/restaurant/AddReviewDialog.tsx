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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating is required.'),
  text: z.string().min(10, 'Review must be at least 10 characters long.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { author: string, text: string, rating: number, avatar: string }) => void;
}

export function AddReviewDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddReviewDialogProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      text: '',
    },
  });

  const handleFormSubmit = (data: ReviewFormValues) => {
    onSubmit({
      author: 'New User', // Placeholder
      text: data.text,
      rating: data.rating,
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`, // Placeholder
    });
    form.reset();
    onOpenChange(false);
  };
  
  const rating = form.watch('rating');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this restaurant.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Your rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                      className="flex items-center"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <FormItem
                          key={value}
                          className="flex items-center space-x-1 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={String(value)} className="sr-only" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            <Star
                              className={cn(
                                'h-6 w-6',
                                rating >= value
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300 fill-gray-300'
                              )}
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like or dislike?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Submit Review</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
