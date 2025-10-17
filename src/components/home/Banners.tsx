import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageById } from '@/lib/placeholder-images';

export function Banners() {
  const banner1Image1 = getImageById('food-21');
  const banner1Image2 = getImageById('food-10');
  const banner2Image = getImageById('food-16');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              Enjoy 50% off your first order!
            </h3>
            <p>Use code 50TREAT on delivery orders of $15+</p>
            <Button variant="secondary" className="mt-2 text-primary">
              Learn more
            </Button>
          </div>
          <div className="flex space-x-2">
             {banner1Image1 && (
              <Image
                src={banner1Image1.imageUrl}
                alt={banner1Image1.description}
                width={100}
                height={100}
                className="rounded-lg object-cover h-24 w-24"
                data-ai-hint={banner1Image1.imageHint}
              />
            )}
            {banner1Image2 && (
              <Image
                src={banner1Image2.imageUrl}
                alt={banner1Image2.description}
                width={100}
                height={100}
                className="rounded-lg object-cover h-24 w-24"
                data-ai-hint={banner1Image2.imageHint}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden bg-teal-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              Get unlimited $0 delivery fees on eligible Eat Hub orders*
            </h3>
            <p className="text-sm">Plus exclusive offers and savings</p>
            <Button className="mt-2 bg-teal-600 hover:bg-teal-700">
              Try it Free for 30 Days
            </Button>
          </div>
           {banner2Image && (
              <Image
                src={banner2Image.imageUrl}
                alt={banner2Image.description}
                width={150}
                height={150}
                className="rounded-lg object-cover h-32 w-32"
                data-ai-hint={banner2Image.imageHint}
              />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
