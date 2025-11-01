
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

const stepOneSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  contactNumber: z.string().min(10, 'A valid contact number is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const cuisineOptions = ["Italian", "Indian", "BBQ", "Pastry", "French", "Mexican", "Japanese", "Chinese"];
const workTypeOptions = ["Freelance", "Full-time", "Event Bookings"];

const stepTwoSchema = z.object({
  experience: z.string().min(1, 'Experience is required.'),
  specialtyCuisines: z.array(z.string()).min(1, 'Please select at least one cuisine.'),
  availability: z.string().optional(),
  workType: z.array(z.string()).min(1, 'Please select at least one work type.'),
  currentCity: z.string().min(2, 'Current city is required.'),
});

const stepThreeSchema = z.object({
  profilePhoto: z.any().optional(),
  certificates: z.any().optional(),
  portfolio: z.any().optional(),
  socialLinks: z.string().optional(),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;
type StepThreeValues = z.infer<typeof stepThreeSchema>;

interface ChefRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChefRegistrationDialog({
  isOpen,
  onOpenChange,
}: ChefRegistrationDialogProps) {
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

  const onSubmit = (data: any) => {
    const allData = {
      ...formStep1.getValues(),
      ...formStep2.getValues(),
      ...formStep3.getValues(),
    };
    console.log('Chef Registration Data:', allData);
    toast({
      title: 'Application Submitted!',
      description: "Thank you for registering as a chef. We'll review your profile and be in touch.",
    });
    onOpenChange(false);
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
          <DialogTitle className="text-2xl">Chef Registration</DialogTitle>
          <DialogDescription>
            Join our platform to connect with new clients and grow your culinary career.
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
                <FormField control={formStep1.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={formStep1.control} name="contactNumber" render={({ field }) => (
                    <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={formStep1.control} name="currentCity" render={({ field }) => (
                    <FormItem><FormLabel>Current City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={formStep2.control} name="experience" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select years..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="0-2">0-2 years</SelectItem>
                                    <SelectItem value="3-5">3-5 years</SelectItem>
                                    <SelectItem value="6-10">6-10 years</SelectItem>
                                    <SelectItem value="10+">10+ years</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={formStep2.control} name="currentCity" render={({ field }) => (
                        <FormItem><FormLabel>Current City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={formStep2.control} name="specialtyCuisines" render={() => (
                    <FormItem>
                        <FormLabel>Specialty Cuisines</FormLabel>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {cuisineOptions.map((option) => (
                            <FormField key={option} control={formStep2.control} name="specialtyCuisines" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value?.includes(option)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...(field.value || []), option]) : field.onChange(field.value?.filter(v => v !== option))
                                    }}/>
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                                </FormItem>
                            )} />
                         ))}
                         </div>
                         <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={formStep2.control} name="workType" render={() => (
                    <FormItem>
                        <FormLabel>Work Type</FormLabel>
                         <div className="flex gap-4">
                         {workTypeOptions.map((option) => (
                            <FormField key={option} control={formStep2.control} name="workType" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value?.includes(option)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...(field.value || []), option]) : field.onChange(field.value?.filter(v => v !== option))
                                    }}/>
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                                </FormItem>
                            )} />
                         ))}
                         </div>
                         <FormMessage />
                    </FormItem>
                )} />
                <FormField control={formStep2.control} name="availability" render={({ field }) => (
                    <FormItem><FormLabel>Availability (e.g., Weekends, Evenings)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                </form>
            </Form>
        )}

        {step === 3 && (
            <Form {...formStep3}>
                <form onSubmit={formStep3.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={formStep3.control} name="profilePhoto" render={({ field }) => (
                        <FormItem><FormLabel>Profile Photo</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="certificates" render={({ field }) => (
                        <FormItem><FormLabel>Culinary Certificates (Optional)</FormLabel><FormControl><Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={formStep3.control} name="portfolio" render={({ field }) => (
                        <FormItem><FormLabel>Portfolio Photos (Dishes, Events)</FormLabel><FormControl><Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={formStep3.control} name="socialLinks" render={({ field }) => (
                        <FormItem><FormLabel>Social Links (Instagram, LinkedIn, etc.)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </form>
            </Form>
        )}

        <DialogFooter className="pt-4">
            {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
            <div className="flex-grow"></div>
            {step < 3 && <Button onClick={handleNext}>Next</Button>}
            {step === 3 && <Button onClick={formStep3.handleSubmit(onSubmit)}>Submit Application</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
