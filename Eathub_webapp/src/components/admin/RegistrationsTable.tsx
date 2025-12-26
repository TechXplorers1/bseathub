'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { PendingRegistration } from '@/lib/admin-data';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface RegistrationsTableProps {
  registrations: PendingRegistration[];
}

type RegistrationType = 'All' | 'Restaurant' | 'Home Food' | 'Chef';

export function RegistrationsTable({ registrations: initialRegistrations }: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [activeTab, setActiveTab] = useState<RegistrationType>('All');

  const handleRegistration = (id: string, approved: boolean) => {
    setRegistrations(registrations.filter(r => r.id !== id));
    // Here you would typically call an API to update the backend
    console.log(`Registration ${id} ${approved ? 'approved' : 'rejected'}`);
  };

  const filteredRegistrations = registrations.filter(reg =>
    activeTab === 'All' || reg.type === activeTab
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Pending Registrations</CardTitle>
        <CardDescription>Approve or reject new partners joining the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RegistrationType)}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Restaurant">Restaurants</TabsTrigger>
            <TabsTrigger value="Home Food">Home Food</TabsTrigger>
            <TabsTrigger value="Chef">Chefs</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reg.type}</Badge>
                    </TableCell>
                    <TableCell>{reg.location || 'New York, USA'}</TableCell>
                    <TableCell>{reg.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleRegistration(reg.id, true)}>
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRegistration(reg.id, false)}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
