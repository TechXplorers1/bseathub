'use client';

import React, { useState, useEffect } from 'react';
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

// --- Firebase Imports ---
import { useAuth } from '@/firebase'; 
import { db } from '@/firebase'; 
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 

import {
  isValidPhoneNumber,
} from 'libphonenumber-js';

const COUNTRIES = [
  { name: 'India', iso2: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', iso2: 'US', dialCode: '+1', flag: '🇺🇸' },
  // ... other countries
];

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);

  const router = useRouter();
  const auth = useAuth();

  // --- 1. Setup Recaptcha (Race Condition Fixed) ---
  useEffect(() => {
    if (!auth || step !== 1) return;

    let isMounted = true; // Track if the component is still valid

    const initRecaptcha = async () => {
      // A. Nuclear DOM Cleanup (Run immediately)
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';

      // B. Cleanup old Verifier
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
        window.recaptchaVerifier = null;
      }

      try {
        // C. Create new Verifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': (response: any) => {
            if (isMounted) {
              console.log("Recaptcha solved");
              setRecaptchaSolved(true);
              setPhoneError(null);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              console.log("Recaptcha expired");
              setRecaptchaSolved(false);
              setPhoneError("Recaptcha expired. Please verify again.");
            }
          }
        });

        // D. Render (Async)
        await verifier.render();

        // E. Check if we were cancelled while rendering (Strict Mode fix)
        if (!isMounted) {
          verifier.clear(); // Destroy myself if I am no longer needed
          return;
        }

        window.recaptchaVerifier = verifier;

      } catch (error) {
        console.error("Recaptcha Setup Error:", error);
      }
    };

    initRecaptcha();

    // Cleanup function (Runs when you leave the page or React refreshes)
    return () => {
      isMounted = false; // Cancel any pending renders
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
        window.recaptchaVerifier = null;
      }
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';
    };
  }, [auth, step]);

  const normalizeInput = (input: string) => input.replace(/[\s()-]/g, '');

  const buildE164 = (input: string, countryDial: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('+')) return normalizeInput(trimmed);
    return normalizeInput(`${countryDial}${trimmed}`);
  };

  // --- 2. Send OTP Logic ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    // Basic Validation
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required.');
      return;
    }
    
    // Ensure Recaptcha is solved
    if (!recaptchaSolved) {
      setPhoneError('Please complete the check above.');
      return;
    }

    setLoading(true);

    const candidate = buildE164(phoneNumber, selectedCountry.dialCode);

    try {
      if (!candidate.startsWith('+') || !/^\+[0-9]+$/.test(candidate)) {
        throw new Error('Please enter a valid phone number.');
      }
      if (!isValidPhoneNumber(candidate)) {
         throw new Error('Invalid phone number.');
      }

      console.log(`Sending OTP to ${candidate}`);
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, candidate, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep(2);
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setPhoneError(error.message || 'Failed to send OTP. Try again.');
      
      // Reset Recaptcha on error so they can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        setRecaptchaSolved(false);
        // Re-render it safely
        const container = document.getElementById('recaptcha-container');
        if(container) container.innerHTML = ''; // Ensure clear before re-render
        
        // Wait a tick before re-initializing (simulated via window reload or simple clear)
        // For simplicity in this flow, we just ask user to refresh or we could re-run init.
        // But usually, clearing is enough to force a re-render from the user side.
        setPhoneError('Verification failed. Please refresh the page and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Verify OTP Logic ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setLoading(true);

    const digits = otp.replace(/\D/g, '');
    if (digits.length !== 6) { 
      setOtpError('Please enter the 6-digit code.');
      setLoading(false);
      return;
    }

    if (!confirmationResult) {
      setOtpError('Session expired. Please restart.');
      setStep(1);
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Save to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        phoneNumber: user.phoneNumber,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp() 
      }, { merge: true });

      // Redirect
      router.push('/');

    } catch (error) {
      console.error('OTP Verification failed:', error);
      setOtpError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
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
              : `We sent a code to ${phoneNumber}`}
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
                    placeholder="e.g. 9618825281"
                    value={phoneNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPhoneNumber(v.replace(/[A-Za-z]/g, ''));
                      if (phoneError) setPhoneError(null);
                    }}
                    required
                  />
                </div>
              </div>

              {/* --- RECAPTCHA INSIDE THE FORM --- */}
              <div className="flex justify-center my-4 min-h-[78px]">
                 <div id="recaptcha-container"></div>
              </div>

              {phoneError && <p className="text-sm text-destructive text-center">{phoneError}</p>}

              <Button type="submit" className="w-full" disabled={!phoneNumber || !recaptchaSolved || loading}>
                {loading ? 'Sending...' : 'Continue'}
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
                  maxLength={6} 
                  className="h-10"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(digits);
                    if (otpError) setOtpError(null);
                  }}
                  required
                />
                {otpError && <p className="text-sm text-destructive">{otpError}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={otp.length < 6 || loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-4">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1); 
                setOtp('');
                setRecaptchaSolved(false);
              }}
              className="underline text-sm text-muted-foreground hover:text-primary"
            >
              Wrong number? Go back
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

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}