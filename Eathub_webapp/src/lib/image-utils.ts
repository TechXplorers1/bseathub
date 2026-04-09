import { getImageById, PlaceholderImageIds } from './placeholder-images';

/**
 * Returns a displayable image URL.
 * If the input is a valid placeholder ID, it returns the placeholder image URL.
 * Otherwise, it returns the input as is (assuming it's a URL or Base64).
 * Falls back to a default restaurant placeholder if input is empty.
 */
export function getCuisinePlaceholder(cuisine: string = ''): PlaceholderImageIds {
  const c = cuisine.toLowerCase();
  if (c.includes('ital')) return 'restaurant-1';
  if (c.includes('sushi') || c.includes('jap')) return 'restaurant-2';
  if (c.includes('burg') || c.includes('amer')) return 'restaurant-3';
  if (c.includes('mex')) return 'restaurant-4';
  if (c.includes('ind')) return 'restaurant-5';
  if (c.includes('salad') || c.includes('green')) return 'restaurant-6';
  if (c.includes('viet') || c.includes('nood')) return 'restaurant-7';
  if (c.includes('pizz')) return 'restaurant-8';
  if (c.includes('cafe') || c.includes('coffe')) return 'restaurant-9';
  if (c.includes('thai')) return 'restaurant-10';
  if (c.includes('veg')) return 'restaurant-11';
  if (c.includes('steak')) return 'restaurant-12';
  if (c.includes('medit')) return 'restaurant-13';
  if (c.includes('break')) return 'restaurant-14';
  if (c.includes('ramen')) return 'restaurant-15';
  if (c.includes('dess') || c.includes('sweet')) return 'restaurant-16';
  
  return 'restaurant-1'; // Default
}

export function getDisplayImage(
  idOrUrl: string | PlaceholderImageIds | undefined | null, 
  fallbackId: PlaceholderImageIds = 'restaurant-1'
): string {
  if (!idOrUrl) {
    const fallback = getImageById(fallbackId);
    return fallback?.imageUrl || '';
  }

  // Check if it's a placeholder ID
  const placeholder = getImageById(idOrUrl as any);
  if (placeholder) {
    return placeholder.imageUrl;
  }

  // Assume it's a URL or Base64 string
  return idOrUrl as string;
}

/**
 * Compresses an image (File or Base64 string) using Canvas.
 * Returns a Promise that resolves to a Base64 string (image/jpeg).
 */
export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };

    if (typeof window === 'undefined') {
      reject(new Error("compressImage can only be used in the browser"));
      return;
    }

    if (fileOrBase64 instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
        } else {
          reject(new Error("FileReader failed"));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    } else {
      processImage(fileOrBase64);
    }
  });
}
