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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { MoreHorizontal, PlusCircle, Loader2, Utensils, Star, ConciergeBell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = React.useState('all');
  const [formMode, setFormMode] = React.useState<'service' | 'menu' | 'signature'>('menu');

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

  const categorizedServices = React.useMemo(() => {
    return {
      all: services,
      services: services.filter(s => s.category === 'Service'),
      menu: services.filter(s => s.category !== 'Service' && !s.isSignature),
      signature: services.filter(s => s.isSignature)
    };
  }, [services]);

  const handleAddClick = (mode: 'service' | 'menu' | 'signature') => {
    setFormMode(mode);
    setEditingService(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (service: any) => {
    let mode: 'service' | 'menu' | 'signature' = 'menu';
    if (service.isSignature) mode = 'signature';
    else if (service.category === 'Service') mode = 'service';
    
    setFormMode(mode);
    setEditingService(service);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & Menu</h1>
          <p className="text-muted-foreground">Manage your culinary offerings, signature dishes, and professional services.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => handleAddClick('service')}>
            <ConciergeBell className="mr-2 h-4 w-4" /> Add Service
          </Button>
          <Button onClick={() => handleAddClick('menu')}>
            <Utensils className="mr-2 h-4 w-4" /> Add Dish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
        </TabsList>

        <Card className="mt-6">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TabsContent value={activeTab} className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Img</TableHead>
                        <TableHead className={activeTab === 'services' ? "w-[200px]" : "w-[250px]"}>Name</TableHead>
                        {activeTab === 'services' ? (
                          <TableHead>Description</TableHead>
                        ) : (
                          <>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                          </>
                        )}
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categorizedServices[activeTab as keyof typeof categorizedServices].length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={activeTab === 'services' ? 5 : 7} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Utensils className="h-8 w-8 opacity-20" />
                              <p>No {activeTab === 'all' ? 'items' : activeTab} found.</p>
                              <Button variant="link" onClick={() => handleAddClick(activeTab === 'services' ? 'service' : activeTab === 'signature' ? 'signature' : 'menu')}>
                                Add your first {activeTab === 'all' ? 'item' : activeTab}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        categorizedServices[activeTab as keyof typeof categorizedServices].map((service) => (
                          <TableRow key={service.id} className="group transition-colors hover:bg-muted/50">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-semibold">{service.name}</div>
                                <div className="flex gap-1.5 flex-wrap">
                                  {service.isSignature && (
                                    <Badge className="h-5 px-1.5 bg-orange-100 text-orange-700 border-orange-200 text-[10px] hover:bg-orange-100">
                                      <Star className="mr-0.5 h-2.5 w-2.5 fill-current" /> Signature
                                    </Badge>
                                  )}
                                  {service.isNegotiable && (
                                    <Badge variant="outline" className="h-5 px-1.5 text-blue-600 border-blue-200 bg-blue-50 text-[10px]">
                                      Negotiable
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            
                            {activeTab === 'services' ? (
                              <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                {service.description}
                              </TableCell>
                            ) : (
                              <>
                                <TableCell>
                                  <Badge variant="secondary" className="font-normal">
                                    {service.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {service.category !== 'Service' ? (
                                    <Badge variant="outline" className={cn(
                                      "font-medium",
                                      service.itemType === 'Veg' ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
                                    )}>
                                      {service.itemType || 'Veg'}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                  )}
                                </TableCell>
                              </>
                            )}

                            <TableCell className="font-medium text-primary">
                              ₹ {service.basePrice ? service.basePrice : "0"}
                            </TableCell>

                            <TableCell>
                              <Badge variant={service.status === 'Active' ? 'default' : 'secondary'} className="capitalize">
                                {service.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditClick(service)}>
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleStatus(service)}>
                                    {service.status === 'Active' ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                    onClick={() => handleDeleteService(service.id)}
                                  >
                                    Delete Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <AddServiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
        isLoading={isSaving}
        mode={formMode}
      />
    </div>
  );
}
