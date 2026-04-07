'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AddReviewDialog } from './AddReviewDialog';

import { fetchReviewsForProvider } from '@/services/api';
import { Loader2 } from 'lucide-react';

function ReviewStars({ rating, className }: { rating: number, className?: string }) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "h-4 w-4",
                        i < Math.floor(rating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 fill-gray-300"
                    )}
                />
            ))}
        </div>
    );
}

type Review = { customerName?: string, comment: string, rating: number, customerAvatar?: string, date?: string };

function ReviewCard({ review }: { review: Review }) {
    const author = review.customerName || "Anonymous User";
    const avatar = review.customerAvatar || `https://i.pravatar.cc/150?u=${author}`;

    return (
        <Card className="w-[300px] flex-shrink-0 border-none shadow-sm bg-muted/30">
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={avatar} alt={author} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{author}</p>
                        <ReviewStars rating={review.rating} />
                    </div>
                    {review.date && (
                        <span className="text-[10px] text-muted-foreground font-medium">{new Date(review.date).toLocaleDateString()}</span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-4 line-clamp-4 leading-relaxed font-medium italic">
                    "{review.comment}"
                </p>
            </CardContent>
        </Card>
    )
}

export function ReviewsSection({ targetId, type }: { targetId: string, type: 'Restaurant' | 'HomeFood' | 'Chef' }) {
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

    const averageRating = React.useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    React.useEffect(() => {
        if (!targetId) return;
        setLoading(true);
        fetchReviewsForProvider(targetId, type)
            .then(data => {
                setReviews(data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [targetId, type]);

    const handleAddReview = (newReview: any) => {
        // Refresh 
        fetchReviewsForProvider(targetId, type).then(setReviews);
    };

    return (
        <div id="Reviews" className="mt-8">
            {loading && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Syncing recent feedback...</p>
                </div>
            )}

            <div className={cn("transition-all duration-300", loading ? "opacity-20 blur-sm pointer-events-none" : "opacity-100")}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black uppercase tracking-tight">Customer Feed</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs font-black text-yellow-700">{averageRating}</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">Based on {reviews.length} actual reviews</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsReviewDialogOpen(true)}
                        className="rounded-full font-black uppercase tracking-widest text-xs px-6 h-10 shadow-lg shadow-primary/10"
                    >
                        Write a Review
                    </Button>
                </div>

                {reviews.length === 0 && !loading ? (
                    <div className="bg-muted/20 border border-dashed rounded-[2rem] p-10 text-center">
                        <p className="text-sm font-bold text-muted-foreground italic mb-2">No reviews yet.</p>
                        <p className="text-xs text-muted-foreground/60">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <ScrollArea className="w-full">
                        <div className="flex space-x-5 pb-6">
                            {reviews.map((review, index) => (
                                <ReviewCard key={index} review={review} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="h-1.5" />
                    </ScrollArea>
                )}
            </div>

            <AddReviewDialog
                open={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
                targetId={targetId}
                targetType={type}
                onSubmit={handleAddReview}
            />
        </div>
    );
}
