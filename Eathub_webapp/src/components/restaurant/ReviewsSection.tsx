'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AddReviewDialog } from './AddReviewDialog';
import { fetchReviewsForProvider } from '@/services/api';
import { Loader2, MessageSquare, ChevronRight, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function ReviewStars({ rating, className }: { rating: number, className?: string }) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "h-3 w-3",
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

function ReviewCard({ review, highlighted = false }: { review: Review, highlighted?: boolean }) {
    const author = review.customerName || "Anonymous User";
    const avatar = review.customerAvatar || `https://i.pravatar.cc/150?u=${author}`;

    return (
        <Card className={cn(
            "w-[280px] flex-shrink-0 border transition-all duration-300",
            highlighted 
                ? "border-primary/30 shadow-lg shadow-primary/5 bg-white scale-105" 
                : "border-muted/50 shadow-sm bg-white/50 backdrop-blur-sm"
        )}>
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
                </div>
                <p className="text-xs text-muted-foreground/80 mt-4 line-clamp-3 leading-relaxed font-medium italic">
                    "{review.comment}"
                </p>
                {review.date && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                )}
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
        fetchReviewsForProvider(targetId, type).then(setReviews);
    };

    return (
        <div id="Reviews" className="mt-8">
            <div className={cn("transition-all duration-300", loading ? "opacity-20 blur-sm pointer-events-none" : "opacity-100")}>
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Reviews</h2>
                         </div>
                         <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-black text-yellow-700">{averageRating}</span>
                        </div>
                    </div>
                </div>

                {reviews.length === 0 && !loading ? (
                    <div className="bg-white/40 border-2 border-dashed rounded-[2rem] p-10 text-center flex flex-col items-center gap-3">
                        <p className="text-sm font-bold text-muted-foreground italic">No reviews found.</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsReviewDialogOpen(true)}
                            className="rounded-full font-bold uppercase tracking-widest text-[10px]"
                        >
                            Submit First Review
                        </Button>
                    </div>
                ) : (
                    <div className="relative group">
                        <ScrollArea className="w-full">
                            <div className="flex space-x-6 pb-6 pt-2 px-2">
                                {reviews.slice(0, 5).map((review, index) => (
                                    <ReviewCard key={index} review={review} highlighted={index === 0} />
                                ))}
                                {reviews.length > 5 && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="w-[120px] flex-shrink-0 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 group/all">
                                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover/all:bg-primary/10 transition-colors">
                                                    <ChevronRight className="h-6 w-6 text-primary/60" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">See All</span>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem] border-none">
                                            <DialogHeader className="p-8 pb-4">
                                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Guest Feedback ({reviews.length})</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="flex-1 px-8 pb-8">
                                                <div className="grid grid-cols-1 gap-4 py-4">
                                                    {reviews.map((review, index) => (
                                                        <div key={index} className="p-5 rounded-2xl bg-muted/30 border border-muted/50">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={review.customerAvatar} />
                                                                    <AvatarFallback>{(review.customerName || "A").charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-bold text-xs">{review.customerName || "Anonymous"}</p>
                                                                    <ReviewStars rating={review.rating} />
                                                                </div>
                                                                <span className="ml-auto text-[10px] font-bold text-muted-foreground/60">{review.date ? new Date(review.date).toLocaleDateString() : ''}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <ScrollBar orientation="horizontal" className="h-1.5" />
                        </ScrollArea>
                        
                        <div className="flex items-center justify-between mt-2 px-1">
                            {reviews.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsReviewDialogOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 hover:text-primary hover:bg-transparent p-0 h-auto"
                                >
                                    + Add Review
                                </Button>
                            )}
                            {reviews.length > 0 && (
                                 <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-primary hover:bg-transparent p-0 h-auto"
                                        >
                                            View All Reviews
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl">
                                        <DialogHeader className="p-8 pb-4">
                                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Full Feedback History</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="flex-1 px-8 pb-8">
                                            <div className="grid grid-cols-1 gap-4 py-4">
                                                {reviews.map((review, index) => (
                                                    <div key={index} className="p-6 rounded-[1.5rem] bg-muted/20 border border-muted/50 transition-all hover:border-primary/20">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                <AvatarImage src={review.customerAvatar} />
                                                                <AvatarFallback>{(review.customerName || "A").charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-black text-sm">{review.customerName || "Anonymous User"}</p>
                                                                <ReviewStars rating={review.rating} />
                                                            </div>
                                                            <span className="ml-auto text-[10px] font-black text-muted-foreground/40 italic uppercase tracking-tighter">
                                                                {review.date ? new Date(review.date).toLocaleDateString() : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed italic font-medium -mt-1">
                                                            "{review.comment}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
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
