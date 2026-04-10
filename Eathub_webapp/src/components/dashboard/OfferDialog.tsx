'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Tag, Percent, Package, Truck, Wallet, Home,
    Clock, Gift, Crown, Calendar, Zap, Sparkles, Plus, X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const offerSchema = z.object({
    isOnOffer: z.boolean().default(false),
    offerType: z.string().default('Percentage Discount'),
    offerValue: z.coerce.number().min(0).optional(),
    offerDescription: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    comboItems: z.array(z.string()).default([]),
    minOrderValue: z.coerce.number().optional(),
    buyX: z.coerce.number().optional(),
    getY: z.coerce.number().optional(),
    planType: z.enum(['Weekly', 'Monthly']).optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface MenuItemShort {
    id: string;
    name: string;
}

interface OfferDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: OfferFormValues) => void;
    itemName: string;
    allMenuItems: MenuItemShort[];
    initialData?: Partial<OfferFormValues>;
}

const OFFER_TYPES = [
    { label: "Percentage Discount", icon: Percent, color: "text-orange-500", desc: "Classic percentage off" },
    { label: "Combo Deals", icon: Package, color: "text-orange-600", desc: "Pair with other dishes" },
    { label: "Free Delivery", icon: Truck, color: "text-blue-500", desc: "No shipping charges" },
    { label: "Cashback", icon: Wallet, color: "text-green-600", desc: "Money back to wallet" },
    { label: "Home Specials", icon: Home, color: "text-amber-600", desc: "Chef's signature deal" },
    { label: "Happy Hours", icon: Clock, color: "text-orange-500", desc: "Time-bound discounts" },
    { label: "BOGO Offers", icon: Gift, color: "text-pink-500", desc: "Buy One Get One" },
    { label: "Pro Offers", icon: Crown, color: "text-yellow-600", desc: "For elite members" },
    { label: "Meal Plans", icon: Calendar, color: "text-orange-400", desc: "Subscription deals" },
    { label: "Flash Deals", icon: Zap, color: "text-yellow-500", desc: "Quick expiry deals" },
];

export function OfferDialog({ isOpen, onClose, onSave, itemName, allMenuItems, initialData }: OfferDialogProps) {
    const form = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            isOnOffer: initialData?.isOnOffer ?? false,
            offerType: initialData?.offerType ?? 'Percentage Discount',
            offerValue: initialData?.offerValue ?? 0,
            offerDescription: initialData?.offerDescription ?? '',
            startDate: initialData?.startDate ?? '',
            endDate: initialData?.endDate ?? '',
            startTime: initialData?.startTime ?? '',
            endTime: initialData?.endTime ?? '',
            comboItems: initialData?.comboItems ?? [],
            minOrderValue: initialData?.minOrderValue ?? 0,
            buyX: initialData?.buyX ?? 1,
            getY: initialData?.getY ?? 1,
            planType: (initialData?.planType as any) ?? 'Weekly',
        },
    });

    const selectedType = form.watch('offerType');

    React.useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
                ...form.getValues(),
                ...initialData
            });
        }
    }, [isOpen, initialData, form]);

    const handleSubmit = (data: OfferFormValues) => {
        onSave(data);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white text-center shrink-0">
                    <div className="inline-flex p-3 bg-white/20 rounded-full mb-3">
                        <Tag size={32} />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white mb-1">
                        Offer Customization
                    </DialogTitle>
                    <DialogDescription className="text-orange-100 font-medium opacity-90 text-sm">
                        Tailoring deals for "{itemName}"
                    </DialogDescription>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6 bg-white">
                            <FormField
                                control={form.control}
                                name="isOnOffer"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border-2 border-orange-50 bg-orange-50/20 p-4 transition-all">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base font-bold text-orange-900">Enable Offer</FormLabel>
                                            <p className="text-xs text-orange-700/70 font-medium tracking-tight">Activate this deal for your customers</p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-orange-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {form.watch('isOnOffer') && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <FormField
                                        control={form.control}
                                        name="offerType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase text-muted-foreground ml-1">Offer Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 border-orange-100 focus:ring-orange-500/20 shadow-sm rounded-xl">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-60 rounded-xl">
                                                        {OFFER_TYPES.map((type) => (
                                                            <SelectItem key={type.label} value={type.label} className="py-2.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-orange-50 rounded-lg">
                                                                        <type.icon size={18} className={type.color} />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-sm text-slate-800">{type.label}</span>
                                                                        <span className="text-[10px] text-muted-foreground">{type.desc}</span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    {/* DYNAMIC FIELDS BASED ON TYPE */}
                                    <div className="p-4 border border-orange-100 rounded-2xl bg-orange-50/10 space-y-4">
                                        {selectedType === "Percentage Discount" && (
                                            <FormField
                                                control={form.control}
                                                name="offerValue"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in slide-in-from-right-2 duration-300">
                                                        <FormLabel className="text-[11px] font-bold text-orange-800 flex items-center gap-1"><Percent size={14}/> Discount Percentage</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input type="number" placeholder="e.g. 15" className="h-11 border-orange-100 pr-8 font-black" {...field} />
                                                                <span className="absolute right-3 top-2.5 font-bold text-muted-foreground">%</span>
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedType === "Combo Deals" && (
                                            <FormField
                                                control={form.control}
                                                name="comboItems"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in slide-in-from-right-2 duration-300">
                                                        <FormLabel className="text-[11px] font-bold text-orange-800 flex items-center gap-1"><Package size={14}/> Select Items for Combo</FormLabel>
                                                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-white scrollbar-hide">
                                                            {allMenuItems.filter(i => i.name !== itemName).map(item => (
                                                                <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                                    <Checkbox 
                                                                        id={item.id} 
                                                                        checked={Array.isArray(field.value) && field.value.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentValues = Array.isArray(field.value) ? field.value : [];
                                                                            const updated = checked 
                                                                                ? [...currentValues, item.id]
                                                                                : currentValues.filter(val => val !== item.id);
                                                                            field.onChange(updated);
                                                                        }}
                                                                    />
                                                                    <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                                                                        {item.name}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <FormDescription className="text-[10px]">Select items that will be part of this combo</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedType === "BOGO Offers" && (
                                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-2 duration-300">
                                                <FormField
                                                    control={form.control}
                                                    name="buyX"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] font-bold text-orange-800 uppercase italic">Buy (Quantity)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" className="h-11 border-orange-100" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="getY"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] font-bold text-orange-800 uppercase italic">Get (Free)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" className="h-11 border-orange-100" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {selectedType === "Free Delivery" && (
                                            <FormField
                                                control={form.control}
                                                name="minOrderValue"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in slide-in-from-right-2 duration-300">
                                                        <FormLabel className="text-[11px] font-bold text-orange-800 flex items-center gap-1"><Truck size={14}/> Min. Order for Free Delivery</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">$</span>
                                                                <Input type="number" placeholder="0.00" className="h-11 border-orange-100 pl-7 font-black" {...field} />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedType === "Meal Plans" && (
                                            <FormField
                                                control={form.control}
                                                name="planType"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in slide-in-from-right-2 duration-300">
                                                        <FormLabel className="text-[11px] font-bold text-orange-800 flex items-center gap-1"><Calendar size={14}/> Subscription Plan</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 border-orange-100">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Weekly">Weekly Plan (7 Days)</SelectItem>
                                                                <SelectItem value="Monthly">Monthly Plan (30 Days)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {(selectedType === "Cashback" || selectedType === "Flash Deals" || selectedType === "Pro Offers") && (
                                            <FormField
                                                control={form.control}
                                                name="offerValue"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in slide-in-from-right-2 duration-300">
                                                        <FormLabel className="text-[11px] font-bold text-orange-800">
                                                            {selectedType === "Cashback" ? "Cashback Amount ($)" : "Offer Discount Value ($)"}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" className="h-11 border-orange-100" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="offerDescription"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Sparkles size={14}/> Display Message</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Buy 1 get 1 FREE this weekend!" className="h-11 border-orange-100 font-medium italic" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* VALIDITY SECTION */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-orange-50">
                                            <Clock size={16} className="text-orange-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Availability Window</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground ml-1">Starts From</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" className="h-11 border-orange-100 rounded-xl" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ends At</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" className="h-11 border-orange-100 rounded-xl" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="startTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground ml-1">Daily Start</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" className="h-11 border-orange-100 rounded-xl" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="endTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground ml-1">Daily End</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" className="h-11 border-orange-100 rounded-xl" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t sticky bottom-0 bg-white">
                                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-muted-foreground hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20 h-11">
                                    Confirm Deal
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
