'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, CheckCircle2, AlertCircle, Camera, Search, FileText, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  fetchChefProfile, 
  fetchChefProfileByOwner,
  updateChefProfile, 
  updateChefLegal, 
  updateChefAddress 
} from '@/services/api';
import { countries } from '@/constants/countries';
import { compressImage } from '@/lib/image-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayConfig {
  active: boolean;
  open: string;
  close: string;
}

interface WorkingHours {
  [key: string]: DayConfig;
}

const DEFAULT_HOURS: WorkingHours = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { active: day !== 'Monday', open: '09:00', close: '21:00' }
}), {});

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: 'Maria',
    bio: 'World-renowned chef with multiple Michelin stars...',
    specialty: 'Modern European, French, British',
    experience: '',
    avatarUrl: '',
    // Granular Experience
    expYears: '0',
    expMonths: '0',
    expDays: '0',
    // Bank Details
    bankName: '',
    bankAccountHolderName: '',
    bankAccountNumber: '',
    bankIFSC: '',
    // Document URLs
    foodSafetyCertUrl: '',
    culinaryDiplomaUrl: '',
    // Expansion
    fullName: '',
    contactNumber: '',
    cuisines: '',
    deliveryAvailability: 'Available',
    idProofType: '',
    idProofNumber: '',
    idProofUrl: '',
    countryCode: '+91',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    houseNumber: '',
    streetName: '',
    basePrice: '',
    workType: 'Freelance',
    socialLinks: '',
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState<'profile' | 'availability' | 'legal' | 'documents' | 'address' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [chefId, setChefId] = useState<string | null>(null);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add the actual ref
  const imageInputRef = (el: HTMLInputElement | null) => {
    (window as any)._imageInput = el;
  };

  const triggerImageUpload = () => {
    const input = (window as any)._imageInput;
    if (input) input.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setForm(prev => ({ ...prev, avatarUrl: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const cid = localStorage.getItem('chefId');
    const uid = localStorage.getItem('userId');
    
    if (!cid && !uid) { setLoading(false); return; }

    const profilePromise = cid 
      ? fetchChefProfile(cid) 
      : fetchChefProfileByOwner(uid!);

    profilePromise
      .then(data => {
        setChefId(data.id);
        if (!cid) localStorage.setItem('chefId', data.id);
        // Parse experience string (e.g. "10 Years, 5 Months, 2 Days")
        let y = '0', m = '0', d = '0';
        if (data.experience) {
          const matchY = data.experience.match(/(\d+)\s*Years?/);
          const matchM = data.experience.match(/(\d+)\s*Months?/);
          const matchD = data.experience.match(/(\d+)\s*Days?/);
          if (matchY) y = matchY[1];
          if (matchM) m = matchM[1];
          if (matchD) d = matchD[1];
        }

        setForm({
          name: data.name ?? 'Maria',
          bio: data.bio ?? '',
          specialty: data.specialty ?? '',
          experience: data.experience ?? '',
          expYears: y,
          expMonths: m,
          expDays: d,
          avatarUrl: data.avatarUrl ?? '',
          bankName: data.bankName ?? '',
          bankAccountHolderName: data.bankAccountHolderName ?? '',
          bankAccountNumber: data.bankAccountNumber ?? '',
          bankIFSC: data.bankIFSC ?? '',
          foodSafetyCertUrl: data.foodSafetyCertUrl ?? '',
          culinaryDiplomaUrl: data.culinaryDiplomaUrl ?? '',
          // Expansion
          fullName: data.fullName ?? '',
          contactNumber: data.contactNumber ?? '',
          cuisines: data.cuisines ?? '',
          deliveryAvailability: data.deliveryAvailability ?? 'Available',
          idProofType: data.idProofType ?? '',
          idProofNumber: data.idProofNumber ?? '',
          idProofUrl: data.idProofUrl ?? '',
          countryCode: data.countryCode ?? '+91',
          city: data.city ?? '',
          basePrice: data.basePrice?.toString() ?? '',
          workType: data.workType ?? 'Freelance',
          socialLinks: data.socialLinks ?? '',
          houseNumber: data.houseNumber ?? '',
          streetName: data.streetName ?? '',
          state: data.state ?? '',
          country: data.country ?? '',
          postalCode: data.postalCode ?? '',
        });
        if (data.workingHours) {
          try {
            let parsed;
            if (typeof data.workingHours === 'string') {
              const trimmed = data.workingHours.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                parsed = JSON.parse(trimmed);
              } else {
                parsed = DEFAULT_HOURS;
              }
            } else {
              parsed = data.workingHours;
            }
            setWorkingHours(parsed || DEFAULT_HOURS);
          } catch (e) {
            console.error("Failed to parse working hours", e);
            setWorkingHours(DEFAULT_HOURS);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!chefId) return;
    setSavingStep('profile');
    try {
      const expString = `${form.expYears} Years, ${form.expMonths} Months, ${form.expDays} Days`;
      const payload = { ...form, experience: expString };
      await updateChefProfile(chefId, payload);

      if (form.avatarUrl) {
        try {
          localStorage.setItem('userAvatar', form.avatarUrl);
          window.dispatchEvent(new Event('auth-change'));
        } catch (e) {
          console.warn("Storage quota exceeded, header icon might not update instantly.");
        }
      }

      showToast('success', 'Profile core info saved!');
      setTimeout(() => {
        window.dispatchEvent(new Event('chef-profile-updated'));
      }, 1000);
    } catch (err) {
      showToast('error', 'Failed to save profile');
    } finally {
      setSavingStep(null);
    }
  };

  const handleSaveAddress = async () => {
    if (!chefId) return;
    setSavingStep('address');
    try {
      await updateChefAddress(chefId, form);
      showToast('success', 'Address updated successfully');
      setTimeout(() => {
        window.dispatchEvent(new Event('chef-profile-updated'));
      }, 1000);
    } catch (err) {
      showToast('error', 'Failed to update address');
    } finally {
      setSavingStep(null);
    }
  };

  const handleSaveLegal = async () => {
    if (!chefId) return;
    setSavingStep('legal');
    try {
      await updateChefLegal(chefId, form);
      showToast('success', 'Bank details saved');
      setTimeout(() => {
        window.dispatchEvent(new Event('chef-profile-updated'));
      }, 1000);
    } catch (err) {
      showToast('error', 'Failed to save bank details');
    } finally {
      setSavingStep(null);
    }
  };

  const handleSaveDocuments = async () => {
    if (!chefId) return;
    setSavingStep('documents');
    try {
      await updateChefLegal(chefId, form);
      showToast('success', 'Documents saved successfully');
    } catch (err) {
      showToast('error', 'Failed to save documents');
    } finally {
      setSavingStep(null);
    }
  };

  const handleSaveAvailability = async () => {
    if (!chefId) return;
    setSavingStep('availability');
    try {
      await updateChefProfile(chefId, { workingHours: JSON.stringify(workingHours) });
      showToast('success', 'Availability saved');
      setTimeout(() => {
        window.dispatchEvent(new Event('chef-profile-updated'));
      }, 1000);
    } catch (err) {
      showToast('error', 'Failed to save availability');
    } finally {
      setSavingStep(null);
    }
  };

  const toggleDay = (day: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile & Settings</h1>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chef Profile</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your profile page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={triggerImageUpload}
                >
                  <Avatar className="h-32 w-32 border-4 border-primary/10 group-hover:opacity-80 transition-opacity">
                    <AvatarImage src={form.avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-muted">{form.name?.[0] || 'M'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/40 rounded-full p-3 text-white">
                      <Camera className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">Click the circle to upload a new image</p>
                </div>
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chef-name">Full Name</Label>
                <Input
                  id="chef-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name (Profile Owner)</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Legal full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <div className="flex gap-2">
                    <Popover open={isCountrySelectOpen} onOpenChange={setIsCountrySelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[100px] h-10 px-2 justify-between font-normal text-xs bg-background"
                        >
                          <span className="flex items-center gap-1 overflow-hidden text-[10px]">
                            <span>{countries.find(c => c.code === form.countryCode)?.flag || '🇮🇳'}</span>
                            <span className="truncate">{form.countryCode}</span>
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[180px] p-0 shadow-2xl" align="start">
                        <div className="flex items-center border-b px-2 py-1">
                          <Search className="mr-2 h-3 w-3 shrink-0 opacity-50" />
                          <input
                            className="flex h-7 w-full rounded-md bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground"
                            placeholder="Search..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto no-scrollbar py-1 text-[10px]">
                          {countries.filter(c =>
                            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            c.code.includes(countrySearch)
                          ).length === 0 ? (
                            <div className="py-2 text-center text-muted-foreground">None</div>
                          ) : (
                            countries.filter(c =>
                              c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              c.code.includes(countrySearch)
                            ).map((c) => (
                              <button
                                key={`${c.name}-${c.code}`}
                                type="button"
                                className="flex w-full items-center gap-2 px-2 py-1.5 hover:bg-muted transition-colors text-left"
                                onClick={() => {
                                  setForm({ ...form, countryCode: c.code });
                                  setIsCountrySelectOpen(false);
                                  setCountrySearch('');
                                }}
                              >
                                <span className="text-sm">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-muted-foreground">{c.code}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      className="flex-1"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      placeholder="Phone for coordination"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Starting Price ($)</Label>
                  <Input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <Select value={form.workType} onValueChange={(v) => setForm({ ...form, workType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Social Links (URLs)</Label>
                <Input
                  value={form.socialLinks}
                  onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
                  placeholder="Instagram, LinkedIn, Portfolio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chef-bio">Professional Bio</Label>
                <Textarea
                  id="chef-bio"
                  placeholder="Tell clients about your culinary journey..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chef-specialties">Specialties</Label>
                  <Input
                    id="chef-specialties"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Separate specialties with a comma.</p>
                </div>
                <div className="space-y-2">
                  <Label>Primary Cuisine</Label>
                  <Select value={form.cuisines} onValueChange={(v) => setForm({ ...form, cuisines: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Cuisine" /></SelectTrigger>
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
                  <Label>Experience</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={form.expYears} onValueChange={(v) => setForm({ ...form, expYears: v })}>
                      <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 51 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Yrs</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.expMonths} onValueChange={(v) => setForm({ ...form, expMonths: v })}>
                      <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Mon</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.expDays} onValueChange={(v) => setForm({ ...form, expDays: v })}>
                      <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Days</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={savingStep === 'profile'}>
                {savingStep === 'profile' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Details</CardTitle>
              <CardDescription>
                Provide your full location details for logistics and coordination.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>House Number / Flat</Label>
                  <Input
                    value={form.houseNumber}
                    onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                    placeholder="e.g. #123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street Name</Label>
                  <Input
                    value={form.streetName}
                    onChange={(e) => setForm({ ...form, streetName: e.target.value })}
                    placeholder="e.g. Baker Street"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. London"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Greater London"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g. United Kingdom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="e.g. NW1 6XE"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAddress} disabled={savingStep === 'address'}>
                {savingStep === 'address' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Address
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>
                Set the days and times you are available for bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={workingHours[day]?.active || false}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <span className="text-sm w-24">
                      {workingHours[day]?.active ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAvailability} disabled={savingStep === 'availability'}>
                {savingStep === 'availability' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Availability
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Manage your bank account for payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  value={form.bankAccountHolderName}
                  onChange={(e) => setForm({ ...form, bankAccountHolderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  type="password"
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input
                  value={form.bankIFSC}
                  onChange={(e) => setForm({ ...form, bankIFSC: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveLegal} className="w-full" disabled={savingStep === 'legal'}>
                {savingStep === 'legal' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Bank Details
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Upload your legal and professional certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex justify-between">
                  Food Safety Certificate {form.foodSafetyCertUrl && <span className="text-green-600 text-xs">✅ Uploaded</span>}
                </Label>
                <Input type="file" onChange={(e) => handleDocumentUpload(e, 'foodSafetyCertUrl')} accept="image/*,.pdf" />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between">
                  Culinary Diploma {form.culinaryDiplomaUrl && <span className="text-green-600 text-xs">✅ Uploaded</span>}
                </Label>
                <Input type="file" onChange={(e) => handleDocumentUpload(e, 'culinaryDiplomaUrl')} accept="image/*,.pdf" />
              </div>

              <Separator className="my-2" />
              <Label className="text-sm font-bold">Identity Verification</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">ID Proof Type</Label>
                  <Select value={form.idProofType} onValueChange={(v) => setForm({ ...form, idProofType: v })}>
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
                  <Label className="text-xs">ID Number</Label>
                  <Input
                    className="h-9"
                    value={form.idProofNumber}
                    onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Upload ID Proof</Label>
                  <div className="flex flex-col gap-2">
                    {form.idProofUrl ? (
                      <div className="relative group rounded-lg border overflow-hidden aspect-video flex items-center justify-center bg-muted/30">
                        {form.idProofUrl.toLowerCase().startsWith('data:application/pdf') || form.idProofUrl.toLowerCase().endsWith('.pdf') ? (
                          <div className="text-center">
                            <FileText className="w-10 h-10 text-primary mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">PDF Identity Proof</span>
                          </div>
                        ) : (
                          <img src={form.idProofUrl} className="w-full h-full object-cover" alt="ID Proof" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => document.getElementById('id-proof-input')?.click()}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-dashed h-20"
                        onClick={() => document.getElementById('id-proof-input')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload ID Document
                      </Button>
                    )}
                    <input
                      id="id-proof-input"
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.type === 'application/pdf') {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm(f => ({ ...f, idProofUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          } else {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = await compressImage(reader.result as string);
                              setForm(f => ({ ...f, idProofUrl: base64 }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                      accept="image/*,.pdf"
                    />
                    <p className="text-[10px] text-muted-foreground">PDF or Image documents supported.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveDocuments} className="w-full" variant="outline" disabled={savingStep === 'documents'}>
                {savingStep === 'documents' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Documents
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
