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
import { Camera, ImagePlus, X, UserCircle2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  fetchRestaurantProfile,
  updateRestaurantProfile,
  updateRestaurantAddress,
  updateRestaurantLegal
} from '@/services/api';
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
};

export default function SettingsPage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<'profile' | 'address' | 'legal' | 'availability' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

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
      const payload = {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
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
      };
      await updateRestaurantLegal(restaurantId, payload);
      showToast('success', 'Bank & Legal details saved!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save bank details.');
    } finally {
      setSavingSection(null);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

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
                <div key={wh.day} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium text-sm w-24">{wh.day}</span>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={wh.isOpen}
                      onCheckedChange={(checked) => {
                        const updated = [...form.workingHours];
                        updated[index].isOpen = checked;
                        setForm(f => ({ ...f, workingHours: updated }));
                      }}
                    />
                    <span className="text-xs w-12 text-muted-foreground">{wh.isOpen ? 'Open' : 'Closed'}</span>
                    <Select
                      value={wh.openTime}
                      onValueChange={(val) => {
                        const updated = [...form.workingHours];
                        updated[index].openTime = val;
                        setForm(f => ({ ...f, workingHours: updated }));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const hourStr = i.toString().padStart(2, '0') + ':00';
                          return <SelectItem key={hourStr} value={hourStr}>{hourStr}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <Select
                      value={wh.closeTime}
                      onValueChange={(val) => {
                        const updated = [...form.workingHours];
                        updated[index].closeTime = val;
                        setForm(f => ({ ...f, workingHours: updated }));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
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
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAddress} disabled={savingSection === 'address'} variant="outline">
                {savingSection === 'address' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Address Only
              </Button>
            </CardFooter>
          </Card>

        </div>

        <div className="space-y-6">
          {/* Legal/Bank Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bank &amp; Legal Profile</CardTitle>
              <CardDescription>Separate record for banking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input value={form.gstNumber} onChange={setField('gstNumber')} />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input value={form.panNumber} onChange={setField('panNumber')} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Account Holder</Label>
                <Input value={form.bankAccountHolderName} onChange={setField('bankAccountHolderName')} />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={form.bankAccountNumber} onChange={setField('bankAccountNumber')} type="password" />
              </div>
              <div className="space-y-2">
                <Label>IFSC</Label>
                <Input value={form.bankIFSC} onChange={setField('bankIFSC')} />
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
    </div>
  );
}
