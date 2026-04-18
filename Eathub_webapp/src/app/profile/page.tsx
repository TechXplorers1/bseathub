'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Home,
    Building2,
    Globe,
    Navigation,
    Map,
    Search,
    Save,
    Loader2,
    ArrowLeft,
    Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { countries } from '@/constants/countries';
import { fetchUserProfile, updateProfile } from '@/services/api';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        countryCode: '+91',
        houseNumber: '',
        street: '',
        area: '',
        city: '',
        state: '',
        country: '',
        avatarUrl: ''
    });

    const [countrySearch, setCountrySearch] = useState('');
    const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const data = await fetchUserProfile();
                // Split name if backend returns combined name
                let fName = data.firstName || '';
                let lName = data.lastName || '';
                if (!fName && data.name) {
                    const parts = data.name.split(' ');
                    fName = parts[0];
                    lName = parts.slice(1).join(' ');
                }

                // Better mobile/country code extraction
                const fullMobile = data.mobileNumber || '';
                let foundCode = data.countryCode || '';
                let subscriberNumber = data.mobile || '';

                if (!foundCode || !subscriberNumber) {
                    // Try to extract from mobileNumber string
                    const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
                    for (const c of sortedCountries) {
                        if (fullMobile.startsWith(c.code)) {
                            foundCode = c.code;
                            subscriberNumber = fullMobile.substring(c.code.length);
                            break;
                        }
                    }
                }

                setForm({
                    firstName: fName,
                    lastName: lName,
                    email: data.email || '',
                    mobile: subscriberNumber || fullMobile.replace(/^\+\d+/, '') || '',
                    countryCode: foundCode || fullMobile.match(/^\+\d+/)?.[0] || '+91',
                    houseNumber: data.houseNumber || '',
                    street: data.street || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    avatarUrl: data.avatarUrl || ''
                });

                // Keep avatar in sync with local storage for header updates
                if (data.avatarUrl) {
                    localStorage.setItem('userAvatar', data.avatarUrl);
                    window.dispatchEvent(new Event('auth-change'));
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                // If fetch fails, try to populate from localStorage or just keep empty
                const email = localStorage.getItem('userEmail');
                if (email) setForm(prev => ({ ...prev, email }));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({
                ...form,
                name: `${form.firstName} ${form.lastName}`,
                mobileNumber: `${form.countryCode}${form.mobile}`
            });

            const fullName = `${form.firstName} ${form.lastName}`;
            localStorage.setItem('userName', fullName);

            if (form.avatarUrl) {
                localStorage.setItem('userAvatar', form.avatarUrl);
                window.dispatchEvent(new Event('auth-change'));
            }

            toast({
                title: "Profile Updated",
                description: "Your details have been successfully saved.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Something went wrong while saving.",
            });
        } finally {
            setSaving(false);
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    );

    const selectedCountry = countries.find(c => c.code === form.countryCode) || countries.find(c => c.name === 'India') || countries[0];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Your Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account details and delivery addresses.</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft size={18} /> Back
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Summary Card */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader className="text-center pb-2">
                            <label className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden relative group cursor-pointer border border-border">
                                {form.avatarUrl ? (
                                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <User size={48} className="text-primary group-hover:opacity-50 transition-opacity" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <Camera className="text-white w-6 h-6" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                            <CardTitle>{form.firstName} {form.lastName}</CardTitle>
                            <CardDescription>{form.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Separator className="my-4" />
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone size={14} /> {form.countryCode} {form.mobile}
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                    <span>{form.houseNumber}, {form.street}, {form.area}, {form.city}, {form.state}, {form.country}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <User size={20} className="text-primary" /> Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input name="email" value={form.email} disabled className="bg-muted cursor-not-allowed" />
                                    <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile Number</Label>
                                    <div className="flex gap-2">
                                        <Popover open={isCountrySelectOpen} onOpenChange={setIsCountrySelectOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-[90px] h-10 px-2 justify-between font-normal text-xs"
                                                >
                                                    <span className="flex items-center gap-1 overflow-hidden">
                                                        <span>{selectedCountry?.flag}</span>
                                                        <span>{form.countryCode}</span>
                                                    </span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0 shadow-2xl" align="start">
                                                <div className="flex items-center border-b px-3 py-2">
                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                    <input
                                                        className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                        placeholder="Search country..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto no-scrollbar py-1">
                                                    {filteredCountries.map((c) => (
                                                        <button
                                                            key={`${c.name}-${c.code}`}
                                                            type="button"
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-primary/5 transition-colors text-left"
                                                            onClick={() => {
                                                                setForm({ ...form, countryCode: c.code, country: c.name });
                                                                setIsCountrySelectOpen(false);
                                                                setCountrySearch('');
                                                            }}
                                                        >
                                                            <span>{c.flag}</span>
                                                            <span className="flex-1 truncate">{c.name}</span>
                                                            <span className="text-muted-foreground">{c.code}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <Input name="mobile" value={form.mobile} onChange={handleChange} placeholder="9876543210" className="flex-1" required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MapPin size={20} className="text-primary" /> Delivery Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Address Line 1 (House, Apt, Building)</Label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="houseNumber" value={form.houseNumber} onChange={handleChange} placeholder="Apt 4B / 123 Main St" className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Address Line 2 (Street, Sector, Area)</Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="street" value={form.street} onChange={handleChange} placeholder="Downtown / Sector 4" className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Landmark / Locality</Label>
                                    <div className="relative">
                                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="area" value={form.area} onChange={handleChange} placeholder="Near Central Park" className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Town / City</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="city" value={form.city} onChange={handleChange} placeholder="New York" className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>State / Province / Region</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="state" value={form.state} onChange={handleChange} placeholder="NY" className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="country" value={form.country} onChange={handleChange} placeholder="United States" className="pl-10" required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" disabled={saving} className="px-8 gap-2 shadow-lg shadow-primary/20">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Saving Changes...' : 'Save All Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
