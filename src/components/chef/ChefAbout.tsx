'use client';

import type { Restaurant } from '@/lib/types';

interface ChefAboutProps {
    restaurant: Restaurant;
    chefName: string;
}

export function ChefAbout({ restaurant, chefName }: ChefAboutProps) {
    return (
        <div className="mt-8" id="About">
            <h2 className="text-2xl font-bold mb-4">About {chefName}</h2>
            <p className="text-muted-foreground">
            Chef {chefName} is the heart and soul behind {restaurant.name}, bringing authentic {restaurant.cuisine} flavors to your table. With over 15 years of experience in kitchens around the world, {chefName.split(' ')[0]} has a passion for using fresh, local ingredients to create memorable dining experiences. This home kitchen is a culmination of that passion, offering a menu that is both innovative and deeply rooted in tradition.
            </p>
        </div>
    );
}
