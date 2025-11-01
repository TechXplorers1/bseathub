
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
  DialogClose,
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
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';

const stepOneSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  kitchenName: z.string().optional(),
  contactNumber: z.string().min(10, 'A valid contact number is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const stepTwoSchema = z.object({
  homeAddress: z.string().min(10, 'Home address is required.'),
  cuisineTypes: z.array(z.string()).min(1, 'Please select at least one cuisine type.'),
  deliveryAvailability: z.enum(['self', 'partner'], { required_error: 'Please select a delivery option.' }),
});

const stepThreeSchema = z.object({
    hygieneCertificate: z.any().optional(),
    menu: z.any().optional(),
    bankAccount: z.string().min(5, 'Bank account or UPI is required.'),
});

const cuisineOptions = ["South Indian", "North Indian", "Desserts", "Italian", "Chinese", "Mexican", "Continental"];

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
      onSubmit(allData, 'Home Food');
      toast({
        title: 'Registration Submitted!',
        description: "Thank you for registering. We will review your application and get back to you shortly.",
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
          <DialogTitle className="text-2xl">Home Food Provider Registration</DialogTitle>
          <DialogDescription>
            Join our platform and start selling your delicious homemade food.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4" />

        {step === 1 && (
            <Form {...formStep1}>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={formStep1.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={formStep1.control} name="kitchenName" render={({ field }) => (
                            <FormItem><FormLabel>Kitchen/Brand Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                     <FormField control={formStep2.control} name="homeAddress" render={({ field }) => (
                        <FormItem><FormLabel>Home Address (for pickup)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={formStep2.control} name="cuisineTypes" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cuisine Types</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {cuisineOptions.map(option => (
                                    <FormField
                                        key={option}
                                        control={formStep2.control}
                                        name="cuisineTypes"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(option)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), option])
                                                            : field.onChange(field.value?.filter(value => value !== option))
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{option}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <FormField control={formStep2.control} name="deliveryAvailability" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery Availability</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="self" /></FormControl>
                                        <FormLabel className="font-normal">Self-delivery</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="partner" /></FormControl>
                                        <FormLabel className="font-normal">Use Platform Delivery Partner</FormLabel>
                                    </FormItem>
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
                    <FormField control={formStep3.control} name="hygieneCertificate" render={({ field }) => (
                        <FormItem><FormLabel>Hygiene Certificate / ID Proof</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="menu" render={({ field }) => (
                        <FormItem><FormLabel>Upload Menu / Dishes (Optional)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
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
