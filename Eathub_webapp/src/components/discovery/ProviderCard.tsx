import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";
import { getImageById } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

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

    const typeConfig = {
        RESTAURANT: { color: "bg-orange-500", label: "RESTAURANT" },
        HOME_FOOD: { color: "bg-teal-600", label: "HOME FOOD" },
        CHEF: { color: "bg-purple-600", label: "PRIVATE CHEF" }
    };

    const config = typeConfig[provider.type] || typeConfig.RESTAURANT;

    return (
        <Link href={href} className="block group">
            <Card className="overflow-hidden border-muted/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full bg-white flex flex-col">
                <div className="relative h-56 w-full overflow-hidden">
                    {image ? (
                        <Image
                            src={image.imageUrl}
                            alt={provider.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs uppercase tracking-widest">No Image</span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 border-none shadow-sm", config.color)}>
                            {config.label}
                        </Badge>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-green-700 text-sm font-black shadow-sm border border-green-100">
                        <span>{provider.rating ? provider.rating.toFixed(1) : "4.5"}</span>
                        <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex-1 mb-4">
                        <h3 className="font-black text-xl leading-tight text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {provider.name}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            {provider.cuisine || "Multi-cuisine Delivery"}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-muted/50 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                            <span>25-35 MIN</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" />
                            <span>Near You</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
