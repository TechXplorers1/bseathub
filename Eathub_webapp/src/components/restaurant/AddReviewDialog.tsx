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

import { submitReview } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating is required.'),
  text: z.string().min(10, 'Review must be at least 10 characters long.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: 'Restaurant' | 'HomeFood' | 'Chef';
  onSubmit?: (data: any) => void;
}

export function AddReviewDialog({
  open,
  onOpenChange,
  targetId,
  targetType,
  onSubmit,
}: AddReviewDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      text: '',
    },
  });

  // RESTORE DRAFT ON MOUNT/OPEN
  React.useEffect(() => {
    if (open) {
      const draft = sessionStorage.getItem(`review-draft-${targetId}`);
      if (draft && !form.getValues('text')) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.rating) form.setValue('rating', parsed.rating);
          if (parsed.text) form.setValue('text', parsed.text);
        } catch (e) {
          console.error("Draft restoration failed", e);
        }
      }
    }
  }, [open, targetId, form]);

  // AUTO-SAVE DRAFT
  const watchedText = form.watch('text');
  const watchedRating = form.watch('rating');

  React.useEffect(() => {
    if (open && (watchedText || watchedRating)) {
      sessionStorage.setItem(`review-draft-${targetId}`, JSON.stringify({ 
        text: watchedText, 
        rating: watchedRating 
      }));
    }
  }, [watchedText, watchedRating, open, targetId]);

  const handleFormSubmit = async (data: ReviewFormValues) => {
    const customerId = localStorage.getItem('userId') || localStorage.getItem('customerId');
    if (!customerId) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please login to write a review.' });
        return;
    }

    setLoading(true);
    try {
        const payload = {
            customerId,
            targetId,
            targetType,
            rating: data.rating,
            comment: data.text,
        };
        await submitReview(payload);
        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
        form.reset();
        onOpenChange(false);
        if (onSubmit) onSubmit(payload);
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to submit review' });
    } finally {
        setLoading(false);
        if (!loading) {
            sessionStorage.removeItem(`review-draft-${targetId}`);
        }
    }
  };
  
  const rating = form.watch('rating');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="rounded-[2rem] border-none shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Your Experience</DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Help others explore by sharing your thoughts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4 pb-2">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-3xl border-2 border-dashed">
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Tap to rate</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={String(field.value)}
                      className="flex items-center gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <FormItem
                          key={value}
                          className="flex items-center space-x-0 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={String(value)} className="sr-only" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            <Star
                              className={cn(
                                'h-10 w-10 transition-all duration-200 active:scale-90',
                                rating >= value
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-muted-foreground/20 fill-muted-foreground/10'
                              )}
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="font-bold text-xs mt-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Write your review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The crust was perfectly crispy and the chef was very polite..."
                      className="resize-none rounded-2xl border-muted bg-white min-h-[140px] p-5 text-base shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="font-bold text-xs" />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest">
                  Nevermind
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} className="flex-[2] rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Review"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
