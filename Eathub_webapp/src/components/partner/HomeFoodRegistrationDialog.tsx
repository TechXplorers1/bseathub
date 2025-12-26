'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react'; // Added Icons

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

// === CONSTANTS ===
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// === HELPER FOR SSR SAFETY ===
const isBrowser = typeof window !== 'undefined';

// === CUISINE OPTIONS ===
const cuisineOptions = [
  'South Indian',
  'North Indian',
  'Desserts',
  'Italian',
  'Chinese',
  'Mexican',
  'Continental',
];

// === COUNTRY CALLING CODES ===
const countryCallingCodes = [
  { code: '+1', label: 'United States / Canada (+1)' },
  { code: '+7', label: 'Russia / Kazakhstan (+7)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  // ... (Add others as needed)
];

// === ADDRESS COUNTRIES ===
const addressCountries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  // ... (Add others as needed)
];

// === CUSTOM FILE SCHEMA ===
const fileSchema = z.custom<File>((val) => {
  return isBrowser ? val instanceof File : true;
}, "File is required");

// === STEP SCHEMAS ===
const stepOneSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.').max(100),
    kitchenName: z.string().optional(),
    phoneCountryCode: z.string().min(1, 'Country code is required.'),
    contactNumber: z
      .string()
      .min(7, 'Phone number is too short.')
      .max(15, 'Phone number is too long.')
      .regex(/^[0-9]+$/, 'Phone number must contain only digits.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const stepTwoSchema = z.object({
  country: z.string().min(1, 'Country is required.'),
  state: z.string().min(2, 'State / Province is required.'),
  city: z.string().min(2, 'City is required.'),
  street: z.string().min(5, 'Street / Area is required.'),
  postalCode: z
    .string()
    .min(3, 'Postal / Zip code is required.')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Invalid postal / zip code.'),
  cuisineTypes: z.array(z.string()).min(1, 'Please select at least one cuisine type.'),
  specialtyDishes: z.string().optional(),
  deliveryAvailability: z.enum(['self', 'partner'], {
    required_error: 'Please select a delivery option.',
  }),
});

const stepThreeSchema = z.object({
  idProofType: z.enum(['aadhar', 'pan', 'voter-id', 'driving-license'], {
    required_error: 'Please select an ID proof type.',
  }),
  idProofNumber: z.string().min(5, 'ID proof number is required.'),
  hygieneVerified: z.boolean().refine(val => val === true, {
    message: 'You must confirm that you maintain hygiene standards.',
  }),
  hygieneCertificate: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB.')
    .refine(
      (file) => !file || ACCEPTED_DOC_TYPES.includes(file.type),
      'Only JPG, PNG, and PDF formats are accepted.'
    ),
  menu: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB.')
    .refine(
      (file) => !file || ACCEPTED_DOC_TYPES.includes(file.type),
      'Only JPG, PNG, and PDF formats are accepted.'
    ),
  bankAccountHolderName: z.string().min(2, 'Account holder name is required.'),
  bankAccountNumber: z.string().min(9, 'Invalid account number.').max(18),
  bankIFSC: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code.'),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;
type StepThreeValues = z.infer<typeof stepThreeSchema>;

interface HomeFoodRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, type: 'Home Food') => void;
}

export function HomeFoodRegistrationDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: HomeFoodRegistrationDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const formStep1 = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      phoneCountryCode: '+91',
    },
  });

  const formStep2 = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      cuisineTypes: [],
      specialtyDishes: '',
      deliveryAvailability: 'self',
    },
  });

  const formStep3 = useForm<StepThreeValues>({
    resolver: zodResolver(stepThreeSchema),
  });

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

  const resetAll = () => {
    formStep1.reset({ phoneCountryCode: '+91' });
    formStep2.reset({ cuisineTypes: [] });
    formStep3.reset();
    setStep(1);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleFinalSubmit = (data: StepThreeValues) => {
    const allData = {
      ...formStep1.getValues(),
      ...formStep2.getValues(),
      ...data,
      fullPhoneNumber: `${formStep1.getValues().phoneCountryCode}${formStep1.getValues().contactNumber}`,
    };

    onSubmit(allData, 'Home Food');

    toast({
      title: 'Registration Submitted!',
      description:
        'Thank you for registering. We will review your application and get back to you shortly.',
    });

    onOpenChange(false);
    router.push('/home-food-dashboard');
    resetAll();
  };

  const progressValue = (step / 3) * 100;

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetAll();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Home Food Provider Registration</DialogTitle>
          <DialogDescription>
            Join our platform and start selling your delicious homemade food.
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
                        <Input {...field} placeholder="e.g. Priya Sharma" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep1.control}
                  name="kitchenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kitchen/Brand Name (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Amma’s Kitchen" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <FormLabel>Contact Number</FormLabel>
                <div className="flex flex-col sm:flex-row gap-2">
                  <FormField
                    control={formStep1.control}
                    name="phoneCountryCode"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-32">
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCallingCodes.map((option) => (
                                <SelectItem key={option.code} value={option.code}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep1.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="tel"
                            inputMode="numeric"
                            {...field}
                            placeholder="e.g. 9876543210"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={formStep1.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="you@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Passwords with Eye Icon Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formStep1.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                            placeholder="••••••••"
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
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
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...field}
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
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
              <div className="space-y-3">
                <FormLabel className="text-base">Home Address (for pickup)</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep2.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {addressCountries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep2.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. California / Île-de-France"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep2.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Paris / Tokyo / Mumbai" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep2.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode / Zip Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 90210 / 100-0001 / 400001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={formStep2.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street / Area / Place</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="e.g. 123 Baker St, Apartment 4B, near Central Park"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cuisine Types */}
              <FormField
                control={formStep2.control}
                name="cuisineTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Cuisine Types</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cuisineOptions.map((option) => (
                        <FormField
                          key={option}
                          control={formStep2.control}
                          name="cuisineTypes"
                          render={({ field }) => {
                            const checked = field.value?.includes(option);
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      if (isChecked) {
                                        field.onChange([...(field.value || []), option]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((v: string) => v !== option)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
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
                name="specialtyDishes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty Dishes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Grandma's special Lasagna, Homemade Tacos..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Availability */}
              <FormField
                control={formStep2.control}
                name="deliveryAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Availability</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="self" />
                          </FormControl>
                          <FormLabel className="font-normal">Self-delivery</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="partner" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Use Platform Delivery Partner
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Form {...formStep3}>
            <form
              onSubmit={formStep3.handleSubmit(handleFinalSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Compliance & Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep3.control}
                    name="idProofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aadhar">Aadhar Card</SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="voter-id">Voter ID</SelectItem>
                            <SelectItem value="driving-license">Driving License</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="idProofNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your ID number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={formStep3.control}
                  name="hygieneVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-orange-50/50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I confirm that I follow food safety and hygiene standards.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={formStep3.control}
                    name="hygieneCertificate"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Upload ID/Cert (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept={ACCEPTED_DOC_TYPES.join(',')}
                            onChange={(e) =>
                              e.target.files && onChange(e.target.files[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep3.control}
                    name="menu"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Upload Menu (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept={ACCEPTED_DOC_TYPES.join(',')}
                            onChange={(e) =>
                              e.target.files && onChange(e.target.files[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold border-b pb-2">Banking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep3.control}
                    name="bankAccountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name as per Bank" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter account number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="bankIFSC"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. ICIC0001234" className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        )}

        <DialogFooter className="pt-4 flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <div className="flex-grow" />
          {step < 3 && <Button onClick={handleNext}>Next</Button>}
          {step === 3 && (
            <Button onClick={formStep3.handleSubmit(handleFinalSubmit)}>
              Submit Application
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}