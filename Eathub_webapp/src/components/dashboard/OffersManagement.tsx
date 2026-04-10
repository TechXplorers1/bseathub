'use client';

import * as React from 'react';
import Image from 'next/image';
import { 
    Tag, 
    Percent, 
    Calendar, 
    Clock, 
    MoreHorizontal, 
    Search, 
    Loader2,
    PlusCircle,
    Package
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OfferDialog } from './OfferDialog';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/services/api';
import type { MenuItem } from '@/lib/types';

interface OffersManagementProps {
    providerId: string | null;
    type: 'restaurant' | 'home-food';
}

export function OffersManagement({ providerId, type }: OffersManagementProps) {
    const [items, setItems] = React.useState<any[]>([]);
    const [allItems, setAllItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [isOfferDialogOpen, setIsOfferDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const loadData = React.useCallback(async () => {
        if (!providerId) return;
        setIsLoading(true);
        try {
            let data: any[];
            if (type === 'restaurant') {
                data = await api.fetchItemsByRestaurant(providerId);
            } else {
                data = await api.fetchHomeFoodMenu(providerId);
            }

            const mapped = data.map((item: any) => ({
                ...item,
                imageUrl: item.imageId || item.imageUrl || "/placeholder-dish.jpg",
                isOnOffer: item.isOnOffer ?? false,
            }));

            setAllItems(mapped);
            setItems(mapped.filter(i => i.isOnOffer));
        } catch (error) {
            console.error("Failed to load offers:", error);
            toast({ title: "Error", description: "Failed to load menu items", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [providerId, type, toast]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredItems = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        return items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.offerType?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const handleSaveOffer = async (offerData: any) => {
        if (!selectedItem) return;
        try {
            const payload = {
                ...selectedItem,
                isOnOffer: offerData.isOnOffer,
                offerType: offerData.offerType,
                offerValue: offerData.offerValue,
                offerDescription: offerData.offerDescription,
                offerStartDate: offerData.startDate,
                offerEndDate: offerData.endDate,
                offerStartTime: offerData.startTime,
                offerEndTime: offerData.endTime,
                offerMetaData: JSON.stringify({
                    comboItems: offerData.comboItems,
                    minOrderValue: offerData.minOrderValue,
                    buyX: offerData.buyX,
                    getY: offerData.getY,
                    planType: offerData.planType
                })
            };

            const updated = await api.updateMenuItem(selectedItem.id, payload) as any;
            
            toast({ title: "Offer updated successfully" });
            loadData(); // Refresh list
            setIsOfferDialogOpen(false);
            setSelectedItem(null);
        } catch (err) {
            toast({ title: "Error", description: "Failed to save offer", variant: "destructive" });
        }
    };

    if (isLoading && !items.length) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Fetching your active deals...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Active Offers</h1>
                    <p className="text-muted-foreground font-medium">Manage and monitor all your current promotional deals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search deals..." 
                            className="pl-9 w-[250px] bg-white border-orange-100" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-orange-500/5 overflow-hidden rounded-2xl">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-600 rounded-lg text-white">
                            <Percent size={18} />
                        </div>
                        <CardTitle className="text-lg font-bold">Offer Catalog</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[80px]">Item</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Offer Type</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <div className="p-4 bg-slate-50 rounded-full mb-3 italic">
                                                <Tag size={32} className="opacity-20" />
                                            </div>
                                            <p className="font-bold uppercase text-xs tracking-widest">No Active Offers Found</p>
                                            <p className="text-xs mt-1">Head to your Menu to create your first deal!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="group hover:bg-orange-50/20 transition-colors">
                                        <TableCell>
                                            <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                                <Image 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                ID: {item.id.slice(0, 8)}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-2 py-0.5 w-fit">
                                                    {item.offerType}
                                                </Badge>
                                                {item.offerDescription && (
                                                    <p className="text-[10px] font-medium italic text-orange-800 line-clamp-1 opacity-70">
                                                        "{item.offerDescription}"
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-orange-400" />
                                                    <span>{item.offerStartDate || '∞'} — {item.offerEndDate || '∞'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-orange-400" />
                                                    <span>{item.offerStartTime || '00:00'} — {item.offerEndTime || '23:59'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-2 py-1.5 tracking-widest">Controls</DropdownMenuLabel>
                                                    <DropdownMenuItem 
                                                        className="rounded-lg gap-2 font-bold text-sm"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsOfferDialogOpen(true);
                                                        }}
                                                    >
                                                        <Settings className="h-4 w-4 text-orange-600" />
                                                        Modify Offer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="rounded-lg gap-2 font-bold text-sm text-destructive"
                                                        onClick={async () => {
                                                            if (!confirm('Remove this offer?')) return;
                                                            try {
                                                                await api.updateMenuItem(item.id, { ...item, isOnOffer: false });
                                                                toast({ title: "Offer Removed" });
                                                                loadData();
                                                            } catch (e) {
                                                                toast({ title: "Error", variant: "destructive" });
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        End Promotion
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <OfferDialog 
                isOpen={isOfferDialogOpen}
                onClose={() => {
                    setIsOfferDialogOpen(false);
                    setSelectedItem(null);
                }}
                onSave={handleSaveOffer}
                itemName={selectedItem?.name || ""}
                allMenuItems={allItems.map(i => ({ id: i.id, name: i.name }))}
                initialData={selectedItem ? {
                    isOnOffer: selectedItem.isOnOffer,
                    offerType: selectedItem.offerType,
                    offerValue: selectedItem.offerValue,
                    offerDescription: selectedItem.offerDescription,
                    startDate: selectedItem.offerStartDate,
                    endDate: selectedItem.offerEndDate,
                    startTime: selectedItem.offerStartTime,
                    endTime: selectedItem.offerEndTime,
                    ...(selectedItem.offerMetaData ? JSON.parse(selectedItem.offerMetaData) : {})
                } : undefined}
            />
        </div>
    );
}

// Helper icons required
import { Settings, Trash2 } from 'lucide-react';
