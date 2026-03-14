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
import { fetchRestaurantProfile, updateRestaurantProfile } from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────────
interface ProfileForm {
  name: string;
  description: string;
  cuisineType: string;
  imageId: string | null;        // base64 or URL
  coverImageId: string | null;   // base64 or URL
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

const EMPTY_FORM: ProfileForm = {
  name: '', description: '', cuisineType: '',
  imageId: null, coverImageId: null,
  addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India',
  legalBusinessName: '', gstNumber: '', panNumber: '', fssaiLicenseNumber: '',
  businessType: '', bankAccountHolderName: '', bankAccountNumber: '', bankIFSC: '', bankName: '',
};

export default function SettingsPage() {
  const [form, setForm]             = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const coverInputRef   = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // ── Load profile from DB on mount ──────────────────────────────────────
  useEffect(() => {
    const rid = localStorage.getItem('restaurantId');
    if (!rid) { setLoading(false); return; }
    setRestaurantId(rid);

    fetchRestaurantProfile(rid)
      .then((data: any) => {
        setForm({
          name:               data.name            ?? '',
          description:        data.description     ?? '',
          cuisineType:        data.cuisineType      ?? '',
          imageId:            data.imageId          ?? null,
          coverImageId:       data.coverImageId     ?? null,
          addressLine1:       data.addressLine1     ?? '',
          addressLine2:       data.addressLine2     ?? '',
          city:               data.city             ?? '',
          state:              data.state            ?? '',
          postalCode:         data.postalCode       ?? '',
          country:            data.country          ?? 'India',
          legalBusinessName:  data.legalBusinessName  ?? '',
          gstNumber:          data.gstNumber           ?? '',
          panNumber:          data.panNumber           ?? '',
          fssaiLicenseNumber: data.fssaiLicenseNumber  ?? '',
          businessType:       data.businessType        ?? '',
          bankAccountHolderName: data.bankAccountHolderName ?? '',
          bankAccountNumber:  data.bankAccountNumber   ?? '',
          bankIFSC:           data.bankIFSC             ?? '',
          bankName:           data.bankName             ?? '',
        });
      })
      .catch(() => {/* use empty form if not found */})
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────
  const set = (key: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'imageId' | 'coverImageId'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, [key]: reader.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!restaurantId) { showToast('error', 'Restaurant ID not found. Please log in again.'); return; }
    setSaving(true);
    try {
      await updateRestaurantProfile(restaurantId, form);
      showToast('success', 'Profile saved successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
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

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all
            ${toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'}`}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="h-5 w-5 shrink-0" />
            : <AlertCircle  className="h-5 w-5 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Restaurant Profile Card ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>
                Displayed publicly on your store page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Cover Photo</Label>
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200 × 300 px · shown as banner on your store page
                </p>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageChange(e, 'coverImageId')} />
                <div
                  className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 cursor-pointer group transition-colors hover:border-primary/60 hover:bg-muted/60"
                  style={{ aspectRatio: '4/1', minHeight: '120px' }}
                  onClick={() => !form.coverImageId && coverInputRef.current?.click()}
                >
                  {form.coverImageId ? (
                    <img src={form.coverImageId} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImagePlus className="h-8 w-8 opacity-60" />
                      <span className="text-sm font-medium">Click to upload cover photo</span>
                      <span className="text-xs opacity-60">JPG, PNG, WEBP</span>
                    </div>
                  )}
                  {form.coverImageId && (
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="gap-1.5"
                        onClick={e => { e.stopPropagation(); coverInputRef.current?.click(); }}>
                        <Camera className="h-4 w-4" /> Change
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1.5"
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, coverImageId: null })); }}>
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <p className="text-xs text-muted-foreground">Square logo / avatar · recommended: 400 × 400 px</p>
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageChange(e, 'imageId')} />
                <div className="flex items-center gap-5">
                  <div
                    className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/40 group transition-colors hover:border-primary/60"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    {form.imageId
                      ? <img src={form.imageId} alt="Profile" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <UserCircle2 className="h-10 w-10 opacity-50" />
                        </div>
                    }
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="gap-2"
                      onClick={() => profileInputRef.current?.click()}>
                      <Camera className="h-4 w-4" />
                      {form.imageId ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {form.imageId && (
                      <Button size="sm" variant="ghost" className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => setForm(f => ({ ...f, imageId: null }))}>
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Core text fields */}
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input id="restaurant-name" value={form.name} onChange={set('name')}
                  placeholder="e.g. The Golden Spoon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurant-bio">Description / Bio</Label>
                <Textarea id="restaurant-bio" value={form.description} onChange={set('description')}
                  placeholder="Tell customers about your restaurant…" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine-type">Cuisine Type</Label>
                <Input id="cuisine-type" value={form.cuisineType} onChange={set('cuisineType')}
                  placeholder="e.g. Italian, Indian, Chinese" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>

          {/* ── Address Card ────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                Your restaurant's physical location, stored in your address record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-line1">Address Line 1</Label>
                <Input id="address-line1" value={form.addressLine1} onChange={set('addressLine1')}
                  placeholder="Street / Building" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line2">Address Line 2 <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="address-line2" value={form.addressLine2} onChange={set('addressLine2')}
                  placeholder="Apartment, floor, etc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={set('state')} placeholder="State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input id="postal-code" value={form.postalCode} onChange={set('postalCode')} placeholder="PIN code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={set('country')} placeholder="Country" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Address'}
              </Button>
            </CardFooter>
          </Card>

          {/* ── Working Hours Card ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Working Hours &amp; Availability</CardTitle>
              <CardDescription>Set the hours you are open for orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center gap-4">
                    <Switch defaultChecked={!['Sunday'].includes(day)} />
                    <span className="text-sm w-20">{!['Sunday'].includes(day) ? 'Open' : 'Closed'}</span>
                    <Select defaultValue="11:00">
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select defaultValue="22:00">
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="21:00">09:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline">Save Hours</Button>
            </CardFooter>
          </Card>

        </div>{/* end left column */}

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Bank / Legal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank &amp; Legal Details</CardTitle>
              <CardDescription>
                Stored securely in your legal profile record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal-name">Legal Business Name</Label>
                <Input id="legal-name" value={form.legalBusinessName} onChange={set('legalBusinessName')}
                  placeholder="Registered business name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input id="gst" value={form.gstNumber} onChange={set('gstNumber')}
                  placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input id="pan" value={form.panNumber} onChange={set('panNumber')}
                  placeholder="ABCDE1234F" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fssai">FSSAI License Number</Label>
                <Input id="fssai" value={form.fssaiLicenseNumber} onChange={set('fssaiLicenseNumber')}
                  placeholder="FSSAI license no." />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="bank-holder">Account Holder Name</Label>
                <Input id="bank-holder" value={form.bankAccountHolderName} onChange={set('bankAccountHolderName')}
                  placeholder="As on bank account" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account">Account Number</Label>
                <Input id="bank-account" type="password" value={form.bankAccountNumber} onChange={set('bankAccountNumber')}
                  placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-ifsc">IFSC Code</Label>
                <Input id="bank-ifsc" value={form.bankIFSC} onChange={set('bankIFSC')}
                  placeholder="e.g. SBIN0001234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input id="bank-name" value={form.bankName} onChange={set('bankName')}
                  placeholder="e.g. State Bank of India" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2 w-full">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Bank Details'}
              </Button>
            </CardFooter>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Deactivate My Restaurant</Button>
              <p className="text-xs text-muted-foreground mt-2">
                This action is not reversible. All your data will be permanently deleted.
              </p>
            </CardContent>
          </Card>

        </div>{/* end right column */}
      </div>
    </div>
  );
}
