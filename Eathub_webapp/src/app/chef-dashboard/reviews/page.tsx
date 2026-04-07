'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getReviewsForOwner } from '@/services/api';
import type { ReviewResponse } from '@/lib/types';
import { Star, Loader2, MessageSquare, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { replyToReview } from '@/services/api';
import { Reply } from 'lucide-react';

function ReviewStars({ rating, className }: { rating: number; className?: string }) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.floor(rating)
                ? "text-orange-500 fill-orange-500"
                : "text-slate-200"
            )}
          />
        ))}
      </div>
    );
  }

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
        const chefId = localStorage.getItem('userId');
        if (!chefId) return;
        try {
            const data = await getReviewsForOwner(chefId, 'Chef');
            setReviews(data);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load reviews' });
        } finally {
            setLoading(false);
        }
    };
    loadReviews();
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
            title: 'Message Sent',
            description: 'The customer will see your professional response!'
        });
    } catch (err) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send response.'
        });
    } finally {
        setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Reading through your feedback...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Customer Feedback</h1>
            <p className="text-muted-foreground font-medium">Hear what your clients are saying about your culinary magic</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-2xl">
            <MessageSquare className="h-6 w-6 text-orange-600" />
        </div>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <CardTitle className="text-xl font-black tracking-tight uppercase">Recent Reviews</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Total {reviews.length} Feedbacks received
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          {reviews.length > 0 ? reviews.map((review, index) => (
            <div key={review.id} className="group relative">
              <div className="flex gap-6 items-start">
                <Avatar className="h-14 w-14 ring-4 ring-slate-50 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-slate-900 text-white font-black">
                    {review.customerName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-black text-slate-800 text-lg">{review.customerName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <ReviewStars rating={review.rating} />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Verified Review</span>
                    </div>
                  </div>
                  <div className="relative pt-2">
                    <Quote className="absolute -top-1 -left-2 h-8 w-8 text-slate-100 -z-10 rotate-180" />
                    <p className="text-slate-600 leading-relaxed font-medium italic relative z-10 transition-colors group-hover:text-slate-900">
                        "{review.comment}"
                    </p>
                  </div>

                  {review.reply ? (
                    <div className="mt-6 ml-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 relative animate-in zoom-in-95 duration-500">
                         <div className="absolute -left-[17px] top-4 w-4 h-px bg-orange-200" />
                         <p className="text-[10px] font-black uppercase text-orange-600 mb-1 flex items-center gap-2">
                            <Reply className="h-3 w-3" /> Your Kitchen's Note
                         </p>
                         <p className="text-sm font-bold text-slate-700 italic">
                            {review.reply}
                         </p>
                    </div>
                  ) : replyingTo === review.id ? (
                    <div className="mt-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                         <Input 
                            placeholder="Add a note to your client..." 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="rounded-xl border-slate-200 focus-visible:ring-orange-500 h-10 text-sm font-medium"
                         />
                         <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            <Button size="sm" className="rounded-full text-xs font-bold px-6 bg-slate-900 text-white" disabled={submittingReply} onClick={() => handleReply(review.id)}>
                                {submittingReply ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                Post Note
                            </Button>
                         </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-9 px-4 hover:bg-slate-900 hover:text-white transition-all"
                        onClick={() => setReplyingTo(review.id)}
                      >
                          Respond to Feedback
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {index < reviews.length - 1 && <Separator className="mt-10 opacity-50" />}
            </div>
          )) : (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-muted-foreground font-medium">No reviews received yet. Your first one will appear here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
