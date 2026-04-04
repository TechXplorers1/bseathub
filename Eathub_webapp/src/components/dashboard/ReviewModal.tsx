'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetName: string;
    targetType: 'Restaurant' | 'HomeFood' | 'Chef';
    orderId?: string;
}

export function ReviewModal({ isOpen, onClose, targetId, targetName, targetType, orderId }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Rating required', description: 'Please select a star rating.' });
            return;
        }

        const customerId = localStorage.getItem('userId') || '';
        if (!customerId) {
            toast({ variant: 'destructive', title: 'Login required', description: 'Session expired. Please login again.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReview({
                customerId,
                targetId,
                targetType,
                rating,
                comment,
                orderId
            });
            toast({ title: 'Success!', description: 'Your review has been submitted.' });
            onClose();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Submission failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-8">
                <DialogHeader>
                    <div className="w-12 h-1 bg-primary/20 rounded-full mb-6 mx-auto" />
                    <DialogTitle className="text-3xl font-black tracking-tight text-center uppercase">
                        Rate Your <span className="text-primary">{targetType}</span>
                    </DialogTitle>
                    <DialogDescription className="text-center font-bold text-slate-500 mt-2">
                        How was your experience with <span className="text-slate-800">{targetName}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-8 space-y-8">
                    {/* Star Rating */}
                    <div className="flex justify-center items-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={cn(
                                    "p-1 transition-all hover:scale-125 focus:outline-none",
                                    (hover || rating) >= star ? "text-yellow-400" : "text-slate-200"
                                )}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star 
                                    className={cn(
                                        "h-10 w-10", 
                                        (hover || rating) >= star ? "fill-current" : "fill-transparent"
                                    )} 
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment Field */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Write your experience</label>
                        <Textarea
                            placeholder="Share some details about the service, food, or overall experience..."
                            className="min-h-[120px] rounded-2xl border-muted/50 bg-slate-50/50 shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-base p-5 resize-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-4 sm:gap-2 pt-4">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="rounded-xl font-bold uppercase tracking-widest text-xs h-12 flex-1"
                    >
                        Maybe later
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || rating === 0}
                        className="rounded-2xl font-black uppercase tracking-widest text-sm h-12 px-8 flex-1 shadow-lg shadow-primary/30"
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
