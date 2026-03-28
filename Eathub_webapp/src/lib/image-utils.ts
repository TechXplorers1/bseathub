import { getImageById, PlaceholderImageIds } from './placeholder-images';

/**
 * Returns a displayable image URL.
 * If the input is a valid placeholder ID, it returns the placeholder image URL.
 * Otherwise, it returns the input as is (assuming it's a URL or Base64).
 * Falls back to a default restaurant placeholder if input is empty.
 */
export function getDisplayImage(idOrUrl: string | PlaceholderImageIds | undefined | null, fallbackId: PlaceholderImageIds = 'restaurant-1'): string {
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
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
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
