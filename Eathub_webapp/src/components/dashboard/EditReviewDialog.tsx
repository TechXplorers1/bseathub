'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { submitReview } from '@/services/api';
import type { ReviewResponse, ReviewRequest } from '@/lib/types';
import { Loader2, Star, Utensils, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EditReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewResponse | null;
  providerName?: string;
  onSuccess: (updatedReview: ReviewResponse) => void;
}

export function EditReviewDialog({
  isOpen,
  onClose,
  review,
  providerName,
  onSuccess,
}: EditReviewDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (review) {
      setRating(review.rating || 5);
      setComment(review.comment || '');
      setError('');
    }
  }, [review, isOpen]);

  if (!review) return null;

  const starLabels = ['Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'];
  const activeRating = hoverRating || rating;

  const handleUpdate = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: ReviewRequest = {
        customerId: review.customerId,
        targetId: review.targetId,
        targetType: review.targetType as any,
        rating: rating,
        comment: comment.trim(),
        orderId: review.orderId,
        menuItemId: review.menuItemId,
        menuItemName: review.menuItemName,
      };

      const result = await submitReview(payload);
      toast({
        title: 'Review Updated',
        description: 'Your feedback has been successfully updated.',
      });
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 py-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-white text-white" />
              Edit Your Review
            </DialogTitle>
            <DialogDescription className="text-orange-100 text-sm mt-1">
              {review.menuItemName
                ? `Update your rating and review for "${review.menuItemName}"`
                : `Update your experience with ${providerName || 'this provider'}`}
            </DialogDescription>
          </DialogHeader>

          {review.menuItemName && (
            <div className="mt-3 bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-white border border-white/25">
              <Utensils className="w-3.5 h-3.5 text-white" />
              <span>Dish: {review.menuItemName}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-background">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Your Rating
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-125 focus:outline-none p-1"
                >
                  <Star
                    className={cn(
                      'h-9 w-9 transition-colors duration-150',
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow'
                        : 'text-gray-300 hover:text-amber-300'
                    )}
                  />
                </button>
              ))}
            </div>
            {activeRating > 0 && (
              <span className="text-sm font-extrabold text-orange-600 animate-in fade-in">
                {starLabels[activeRating - 1]}
              </span>
            )}
          </div>

          {/* Comment text area */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Review Comments
            </label>
            <Textarea
              placeholder="What did you like or dislike? Describe taste, quality, packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none min-h-[120px] rounded-xl text-sm"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between items-center text-[11px] text-muted-foreground px-1">
              <span>Help others choose the best dishes</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-medium text-center">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="rounded-full px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
