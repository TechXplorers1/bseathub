'use client';

import Image from 'next/image';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { menuItems } from '@/lib/home-food-dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MenuPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Add, edit, or delete your food items.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Dish
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
               <TableHead>Today's Special</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={item.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={item.imageUrl}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'Available' ? 'secondary' : 'outline'}>
                    {item.status}
                  </Badge>
                </TableCell>
                 <TableCell>
                  {item.isSpecial && <Badge variant="default">Special</Badge>}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ${item.price.toFixed(2)}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                       <DropdownMenuItem>Mark as "Today's Special"</DropdownMenuItem>
                      <DropdownMenuItem>Mark as "Out of Stock"</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
