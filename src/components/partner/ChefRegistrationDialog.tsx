'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';

// === SCHEMAS WITH FULL VALIDATION ===

const stepOneSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Please enter a valid email address.'),

    countryCode: z.string().min(1, 'Country code is required.'),

    contactNumber: z
      .string()
      .min(6, 'Contact number must be at least 6 digits.')
      .max(15, 'Contact number cannot exceed 15 digits.')
      .regex(/^[0-9]*$/, 'Contact number can only contain digits.'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character (!@#$%^&* etc.).'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const cuisineOptions = [
  'Italian',
  'Indian',
  'BBQ',
  'Pastry',
  'French',
  'Mexican',
  'Japanese',
  'Chinese',
];

const workTypeOptions = ['Freelance', 'Full-time', 'Event Bookings'];

const stepTwoSchema = z.object({
  experience: z
    .string({
      required_error: 'Please select your years of experience.',
    })
    .min(1, 'Experience is required.'),
  specialtyCuisines: z
    .array(z.string())
    .min(1, 'Please select at least one cuisine.'),

  availability: z.string().optional(), // extra notes
  availabilityStartTime: z.string().optional(), // "HH:MM"
  availabilityEndTime: z.string().optional(),

  workType: z.array(z.string()).min(1, 'Please select at least one work type.'),
  currentCity: z.string().min(2, 'Current city is required.'),
});

// Step 3 doesn't need strict Zod validation on files (handled in UI),
// but we keep the schema for consistency.
const stepThreeSchema = z.object({
  profilePhoto: z.any().optional(),
  certificates: z.any().optional(),
  portfolio: z.any().optional(),
  socialLinks: z
    .string()
    .url('Please enter a valid URL (e.g., https://instagram.com/yourprofile)')
    .optional()
    .or(z.literal('')),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;
type StepThreeValues = z.infer<typeof stepThreeSchema>;

interface ChefRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, type: 'Chef') => void;
}

export function ChefRegistrationDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: ChefRegistrationDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);

  const formStep1 = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      fullName: '',
      email: '',
      countryCode: '+91',
      contactNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const formStep2 = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      experience: '',
      specialtyCuisines: [],
      availability: '',
      availabilityStartTime: '',
      availabilityEndTime: '',
      workType: [],
      currentCity: '',
    },
  });

  const formStep3 = useForm<StepThreeValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      profilePhoto: undefined,
      certificates: undefined,
      portfolio: undefined,
      socialLinks: '',
    },
  });

  // Reset wizard when dialog is closed externally
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1);
      formStep1.reset();
      formStep2.reset();
      formStep3.reset();
    }
  }, [isOpen, formStep1, formStep2, formStep3]);

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await formStep1.trigger();
    } else if (step === 2) {
      isValid = await formStep2.trigger();
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFinalSubmit = (data: StepThreeValues) => {
    const step1Values = formStep1.getValues();
    const step2Values = formStep2.getValues();

    const allData = {
      ...step1Values,
      // combine code + number for convenience
      contactNumber: `${step1Values.countryCode} ${step1Values.contactNumber}`,
      ...step2Values,
      ...data,
    };

    onSubmit(allData, 'Chef');

    toast({
      title: 'Application Submitted!',
      description:
        "Thank you for registering as a chef. We'll review your profile and be in touch.",
    });

    onOpenChange(false);
  };

  const progressValue = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto px-2 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Chef Registration
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Join our platform to connect with new clients and grow your culinary
            career.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4" />

        {/* STEP 1 */}
        {step === 1 && (
          <Form {...formStep1}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formStep1.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep1.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country code */}
                <FormField
                  control={formStep1.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="+91" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Add/remove codes as you like */}
                          <SelectItem value="+91">🇮🇳 +91</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+44">🇬🇧 +44</SelectItem>
                          <SelectItem value="+61">🇦🇺 +61</SelectItem>
                          <SelectItem value="+971">🇦🇪 +971</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Local phone number */}
                <FormField
                  control={formStep1.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep1.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        8+ chars, with uppercase, lowercase, number, and
                        symbol.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep1.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Form {...formStep2}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formStep2.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-2">0–2 years</SelectItem>
                          <SelectItem value="3-5">3–5 years</SelectItem>
                          <SelectItem value="6-10">6–10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep2.control}
                  name="currentCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Mumbai, Paris, New York"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formStep2.control}
                name="specialtyCuisines"
                render={() => (
                  <FormItem>
                    <FormLabel>Specialty Cuisines</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {cuisineOptions.map((option) => (
                        <FormField
                          key={option}
                          control={formStep2.control}
                          name="specialtyCuisines"
                          render={({ field }) => {
                            const value = field.value || [];
                            const checked = value.includes(option);
                            return (
                              <FormItem className="flex items-start space-x-2 space-y-0 rounded-md border px-2 py-1">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      const isChecked = Boolean(next);
                                      if (isChecked) {
                                        field.onChange([...value, option]);
                                      } else {
                                        field.onChange(
                                          value.filter(
                                            (v: string) => v !== option
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep2.control}
                name="workType"
                render={() => (
                  <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {workTypeOptions.map((option) => (
                        <FormField
                          key={option}
                          control={formStep2.control}
                          name="workType"
                          render={({ field }) => {
                            const value = field.value || [];
                            const checked = value.includes(option);
                            return (
                              <FormItem className="flex items-center space-x-2 space-y-0 rounded-full border px-3 py-1">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      const isChecked = Boolean(next);
                                      if (isChecked) {
                                        field.onChange([...value, option]);
                                      } else {
                                        field.onChange(
                                          value.filter(
                                            (v: string) => v !== option
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability time & notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={formStep2.control}
                  name="availabilityStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formStep2.control}
                  name="availabilityEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available To</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formStep2.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Weekends only, Mon–Fri after 6 PM"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Form {...formStep3}>
            <form
              onSubmit={formStep3.handleSubmit(handleFinalSubmit)}
              className="space-y-4"
            >
              <FormField
                control={formStep3.control}
                name="profilePhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {'Profile Photo (Recommended: JPG/PNG, <5MB)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep3.control}
                name="certificates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Culinary Certificates (Optional, PDF/JPG/PNG)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep3.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Portfolio Photos (Dishes, Events – JPG/PNG)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep3.control}
                name="socialLinks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Links (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/yourprofile"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex w-full justify-between gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                type="button"
                onClick={formStep3.handleSubmit(handleFinalSubmit)}
                className="w-full sm:w-auto"
              >
                Submit Application
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
