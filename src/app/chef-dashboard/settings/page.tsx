
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile & Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chef Profile</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your profile page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chef-name">Full Name</Label>
                <Input id="chef-name" defaultValue="Maria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chef-bio">Professional Bio</Label>
                <Textarea
                  id="chef-bio"
                  placeholder="Tell clients about your culinary journey, experience, and passion..."
                  defaultValue="World-renowned chef with multiple Michelin stars. Known for a fiery passion for perfection and creating unforgettable dining experiences. Specializing in modern European cuisine."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chef-specialties">Specialties</Label>
                <Input id="chef-specialties" placeholder="e.g., French, Italian, Pastry" defaultValue="Modern European, French, British" />
                 <p className="text-xs text-muted-foreground">Separate specialties with a comma.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>
                Set the days and times you are available for bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center gap-4">
                    <Switch defaultChecked={!['Monday'].includes(day)} />
                    <span className="text-sm w-24">{!['Monday'].includes(day) ? 'Available' : 'Unavailable'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button>Save Availability</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Manage your bank account for payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <div className="p-3 rounded-md border text-sm text-muted-foreground">
                  **** **** **** 9876
                </div>
              </div>
              <Button variant="outline">Update Bank Account</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Upload certificates or other relevant documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="food-safety-cert">Food Safety Certificate</Label>
                    <Input id="food-safety-cert" type="file" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="culinary-diploma">Culinary Diploma</Label>
                    <Input id="culinary-diploma" type="file" />
                </div>
                <Button>Upload Files</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
