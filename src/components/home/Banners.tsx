import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageById } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export function Banners() {
    const banner1Image = getImageById("food-21");
    const banner2Image = getImageById("food-16");
    const banner3Image = getImageById("food-9");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
            <Card className="overflow-hidden bg-primary text-primary-foreground">
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <h3 className="text-2xl font-bold">20% off + $0 delivery</h3>
                        <p>for new customers</p>
                        <Button variant="secondary" className="mt-4">
                            Order now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    {banner1Image && (
                        <Image 
                            src={banner1Image.imageUrl}
                            alt={banner1Image.description}
                            width={150}
                            height={150}
                            className="rounded-full object-cover h-32 w-32"
                            data-ai-hint={banner1Image.imageHint}
                        />
                    )}
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardContent className="flex items-center justify-between p-6">
                     <div>
                        <h3 className="text-2xl font-bold">Become a Dasher</h3>
                        <p>Start earning with us</p>
                        <Button variant="secondary" className="mt-4">
                            Start earning <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    {banner2Image && (
                        <Image 
                            src={banner2Image.imageUrl}
                            alt={banner2Image.description}
                            width={150}
                            height={150}
                            className="rounded-full object-cover h-32 w-32"
                            data-ai-hint={banner2Image.imageHint}
                        />
                    )}
                </CardContent>
            </Card>
            <Card className="overflow-hidden md:col-span-2 lg:col-span-1">
                <CardContent className="flex items-center justify-between p-6">
                     <div>
                        <h3 className="text-2xl font-bold">Taste the comfort</h3>
                        <p>Burger Bonanza</p>
                        <Button variant="secondary" className="mt-4">
                            Order now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    {banner3Image && (
                        <Image 
                            src={banner3Image.imageUrl}
                            alt={banner3Image.description}
                            width={150}
                            height={150}
                            className="rounded-full object-cover h-32 w-32"
                            data-ai-hint={banner3Image.imageHint}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
