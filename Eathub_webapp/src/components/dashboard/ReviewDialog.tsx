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
import { submitReview, checkAlreadyReviewed } from '@/services/api';
import { type ReviewRequest } from '@/lib/types';
import { CheckCircle2, Loader2, Star, ShoppingBag, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface OrderedItem {
    itemRefId: string;
    itemName: string;
}

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'Restaurant' | 'HomeFood' | 'Chef';
    providerName: string;
    orderedItems?: OrderedItem[];
    orderTotal?: number;
    orderDate?: string;
    orderId?: string;
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
    orderId = 'Unknown',
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
    const [reviewedItemIds, setReviewedItemIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');

    // PERSISTENCE RECOVERY
    useEffect(() => {
        if (isOpen && orderId && !submitted) {
            const draftKey = `order-review-draft-${orderId}`;
            const draft = sessionStorage.getItem(draftKey);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed.providerRating) setProviderRating(parsed.providerRating);
                    if (parsed.providerComment) setProviderComment(parsed.providerComment);
                    if (parsed.itemReviews) setItemReviews(parsed.itemReviews);
                } catch (e) {
                    console.error("Failed to restore complex review draft", e);
                }
            }
        }
    }, [isOpen, orderId, submitted]);

    // AUTO-SAVE DRAFT
    useEffect(() => {
        if (isOpen && orderId && !submitted && (providerRating > 0 || Object.keys(itemReviews).length > 0)) {
            const draftKey = `order-review-draft-${orderId}`;
            sessionStorage.setItem(draftKey, JSON.stringify({
                providerRating,
                providerComment,
                itemReviews
            }));
        }
    }, [isOpen, orderId, providerRating, providerComment, itemReviews, submitted]);

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

        const draftKey = `order-review-draft-${orderId}`;
        const existingDraft = sessionStorage.getItem(draftKey);

        if (!existingDraft) {
            setProviderRating(0);
            setProviderHover(0);
            setProviderComment('');
            
            const initialItemState: Record<string, ItemReviewState> = {};
            orderedItems.forEach(item => {
                initialItemState[item.itemRefId] = { rating: 0, hover: 0, comment: '' };
            });
            setItemReviews(initialItemState);
        }

        setSubmitted(false);
        setError('');

        const customerId = getCustomerId();
        if (!customerId) {
            setChecking(false);
            return;
        }

        const checkStatus = async () => {
            setChecking(true);
            const reviewed = new Set<string>();
            try {
                const checkPromises = orderedItems.map(async (item) => {
                    const isReviewed = await checkAlreadyReviewed(customerId, targetId, item.itemRefId);
                    if (isReviewed) reviewed.add(item.itemRefId);
                });
                await Promise.all(checkPromises);
                setReviewedItemIds(reviewed);
            } catch (err) {
                console.error("Failed to check review status", err);
            } finally {
                setChecking(false);
            }
        };

        checkStatus();
    }, [isOpen, orderId, targetId]);

    const allItemsAlreadyReviewed = orderedItems.length > 0 && 
        reviewedItemIds.size === orderedItems.length;

    const anyNewRatingEntered = orderedItems.length > 0 
        ? orderedItems.some(item => !reviewedItemIds.has(item.itemRefId) && itemReviews[item.itemRefId]?.rating > 0)
        : providerRating > 0;

    const starLabels = ['Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'];

    const updateItemReview = (itemId: string, field: keyof ItemReviewState, value: any) => {
        setItemReviews(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
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
                const reviewState = itemReviews[item.itemRefId];
                if (reviewState && reviewState.rating > 0) {
                    atLeastOne = true;
                    // For item review, targetId is the restaurant/provider,
                    // and menuItemId is the specific item.
                    const payload: ReviewRequest = {
                        customerId,
                        targetId, // Restaurant ID
                        targetType, // Restaurant, HomeFood, Chef
                        rating: reviewState.rating,
                        comment: reviewState.comment.trim(),
                        orderId: orderId,
                        menuItemId: item.itemRefId,
                        menuItemName: item.itemName
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
            if (!loading && submitted) {
                sessionStorage.removeItem(`order-review-draft-${orderId}`);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] flex flex-col"
            >

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
                            <span className="font-bold text-white">${orderTotal.toFixed(2)}</span>
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
                                    const state = itemReviews[item.itemRefId] || { rating: 0, hover: 0, comment: '' };
                                    const activeItemRating = state.hover || state.rating;
                                    const isAlreadyReviewed = reviewedItemIds.has(item.itemRefId);

                                    return (
                                        <div key={item.itemRefId} className={cn(
                                            "border p-4 rounded-xl space-y-3 transition-opacity",
                                            isAlreadyReviewed ? "bg-slate-50 opacity-60 border-slate-200" : "bg-slate-50 border-slate-100"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                                    <Utensils className="w-4 h-4 text-orange-500" />
                                                    <span>{item.itemName}</span>
                                                </div>
                                                {isAlreadyReviewed && (
                                                    <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Already Reviewed
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stars for Item */}
                                            <div className={cn("flex items-center gap-3", isAlreadyReviewed && "pointer-events-none")}>
                                                <div className="flex gap-1.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            disabled={isAlreadyReviewed}
                                                            onMouseEnter={() => !isAlreadyReviewed && updateItemReview(item.itemRefId, 'hover', star)}
                                                            onMouseLeave={() => !isAlreadyReviewed && updateItemReview(item.itemRefId, 'hover', 0)}
                                                            onClick={() => !isAlreadyReviewed && updateItemReview(item.itemRefId, 'rating', star)}
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
                                            {!isAlreadyReviewed && state.rating > 0 && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <Textarea
                                                        placeholder={`Any comments specifically for ${item.itemName}? (optional)`}
                                                        value={state.comment}
                                                        onChange={(e) => updateItemReview(item.itemRefId, 'comment', e.target.value)}
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
                            disabled={loading || allItemsAlreadyReviewed || !anyNewRatingEntered}
                            className={cn(
                                "rounded-full px-7 min-w-[140px] shadow-lg transition-all",
                                allItemsAlreadyReviewed 
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting…
                                </>
                            ) : allItemsAlreadyReviewed ? (
                                'Already Reviewed ✅'
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
