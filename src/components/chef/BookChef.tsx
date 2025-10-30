'use client';
import { BookingForm } from "./BookingForm";

export function BookChef({ chefName }: { chefName: string }) {
    return (
        <div id="Book a Chef">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Book This Chef</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Elevate your next event with a private culinary experience curated by Chef {chefName}.
                </p>
            </div>
            <div className="mt-8">
            <BookingForm chefName={chefName} />
            </div>
        </div>
    )
}
