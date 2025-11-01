
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';

const stepOneSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name is required.'),
  ownerName: z.string().min(2, 'Owner/Manager name is required.'),
  contactNumber: z.string().min(10, 'A valid contact number is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const stepTwoSchema = z.object({
  location: z.string().min(10, 'Restaurant address is required.'),
  restaurantType: z.string({ required_error: 'Please select a restaurant type.' }),
  businessModel: z.enum(['dine-in', 'delivery', 'both'], { required_error: 'Please select a business model.' }),
  operatingHours: z.object({
    open: z.string().min(1, 'Open time is required'),
    close: z.string().min(1, 'Close time is required'),
  }),
});

const stepThreeSchema = z.object({
    logo: z.any().optional(),
    restaurantPhotos: z.any().optional(),
    foodLicense: z.any().optional(),
    menu: z.any().optional(),
    bankAccount: z.string().min(5, 'Bank account or UPI is required.'),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;
type StepThreeValues = z.infer<typeof stepThreeSchema>;

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
    const [step, setStep] = React.useState(1);
  
    const formStep1 = useForm<StepOneValues>({ resolver: zodResolver(stepOneSchema) });
    const formStep2 = useForm<StepTwoValues>({ resolver: zodResolver(stepTwoSchema) });
    const formStep3 = useForm<StepThreeValues>({ resolver: zodResolver(stepThreeSchema) });
  
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
  
    const handleFinalSubmit = (data: any) => {
        const allData = {
          ...formStep1.getValues(),
          ...formStep2.getValues(),
          ...formStep3.getValues(),
        };
        onSubmit(allData, 'Restaurant');
        toast({
          title: 'Registration Submitted!',
          description: "Thank you for registering your restaurant. We will review your application and get back to you shortly.",
        });
        onOpenChange(false);
        // Reset forms after a delay to allow dialog to close
        setTimeout(() => {
          formStep1.reset();
          formStep2.reset();
          formStep3.reset();
          setStep(1);
        }, 500);
      };

    const progressValue = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Restaurant Registration</DialogTitle>
          <DialogDescription>
            Join our platform and showcase your restaurant to a wider audience.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4" />

        {step === 1 && (
            <Form {...formStep1}>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={formStep1.control} name="restaurantName" render={({ field }) => (
                            <FormItem><FormLabel>Restaurant Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="ownerName" render={({ field }) => (
                            <FormItem><FormLabel>Owner/Manager Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="contactNumber" render={({ field }) => (
                            <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </form>
            </Form>
        )}

        {step === 2 && (
            <Form {...formStep2}>
                <form className="space-y-4">
                    <FormField control={formStep2.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Textarea placeholder="Full address of your restaurant" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep2.control} name="restaurantType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Restaurant Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="multi-cuisine">Multi-cuisine</SelectItem>
                                    <SelectItem value="fine-dining">Fine Dining</SelectItem>
                                    <SelectItem value="cafe">Café</SelectItem>
                                    <SelectItem value="bakery">Bakery</SelectItem>
                                    <SelectItem value="biryani">Biryani</SelectItem>
                                    <SelectItem value="fast-food">Fast Food</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={formStep2.control} name="operatingHours" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Operating Hours</FormLabel>
                            <div className="flex items-center gap-4">
                                <Input type="time" {...formStep2.register("operatingHours.open")} />
                                <span>to</span>
                                <Input type="time" {...formStep2.register("operatingHours.close")} />
                            </div>
                             <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={formStep2.control} name="businessModel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Model</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="dine-in" /></FormControl><FormLabel className="font-normal">Dine-in Only</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="delivery" /></FormControl><FormLabel className="font-normal">Delivery Only</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="both" /></FormControl><FormLabel className="font-normal">Both</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>
        )}
        
        {step === 3 && (
             <Form {...formStep3}>
                <form onSubmit={formStep3.handleSubmit(handleFinalSubmit)} className="space-y-4">
                    <FormField control={formStep3.control} name="logo" render={({ field }) => (
                        <FormItem><FormLabel>Upload Logo</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="restaurantPhotos" render={({ field }) => (
                        <FormItem><FormLabel>Upload Restaurant Photos (up to 5)</FormLabel><FormControl><Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="foodLicense" render={({ field }) => (
                        <FormItem><FormLabel>Food License / FSSAI</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="menu" render={({ field }) => (
                        <FormItem><FormLabel>Upload Menu</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="bankAccount" render={({ field }) => (
                        <FormItem><FormLabel>Bank Account / UPI</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </form>
             </Form>
        )}

        <DialogFooter className="pt-4">
            {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
            <div className="flex-grow"></div>
            {step < 3 && <Button onClick={handleNext}>Next</Button>}
            {step === 3 && <Button onClick={formStep3.handleSubmit(handleFinalSubmit)}>Submit Application</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
