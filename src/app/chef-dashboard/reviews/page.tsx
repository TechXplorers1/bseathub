
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { chefReviews } from '@/lib/chef-dashboard-data';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function ReviewStars({ rating, className }: { rating: number; className?: string }) {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  }

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customer Reviews</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Feedback</CardTitle>
          <CardDescription>
            Here's what your clients are saying about your services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {chefReviews.map((review, index) => (
            <div key={review.id}>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.customer.avatarUrl} alt={review.customer.name} />
                  <AvatarFallback>
                    {review.customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                    <ReviewStars rating={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                     "{review.comment}"
                  </p>
                </div>
              </div>
              <div className="pl-16 mt-4">
                <Button variant="outline" size="sm">Respond</Button>
              </div>
              {index < chefReviews.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
