import data from './placeholder-images.json';

export type ImagePlaceholder = (typeof data.placeholderImages)[number];

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;

export const getImageById = (id: ImagePlaceholder['id']) => {
  return placeholderImages.find((img) => img.id === id);
};
