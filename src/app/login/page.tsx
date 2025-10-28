'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send an OTP here
    console.log(`Sending OTP to ${phoneNumber}`);
    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd verify the OTP here
    console.log(`Verifying OTP ${otp}`);
    router.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-gray-100/40 dark:bg-transparent px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Flame className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 ? 'Sign In or Sign Up' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Enter your phone number to receive a verification code.'
              : `We sent a code to ${phoneNumber}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {step === 2 && (
              <button
                onClick={() => console.log('Resending OTP...')}
                className="underline hover:text-primary"
              >
                Didn't receive a code? Resend
              </button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
