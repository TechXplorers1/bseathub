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

// === ALL COUNTRIES FOR ADDRESS (from ISO 3166) ===
const addressCountries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Belgium',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Brazil',
  'Bulgaria',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Egypt',
  'Estonia',
  'Ethiopia',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Latvia',
  'Lebanon',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malaysia',
  'Malta',
  'Mexico',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Myanmar',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palestine',
  'Panama',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'Serbia',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Syria',
  'Tanzania',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Zimbabwe',
];

// === STEP SCHEMAS ===
const stepOneSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.'),
    kitchenName: z.string().optional(),
    phoneCountryCode: z.string().min(1, 'Country code is required.'),
    contactNumber: z
      .string()
      .min(6, 'Phone number is too short.')
      .max(15, 'Phone number is too long.')
      .regex(/^[0-9]+$/, 'Phone number must contain only digits.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const stepTwoSchema = z.object({
  country: z.string().min(1, 'Country is required.'),
  state: z.string().min(1, 'State / Province is required.'),
  city: z.string().min(1, 'City is required.'),
  street: z.string().min(5, 'Street / Area is required.'),
  postalCode: z
    .string()
    .min(3, 'Postal / Zip code is required.')
    .regex(/^[A-Za-z0-9\- ]+$/, 'Invalid postal / zip code.'),
  cuisineTypes: z.array(z.string()).min(1, 'Please select at least one cuisine type.'),
  deliveryAvailability: z.enum(['self', 'partner'], {
    required_error: 'Please select a delivery option.',
  }),
});

const stepThreeSchema = z.object({
  hygieneCertificate: z.any().optional(),
  menu: z.any().optional(),
  bankAccount: z.string().min(5, 'Bank account or UPI is required.'),
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
  const [step, setStep] = React.useState(1);

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
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const resetAll = () => {
    formStep1.reset({ phoneCountryCode: '+91' });
    formStep2.reset({ cuisineTypes: [] });
    formStep3.reset();
    setStep(1);
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
      description: 'Thank you for registering. We will review your application and get back to you shortly.',
    });

    onOpenChange(false);
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
                              {countryCallingCodes.map(option => (
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

              {/* Passwords side-by-side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Minimum 8 characters with uppercase, lowercase, number and special character.
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
                              {addressCountries.map(country => (
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
                          <Input {...field} placeholder="e.g. California / Île-de-France" />
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
                      {cuisineOptions.map(option => (
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
                                    onCheckedChange={isChecked => {
                                      if (isChecked) {
                                        field.onChange([...(field.value || []), option]);
                                      } else {
                                        field.onChange(field.value?.filter((v: string) => v !== option));
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
                          <FormLabel className="font-normal">Use Platform Delivery Partner</FormLabel>
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
            <form onSubmit={formStep3.handleSubmit(handleFinalSubmit)} className="space-y-4">
              <FormField
                control={formStep3.control}
                name="hygieneCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hygiene Certificate / ID Proof</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep3.control}
                name="menu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Menu / Dishes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formStep3.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account / UPI</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. yourname@oksbi / 12345678901234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <Button onClick={formStep3.handleSubmit(handleFinalSubmit)}>Submit Application</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}