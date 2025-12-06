'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

const COUNTRIES = [
  { name: 'India', iso2: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', iso2: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', iso2: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', iso2: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Pakistan', iso2: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', iso2: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Germany', iso2: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', iso2: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Spain', iso2: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', iso2: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Brazil', iso2: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', iso2: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Japan', iso2: 'JP', dialCode: '+81', flag: '🇯🇵' },
];

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  const normalizeInput = (input: string) => input.replace(/[\s()-]/g, '');

  const buildE164 = (input: string, countryDial: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('+')) return normalizeInput(trimmed);
    return normalizeInput(`${countryDial}${trimmed}`);
  };

  const formatForDisplay = (candidate: string, countryDial: string) => {
    if (!candidate) return '';
    if (candidate.startsWith(countryDial)) {
      return `${countryDial} ${candidate.slice(countryDial.length)}`;
    }
    if (candidate.startsWith('+')) {
      const m = candidate.match(/^(\+\d{1,3})(\d+)$/);
      if (m) return `${m[1]} ${m[2]}`;
    }
    return candidate;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required.');
      return;
    }

    const candidate = buildE164(phoneNumber, selectedCountry.dialCode);

    try {
      if (!candidate.startsWith('+') || !/^\+[0-9]+$/.test(candidate)) {
        setPhoneError('Please enter a valid phone number.');
        return;
      }

      const isValid = isValidPhoneNumber(candidate);

      if (!isValid) {
        const parsed = parsePhoneNumberFromString(candidate);
        if (parsed) {
          if (!parsed.isPossible()) {
            setPhoneError('Phone number length is invalid for this country.');
            return;
          }
          if (!parsed.isValid()) {
            setPhoneError('Invalid phone number.');
            return;
          }
        }

        setPhoneError('Invalid phone number.');
        return;
      }

      console.log(`Sending OTP to ${candidate}`);
      // STATIC: no real OTP, just move to step 2
      setStep(2);
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneError('Invalid phone number format.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const digits = otp.replace(/\D/g, '');

    // Only requirement: exactly 4 digits (any 4 digits accepted)
    if (digits.length !== 4) {
      setOtpError('Please enter the 4-digit code.');
      return;
    }

    // Build phone candidate to store
    const candidate = buildE164(phoneNumber, selectedCountry.dialCode) || phoneNumber;

    // Try to sign in anonymously (optional, can fail silently)
    if (auth) {
      try {
        await signInAnonymously(auth);
        console.log('Successfully signed in anonymously.');
      } catch (error) {
        console.error('Anonymous sign-in failed, continuing anyway:', error);
      }
    } else {
      console.warn('Auth not initialized; skipping Firebase sign-in');
    }

    // 🔹 STATIC LOGIN FLAG IN LOCALSTORAGE
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eathubLoggedIn', 'true');
        localStorage.setItem('eathubUserPhone', candidate);
      } catch (err) {
        console.warn('Failed to write login state to localStorage', err);
      }
    }

    // Go to home
    router.push('/');
  };

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-gray-100/40 dark:bg-transparent px-4 py-12">
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
              : `We sent a code to ${formatForDisplay(
                  buildE164(phoneNumber, selectedCountry.dialCode),
                  selectedCountry.dialCode
                )}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Phone Number</Label>

                <div className="flex items-center gap-3 w-full">
                  <select
                    value={selectedCountry.iso2}
                    onChange={(e) => {
                      const found = COUNTRIES.find((c) => c.iso2 === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="w-24 h-10 rounded border bg-white px-2 text-sm"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.iso2} value={c.iso2}>
                        {`${c.flag} ${c.dialCode}`}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="tel"
                    className="h-10 flex-1"
                    placeholder="e.g. 9123456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPhoneNumber(v.replace(/[A-Za-z]/g, ''));
                      if (phoneError) setPhoneError(null);
                    }}
                    required
                  />
                </div>

                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={!phoneNumber}>
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
                  inputMode="numeric"
                  maxLength={4}
                  className="h-10"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setOtp(digits);
                    if (otpError) setOtpError(null);
                  }}
                  required
                />
                {otpError && <p className="text-sm text-destructive">{otpError}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={otp.length !== 4}>
                Verify
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-4">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                console.log('Resending OTP...');
              }}
              className="underline text-sm text-muted-foreground hover:text-primary"
            >
              Didn’t receive a code? Resend
            </button>
          )}

          <Link href="/partner" className="font-medium text-primary hover:underline text-sm">
            Become a partner
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
