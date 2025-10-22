'use client';

import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';

const galleryImageIds = [
    'food-3',
    'food-5',
    'food-9',
    'food-13',
    'food-17',
    'food-21',
];

export function ChefGallery() {
    const images = galleryImageIds.map(id => getImageById(id));

    if (images.some(img => !img)) return null;

    const [img1, img2, img3, img4, img5, img6] = images;

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Signature Dishes</h2>
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
                {img1 && (
                    <Card className="col-span-2 row-span-2 overflow-hidden relative group">
                         <Image
                            src={img1.imageUrl}
                            alt={img1.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img1.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </Card>
                )}
                 {img2 && (
                    <Card className="overflow-hidden relative group">
                        <Image
                            src={img2.imageUrl}
                            alt={img2.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img2.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </Card>
                )}
                {img3 && (
                    <Card className="overflow-hidden relative group">
                        <Image
                            src={img3.imageUrl}
                            alt={img3.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img3.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </Card>
                )}
                {img4 && (
                    <Card className="overflow-hidden relative group">
                        <Image
                            src={img4.imageUrl}
                            alt={img4.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img4.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </Card>
                )}
                 {img5 && (
                    <Card className="overflow-hidden relative group">
                        <Image
                            src={img5.imageUrl}
                            alt={img5.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img5.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </Card>
                )}
            </div>
        </div>
    );
}
