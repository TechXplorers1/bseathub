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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';
import { parsePhoneNumber } from 'libphonenumber-js';
import { countries } from 'countries-list';

// === HELPER FOR SSR SAFETY ===
const isBrowser = typeof window !== 'undefined';

// === SCHEMAS ===
const stepOneSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name is required.').max(100, 'Name too long.'),
  ownerName: z.string().min(2, 'Owner/Manager name is required.').max(100),
  countryCode: z.string().min(1, 'Country code is required.'),
  contactNumber: z.string()
    .min(1, 'Phone number is required.')
    .refine(
      (val) => {
        if (!val) return false;
        try {
          const phoneNumber = parsePhoneNumber(`+${val}`);
          return phoneNumber ? (phoneNumber.isValid() && phoneNumber.isPossible()) : false;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid phone number.' }
    ),
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

const stepTwoSchema = z.object({
  country: z.string().min(1, 'Country is required.'),
  state: z.string().min(2, 'State/Province is required.').max(100),
  city: z.string().min(2, 'City is required.').max(100),
  street: z.string().min(5, 'Street address is required.').max(200),
  pincode: z.string()
    .min(1, 'Pincode/ZIP is required.')
    .max(10)
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid postal code format.'),
  restaurantType: z.string({ required_error: 'Please select a restaurant type.' }),
  businessModel: z.enum(['dine-in', 'delivery', 'both'], {
    required_error: 'Please select a business model.',
  }),
  deliveryRadius: z.coerce.number().min(0, 'Delivery radius must be 0 or more.').default(5),
  operatingHours: z.object({
    open: z.string().min(1, 'Open time is required'),
    close: z.string().min(1, 'Close time is required'),
  }).refine((data) => data.open < data.close, {
    message: 'Open time must be before close time.',
    path: ['close'],
  }),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const fileSchema = z.custom<File>((val) => {
  return isBrowser ? val instanceof File : true;
}, "File is required");

const stepThreeSchema = z.object({
  // Legal Profile
  legalBusinessName: z.string().min(2, 'Legal business name is required.'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format.').optional().or(z.literal('')),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format.'),
  fssaiLicenseNumber: z.string().min(14, 'FSSAI License must be 14 digits.').max(14),
  fssaiExpiryDate: z.string().min(1, 'FSSAI Expiry date is required.'),
  businessType: z.enum(['sole-proprietorship', 'partnership', 'pvt-ltd', 'llp', 'other'], {
    required_error: 'Please select a business type.',
  }),

  // Bank Account Details
  bankAccountHolderName: z.string().min(2, 'Account holder name is required.'),
  bankAccountNumber: z.string().min(9, 'Invalid account number.').max(18),
  bankIFSC: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code.'),
  bankName: z.string().min(2, 'Bank name is required.'),
});

const stepFourSchema = z.object({
  logo: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: 'Logo must be less than 5MB.',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: 'Logo must be JPG, PNG, or WebP.',
    }),
  restaurantPhotos: z
    .array(fileSchema)
    .optional()
    .refine((files) => !files || files.length <= 5, {
      message: 'You can upload up to 5 photos.',
    })
    .refine((files) => {
      if (!files) return true;
      return files.every((file) => file.size <= MAX_FILE_SIZE);
    }, {
      message: 'Each photo must be less than 5MB.',
    })
    .refine((files) => {
      if (!files) return true;
      return files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, {
      message: 'Photos must be JPG, PNG, or WebP.',
    }),
  foodLicense: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE * 2, {
      message: 'License must be less than 10MB.',
    })
    .refine((file) => !file || ACCEPTED_DOC_TYPES.includes(file.type), {
      message: 'License must be PDF, JPG, or PNG.',
    }),
  menu: fileSchema
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE * 2, {
      message: 'Menu must be less than 10MB.',
    })
    .refine((file) => !file || ACCEPTED_DOC_TYPES.includes(file.type), {
      message: 'Menu must be PDF, JPG, or PNG.',
    }),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;
type StepThreeValues = z.infer<typeof stepThreeSchema>;
type StepFourValues = z.infer<typeof stepFourSchema>;

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
  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const formStep1 = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      countryCode: '91',
    },
  });
  const formStep2 = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      country: 'IN',
      deliveryRadius: 5,
      operatingHours: { open: '09:00', close: '22:00' },
    },
  });
  const formStep3 = useForm<StepThreeValues>({
    resolver: zodResolver(stepThreeSchema),
  });
  const formStep4 = useForm<StepFourValues>({
    resolver: zodResolver(stepFourSchema),
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await formStep1.trigger();
    } else if (step === 2) {
      isValid = await formStep2.trigger();
    } else if (step === 3) {
      isValid = await formStep3.trigger();
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFinalSubmit = () => {
    const allData = {
      ...formStep1.getValues(),
      ...formStep2.getValues(),
      ...formStep3.getValues(),
      ...formStep4.getValues(),
    };
    onSubmit(allData, 'Restaurant');
    toast({
      title: 'Registration Submitted!',
      description: 'Redirecting to your restaurant dashboard...',
    });
    onOpenChange(false);

    router.push('/restaurant-dashboard');

    setTimeout(() => {
      formStep1.reset();
      formStep2.reset();
      formStep3.reset();
      formStep4.reset();
      setStep(1);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 500);
  };

  const progressValue = (step / 4) * 100;

  // Country options (sorted by name)
  const countryOptions = countries
    ? Object.entries(countries)
      .map(([code, data]) => ({
        code,
        name: data.name,
        phone: Array.isArray(data.phone) ? data.phone[0].toString() : String(data.phone),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Restaurant Registration</DialogTitle>
          <DialogDescription>
            Join our platform and showcase your restaurant to a wider audience.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4" />

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <Form {...formStep1}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formStep1.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., The Spice Garden" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formStep1.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner/Manager Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone with Country Code */}
                <div className="md:col-span-2">
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <div className="flex gap-2">
                      <FormField
                        control={formStep1.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value} // This needs to match the value in SelectItem
                            >
                              <FormControl>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Code">
                                    {/* Display custom logic if needed, otherwise SelectValue handles it based on value match */}
                                    {field.value ? `+${field.value}` : "Code"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryOptions.map((country) => (
                                  // The value here is "91", "1", etc.
                                  <SelectItem key={country.code} value={country.phone}>
                                    {country.name} (+{country.phone})
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
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="Enter phone number"
                                className="flex-grow"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormItem>
                </div>

                <FormField
                  control={formStep1.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="you@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password with Toggle */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep1.control}
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
                    control={formStep1.control}
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
            </form>
          </Form>
        )}

        {/* STEP 2: Location & Business */}
        {step === 2 && (
          <Form {...formStep2}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formStep2.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input {...field} placeholder="e.g., Maharashtra, California" />
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
                        <Input {...field} placeholder="e.g., Mumbai, Los Angeles" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formStep2.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode / ZIP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 400001, 90210" />
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
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Building name, street, area, landmark..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep2.control}
                name="restaurantType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multi-cuisine">Multi-cuisine</SelectItem>
                        <SelectItem value="fine-dining">Fine Dining</SelectItem>
                        <SelectItem value="cafe">Café</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="biryani">Biryani</SelectItem>
                        <SelectItem value="fast-food">Fast Food</SelectItem>
                        <SelectItem value="street-food">Street Food</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep2.control}
                name="operatingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Hours</FormLabel>
                    <div className="flex items-center gap-4">
                      <Input
                        type="time"
                        {...formStep2.register('operatingHours.open')}
                        className="w-[120px]"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        {...formStep2.register('operatingHours.close')}
                        className="w-[120px]"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep2.control}
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dine-in" id="dine-in" />
                          </FormControl>
                          <FormLabel htmlFor="dine-in" className="font-normal">
                            Dine-in Only
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="delivery" id="delivery" />
                          </FormControl>
                          <FormLabel htmlFor="delivery" className="font-normal">
                            Delivery Only
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="both" id="both" />
                          </FormControl>
                          <FormLabel htmlFor="both" className="font-normal">
                            Both
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep2.control}
                name="deliveryRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Delivery Radius (km)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="e.g. 10" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">How far are you willing to deliver?</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {/* STEP 3: Legal & Banking */}
        {step === 3 && (
          <Form {...formStep3}>
            <form className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Business Legal Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formStep3.control}
                    name="legalBusinessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="as per PAN/GST" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="pvt-ltd">Private Limited</SelectItem>
                            <SelectItem value="llp">LLP</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABCDE1234F" className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="22AAAAA0000A1Z5" className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="fssaiLicenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FSSAI License Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="14-digit number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formStep3.control}
                    name="fssaiExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FSSAI Expiry Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold border-b pb-2">Bank Account for Payouts</h3>
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
                          <Input {...field} placeholder="e.g. HDFC Bank" />
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
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="HDFC0001234" className="uppercase" />
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

        {/* STEP 4: Documents */}
        {step === 4 && (
          <Form {...formStep4}>
            <form onSubmit={formStep4.handleSubmit(handleFinalSubmit)} className="space-y-4">
              <FormField
                control={formStep4.control}
                name="logo"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Logo (PNG, JPG, WebP ≤ 5MB)</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(e) => e.target.files && onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formStep4.control}
                name="restaurantPhotos"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Restaurant Photos (up to 5, ≤ 5MB each)</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        multiple
                        onChange={(e) => e.target.files && onChange(Array.from(e.target.files))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formStep4.control}
                name="foodLicense"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Food License / FSSAI (PDF, JPG, PNG ≤ 10MB)</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept={ACCEPTED_DOC_TYPES.join(',')}
                        onChange={(e) => e.target.files && onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formStep4.control}
                name="menu"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Upload Menu (PDF, JPG, PNG ≤ 10MB)</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept={ACCEPTED_DOC_TYPES.join(',')}
                        onChange={(e) => e.target.files && onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter className="pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <div className="flex-grow"></div>
          {step < 4 && <Button onClick={handleNext}>Next</Button>}
          {step === 4 && (
            <Button onClick={formStep4.handleSubmit(handleFinalSubmit)}>
              Submit Application
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}