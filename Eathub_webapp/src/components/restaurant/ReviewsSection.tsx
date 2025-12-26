'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AddReviewDialog } from './AddReviewDialog';

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

type Review = { author: string, text: string, rating: number, avatar: string };

function ReviewCard({ review }: { review: Review }) {
    return (
        <Card className="w-[300px] flex-shrink-0">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={review.avatar} alt={review.author} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{review.author}</p>
                        <ReviewStars rating={review.rating} />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{review.text}</p>
            </CardContent>
        </Card>
    )
}

const initialReviews: Review[] = [
    { author: "Jane D.", text: "Absolutely delicious! The carbonara was to die for. Will be ordering again soon.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { author: "John S.", text: "Good food, but the delivery was a bit slow. The pizza was still warm though.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e" },
    { author: "Mike L.", text: "The Calamari Fritti was a bit soggy, but the main course was great. Overall a good experience.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f" },
    { author: "Sarah B.", text: "Wow! The sushi was incredibly fresh and beautifully presented. Best I've had in a long time.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
    { author: "Tom H.", text: "Burger was juicy and cooked perfectly. Fries were a little cold on arrival, but still good.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706e" },
    { author: "Emily R.", text: "The vegan options are amazing! So much flavor and creativity. Highly recommend the power bowl.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707f" },
];

export function ReviewsSection() {
    const [reviews, setReviews] = React.useState<Review[]>(initialReviews);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

    const handleAddReview = (newReview: Review) => {
        setReviews([newReview, ...reviews]);
    };

    return (
        <div id="Reviews">
            <div className="flex justify-between items-center mt-6 mb-4">
                <h2 className="text-2xl font-semibold">Reviews</h2>
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(true)}>Add Review</Button>
            </div>
            <ScrollArea>
                <div className="flex space-x-4 pb-4">
                    {reviews.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <AddReviewDialog 
                open={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
                onSubmit={handleAddReview}
            />
        </div>
    );
}
