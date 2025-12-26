'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

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

// === CONSTANTS ===
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// === HELPER FOR SSR SAFETY ===
const isBrowser = typeof window !== 'undefined';

// === DATA: CUISINE OPTIONS ===
const cuisineOptions = [
  'Italian',
  'Indian',
  'BBQ',
  'Pastry',
  'French',
  'Mexican',
  'Japanese',
  'Chinese',
  'Mediterranean',
  'Thai',
];

// === DATA: WORK TYPES ===
const workTypeOptions = ['Freelance', 'Full-time', 'Event Bookings', 'Private Chef'];

// === DATA: COUNTRY CALLING CODES ===
const countryCallingCodes = [
  { code: '+1', label: 'United States / Canada (+1)' },
  { code: '+7', label: 'Russia / Kazakhstan (+7)' },
  { code: '+20', label: 'Egypt (+20)' },
  { code: '+27', label: 'South Africa (+27)' },
  { code: '+30', label: 'Greece (+30)' },
  { code: '+31', label: 'Netherlands (+31)' },
  { code: '+32', label: 'Belgium (+32)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+34', label: 'Spain (+34)' },
  { code: '+36', label: 'Hungary (+36)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+40', label: 'Romania (+40)' },
  { code: '+41', label: 'Switzerland (+41)' },
  { code: '+43', label: 'Austria (+43)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+45', label: 'Denmark (+45)' },
  { code: '+46', label: 'Sweden (+46)' },
  { code: '+47', label: 'Norway (+47)' },
  { code: '+48', label: 'Poland (+48)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+51', label: 'Peru (+51)' },
  { code: '+52', label: 'Mexico (+52)' },
  { code: '+53', label: 'Cuba (+53)' },
  { code: '+54', label: 'Argentina (+54)' },
  { code: '+55', label: 'Brazil (+55)' },
  { code: '+56', label: 'Chile (+56)' },
  { code: '+57', label: 'Colombia (+57)' },
  { code: '+58', label: 'Venezuela (+58)' },
  { code: '+60', label: 'Malaysia (+60)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+62', label: 'Indonesia (+62)' },
  { code: '+63', label: 'Philippines (+63)' },
  { code: '+64', label: 'New Zealand (+64)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+66', label: 'Thailand (+66)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+82', label: 'South Korea (+82)' },
  { code: '+84', label: 'Vietnam (+84)' },
  { code: '+86', label: 'China (+86)' },
  { code: '+90', label: 'Turkey (+90)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+92', label: 'Pakistan (+92)' },
  { code: '+93', label: 'Afghanistan (+93)' },
  { code: '+94', label: 'Sri Lanka (+94)' },
  { code: '+95', label: 'Myanmar (+95)' },
  { code: '+98', label: 'Iran (+98)' },
  { code: '+211', label: 'South Sudan (+211)' },
  { code: '+212', label: 'Morocco (+212)' },
  { code: '+213', label: 'Algeria (+213)' },
  { code: '+216', label: 'Tunisia (+216)' },
  { code: '+218', label: 'Libya (+218)' },
  { code: '+220', label: 'Gambia (+220)' },
  { code: '+221', label: 'Senegal (+221)' },
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+251', label: 'Ethiopia (+251)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+255', label: 'Tanzania (+255)' },
  { code: '+256', label: 'Uganda (+256)' },
  { code: '+263', label: 'Zimbabwe (+263)' },
  { code: '+351', label: 'Portugal (+351)' },
  { code: '+352', label: 'Luxembourg (+352)' },
  { code: '+353', label: 'Ireland (+353)' },
  { code: '+354', label: 'Iceland (+354)' },
  { code: '+355', label: 'Albania (+355)' },
  { code: '+356', label: 'Malta (+356)' },
  { code: '+357', label: 'Cyprus (+357)' },
  { code: '+358', label: 'Finland (+358)' },
  { code: '+380', label: 'Ukraine (+380)' },
  { code: '+381', label: 'Serbia (+381)' },
  { code: '+382', label: 'Montenegro (+382)' },
  { code: '+385', label: 'Croatia (+385)' },
  { code: '+386', label: 'Slovenia (+386)' },
  { code: '+387', label: 'Bosnia and Herzegovina (+387)' },
  { code: '+389', label: 'North Macedonia (+389)' },
  { code: '+420', label: 'Czech Republic (+420)' },
  { code: '+421', label: 'Slovakia (+421)' },
  { code: '+852', label: 'Hong Kong (+852)' },
  { code: '+853', label: 'Macau (+853)' },
  { code: '+855', label: 'Cambodia (+855)' },
  { code: '+856', label: 'Laos (+856)' },
  { code: '+880', label: 'Bangladesh (+880)' },
  { code: '+971', label: 'United Arab Emirates (+971)' },
  { code: '+972', label: 'Israel (+972)' },
  { code: '+973', label: 'Bahrain (+973)' },
  { code: '+974', label: 'Qatar (+974)' },
  { code: '+975', label: 'Bhutan (+975)' },
  { code: '+976', label: 'Mongolia (+976)' },
  { code: '+977', label: 'Nepal (+977)' },
  { code: '+994', label: 'Azerbaijan (+994)' },
];

// === CUSTOM FILE SCHEMA ===
const fileSchema = z.custom<File>((val) => {
  return isBrowser ? val instanceof File : true;
}, "File is required");

// === SCHEMAS ===
const stepOneSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.').max(100),
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
  experience: z.string({ required_error: 'Experience is required.' }).min(1, 'Select experience.'),
  specialtyCuisines: z.array(z.string()).min(1, 'Select at least one cuisine.'),
  availability: z.string().optional(),
  availabilityStartTime: z.string().optional(),
  availabilityEndTime: z.string().optional(),
  workType: z.array(z.string()).min(1, 'Select at least one work type.'),
  currentCity: z.string().min(2, 'Current city is required.'),
  basePrice: z.coerce.number().min(1, 'Base price is required.'),
});

const stepThreeSchema = z.object({
  profilePhoto: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB.')
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG and WebP images are accepted.'
    ),
  idProofType: z.enum(['aadhar', 'pan', 'passport', 'driving-license'], {
    required_error: 'Please select an ID proof type.',
  }),
  idProofNumber: z.string().min(5, 'ID proof number is required.'),
  certificates: z.any().optional(),
  portfolio: z.any().optional(),
  socialLinks: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Please enter a valid URL (e.g. https://instagram.com/user)",
    }),

  // Banking Details for Payouts
  bankAccountHolderName: z.string().min(2, 'Account holder name is required.'),
  bankAccountNumber: z.string().min(9, 'Invalid account number.').max(18),
  bankIFSC: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code.'),
  bankName: z.string().min(2, 'Bank name is required.'),
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
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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
      basePrice: 0,
    },
  });

  const formStep3 = useForm<StepThreeValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      socialLinks: '',
    },
  });

  // Reset logic
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setShowPassword(false);
      setShowConfirmPassword(false);
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
      contactNumber: `${step1Values.countryCode} ${step1Values.contactNumber}`,
      ...step2Values,
      ...data,
    };

    onSubmit(allData, 'Chef');

    toast({
      title: 'Application Submitted!',
      description: "Redirecting to your chef dashboard...",
    });

    onOpenChange(false);
    // Redirect logic
    router.push('/chef-dashboard');
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
            Join our platform to connect with new clients and grow your culinary career.
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
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country Code & Phone */}
                <div className="flex flex-col sm:flex-row gap-2 md:col-span-2">
                  <FormField
                    control={formStep1.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-[140px]">
                        <FormLabel>Country Code</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="+91" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countryCallingCodes.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep1.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Fields with Icons */}
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
                            placeholder="••••••••"
                            {...field}
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
                        Min 8 chars, uppercase, lowercase, number, & symbol.
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
                            placeholder="••••••••"
                            {...field}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        <Input placeholder="e.g. Mumbai, New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep2.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 50" {...field} />
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
                              <FormItem className="flex items-start space-x-2 space-y-0 rounded-md border px-2 py-1 hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      if (next) {
                                        field.onChange([...value, option]);
                                      } else {
                                        field.onChange(value.filter((v: string) => v !== option));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm cursor-pointer w-full">
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
                              <FormItem className="flex items-center space-x-2 space-y-0 rounded-full border px-3 py-1 hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      if (next) {
                                        field.onChange([...value, option]);
                                      } else {
                                        field.onChange(value.filter((v: string) => v !== option));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm cursor-pointer">
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Weekends only" {...field} />
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
            <form onSubmit={formStep3.handleSubmit(handleFinalSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Identity & Compliance</h3>
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
                            <SelectItem value="passport">Passport</SelectItem>
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
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Profile & Social</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep3.control}
                    name="profilePhoto"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Profile Photo (JPG/PNG, Max 5MB)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            onChange={(e) => onChange(e.target.files && e.target.files[0])}
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
                        <FormLabel>Social Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourprofile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Banking Details for Payouts</h3>
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
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Chase Bank" />
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
                      <FormItem>
                        <FormLabel>IFSC / BIC Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABCD0123456" className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Documents (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep3.control}
                    name="certificates"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Certificates (PDF/Images)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            accept={ACCEPTED_DOC_TYPES.join(',')}
                            onChange={(e) => onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formStep3.control}
                    name="portfolio"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Portfolio (Images)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            onChange={(e) => onChange(e.target.files)}
                          />
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

        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex w-full justify-between gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto">
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
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