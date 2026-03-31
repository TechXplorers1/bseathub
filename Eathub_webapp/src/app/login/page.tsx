'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { login as apiLogin, sendOtp, verifyOtp, AUTH_URL } from '@/services/api';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [open, setOpen] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Registration States
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');



  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiLogin({ email, password });

      // Safely store user details in localStorage
      try {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('eathubLoggedIn', 'true');

        if (response.providerId) {
          if (response.role === 'RESTAURANT') {
            localStorage.setItem('restaurantId', response.providerId);
          } else if (response.role === 'HOMEFOOD') {
            localStorage.setItem('homeFoodId', response.providerId);
          } else if (response.role === 'CHEF') {
            localStorage.setItem('chefId', response.providerId);
          }
        }

        // Handle userAvatar separately because it can be very large (Base64)
        if (response.avatarUrl) {
          try {
            // If it's a small string (like a URL or small Base64), store directly
            if (response.avatarUrl.length < 50000) { // < 50KB
              localStorage.setItem('userAvatar', response.avatarUrl);
            } else {
              // For large avatars, we skip storing it in localStorage to avoid QuotaExceededError
              console.warn("Avatar too large for localStorage, skipping storage.");
            }
          } catch (e) {
            console.error("Failed to store userAvatar in localStorage:", e);
          }
        }
      } catch (storageError) {
        console.error("LocalStorage error during login:", storageError);
        // Ensure critical item 'token' is there if possible
        try { localStorage.setItem('token', response.token); } catch (e) {}
      }

      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.email}!`,
      });

      setOpen(false);
      router.push('/');

    } catch (error: any) {
      // If it's a QuotaExceededError from localStorage that leaked out
      if (error.name === 'QuotaExceededError' || error.message?.includes('exceeded the quota')) {
        toast({
          variant: "destructive",
          title: "Storage Limit Reached",
          description: "Your browser storage is full. Some profile details might not be saved locally, but you can still login.",
        });
        setOpen(false);
        router.push('/');
        return;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        await sendOtp(regForm.email);
        setOtpSent(true);
        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${regForm.email}`,
        });
      } else {
        // Step 2: Verify OTP
        const verification = await verifyOtp(regForm.email, otp);
        if (!verification.success) {
          throw new Error(verification.message || "Invalid OTP");
        }

        // Proceed to complete registration
        const payload = {
          name: `${regForm.firstName} ${regForm.lastName}`,
          firstName: regForm.firstName,
          lastName: regForm.lastName,
          email: regForm.email,
          password: regForm.password,
          mobileNumber: regForm.mobile,
          houseNumber: "",
          street: "",
          area: "",
          city: "",
          state: "",
          country: "India"
        };

        const res = await fetch(`${AUTH_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Registration failed');
        }

        toast({
          title: "Registration Successful!",
          description: "You can now log in with your account.",
        });

        setIsRegistering(false);
        setOtpSent(false);
        setOtp('');
        setEmail(regForm.email); // Pre-fill login email
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!loading) {
          setOpen(isOpen);
          if (!isOpen) router.push('/');
        }
      }}
    >
      <DialogContent className={`${isRegistering ? 'max-w-[95vw] sm:max-w-2xl' : 'max-w-[calc(100vw-2rem)] sm:max-w-[425px]'} p-0 overflow-y-auto border-none shadow-2xl transition-all duration-300 max-h-[90vh] no-scrollbar`}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-primary/5 pb-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-full text-primary">
                {isRegistering ? <UserPlus size={24} className="sm:w-7 sm:h-7" /> : <LogIn size={24} className="sm:w-7 sm:h-7" />}
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {isRegistering ? 'User Registration' : 'Welcome Back'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {isRegistering
                ? 'Join Eat Hub and enjoy fresh flavors delivered to your door'
                : 'Enter your credentials to access your account'}
            </DialogDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {!isRegistering ? (
              // LOGIN FORM
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@eathub.com"
                        className="bg-background pl-10 h-10 sm:h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background pl-10 pr-10 h-10 sm:h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 sm:h-11 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? 'Processing...' : 'Login'}
                </Button>

                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                  <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground font-medium">New here?</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full h-10 sm:h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm sm:text-base"
                    onClick={() => setIsRegistering(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> User Registration
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 sm:h-11 border-primary text-primary hover:bg-primary/5 font-bold text-sm sm:text-base"
                    onClick={() => router.push('/partner')}
                  >
                    Become a Partner
                  </Button>
                </div>
              </form>
            ) : (
              // COMPREHENSIVE REGISTRATION FORM
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-6 sm:space-y-8 pb-4">
                  {/* Contact Information Section */}
                  <div>
                    <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-3 sm:mb-4">
                      <User size={14} className="sm:w-4 sm:h-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground">First Name</Label>
                        <Input name="firstName" value={regForm.firstName} onChange={handleRegChange} placeholder="John" className="h-9 sm:h-10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Last Name</Label>
                        <Input name="lastName" value={regForm.lastName} onChange={handleRegChange} placeholder="Doe" className="h-9 sm:h-10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Email Address</Label>
                        <Input type="email" name="email" value={regForm.email} onChange={handleRegChange} placeholder="john@example.com" className="h-9 sm:h-10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={regForm.password}
                            onChange={handleRegChange}
                            placeholder="••••••••"
                            className="h-9 sm:h-10 pr-9"
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input name="mobile" value={regForm.mobile} onChange={handleRegChange} placeholder="9876543210" className="pl-9 h-9 sm:h-10" required />
                        </div>
                      </div>

                      {otpSent && (
                        <div className="sm:col-span-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                          <Label className="text-[10px] sm:text-xs font-bold text-primary uppercase ml-1">Enter Verification Code (OTP)</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              className="pl-9 h-10 border-primary/30 focus:border-primary"
                              maxLength={6}
                              required
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground ml-1">Check your email for the code.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 pt-4">
                  <Button type="submit" className="w-full h-11 sm:h-12 text-base sm:text-lg font-bold shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? 'Processing...' : (otpSent ? 'Verify & Complete Registration' : 'Send OTP')}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-9 sm:h-10 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm"
                    onClick={() => setIsRegistering(false)}
                  >
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back to Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
