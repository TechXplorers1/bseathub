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
import { submitReview, checkAlreadyReviewed, type ReviewRequest } from '@/services/api';
import { CheckCircle2, Loader2, Star, ShoppingBag, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'Restaurant' | 'HomeFood' | 'Chef';
    providerName: string;
    orderedItems?: string[];
    orderTotal?: number;
    orderDate?: string;
    orderId?: string; // Passed down to tie multiple reviews to the same order
}

interface ItemReviewState {
    rating: number;
    hover: number;
    comment: string;
}

export function ReviewDialog({
    isOpen,
    onClose,
    targetId,
    targetType,
    providerName,
    orderedItems = [],
    orderTotal,
    orderDate,
    orderId = 'Unknown', // Need to define this in props
}: ReviewDialogProps) {
    // For single Provider review (fallback if no items)
    const [providerRating, setProviderRating] = useState(0);
    const [providerHover, setProviderHover] = useState(0);
    const [providerComment, setProviderComment] = useState('');

    // For Item-level reviews
    const [itemReviews, setItemReviews] = useState<Record<string, ItemReviewState>>({});

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const getCustomerId = () => {
        if (typeof window === 'undefined') return null;
        return (
            localStorage.getItem('userId') ||
            localStorage.getItem('customerId') ||
            localStorage.getItem('userEmail')
        );
    };

    // Initialize state
    useEffect(() => {
        if (!isOpen) return;
        setProviderRating(0);
        setProviderHover(0);
        setProviderComment('');
        setSubmitted(false);
        setError('');

        const initialItemState: Record<string, ItemReviewState> = {};
        orderedItems.forEach(item => {
            initialItemState[item] = { rating: 0, hover: 0, comment: '' };
        });
        setItemReviews(initialItemState);

        const customerId = getCustomerId();
        if (!customerId) {
            setChecking(false);
            return;
        }

        // We can skip checking "already reviewed" for multiple items to simplify the UI,
        // or just let them update normally (Spring backend handles UPSERT logic based on targetId).
        setChecking(false);
    }, [isOpen, orderedItems]);

    const starLabels = ['Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'];

    const updateItemReview = (itemName: string, field: keyof ItemReviewState, value: any) => {
        setItemReviews(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                [field]: value
            }
        }));
        setError('');
    };

    const handleSubmit = async () => {
        const customerId = getCustomerId();
        if (!customerId) {
            setError('Please log in to submit a review.');
            return;
        }

        setLoading(true);
        setError('');

        let promises: Promise<any>[] = [];
        let atLeastOne = false;

        // Submit Item-Level Reviews
        if (orderedItems.length > 0) {
            for (const item of orderedItems) {
                const reviewState = itemReviews[item];
                if (reviewState && reviewState.rating > 0) {
                    atLeastOne = true;
                    const payload: ReviewRequest = {
                        customerId,
                        targetId: item, // Use item name as Target ID
                        targetType: 'MenuItem',
                        rating: reviewState.rating,
                        comment: reviewState.comment.trim(),
                        orderId: orderId,
                    };
                    promises.push(submitReview(payload));
                }
            }
        } else {
            // Submit Provider-Level Review Fallback
            if (providerRating > 0) {
                atLeastOne = true;
                const payload: ReviewRequest = {
                    customerId,
                    targetId,
                    targetType,
                    rating: providerRating,
                    comment: providerComment.trim(),
                    orderId: orderId,
                };
                promises.push(submitReview(payload));
            }
        }

        if (!atLeastOne) {
            setError('Please rate at least one item before submitting.');
            setLoading(false);
            return;
        }

        try {
            await Promise.all(promises);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] flex flex-col">

                {/* ── Gradient header ── */}
                <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-6 pt-6 pb-6 text-white shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-[22px] font-bold text-white leading-snug">
                            {submitted ? '🎉 Review Submitted!' : '⭐ Rate Your Items'}
                        </DialogTitle>
                        <DialogDescription className="text-orange-100 mt-1 text-sm">
                            {submitted
                                ? `Thanks for reviewing your order from ${providerName}!`
                                : `How were the dishes from ${providerName}?`}
                        </DialogDescription>
                    </DialogHeader>

                    {!submitted && orderTotal !== undefined && (
                        <div className="mt-4 bg-white/15 rounded-xl px-4 py-2 flex justify-between items-center border border-white/20">
                             <div className="flex gap-2 items-center text-sm font-semibold text-white">
                                <ShoppingBag className="w-4 h-4" /> Order Total
                             </div>
                             <span className="font-bold text-white">₹{orderTotal.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-5 bg-white overflow-y-auto no-scrollbar flex-grow">
                    {checking ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                            <p className="text-sm text-muted-foreground">Checking review status…</p>
                        </div>

                    ) : submitted ? (
                        /* ── Success state ── */
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
                                <CheckCircle2 className="h-11 w-11 text-green-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">
                                Your reviews help others discover great food!
                            </p>
                            <Button
                                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-10"
                                onClick={onClose}
                            >
                                Done
                            </Button>
                        </div>

                    ) : (
                        /* ── Active review form ── */
                        <div className="space-y-6">
                            {orderedItems.length > 0 ? (
                                // Item-Level Reviews
                                orderedItems.map((item, idx) => {
                                    const state = itemReviews[item] || { rating: 0, hover: 0, comment: '' };
                                    const activeItemRating = state.hover || state.rating;

                                    return (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                                <Utensils className="w-4 h-4 text-orange-500" />
                                                <span>{item}</span>
                                            </div>

                                            {/* Stars for Item */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onMouseEnter={() => updateItemReview(item, 'hover', star)}
                                                            onMouseLeave={() => updateItemReview(item, 'hover', 0)}
                                                            onClick={() => updateItemReview(item, 'rating', star)}
                                                            className="transition-transform hover:scale-110 focus:outline-none"
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    'h-7 w-7 transition-colors duration-100',
                                                                    star <= activeItemRating
                                                                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                                                        : 'text-gray-300 hover:text-amber-200'
                                                                )}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                {activeItemRating > 0 && (
                                                     <span className="text-xs font-semibold text-orange-600">
                                                         {starLabels[activeItemRating - 1]}
                                                     </span>
                                                )}
                                            </div>

                                            {/* Optional Comment for Item */}
                                            {state.rating > 0 && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <Textarea
                                                        placeholder={`Any comments specifically for ${item}? (optional)`}
                                                        value={state.comment}
                                                        onChange={(e) => updateItemReview(item, 'comment', e.target.value)}
                                                        className="resize-none text-xs leading-relaxed bg-white border-slate-200"
                                                        rows={2}
                                                        maxLength={200}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                // Provider-Level Review (Fallback)
                                <div className="space-y-4">
                                     <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-700">Rate your overall experience</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setProviderHover(star)}
                                                    onMouseLeave={() => setProviderHover(0)}
                                                    onClick={() => { setProviderRating(star); setError(''); }}
                                                    className="transition-transform hover:scale-115 focus:outline-none"
                                                >
                                                    <Star
                                                        className={cn(
                                                            'h-10 w-10 transition-all duration-100',
                                                            star <= (providerHover || providerRating)
                                                                ? 'fill-amber-400 text-amber-400 drop-shadow'
                                                                : 'text-gray-300 hover:text-amber-300'
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Add a comment... (optional)"
                                        value={providerComment}
                                        onChange={(e) => setProviderComment(e.target.value)}
                                        className="resize-none"
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-center">
                                    {error}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                {!submitted && !checking && (
                    <DialogFooter className="px-6 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100 gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={onClose} className="rounded-full text-muted-foreground">
                            Skip Reviews
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || (orderedItems.length > 0 ? !Object.values(itemReviews).some(r => r.rating > 0) : providerRating === 0)}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-7 min-w-[140px] shadow-lg shadow-orange-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                'Submit Reviews'
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
