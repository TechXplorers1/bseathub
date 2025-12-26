
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
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your store page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input id="restaurant-name" defaultValue="The Golden Spoon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurant-bio">Restaurant Bio</Label>
                <Textarea
                  id="restaurant-bio"
                  placeholder="Tell your customers a little bit about your restaurant..."
                  defaultValue="Serving the finest Italian cuisine with a modern twist. All our ingredients are locally sourced to ensure the freshest taste."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurant-address">Address</Label>
                <Input
                  id="restaurant-address"
                  defaultValue="456 Culinary Ave, Gastronomy City, 54321"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Hours & Availability</CardTitle>
              <CardDescription>
                Set the hours you are open for orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center gap-4">
                    <Switch defaultChecked={!['Sunday'].includes(day)} />
                    <span className="text-sm w-20">{!['Sunday'].includes(day) ? 'Open' : 'Closed'}</span>
                     <Select defaultValue="11:00">
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                        </SelectContent>
                     </Select>
                     <span>to</span>
                     <Select defaultValue="22:00">
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="21:00">09:00 PM</SelectItem>
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button>Save Hours</Button>
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
                  **** **** **** 5678
                </div>
              </div>
              <Button variant="outline">Update Bank Account</Button>
            </CardContent>
          </Card>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Deactivate My Restaurant</Button>
              <p className="text-xs text-muted-foreground mt-2">
                This action is not reversible. All your data will be permanently
                deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
