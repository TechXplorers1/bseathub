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
import { Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { fetchChefProfile, updateChefProfile, updateChefLegal } from '@/services/api';
import { compressImage } from '@/lib/image-utils';

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
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState<'profile' | 'availability' | 'legal' | 'documents' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [chefId, setChefId] = useState<string | null>(null);

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
    const id = localStorage.getItem('chefId');
    if (!id) { setLoading(false); return; }
    setChefId(id);

    fetchChefProfile(id)
      .then(data => {
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
        });
        if (data.workingHours) {
          try {
            setWorkingHours(JSON.parse(data.workingHours));
          } catch (e) {
            console.error("Failed to parse working hours", e);
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
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
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
                    <AvatarFallback className="text-4xl bg-muted">{form.name[0]}</AvatarFallback>
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
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chef-bio">Professional Bio</Label>
                <Textarea
                  id="chef-bio"
                  placeholder="Tell clients about your culinary journey..."
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chef-specialties">Specialties</Label>
                  <Input 
                    id="chef-specialties" 
                    value={form.specialty} 
                    onChange={(e) => setForm({...form, specialty: e.target.value})} 
                  />
                  <p className="text-xs text-muted-foreground">Separate specialties with a comma.</p>
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={form.expYears} onValueChange={(v) => setForm({...form, expYears: v})}>
                      <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 51}, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Yrs</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.expMonths} onValueChange={(v) => setForm({...form, expMonths: v})}>
                      <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Mon</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.expDays} onValueChange={(v) => setForm({...form, expDays: v})}>
                      <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 31}, (_, i) => (
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
                  onChange={(e) => setForm({...form, bankAccountHolderName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input 
                  value={form.bankName} 
                  onChange={(e) => setForm({...form, bankName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input 
                  type="password"
                  value={form.bankAccountNumber} 
                  onChange={(e) => setForm({...form, bankAccountNumber: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input 
                  value={form.bankIFSC} 
                  onChange={(e) => setForm({...form, bankIFSC: e.target.value})} 
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
