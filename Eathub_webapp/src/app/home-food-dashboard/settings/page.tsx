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
  fetchHomeFoodProfile,
  updateHomeFoodProfile,
  updateHomeFoodAddress,
  updateHomeFoodLegal
} from '@/services/api';
import { countries } from '@/constants/countries';
import { compressImage } from '@/lib/image-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Globe, Phone, Search, FileText, Upload, Trash2, Plus, Home } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
export type DayAvailability = { day: string; isOpen: boolean; openTime: string; closeTime: string };

interface ProfileForm {
  name: string;
  description: string;
  foodType: string;
  imageId: string | null;
  coverImageId: string | null;
  isOpen: boolean;
  workingHours: DayAvailability[];
  operationalStatus: string;
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
  // Expansion
  fullName: string;
  contactNumber: string;
  countryCode: string;
  cuisines: string;
  specialtyDishes: string;
  deliveryAvailability: string;
  idProofType: string;
  idProofNumber: string;
  idProofUrl: string | null;
}

const defaultHours: DayAvailability[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
  day, isOpen: true, openTime: '11:00', closeTime: '22:00'
}));

const EMPTY_FORM: ProfileForm = {
  name: '', description: '', foodType: '',
  imageId: null, coverImageId: null, isOpen: true,
  workingHours: defaultHours,
  operationalStatus: 'OPEN',
  addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India',
  legalBusinessName: '', gstNumber: '', panNumber: '', fssaiLicenseNumber: '',
  businessType: '', bankAccountHolderName: '', bankAccountNumber: '', bankIFSC: '', bankName: '',
  fullName: '', contactNumber: '', countryCode: '+91', cuisines: '', specialtyDishes: '', deliveryAvailability: 'Available',
  idProofType: '', idProofNumber: '', idProofUrl: null
};

export default function HomeFoodSettingsPage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<'profile' | 'address' | 'legal' | 'availability' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [homeFoodId, setHomeFoodId] = useState<string | null>(null);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const idProofInputRef = useRef<HTMLInputElement>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hid = localStorage.getItem('homeFoodId');
    if (!hid) { setLoading(false); return; }
    setHomeFoodId(hid);

    fetchHomeFoodProfile(hid)
      .then((data: any) => {
        setForm({
          name: data.name ?? '',
          description: data.description ?? '',
          foodType: data.foodType ?? '',
          imageId: data.imageId ?? null,
          coverImageId: data.coverImageId ?? null,
          isOpen: data.isActive ?? true,
          operationalStatus: data.operationalStatus ?? 'OPEN',
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
          fullName: data.fullName ?? '',
          contactNumber: data.contactNumber ?? '',
          countryCode: data.countryCode ?? '+91',
          cuisines: data.cuisines ?? '',
          specialtyDishes: data.specialtyDishes ?? '',
          deliveryAvailability: data.deliveryAvailability ?? 'Available',
          idProofType: data.idProofType ?? '',
          idProofNumber: data.idProofNumber ?? '',
          idProofUrl: data.idProofUrl ?? null,
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'imageId' | 'coverImageId'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(
        reader.result as string,
        key === 'coverImageId' ? 1200 : 800,
        key === 'coverImageId' ? 400 : 800
      );
      setForm(f => ({ ...f, [key]: compressed }));
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
    if (!homeFoodId) return;
    setSavingSection('profile');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        foodType: form.foodType,
        imageId: form.imageId,
        coverImageId: form.coverImageId,
        fullName: form.fullName,
        contactNumber: form.contactNumber,
        countryCode: form.countryCode,
        cuisines: form.cuisines,
        specialtyDishes: form.specialtyDishes,
        deliveryAvailability: form.deliveryAvailability,
      };
      await updateHomeFoodProfile(homeFoodId, payload);

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
    if (!homeFoodId) return;
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
      await updateHomeFoodAddress(homeFoodId, payload);
      showToast('success', 'Address details updated!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save address.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveLegal = async () => {
    if (!homeFoodId) return;
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
        idProofType: form.idProofType,
        idProofNumber: form.idProofNumber,
        idProofUrl: form.idProofUrl,
      };
      await updateHomeFoodLegal(homeFoodId, payload);
      showToast('success', 'Bank & Legal details saved!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save bank details.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAvailability = async () => {
    if (!homeFoodId) return;
    setSavingSection('availability');
    try {
      await updateHomeFoodProfile(homeFoodId, {
        operationalStatus: form.isOpen ? 'OPEN' : 'CLOSED',
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
              <CardTitle>Home Food Profile</CardTitle>
              <CardDescription>Public core details and brand images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Cover Photo</Label>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageChange(e, 'coverImageId')} />
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
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, 'imageId')} />
                <div className="relative h-20 w-20 rounded-full border-2 border-dashed overflow-hidden cursor-pointer"
                  onClick={() => profileInputRef.current?.click()}>
                  {form.imageId ? <img src={form.imageId} alt="Profile" className="h-full w-full object-cover" /> : <UserCircle2 className="h-full w-full opacity-30" />}
                </div>
                <Button size="sm" variant="outline" onClick={() => profileInputRef.current?.click()}>Upload Brand Logo</Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Delivery Availability</Label>
                <Select value={form.deliveryAvailability} onValueChange={(v) => setForm(f => ({ ...f, deliveryAvailability: v }))}>
                  <SelectTrigger><SelectValue placeholder="Delivery preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available for Delivery</SelectItem>
                    <SelectItem value="Pickup Only">Pickup Only</SelectItem>
                    <SelectItem value="Both">Both Delivery & Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={setField('fullName')} placeholder="Legal Full Name" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <div className="flex gap-2">
                    <Popover open={isCountrySelectOpen} onOpenChange={setIsCountrySelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[110px] h-10 px-2 justify-between font-normal text-xs bg-background"
                        >
                          <span className="flex items-center gap-1 overflow-hidden">
                            <span>{countries.find(c => c.code === form.countryCode)?.flag || '🇮🇳'}</span>
                            <span className="truncate">{form.countryCode}</span>
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0 shadow-2xl" align="start">
                        <div className="flex items-center border-b px-3 py-2">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Search code..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[250px] overflow-y-auto no-scrollbar py-1 text-xs">
                          {countries.filter(c =>
                            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            c.code.includes(countrySearch)
                          ).length === 0 ? (
                            <div className="py-4 text-center">Not found</div>
                          ) : (
                            countries.filter(c =>
                              c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              c.code.includes(countrySearch)
                            ).map((c) => (
                              <button
                                key={`${c.name}-${c.code}`}
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                                onClick={() => {
                                  setForm({ ...form, countryCode: c.code });
                                  setIsCountrySelectOpen(false);
                                  setCountrySearch('');
                                }}
                              >
                                <span className="text-base">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-muted-foreground">{c.code}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={form.contactNumber}
                      onChange={setField('contactNumber')}
                      className="flex-1"
                      placeholder="Mobile Number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Cuisine</Label>
                  <Select value={form.cuisines} onValueChange={(v) => setForm(f => ({ ...f, cuisines: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="International">International</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                      <SelectItem value="Continental">Continental</SelectItem>
                      <SelectItem value="Desserts">Desserts & Sweets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Specialty Dishes</Label>
                  <Input value={form.specialtyDishes} onChange={setField('specialtyDishes')} placeholder="e.g. Grandma's Biryani" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Food Type Tagline</Label>
                <Input value={form.foodType} onChange={setField('foodType')} placeholder="e.g. Healthy, Homemade, Spicy" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="Tell customers about your kitchen, your specialties, and your cooking style..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={savingSection === 'profile'}>
                {savingSection === 'profile' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Core Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Working Hours & Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle>Working Hours & Availability</CardTitle>
              <CardDescription>Set the hours you are active for orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Currently Accepting Orders</Label>
                  <p className="text-xs text-muted-foreground">Turn this off to temporarily close your kitchen globally.</p>
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
              <CardTitle>Pickup Address</CardTitle>
              <CardDescription>Where orders will be picked up from.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>House/Flat No.</Label>
                <Input value={form.addressLine1} onChange={setField('addressLine1')} />
              </div>
              <div className="space-y-2">
                <Label>Street / Apartment Name</Label>
                <Input value={form.addressLine2} onChange={setField('addressLine2')} placeholder="Optional" />
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
              <CardTitle>Legal & Bank Details</CardTitle>
              <CardDescription>Required for payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>FSSAI License No. (Optional)</Label>
                <Input value={form.fssaiLicenseNumber} onChange={setField('fssaiLicenseNumber')} />
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
              <Separator className="my-4" />
              <CardTitle className="text-lg">Identity Verification</CardTitle>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID Proof Type</Label>
                  <Select value={form.idProofType} onValueChange={(v) => setForm(f => ({ ...f, idProofType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                      <SelectItem value="Voter ID">Voter ID</SelectItem>
                      <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                      <SelectItem value="PAN Card">PAN Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Proof Number</Label>
                  <Input value={form.idProofNumber} onChange={setField('idProofNumber')} placeholder="Enter ID number" />
                </div>
                <div className="space-y-2">
                  <Label>ID Certificate (PDF or Image)</Label>
                  <input ref={idProofInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type === 'application/pdf') {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm(f => ({ ...f, idProofUrl: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      } else {
                        const base64 = await compressImage(file);
                        setForm(f => ({ ...f, idProofUrl: base64 }));
                      }
                    }
                  }} />
                  <div className="flex flex-col gap-2">
                    {form.idProofUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border aspect-video flex items-center justify-center bg-muted/30">
                        {form.idProofUrl.toLowerCase().startsWith('data:application/pdf') || form.idProofUrl.toLowerCase().endsWith('.pdf') ? (
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-primary mx-auto mb-2" />
                            <span className="text-xs font-medium text-muted-foreground">PDF Document Uploaded</span>
                          </div>
                        ) : (
                          <img src={form.idProofUrl} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" onClick={() => idProofInputRef.current?.click()}>Change</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full border-dashed py-8" onClick={() => idProofInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload ID Document
                      </Button>
                    )}
                    <p className="text-[10px] text-muted-foreground">Supports clear images of ID or PDF documents.</p>
                  </div>
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

          <Card className={form.isOpen ? "border-destructive" : "border-green-500"}>
            <CardHeader>
              <CardTitle className={form.isOpen ? "text-destructive font-bold" : "text-green-600 font-bold"}>
                {form.isOpen ? "Danger Zone" : "Kitchen Deactivated"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {form.isOpen ? (
                <>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      if (confirm("Are you sure you want to deactivate your kitchen? This will hide your profile from all customers.")) {
                        try {
                          await updateHomeFoodProfile(homeFoodId!, { operationalStatus: 'CLOSED' });
                          setForm(f => ({ ...f, isOpen: false, operationalStatus: 'CLOSED' }));
                          showToast('success', 'Kitchen deactivated successfully.');
                        } catch (err: any) {
                          showToast('error', 'Failed to deactivate.');
                        }
                      }
                    }}
                  >
                    Deactivate My Kitchen
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will temporarily hide your kitchen from the platform. You can reactivate it anytime.
                  </p>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                      try {
                        await updateHomeFoodProfile(homeFoodId!, { operationalStatus: 'OPEN' });
                        setForm(f => ({ ...f, isOpen: true, operationalStatus: 'OPEN' }));
                        showToast('success', 'Kitchen reactivated! You are now visible to customers.');
                      } catch (err: any) {
                        showToast('error', 'Failed to reactivate.');
                      }
                    }}
                  >
                    Activate My Kitchen
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your kitchen is currently hidden. Click above to become visible to customers again.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
