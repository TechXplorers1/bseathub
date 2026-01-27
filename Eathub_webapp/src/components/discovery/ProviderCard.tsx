import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Utensils } from "lucide-react";
import { getImageById } from "@/lib/placeholder-images";

interface ProviderCardProps {
    provider: {
        id: string;
        name: string;
        type: "RESTAURANT" | "HOME_FOOD" | "CHEF";
        cuisine?: string;
        rating: number;
        imageId: string;
        slug?: string;
    };
    onClick?: () => void;
}

export function ProviderCard({ provider }: ProviderCardProps) {
    const image = getImageById(provider.imageId);

    const href =
        provider.type === "RESTAURANT"
            ? `/restaurant/${provider.slug ?? provider.id}`
            : provider.type === "HOME_FOOD"
                ? `/homefood/${provider.id}`
                : `/chef/${provider.id}`;

    return (
        <Link href={href} className="block">
            <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
                <div className="relative h-48 w-full">
                    {image && (
                        <Image
                            src={image.imageUrl}
                            alt={provider.name}
                            fill
                            className="object-cover"
                        />
                    )}

                    <div className="absolute top-2 right-2">
                        <Badge
                            variant={provider.type === "RESTAURANT" ? "default" : "secondary"}
                        >
                            {provider.type.replace("_", " ")}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{provider.name}</h3>

                        <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded text-green-700 text-sm font-bold">
                            <span>{provider.rating || "4.0"}</span>
                            <Star className="h-3 w-3 fill-current" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        <span>{provider.cuisine || "Multi-cuisine"}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
