'use client';

import { useEffect, useState } from 'react';
import { getReviewsForProvider } from '@/services/api';
import type { ReviewResponse } from '@/lib/types';
import { Loader2, MessageSquare, Star, Reply } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { replyToReview } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

function ReviewStars({ rating, className }: { rating: number; className?: string }) {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.floor(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-200"
            )}
          />
        ))}
      </div>
    );
  }

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    getReviewsForProvider(restaurantId, 'Restaurant')
      .then(data => setReviews(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
        const updatedReview = await replyToReview(reviewId, replyText);
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
        setReplyingTo(null);
        setReplyText('');
        toast({
            title: 'Reply Sent',
            description: 'Your response has been shared with the customer.'
        });
    } catch (err) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send reply.'
        });
    } finally {
        setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Customer Voice
        </h1>
        <p className="text-muted-foreground font-medium">Real reviews from people who enjoyed your food.</p>
      </div>

      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 px-8 py-6">
          <CardTitle className="text-2xl font-bold">Latest Feedback</CardTitle>
          <CardDescription className="font-medium text-muted-foreground/80">
            {loading ? "Listening to customers..." : `You have received ${reviews.length} total reviews.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse text-sm">Gathering reviews...</p>
             </div>
          ) : reviews.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center gap-4">
                 <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-2">
                     <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                 </div>
                 <p className="text-muted-foreground font-black text-xl">No feedback yet</p>
                 <p className="text-muted-foreground/70 text-sm font-medium max-w-xs mx-auto">When customers rate your dishes, their reviews will appear here for you to analyze.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {reviews.map((review, index) => (
                <div key={review.id} className="p-8 hover:bg-muted/30 transition-colors group">
                  <div className="flex gap-6 items-start">
                    <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customerName}`} alt={review.customerName} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {review.customerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-black text-lg leading-none mb-1">{review.customerName}</p>
                          <div className="flex items-center gap-2">
                            <ReviewStars rating={review.rating} />
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none bg-muted px-1.5 py-0.5 rounded">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 relative">
                        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                        <p className="text-sm text-foreground/90 font-medium italic leading-relaxed pl-4">
                          "{review.comment}"
                        </p>
                      </div>
                      {review.reply ? (
                        <div className="mt-6 ml-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 relative">
                             <div className="absolute -left-[17px] top-4 w-4 h-px bg-primary/20" />
                             <p className="text-[10px] font-black uppercase text-primary mb-1 flex items-center gap-2">
                                <Reply className="h-3 w-3" /> Your Response
                             </p>
                             <p className="text-sm font-bold text-foreground/80 italic">
                                {review.reply}
                             </p>
                        </div>
                      ) : replyingTo === review.id ? (
                        <div className="mt-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                             <Input 
                                placeholder="Write your heartwarming response..." 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="rounded-xl border-primary/20 focus-visible:ring-primary h-10 text-sm font-medium"
                             />
                             <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                <Button size="sm" className="rounded-full text-xs font-bold px-6" disabled={submittingReply} onClick={() => handleReply(review.id)}>
                                    {submittingReply ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                    Send Reply
                                </Button>
                             </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter rounded-full border-primary/20 text-primary">
                                Verified Order
                             </Badge>
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] font-black uppercase tracking-tight gap-1 hover:text-primary p-0"
                                onClick={() => setReplyingTo(review.id)}
                            >
                                <Reply className="h-3 w-3" /> Say Thanks
                             </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
