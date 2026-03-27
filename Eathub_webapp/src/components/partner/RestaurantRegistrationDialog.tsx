'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Upload, Clock, Phone, User, Building, Landmark, FileText, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// === HELPER FOR SSR SAFETY ===
const isBrowser = typeof window !== 'undefined';

// === SCHEMAS ===
const registrationSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(64)
    .refine((val) => /[A-Z]/.test(val), { message: 'Must contain at least one uppercase letter.' })
    .refine((val) => /[a-z]/.test(val), { message: 'Must contain at least one lowercase letter.' })
    .refine((val) => /\d/.test(val), { message: 'Must contain at least one number.' })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Must contain at least one special character.' }),
  confirmPassword: z.string(),
  // New Fields
  ownerName: z.string().min(2, 'Owner name is required.'),
  mobileNumber: z.string().min(10, 'Valid mobile number is required.'),
  restaurantName: z.string().min(2, 'Restaurant name is required.'),
  restaurantType: z.string().min(1, 'Please select a restaurant type.'),
  operationHoursOpen: z.string().min(1, 'Opening time is required.'),
  operationHoursClose: z.string().min(1, 'Closing time is required.'),
  businessModel: z.enum(['dine-only', 'delivery-only', 'both']),
  legalBusinessName: z.string().min(2, 'Legal business name is required.'),
  businessType: z.string().min(1, 'Please select a business type.'),
  fssaiLicenseNumber: z.string().min(14, 'FSSAI license number must be 14 digits.').max(14),
  fssaiExpiryDate: z.string().min(1, 'FSSAI expiry date is required.'),
  bankName: z.string().min(2, 'Bank name is required.'),
  fssaiDocument: z.string().optional(), // Base64
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

type RegistrationValues = z.infer<typeof registrationSchema>;
type OtpValues = z.infer<typeof otpSchema>;

interface RestaurantRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, type: 'Restaurant') => void;
}

export function RestaurantRegistrationDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: RestaurantRegistrationDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      ownerName: '',
      mobileNumber: '',
      restaurantName: '',
      restaurantType: '',
      operationHoursOpen: '09:00',
      operationHoursClose: '22:00',
      businessModel: 'both',
      legalBusinessName: '',
      businessType: '',
      fssaiLicenseNumber: '',
      fssaiExpiryDate: '',
      bankName: '',
      fssaiDocument: '',
    },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    }
  });

  const handleSendOtp = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8081/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.getValues().email }),
      });

      if (response.ok) {
        setIsOtpSent(true);
        setIsOtpDialogOpen(true);
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpData: OtpValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8081/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.getValues().email,
          otp: otpData.otp,
        }),
      });

      if (response.ok) {
        setIsOtpDialogOpen(false);
        handleFinalSubmit();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    const data = form.getValues();
    const allData = {
      email: data.email,
      password: data.password,
      fullName: data.ownerName,
      contactNumber: data.mobileNumber,
      restaurantName: data.restaurantName,
      restaurantType: data.restaurantType,
      operatingHours: {
        open: data.operationHoursOpen,
        close: data.operationHoursClose,
      },
      businessModel: data.businessModel,
      legalBusinessName: data.legalBusinessName,
      businessType: data.businessType,
      fssaiLicenseNumber: data.fssaiLicenseNumber,
      fssaiExpiryDate: data.fssaiExpiryDate,
      bankName: data.bankName,
      fssaiDocument: data.fssaiDocument,
    };

    onSubmit(allData, 'Restaurant');

    // The parent's onSubmit handles the API call to register
    // but ideally we should wait for it or handle success here.
    // For now, following existing pattern.

    toast({
      title: 'Registration Successful!',
      description: 'Welcome to Eat Hub! Redirecting to home...',
    });

    onOpenChange(false);
    router.push('/');

    setTimeout(() => {
      form.reset();
      otpForm.reset();
      setIsOtpSent(false);
    }, 500);
  };

  const handleGoogleSignIn = () => {
    toast({
      title: 'Google Sign-in',
      description: 'Redirecting to Google...',
    });
    // Placeholder for Google OAuth logic
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl text-center">Restaurant Registration</DialogTitle>
            <DialogDescription className="text-center">
              Enter your details to register as a restaurant partner.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            <Form {...form}>
              <form className="space-y-6 pb-6">
                {/* --- Section: Account & Owner --- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <User size={20} />
                    <span>Account & Owner Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="owner@example.com" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Full Name" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input {...field} className="pl-10" placeholder="10-digit number" disabled={isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* --- Section: Restaurant Info --- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <Building size={20} />
                    <span>Restaurant Information</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Restaurant Brand Name" disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="restaurantType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fine Dining">Fine Dining</SelectItem>
                              <SelectItem value="Cafe">Cafe</SelectItem>
                              <SelectItem value="Fast Food">Fast Food</SelectItem>
                              <SelectItem value="Bakery">Bakery</SelectItem>
                              <SelectItem value="Cloud Kitchen">Cloud Kitchen</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="businessModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dine-only">Dine-only</SelectItem>
                              <SelectItem value="delivery-only">Delivery-only</SelectItem>
                              <SelectItem value="both">Both (Dine-in & Delivery)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="operationHoursOpen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operationHoursClose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Closing Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* --- Section: Legal & Banking --- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <Landmark size={20} />
                    <span>Legal & Banking</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="legalBusinessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Registered Name" disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sole Proprietor">Sole Proprietor</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="Private Limited">Private Limited</SelectItem>
                              <SelectItem value="LLP">LLP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="HDFC, SBI, etc." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fssaiLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FSSAI License No.</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={14} placeholder="14-digit number" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fssaiExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FSSAI Expiry</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fssaiDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food License Document</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition-colors">
                            <input
                              type="file"
                              className="hidden"
                              id="fssai-upload"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    field.onChange(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <label htmlFor="fssai-upload" className="cursor-pointer flex flex-col items-center gap-2">
                              {field.value ? (
                                <>
                                  <CheckCircle2 className="text-green-500" size={32} />
                                  <span className="text-sm font-medium">Document Uploaded</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="text-muted-foreground" size={32} />
                                  <span className="text-sm">Click to upload license</span>
                                </>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    type="button"
                    className="w-full bg-orange-600 hover:bg-orange-700 h-11 text-lg"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Verify Email & Register'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google Sign-in
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to {form.getValues().email}
            </DialogDescription>
          </DialogHeader>

          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        className="text-center text-2xl tracking-[1em] h-14"
                        maxLength={6}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify & Register'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}