'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
} from '@/components/ui/form';
import { Camera, FolderOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
import { getImageById } from '@/lib/placeholder-images';

const CATEGORIES = [
    "Main Course", "Appetizer", "Dessert", "Beverage", "Breakfast",
    "Snacks", "Soups", "Salads", "Breads", "Sides", "Fusion", "Traditional"
];

const serviceSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    basePrice: z.union([z.string(), z.number()]).transform(v => String(v)),
    category: z.string().min(1, "Category is required"),
    itemType: z.enum(['Veg', 'Non-Veg', 'Vegan', 'Other']),
    isSignature: z.boolean().default(false),
    isNegotiable: z.boolean().default(false),
    status: z.enum(['Active', 'Inactive', 'Unavailable']),
    imageId: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface AddServiceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    isLoading?: boolean;
    mode?: 'service' | 'menu' | 'signature';
}

/* ================= COMPONENT ================= */

export function AddServiceDialog({
    isOpen,
    onClose,
    onSave,
    initialData,
    isLoading = false,
    mode = 'menu',
}: AddServiceDialogProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            basePrice: '',
            category: mode === 'service' ? 'Service' : 'Main Course',
            itemType: 'Veg',
            isSignature: mode === 'signature',
            isNegotiable: mode === 'service',
            status: 'Active',
            imageId: 'food-1',
        },
    });

    React.useEffect(() => {
        if (initialData && isOpen) {
            form.reset({
                name: initialData.name,
                description: initialData.description,
                basePrice: String(initialData.basePrice || ''),
                category: initialData.category || (mode === 'service' ? 'Service' : 'Main Course'),
                itemType: (initialData.itemType as any) || 'Veg',
                isSignature: !!initialData.isSignature || (mode === 'signature'),
                isNegotiable: !!initialData.isNegotiable,
                status: initialData.status || 'Active',
                imageId: initialData.imageId || 'food-1',
            });
            const resolvedImage = initialData.imageId ? (getImageById(initialData.imageId)?.imageUrl || (initialData.imageId.startsWith('data:') ? initialData.imageId : null)) : null;
            setImagePreview(resolvedImage);
        } else if (!initialData && isOpen) {
            form.reset({
                name: '',
                description: '',
                basePrice: "",
                category: mode === 'service' ? 'Service' : 'Main Course',
                itemType: 'Veg',
                isSignature: mode === 'signature',
                isNegotiable: mode === 'service',
                status: 'Active',
                imageId: 'food-1',
            });
            setImagePreview(null);
        }
    }, [initialData, isOpen, form, mode]);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                setImagePreview(compressedBase64);
                form.setValue('imageId', compressedBase64);
            } catch (err) {
                console.error("Compression failed, fallback to original", err);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setImagePreview(base64String);
                    form.setValue('imageId', base64String);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    /* ================= SUBMIT ================= */

    const handleFormSubmit = (data: ServiceFormValues) => {
        // Sanitize price: remove currency symbols, commas, or other non-numeric chars except dot
        const numericPrice = String(data.basePrice).replace(/[^0-9.]/g, '');

        onSave({
            ...data,
            basePrice: numericPrice,
            id: initialData?.id,
        });
    };

    /* ================= UI ================= */

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit' : 'Add'} {mode === 'service' ? 'Service' : mode === 'signature' ? 'Signature Dish' : 'Menu Item'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update your culinary offering.' : `Provide details for your new ${mode}.`}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleFormSubmit)}
                        className="flex flex-col gap-0"
                    >
                        <ScrollArea className="max-h-[70vh] px-1">
                            <div className="space-y-6 py-4 px-1">
                                {/* NAME */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{mode === 'service' ? 'Service Name' : 'Item Name'}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={mode === 'service' ? "e.g. Private Fine Dining Experience" : "e.g. Butter Chicken"} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* DESCRIPTION */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe what's included in this service..."
                                                    {...field}
                                                    className="min-h-[80px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {mode !== 'service' && (
                                    <>
                                        {/* IMAGE UPLOAD */}
                                        <div className="space-y-3">
                                            <Label className="font-semibold">Item Image</Label>

                                            {imagePreview && (
                                                <div className="relative w-full h-40 rounded-xl overflow-hidden border bg-muted">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            form.setValue('imageId', 'food-1');
                                                        }}
                                                    >
                                                        <span className="text-xs">×</span>
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    className="hidden"
                                                    ref={cameraInputRef}
                                                    onChange={handleImageChange}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 gap-2 h-16 border-dashed bg-muted/20 hover:bg-muted/40 transition-colors"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <FolderOpen className="h-4 w-4 text-primary" />
                                                    <span className="text-xs">Upload</span>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 gap-2 h-16 border-dashed bg-muted/20 hover:bg-muted/40 transition-colors"
                                                    onClick={() => cameraInputRef.current?.click()}
                                                >
                                                    <Camera className="h-4 w-4 text-primary" />
                                                    <span className="text-xs">Camera</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* CATEGORY */}
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Category</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {CATEGORIES.map((cat) => (
                                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* ITEM TYPE */}
                                            <FormField
                                                control={form.control}
                                                name="itemType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Item Type</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Veg">Veg</SelectItem>
                                                                <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                                                                <SelectItem value="Vegan">Vegan</SelectItem>
                                                                <SelectItem value="Other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* SIGNATURE TOGGLE FOR MENU ITEMS */}
                                        {mode === 'menu' && (
                                            <FormField
                                                control={form.control}
                                                name="isSignature"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Mark as Signature Dish</FormLabel>
                                                            <div className="text-[0.8rem] text-muted-foreground">
                                                                Signature dishes are highlighted on your profile.
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* PRICE */}
                                    <FormField
                                        control={form.control}
                                        name="basePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="e.g. 100"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* STATUS */}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                                        <SelectItem value="Unavailable">Unavailable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                                    {/* IS SIGNATURE */}
                                    {mode !== 'service' && mode !== 'menu' && (
                                        <FormField
                                            control={form.control}
                                            name="isSignature"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between space-y-0 text-orange-600">
                                                    <div className="flex-1 mr-4">
                                                        <FormLabel className="text-base font-semibold">Signature Dish</FormLabel>
                                                        <p className="text-xs text-muted-foreground">Will be featured at the top of your profile.</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={mode === 'signature'}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {/* IS NEGOTIABLE */}
                                    <FormField
                                        control={form.control}
                                        name="isNegotiable"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <div className="flex-1 mr-4">
                                                    <FormLabel className="text-base font-semibold">Price Negotiable</FormLabel>
                                                    <p className="text-xs text-muted-foreground">Customers can discuss the pricing with you.</p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="pt-6">
                            <DialogFooter className="sm:justify-end gap-2 px-1">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
                                    {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                                    {initialData ? 'Update Service' : 'Add Service'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
