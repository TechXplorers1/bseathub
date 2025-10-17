import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatus } from '@/components/tracking/OrderStatus';
import { getImageById } from '@/lib/placeholder-images';

export default function TrackOrderPage() {
    const mapImage = getImageById('track-order-map');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Order #SW12345</CardTitle>
                            <p className="text-muted-foreground">From The Golden Spoon</p>
                        </div>
                        <p className="text-lg font-semibold">Estimated Arrival: 8:30 PM</p>
                    </div>
                </CardHeader>
                <CardContent>
                    {mapImage && (
                        <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8">
                            <Image
                                src={mapImage.imageUrl}
                                alt={mapImage.description}
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint={mapImage.imageHint}
                            />
                        </div>
                    )}
                    <OrderStatus />
                </CardContent>
            </Card>
        </div>
    )
}
