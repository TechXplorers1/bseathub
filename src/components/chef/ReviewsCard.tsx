'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Star, User } from 'lucide-react';
import { chefReviews } from '@/lib/chef-dashboard-data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ReviewsCardProps {
    rating: number;
    reviewCount: number;
}

export function ReviewsCard({ rating, reviewCount }: ReviewsCardProps) {
    const latestReviews = chefReviews.slice(0,2);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Ratings & Reviews</CardTitle>
            <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestReviews.map((review, index) => (
            <div key={review.id}>
                 <div className="flex items-start gap-3">
                    <Avatar>
                        <AvatarImage src={review.customer.avatarUrl} />
                        <AvatarFallback>{review.customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{review.customer.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">"{review.comment}"</p>
                    </div>
                 </div>
                 {index < latestReviews.length - 1 && <Separator className="mt-4" />}
            </div>
        ))}
         <Button variant="link" className="p-0 h-auto">View all {reviewCount} reviews</Button>
      </CardContent>
    </Card>
  );
}
