import { BookingForm } from "./BookingForm";
import type { MenuCategory } from "@/lib/types";

export function BookChef({ chefName, chefId, basePrice, services }: { chefName: string, chefId: string, basePrice?: number, services?: MenuCategory[] }) {
    return (
        <div id="Book a Chef" className="pt-12 pb-6 bg-white/80 backdrop-blur-md rounded-t-[2.5rem]">
            <div className="text-center px-8">
                <h2 className="text-3xl font-black tracking-tighter uppercase text-primary">Book This Chef</h2>
                <p className="mt-4 text-base text-muted-foreground font-medium italic">
                    Elevate your next event with a private culinary experience curated by <span className="text-primary font-bold">{chefName}</span>.
                </p>
            </div>
            <div className="mt-8">
                <BookingForm chefName={chefName} chefId={chefId} basePrice={basePrice} services={services} />
            </div>
        </div>
    )
}
