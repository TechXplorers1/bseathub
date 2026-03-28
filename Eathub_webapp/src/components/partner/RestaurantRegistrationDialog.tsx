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
import { Eye, EyeOff, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendOtp, verifyOtp } from '@/services/api';

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
  onSubmit: (data: any, type: 'Restaurant') => Promise<void> | void;
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
    },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    }
  });

  const handleFinalSubmit = async () => {
    const data = form.getValues();
    const allData = {
      email: data.email,
      password: data.password,
    };

    try {
      await onSubmit(allData, 'Restaurant');

      toast({
        title: 'Registration Successful!',
        description: 'Welcome to Eat Hub! Please sign in with your account.',
      });

      onOpenChange(false);
      router.push('/login');

      setTimeout(() => {
        form.reset();
        otpForm.reset();
        setIsOtpSent(false);
      }, 500);
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  const handleSendOtp = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await sendOtp(form.getValues().email);
      setIsOtpSent(true);
      setIsOtpDialogOpen(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
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
      await verifyOtp(form.getValues().email, otpData.otp);
      setIsOtpDialogOpen(false);
      handleFinalSubmit();
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

  const handleGoogleSignIn = () => {
    toast({
      title: 'Google Sign-in',
      description: 'Redirecting to Google...',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 text-foreground overflow-hidden">
          <ScrollArea className="flex-1 w-full">
            <div className="p-6 space-y-6 pb-12">
              <DialogHeader>
                <DialogTitle className="text-xl text-center font-bold">Restaurant Registration</DialogTitle>
                <DialogDescription className="text-center text-sm">
                  Quick setup. Start your cloud kitchen or restaurant journey.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                      <User size={18} />
                      <span>Account Details</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="owner@example.com" disabled={isSubmitting} className="h-9 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className="h-9 text-sm"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className="h-9 text-sm"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>

              <div className="space-y-4 pt-2">
                <Button
                  type="button"
                  className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-base font-semibold"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Send OTP & Register'}
                </Button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 text-sm font-medium shadow-sm hover:bg-muted"
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
                  Sign up with Google
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Verify Your Email</DialogTitle>
            <DialogDescription className="text-sm">
              We've sent a 6-digit code to <span className="font-semibold">{form.getValues().email}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6 py-2">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        className="text-center text-2xl font-bold tracking-[0.5em] h-14 border-2 focus-visible:ring-orange-500"
                        maxLength={6}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage className="text-center text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 text-base bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify & Register'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}