
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { allHomeFoods } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import Image from 'next/image';

const chefs = allHomeFoods.map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
    restaurantName: food.name,
    restaurantImageId: food.imageId,
    bio: `The heart and soul behind ${food.name}, bringing authentic ${food.cuisine} flavors to your table.`
}));

// Create a unique list of chefs based on their name
const uniqueChefs = chefs.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
        acc.push(current);
    }
    return acc;
}, [] as typeof chefs);


export default function ChefsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Chefs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {uniqueChefs.map((chef) => {
          const restaurantImage = getImageById(chef.restaurantImageId);
          return (
            <Card key={chef.name} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {restaurantImage && (
                    <div className="relative h-40 w-full">
                        <Image
                            src={restaurantImage.imageUrl}
                            alt={chef.restaurantName}
                            fill
                            className="object-cover"
                            data-ai-hint={restaurantImage.imageHint}
                        />
                    </div>
                )}
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={chef.avatarUrl} alt={chef.name} />
                  <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{chef.name}</CardTitle>
                  <CardDescription>{chef.specialty}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{chef.bio}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
