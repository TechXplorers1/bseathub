
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { HomeFoodRegistrationDialog } from '@/components/partner/HomeFoodRegistrationDialog';
import { RestaurantRegistrationDialog } from '@/components/partner/RestaurantRegistrationDialog';

const HomeFoodIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
        <path d="M12 16a2.5 2.5 0 0 0-5 0v2.5"/>
        <path d="M17 16a2.5 2.5 0 0 1-5 0v2.5"/>
        <path d="M12 11V8"/>
    </svg>
);


const partnerOptions = [
    {
        id: 'home-food',
        title: "Home Food partner",
        description: "For home cooks and tiffin services",
        icon: <HomeFoodIcon />,
        link: "#"
    },
    {
        id: 'restaurant',
        title: "Restaurant Partner",
        description: "For restaurants, cafes, and cloud kitchens.",
        icon: <UtensilsCrossed size={32} />,
        link: "#"
    },
    {
        id: 'chef',
        title: "Chef Partner",
        description: "Grow your career, connect with clients, and showcase your passion for food.",
        icon: <ChefHat size={32} />,
        link: "/chef-dashboard" // Placeholder for future registration flow
    }
];

export default function PartnerPage() {
    const [isHomeFoodDialogOpen, setIsHomeFoodDialogOpen] = useState(false);
    const [isRestaurantDialogOpen, setIsRestaurantDialogOpen] = useState(false);

    const handleRegisterClick = (id: string) => {
        if (id === 'home-food') {
            setIsHomeFoodDialogOpen(true);
        }
        if (id === 'restaurant') {
            setIsRestaurantDialogOpen(true);
        }
        // For other types, we'll let the Link component handle navigation.
    };

    return (
        <>
            <div className="min-h-screen bg-orange-50/50 flex flex-col items-center justify-center p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Become a Partner</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Grow with Eat Hub by joining as a Restaurant, Home Food Cook, or Private Chef.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    {partnerOptions.map((option) => (
                        <Card key={option.title} className="text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <CardHeader className="items-center">
                                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                                    {option.icon}
                                </div>
                                <CardTitle>{option.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription className="text-base">{option.description}</CardDescription>
                            </CardContent>
                            <div className="p-6">
                                {option.id === 'chef' ? (
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={option.link}>Register Now</Link>
                                    </Button>
                                ) : (
                                     <Button onClick={() => handleRegisterClick(option.id)} className="w-full" size="lg">Register Now</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            <HomeFoodRegistrationDialog isOpen={isHomeFoodDialogOpen} onOpenChange={setIsHomeFoodDialogOpen} />
            <RestaurantRegistrationDialog isOpen={isRestaurantDialogOpen} onOpenChange={setIsRestaurantDialogOpen} />
        </>
    )
}
