'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { createChefBooking } from '@/services/api';
import { Switch } from '@/components/ui/switch';
import { useHeader } from '@/context/HeaderProvider';
import type { MenuCategory } from '@/lib/types';

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  countryCode: z.string().default('+91'),
  eventDate: z.date({ required_error: 'An event date is required.' }),
  eventType: z.string({ required_error: 'Please select an event type.' }),
  guests: z.coerce.number().min(1, { message: 'Must have at least 1 guest.' }),
  message: z.string().optional(),
  foodPreference: z.string({ required_error: 'Please select a food preference.' }),
  isNegotiable: z.boolean().default(true),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingForm({ chefName, chefId, basePrice = 500, services }: { chefName: string, chefId: string, basePrice?: number, services?: MenuCategory[] }) {
  const { toast } = useToast();
  const { setIsAuthSuggestionOpen } = useHeader();
  const [loading, setLoading] = React.useState(false);
  
  const countryCodes = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  ];

  const getCustomerInfo = () => {
    if (typeof window === 'undefined') return { id: '', name: '', email: '' };
    return {
      id: localStorage.getItem('userId') || localStorage.getItem('customerId') || '',
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
    };
  };

  const customerInfo = getCustomerInfo();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: '',
      countryCode: '+91',
      guests: 1,
      message: '',
      eventType: '',
      foodPreference: 'Both',
      isNegotiable: true,
    },
  });

  const guests = form.watch('guests');
  const totalPrice = guests * (basePrice || 500);

  const onSubmit = async (data: BookingFormValues) => {
    if (!customerInfo.id) {
      setIsAuthSuggestionOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        customerId: customerInfo.id,
        chefId: chefId,
        eventDate: data.eventDate.toISOString(),
        guests: data.guests,
        totalAmount: data.isNegotiable ? 0 : totalPrice,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        eventAddress: 'To be confirmed',
        notes: data.message || '',
        eventType: data.eventType,
        customerPhone: `${data.countryCode} ${data.phone}`,
        foodPreference: data.foodPreference,
        isNegotiable: data.isNegotiable,
      };

      await createChefBooking(payload);

      toast({
        title: 'Booking Request Sent!',
        description: `Your request to book Chef ${chefName} has been recorded.`,
      });
      form.reset();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-white/20 shadow-2xl bg-white/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden overflow-y-auto no-scrollbar max-h-[85vh]">
      <CardHeader className="pt-10 px-8 pb-4">
        <div className="h-1 w-12 bg-primary/20 rounded-full mb-6 mx-auto md:mx-0" />
        <CardTitle className="text-3xl font-black tracking-tight uppercase leading-tight">
          Book <span className="text-primary">{chefName}</span>
        </CardTitle>
        <CardDescription className="font-medium text-base text-muted-foreground/80 mt-2">
          Reserve your date and customize your culinary experience.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-8 pb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-base px-5" />
                      </FormControl>
                      <FormMessage className="text-xs font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-base px-5" />
                      </FormControl>
                      <FormMessage className="text-xs font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                   <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Country Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm font-semibold hover:border-primary/50 px-5">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 opacity-40" />
                                <SelectValue placeholder="Code" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl shadow-2xl p-1">
                            {countryCodes.map(c => (
                              <SelectItem key={c.code} value={c.code} className="rounded-xl py-3 px-4 font-semibold">
                                <div className="flex items-center gap-3">
                                  <span>{c.flag}</span>
                                  <span>{c.code}</span>
                                  <span className="text-[10px] opacity-40 font-bold">({c.name})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Number" {...field} className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-base px-5" />
                        </FormControl>
                        <FormMessage className="text-xs font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-5 text-left font-semibold transition-all h-14 rounded-2xl border-muted/50 bg-white shadow-sm hover:border-primary/50',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span className="opacity-50">Select Date</span>
                              )}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-40" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Number of Guests</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-base px-5" />
                      </FormControl>
                      <FormMessage className="text-xs font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="foodPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Food Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm font-semibold hover:border-primary/50 px-5">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl shadow-2xl">
                        <SelectItem value="Veg" className="rounded-xl py-2 px-4">Vegetarian Only</SelectItem>
                        <SelectItem value="Non-Veg" className="rounded-xl py-2 px-4">Non-Vegetarian</SelectItem>
                        <SelectItem value="Both" className="rounded-xl py-2 px-4">Both (Veg & Non-Veg)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Specific Occasion</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-white shadow-sm font-semibold hover:border-primary/50 px-5">
                          <SelectValue placeholder="What's the occasion?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl shadow-2xl">
                        <SelectItem value="Private Dinner">Private Dinner</SelectItem>
                        <SelectItem value="Event Catering">Large Event Catering</SelectItem>
                        <SelectItem value="Home Cooking Class">Cooking Class</SelectItem>
                        <SelectItem value="Celebration">Birthday / Celebration</SelectItem>
                        <SelectItem value="Other">Other Occasion</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isNegotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-dashed border-muted/50 p-4 shadow-sm bg-white/30 backdrop-blur-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/80">Negotiation</FormLabel>
                      <FormDescription className="text-[10px] font-medium leading-tight text-muted-foreground/70">
                        Allow price discussion during enquiry
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Special Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dietary requests, kitchen equipment details, or venue preferences..."
                        className="resize-none rounded-2xl border-muted/50 bg-white shadow-sm min-h-[120px] p-5 text-base focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-bold" />
                  </FormItem>
                )}
              />
            </div>

            <div className="relative group p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 overflow-hidden">
               <div className="relative flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">Estimated Total</p>
                  <p className="text-xs text-muted-foreground font-medium italic">Final price may vary based on exact requirements</p>
                </div>
                <div className="text-right">
                  {form.watch('isNegotiable') ? (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-primary tracking-tighter uppercase italic">Negotiable</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60">Base: ${totalPrice.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-black text-primary tracking-tighter">${totalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-2xl h-16 text-lg font-black uppercase tracking-[0.1em] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all">
              {loading ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   <span>Processing...</span>
                </div>
              ) : 'Confirm Booking Request'}
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground italic px-6">
              By submitting, you agree to our terms of service and chef cancellation policies.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
