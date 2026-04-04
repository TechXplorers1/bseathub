import { BookingForm } from "./BookingForm";
import type { MenuCategory } from "@/lib/types";

export function BookChef({ chefName, chefId, basePrice, services }: { chefName: string, chefId: string, basePrice?: number, services?: MenuCategory[] }) {
    return (
        <div id="Book a Chef">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight uppercase">Book This Chef</h2>
                <p className="mt-2 text-lg text-muted-foreground font-medium">
                    Elevate your next event with a private culinary experience curated by Chef {chefName}.
                </p>
            </div>
            <div className="mt-8">
            <BookingForm chefName={chefName} chefId={chefId} basePrice={basePrice} services={services} />
            </div>
        </div>
    )
}
