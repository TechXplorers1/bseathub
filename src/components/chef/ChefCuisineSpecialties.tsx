'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Beef, CakeSlice, Leaf, Soup } from "lucide-react";

const specialtyData = [
    { cuisine: "Hyderabadi", description: "Authentic biryanis & kebabs", icon: Beef },
    { cuisine: "South Indian", description: "Classic dosas & chutneys", icon: Leaf },
    { cuisine: "Chinese", description: "Indo-Chinese fusion favorites", icon: Soup },
    { cuisine: "Continental", description: "Grilled meats & creamy pastas", icon: Beef },
    { cuisine: "Desserts", description: "Homemade sweets & baked treats", icon: CakeSlice },
    { cuisine: "Italian", description: "Classic pasta & pizza", icon: Soup },
];

export function ChefCuisineSpecialties({ cuisines }: { cuisines: string[] }) {
    
    const chefSpecialties = specialtyData.filter(specialty => 
        cuisines.some(c => specialty.cuisine.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(specialty.cuisine.toLowerCase()))
    );

    // If no specific specialties match, show some defaults
    const displaySpecialties = chefSpecialties.length > 0 ? chefSpecialties : specialtyData.slice(0, 4);

    return (
        <div id="Specialties">
            <h2 className="text-2xl font-bold mb-4">Special in Cuisines</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displaySpecialties.map((specialty) => (
                    <Card key={specialty.cuisine} className="group hover:bg-primary/5 transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <specialty.icon className="h-6 w-6 text-gray-700 group-hover:text-primary" />
                                </div>
                                <CardTitle className="text-lg">{specialty.cuisine}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{specialty.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
