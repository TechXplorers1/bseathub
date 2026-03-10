'use client';

import * as React from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { AddServiceDialog } from '@/components/dashboard/chef/AddServiceDialog';
import {
  fetchChefServices,
  addChefService,
  updateChefService,
  deleteChefService
} from '@/services/api';

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Retrieve chefId from localStorage
  const [chefId, setChefId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = localStorage.getItem("chefId");
    setChefId(id);
  }, []);

  const refreshServices = React.useCallback(async () => {
    if (!chefId) return;
    try {
      setIsLoading(true);
      const data = await fetchChefServices(chefId);
      setServices(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load services. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [chefId, toast]);

  React.useEffect(() => {
    if (chefId) {
      refreshServices();
    }
  }, [chefId]);

  const handleSaveService = async (formData: any) => {

    if (!chefId) {
      toast({
        title: "Error",
        description: "Chef ID missing. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {

      setIsSaving(true);

      if (editingService) {
        await updateChefService(editingService.id, formData);
      } else {
        await addChefService(chefId, formData);
      }

      toast({
        title: "Success",
        description: "Service saved successfully"
      });

      setIsAddDialogOpen(false);
      setEditingService(null);

      refreshServices();

    } catch (err: any) {

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });

    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteChefService(id);
      toast({ title: "Deleted", description: "Service removed successfully" });
      refreshServices();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (service: any) => {
    try {
      const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';
      await updateChefService(service.id, { ...service, status: newStatus });
      refreshServices();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Services & Menu</CardTitle>
              <CardDescription>Manage the services and sample menus you offer.</CardDescription>
            </div>
            <Button onClick={() => { setEditingService(null); setIsAddDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No services found. Add your first service!
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-sm">
                        <p className="truncate">{service.description}</p>
                      </TableCell>
                      <TableCell>
                        {service.basePrice ? service.basePrice : "Not specified"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.status === 'Active' ? 'secondary' : 'outline'}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setEditingService(service); setIsAddDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(service)}>
                              {service.status === 'Active' ? "Set as Inactive" : "Set as Active"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddServiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
        isLoading={isSaving}
      />
    </div>
  );
}
