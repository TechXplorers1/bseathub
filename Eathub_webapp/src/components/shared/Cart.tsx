'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { getDisplayImage } from '@/lib/image-utils';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, MapPin, Home, Navigation, Map, Building2, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUserProfile } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Cart() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        cartTotal,
        clearCart,
        itemCount,
        checkout,
        isCheckingOut
    } = useCart();

    const [step, setStep] = useState<'cart' | 'address'>('cart');
    const [addressType, setAddressType] = useState<'profile' | 'new'>('profile');
    const [profileAddress, setProfileAddress] = useState<string>('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [newAddress, setNewAddress] = useState({
        houseNumber: '',
        street: '',
        area: '',
        city: '',
        state: '',
        country: ''
    });

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const goToAddressStep = async () => {
        setLoadingProfile(true);
        try {
            const user = await fetchUserProfile();

            // Build address string filtering out empty/null parts
            const parts = [
                user.houseNumber,
                user.street,
                user.area,
                user.city,
                user.state,
                user.country
            ].filter(p => p && p !== 'null' && p !== 'undefined' && p.trim() !== '');

            const addr = parts.join(', ');
            setProfileAddress(addr);

            // If profile address is very short or looks invalid, default to 'new' mode
            if (parts.length < 3) {
                setAddressType('new');
            } else {
                setAddressType('profile');
            }

            setStep('address');
        } catch (error) {
            console.error("Failed to load profile for address:", error);
            setAddressType('new');
            setStep('address');
        } finally {
            setLoadingProfile(false);
        }
    };

    const isAddressValid = () => {
        if (addressType === 'profile') {
            // trust default more to avoid blocking checkout for users who have it
            return profileAddress && profileAddress.trim() !== '';
        } else {
            // keep new address strict
            return newAddress.houseNumber.trim() !== '' &&
                newAddress.street.trim() !== '' &&
                newAddress.city.trim() !== '' &&
                newAddress.state.trim() !== '';
        }
    };

    const handleCheckout = () => {
        if (addressType === 'profile') {
            if (!isAddressValid()) {
                alert("Please select a valid profile address or enter a new one.");
                return;
            }
            checkout();
        } else {
            if (!isAddressValid()) {
                alert("Please fill in all the address fields (House No, Street, City, State) to continue.");
                return;
            }
            const addrString = `${newAddress.houseNumber}, ${newAddress.street}, ${newAddress.area}, ${newAddress.city}, ${newAddress.state}, ${newAddress.country}`;
            checkout(addrString);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex h-full flex-col">
                <SheetHeader className="px-6">
                    <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col items-center justify-center space-y-4 px-6">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground text-center">
                        Add items from a restaurant to get started.
                    </p>
                    <SheetClose asChild>
                        <Button className="rounded-full">Start Shopping</Button>
                    </SheetClose>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="px-6 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    {step === 'address' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('cart')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <SheetTitle>{step === 'cart' ? `Your Cart (${itemCount})` : 'Delivery Address'}</SheetTitle>
                </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
                <div className="mt-4 px-6">
                    {step === 'cart' ? (
                        <div className="divide-y divide-border">
                            {cartItems.map((item) => {
                                const imageUrl = getDisplayImage(item.imageId, 'food-1');
                                return (
                                    <div key={item.id} className="flex py-6 border-b last:border-0 hover:bg-muted/30 transition-colors p-2 rounded-xl group">
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm group-hover:shadow-md transition-shadow">
                                            <Image
                                                src={imageUrl}
                                                alt={item.name}
                                                fill
                                                className="rounded-md object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 ml-4 space-y-2">
                                            <div>
                                                <p className="font-medium leading-tight">{item.name}</p>
                                                <p className="text-sm text-muted-foreground font-bold text-orange-600">
                                                    ₹{item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6 py-2">
                            <RadioGroup
                                defaultValue="profile"
                                value={addressType}
                                onValueChange={(val) => setAddressType(val as 'profile' | 'new')}
                                className="space-y-4"
                            >
                                <div className={cn(
                                    "flex items-start space-x-3 space-y-0 rounded-xl border p-4 transition-all hover:bg-muted/50",
                                    addressType === 'profile' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                )}>
                                    <RadioGroupItem value="profile" id="profile" className="mt-1" />
                                    <Label htmlFor="profile" className="flex-1 font-normal cursor-pointer">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                Default Address
                                            </span>
                                            <span className="text-sm text-muted-foreground leading-relaxed">
                                                {profileAddress || 'Loading your address...'}
                                            </span>
                                        </div>
                                    </Label>
                                    {addressType === 'profile' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                </div>

                                <div className={cn(
                                    "flex items-start space-x-3 space-y-0 rounded-xl border p-4 transition-all hover:bg-muted/50",
                                    addressType === 'new' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                )}>
                                    <RadioGroupItem value="new" id="new" className="mt-1" />
                                    <Label htmlFor="new" className="flex-1 font-normal cursor-pointer">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold flex items-center gap-2">
                                                <Home className="h-4 w-4 text-primary" />
                                                New Delivery Address
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Enter a different location for this order.
                                            </span>
                                        </div>
                                    </Label>
                                    {addressType === 'new' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                </div>
                            </RadioGroup>

                            {step === 'address' && !isAddressValid() && addressType === 'profile' && profileAddress && (
                                <p className="text-[10px] text-red-500 font-bold px-2 animate-pulse">
                                    ⚠️ Your profile address is incomplete. Please edit your profile or use a new address.
                                </p>
                            )}

                            {step === 'address' && !isAddressValid() && addressType === 'new' && (
                                <p className="text-[10px] text-orange-600 font-black px-2 uppercase tracking-tighter">
                                    Please fill in the required fields below to proceed.
                                </p>
                            )}

                            {addressType === 'new' && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Flat / House No.</Label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input name="houseNumber" value={newAddress.houseNumber} onChange={handleAddressChange} className="pl-9 h-9 text-sm" placeholder="Apt 4B" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Street / Locality</Label>
                                            <div className="relative">
                                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input name="street" value={newAddress.street} onChange={handleAddressChange} className="pl-9 h-9 text-sm" placeholder="Main St" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Landmark / Area</Label>
                                        <div className="relative">
                                            <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input name="area" value={newAddress.area} onChange={handleAddressChange} className="pl-9 h-9 text-sm" placeholder="Near Park" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">City</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input name="city" value={newAddress.city} onChange={handleAddressChange} className="pl-9 h-9 text-sm" placeholder="Mumbai" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">State</Label>
                                            <Input name="state" value={newAddress.state} onChange={handleAddressChange} className="h-9 text-sm" placeholder="MH" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <SheetFooter className="mt-auto flex-col sm:flex-col space-y-6 sm:space-x-0 p-6 bg-background border-t">
                {/* Summary Lines */}
                <div className="space-y-2.5">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Taxes (5%)</span>
                        <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Platform Fee (4%)</span>
                        <span>₹{(cartTotal * 0.04).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>₹25.00</span>
                    </div>
                    
                    <div className="flex justify-between font-black text-xl pt-4 border-t-2 border-dashed border-gray-200 mt-2">
                        <span>Total Amount</span>
                        <span className="text-orange-600">₹{(cartTotal * 1.09 + 25).toFixed(2)}</span>
                    </div>
                </div>

                {/* Horizontal Action Buttons Wrapper */}
                <div className="flex flex-row items-center gap-3 w-full">
                    {step === 'cart' && (
                        <Button 
                            variant="outline" 
                            className="w-1/3 rounded-full text-red-600 hover:bg-red-50 hover:border-red-100 hover:text-red-700 h-12 font-bold shadow-sm transition-all" 
                            onClick={clearCart}
                        >
                            Clear
                        </Button>
                    )}
                    
                    {step === 'cart' ? (
                        <Button
                            size="lg"
                            className="flex-1 rounded-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all"
                            onClick={goToAddressStep}
                            disabled={loadingProfile}
                        >
                            {loadingProfile ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Proceed to Checkout'
                            )}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full rounded-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all"
                            onClick={handleCheckout}
                            disabled={isCheckingOut || (step === 'address' && !isAddressValid())}
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                `Confirm & Pay ₹${(cartTotal * 1.09 + 25).toFixed(2)}`
                            )}
                        </Button>
                    )}
                </div>
            </SheetFooter>
        </div>
    );
}
