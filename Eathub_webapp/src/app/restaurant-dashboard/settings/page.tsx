'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Camera, ImagePlus, X, UserCircle2, CheckCircle2, AlertCircle, Loader2, FileText, Upload, MapPin, Search } from 'lucide-react';
import {
  fetchRestaurantProfile,
  updateRestaurantProfile,
  updateRestaurantAddress,
  updateRestaurantLegal
} from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LocationPicker from '@/components/location/LocationPicker';
import { compressImage } from '@/lib/image-utils';

// ─── Types ──────────────────────────────────────────────────────────────
export type DayAvailability = { day: string; isOpen: boolean; openTime: string; closeTime: string };

interface ProfileForm {
  name: string;
  description: string;
  cuisineType: string;
  imageId: string | null;
  coverImageId: string | null;
  isOpen: boolean;
  workingHours: DayAvailability[];
  restaurantType: string;
  // address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // legal / banking
  legalBusinessName: string;
  gstNumber: string;
  panNumber: string;
  fssaiLicenseNumber: string;
  businessType: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankName: string;
  ownerName: string;
  mobileNumber: string;
  businessModel: string;
  fssaiExpiryDate: string;
  fssaiDocumentUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

const restaurantTypes = [
  "General",
  "Fine Dining",
  "Casual Dining",
  "Family Restaurant",
  "Fast Food",
  "Cafe",
  "Bakery",
  "Dessert Shop",
  "Food Truck",
  "Cloud Kitchen",
  "Takeaway Only",
  "Bar",
  "Pub",
  "Lounge",
  "Nightlife",
  "Buffet",
  "Catering Service",
  "Home Kitchen",
  "Multi-Cuisine"
];

const defaultHours: DayAvailability[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
  day, isOpen: true, openTime: '11:00', closeTime: '22:00'
}));

const EMPTY_FORM: ProfileForm = {
  name: '', description: '', cuisineType: '',
  imageId: null, coverImageId: null, isOpen: true,
  workingHours: defaultHours,
  restaurantType: 'General',
  addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India',
  legalBusinessName: '', gstNumber: '', panNumber: '', fssaiLicenseNumber: '',
  businessType: '', bankAccountHolderName: '', bankAccountNumber: '', bankIFSC: '', bankName: '',
  ownerName: '', mobileNumber: '', businessModel: 'both', fssaiExpiryDate: '', fssaiDocumentUrl: null,
  latitude: null, longitude: null,
};

export default function SettingsPage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<'profile' | 'address' | 'legal' | 'availability' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const rid = localStorage.getItem('restaurantId');
    if (!rid) { setLoading(false); return; }
    setRestaurantId(rid);

    fetchRestaurantProfile(rid)
      .then((data: any) => {
        setForm({
          name: data.name ?? '',
          description: data.description ?? '',
          cuisineType: data.cuisineType ?? '',
          imageId: data.imageId ?? null,
          coverImageId: data.coverImageId ?? null,
          isOpen: data.isOpen ?? true,
          restaurantType: data.restaurantType ?? 'General',
          workingHours: (() => {
            try {
              if (!data.workingHours) return defaultHours;
              const parsed = typeof data.workingHours === 'string' ? JSON.parse(data.workingHours) : data.workingHours;
              return Array.isArray(parsed) ? parsed : defaultHours;
            } catch (e) {
              return defaultHours;
            }
          })(),
          addressLine1: data.addressLine1 ?? '',
          addressLine2: data.addressLine2 ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          postalCode: data.postalCode ?? '',
          country: data.country ?? 'India',
          legalBusinessName: data.legalBusinessName ?? '',
          gstNumber: data.gstNumber ?? '',
          panNumber: data.panNumber ?? '',
          fssaiLicenseNumber: data.fssaiLicenseNumber ?? '',
          businessType: data.businessType ?? '',
          bankAccountHolderName: data.bankAccountHolderName ?? '',
          bankAccountNumber: data.bankAccountNumber ?? '',
          bankIFSC: data.bankIFSC ?? '',
          bankName: data.bankName ?? '',
          ownerName: data.ownerName ?? '',
          mobileNumber: data.mobileNumber ?? '',
          businessModel: data.businessModel ?? 'both',
          fssaiExpiryDate: data.fssaiExpiryDate ?? '',
          fssaiDocumentUrl: data.fssaiDocumentUrl ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      setForm(prev => ({ ...prev, imageId: compressed }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string, 1200, 400); // Larger for cover
      setForm(prev => ({ ...prev, coverImageId: compressed }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Sectioned Save Handlers ───────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!restaurantId) return;
    setSavingSection('profile');
    try {
      // Send core profile data including images
      const payload = {
        name: form.name,
        description: form.description,
        cuisineType: form.cuisineType,
        restaurantType: form.restaurantType,
        businessModel: form.businessModel,
        ownerName: form.ownerName,
        mobileNumber: form.mobileNumber,
        imageId: form.imageId,
        coverImageId: form.coverImageId,
      };
      await updateRestaurantProfile(restaurantId, payload);

      if (form.imageId) {
        try {
          localStorage.setItem('userAvatar', form.imageId);
          window.dispatchEvent(new Event('auth-change'));
        } catch (e) {
          console.warn("Storage quota exceeded, header icon might not update instantly.");
        }
      }

      showToast('success', 'Profile core info saved!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save profile.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAddress = async () => {
    if (!restaurantId) return;
    setSavingSection('address');
    try {
      let lat = form.latitude;
      let lng = form.longitude;

      // Auto-geocode if coordinates are missing
      if (!lat || !lng) {
        const query = `${form.addressLine1}, ${form.city}, ${form.state}, ${form.postalCode}`;
        const performSearch = async (q: string) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
            const data = await res.json();
            return (data && data[0]) ? data[0] : null;
          } catch { return null; }
        };

        let result = await performSearch(query);
        // Fallback: Just city and state
        if (!result) {
          result = await performSearch(`${form.city}, ${form.state}, ${form.country}`);
        }

        if (result) {
          lat = parseFloat(result.lat);
          lng = parseFloat(result.lon);
          setForm(f => ({ ...f, latitude: lat, longitude: lng }));
        }
      }

      const payload = {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        latitude: lat,
        longitude: lng,
      };
      await updateRestaurantAddress(restaurantId, payload);
      showToast('success', 'Address details updated!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save address.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveLegal = async () => {
    if (!restaurantId) return;
    setSavingSection('legal');
    try {
      const payload = {
        legalBusinessName: form.legalBusinessName,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
        fssaiLicenseNumber: form.fssaiLicenseNumber,
        businessType: form.businessType,
        bankAccountHolderName: form.bankAccountHolderName,
        bankAccountNumber: form.bankAccountNumber,
        bankIFSC: form.bankIFSC,
        bankName: form.bankName,
        fssaiExpiryDate: form.fssaiExpiryDate,
        fssaiDocumentUrl: form.fssaiDocumentUrl,
      };
      await updateRestaurantLegal(restaurantId, payload);
      showToast('success', 'Bank & Legal details saved!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save bank details.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleFetchCoords = async () => {
    const query = `${form.addressLine1}, ${form.city}, ${form.state}, ${form.postalCode}, ${form.country}`;
    if (!query.trim() || query.replace(/[, ]/g, '').length < 3) {
      showToast('error', 'Please enter more address details first');
      return;
    }
    setIsGeocoding(true);

    const performSearch = async (q: string) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        return (data && data[0]) ? data[0] : null;
      } catch { return null; }
    };

    try {
      let result = await performSearch(query);
      
      // Fallback 1: Remove potentially specific parts
      if (!result && query.includes(',')) {
        const fallbackQuery = query.split(',').slice(1).join(',').trim();
        result = await performSearch(fallbackQuery);
      }

      if (result) {
        const resLat = parseFloat(result.lat);
        const resLng = parseFloat(result.lon);
        setForm(f => ({ ...f, latitude: resLat, longitude: resLng }));
        showToast('success', 'Coordinates updated from address!');
      } else {
        showToast('error', 'Location not found. Try entering a landmark or just the city.');
      }
    } catch (e) {
      showToast('error', 'Geocoding failed. Check your connection.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!restaurantId) return;
    setSavingSection('availability');
    try {
      // Re-using profile endpoint for isOpen toggle as it's a core field
      await updateRestaurantProfile(restaurantId, {
        isOpen: form.isOpen,
        workingHours: JSON.stringify(form.workingHours)
      });
      showToast('success', 'Availability updated!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save hours.');
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {toast && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all
            ${toast.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6 items-start">
        {/* Core Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>Public core details and images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Cover Photo</Label>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handleCoverImageChange} />
                <div className="relative w-full rounded-xl border-2 border-dashed bg-muted/40 cursor-pointer overflow-hidden"
                  style={{ aspectRatio: '4/1' }} onClick={() => !form.coverImageId && coverInputRef.current?.click()}>
                  {form.coverImageId ? (
                    <img src={form.coverImageId} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm">Click to upload cover</span>
                    </div>
                  )}
                  {form.coverImageId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity gap-2">
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}>Change</Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, coverImageId: null })); }}>Remove</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5">
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handleProfileImageChange} />
                <div className="relative h-20 w-20 rounded-full border-2 border-dashed overflow-hidden cursor-pointer"
                  onClick={() => profileInputRef.current?.click()}>
                  {form.imageId ? <img src={form.imageId} alt="Profile" className="h-full w-full object-cover" /> : <UserCircle2 className="h-full w-full opacity-30" />}
                </div>
                <Button size="sm" variant="outline" onClick={() => profileInputRef.current?.click()}>Upload Brand Logo</Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input value={form.name} onChange={setField('name')} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.description} onChange={setField('description')} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cuisine</Label>
                  <Input value={form.cuisineType} onChange={setField('cuisineType')} placeholder="e.g. Italian, Chinese" />
                </div>
                <div className="space-y-2">
                  <Label>Restaurant Type</Label>
                  <Select
                    value={form.restaurantType}
                    onValueChange={(val) => setForm(f => ({ ...f, restaurantType: val }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {restaurantTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input value={form.ownerName} onChange={setField('ownerName')} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input value={form.mobileNumber} onChange={setField('mobileNumber')} placeholder="10-digit number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Business Model</Label>
                <Select
                  value={form.businessModel}
                  onValueChange={(val) => setForm(f => ({ ...f, businessModel: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-only">Dine-only</SelectItem>
                    <SelectItem value="delivery-only">Delivery-only</SelectItem>
                    <SelectItem value="both">Both (Dine-in & Delivery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={savingSection === 'profile'}>
                {savingSection === 'profile' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Core Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Restored: Working Hours & Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle>Working Hours & Availability</CardTitle>
              <CardDescription>Set the hours you are open for orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Currently Accepting Orders</Label>
                  <p className="text-xs text-muted-foreground">Turn this off to temporarily close your restaurant globally.</p>
                </div>
                <Switch
                  checked={form.isOpen}
                  onCheckedChange={(c) => setForm(f => ({ ...f, isOpen: c }))}
                />
              </div>
              <Separator />
              {form.workingHours.map((wh, index) => (
                <div key={wh.day} className="flex flex-wrap items-center justify-between p-3 rounded-lg border gap-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm w-20">{wh.day}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={wh.isOpen}
                        onCheckedChange={(checked) => {
                          const updated = [...form.workingHours];
                          updated[index].isOpen = checked;
                          setForm(f => ({ ...f, workingHours: updated }));
                        }}
                      />
                      <span className="text-[10px] w-10 text-muted-foreground">{wh.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <Select
                      value={wh.openTime}
                      onValueChange={(val) => {
                        const updated = [...form.workingHours];
                        updated[index].openTime = val;
                        setForm(f => ({ ...f, workingHours: updated }));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[80px] text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const hourStr = i.toString().padStart(2, '0') + ':00';
                          return <SelectItem key={hourStr} value={hourStr}>{hourStr}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground shrink-0">to</span>
                    <Select
                      value={wh.closeTime}
                      onValueChange={(val) => {
                        const updated = [...form.workingHours];
                        updated[index].closeTime = val;
                        setForm(f => ({ ...f, workingHours: updated }));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[80px] text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const hourStr = i.toString().padStart(2, '0') + ':00';
                          return <SelectItem key={hourStr} value={hourStr}>{hourStr}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAvailability} disabled={savingSection === 'availability'} variant="outline">
                {savingSection === 'availability' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Hours
              </Button>
            </CardFooter>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Address</CardTitle>
              <CardDescription>Stored in its allotted table.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>House No.</Label>
                <Input value={form.addressLine1} onChange={setField('addressLine1')} />
              </div>
              <div className="space-y-2">
                <Label>Street Name</Label>
                <Input value={form.addressLine2} onChange={setField('addressLine2')} placeholder="Suite, floor, etc. (Optional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={setField('city')} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={setField('state')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={form.postalCode} onChange={setField('postalCode')} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.country} onChange={setField('country')} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-primary" />
                     Map Coordinates
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {form.latitude && form.longitude 
                      ? `Set to ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`
                      : "No coordinates set yet"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 flex-1 sm:flex-none"
                    onClick={handleFetchCoords}
                    disabled={isGeocoding}
                  >
                    {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Sync from Address
                  </Button>
                  <Dialog open={isLocationPickerOpen} onOpenChange={setIsLocationPickerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                        <MapPin className="h-4 w-4" />
                        Pick on Map
                      </Button>
                    </DialogTrigger>
                      <DialogContent className="max-w-2xl h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Select Restaurant Location</DialogTitle>
                        </DialogHeader>
                        <LocationPicker 
                          initialLat={form.latitude}
                          initialLng={form.longitude}
                          initialAddress={`${form.addressLine1}, ${form.city}, ${form.state}, ${form.postalCode}`}
                          onLocationSelect={(lat, lng) => {
                            setForm(f => ({ ...f, latitude: lat, longitude: lng }));
                          }}
                        />
                        <Button className="w-full mt-4" onClick={() => setIsLocationPickerOpen(false)}>
                          Confirm Location
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

              <div className="hidden">
                <Input value={form.latitude ?? ''} readOnly />
                <Input value={form.longitude ?? ''} readOnly />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAddress} disabled={savingSection === 'address'} variant="outline">
                {savingSection === 'address' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Address Only
              </Button>
            </CardFooter>
          </Card>


          {/* Legal/Bank Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bank &amp; Legal Profile</CardTitle>
              <CardDescription>Separate record for banking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input value={form.bankAccountHolderName} onChange={setField('bankAccountHolderName')} />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={form.bankAccountNumber} onChange={setField('bankAccountNumber')} type="password" />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bankName} onChange={setField('bankName')} />
              </div>
              <div className="space-y-2">
                <Label>IFSC</Label>
                <Input value={form.bankIFSC} onChange={setField('bankIFSC')} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>FSSAI Expiry Date</Label>
                <Input type="date" value={form.fssaiExpiryDate} onChange={setField('fssaiExpiryDate')} />
              </div>
              <div className="space-y-2">
                <Label>Food License Document</Label>
                <div className="flex flex-col gap-2">
                  {form.fssaiDocumentUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border aspect-video bg-muted/20">
                      {form.fssaiDocumentUrl && (form.fssaiDocumentUrl.startsWith('data:image') || form.fssaiDocumentUrl.startsWith('http')) ? (
                        <img src={form.fssaiDocumentUrl} alt="FSSAI License" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-full gap-2">
                          <FileText className="h-8 w-8 text-orange-600" />
                          <span className="text-sm font-medium">License File Uploaded</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => document.getElementById('fssai-upload')?.click()}>Change</Button>
                        <Button size="sm" variant="destructive" onClick={() => setForm(f => ({ ...f, fssaiDocumentUrl: null }))}>Remove</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full border-dashed py-8 flex flex-col gap-2" onClick={() => document.getElementById('fssai-upload')?.click()}>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span>Upload FSSAI Document</span>
                    </Button>
                  )}
                  <input
                    id="fssai-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const result = reader.result as string;
                          setForm(prev => ({ ...prev, fssaiDocumentUrl: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground text-center">Images or PDFs up to 5MB are supported.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveLegal} disabled={savingSection === 'legal'} variant="outline" className="w-full">
                {savingSection === 'legal' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Bank Details Only
              </Button>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
