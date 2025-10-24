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
              <CardTitle>Kitchen Profile</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your store page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kitchen-name">Kitchen Name</Label>
                <Input id="kitchen-name" defaultValue="Maria's Kitchen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-bio">Kitchen Bio</Label>
                <Textarea
                  id="kitchen-bio"
                  placeholder="Tell your customers a little bit about your kitchen and your passion for cooking."
                  defaultValue="Bringing authentic, homestyle Italian food from my kitchen to your table. Every dish is made with love and the freshest ingredients, following cherished family recipes."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-address">Address</Label>
                <Input
                  id="kitchen-address"
                  defaultValue="123 Foodie Lane, Flavor Town, 12345"
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
                    <Switch defaultChecked={!['Saturday', 'Sunday'].includes(day)} />
                    <span className="text-sm w-20">{!['Saturday', 'Sunday'].includes(day) ? 'Open' : 'Closed'}</span>
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
                     <Select defaultValue="21:00">
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="20:00">08:00 PM</SelectItem>
                            <SelectItem value="21:00">09:00 PM</SelectItem>
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
                  **** **** **** 1234
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
              <Button variant="destructive">Deactivate My Kitchen</Button>
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
