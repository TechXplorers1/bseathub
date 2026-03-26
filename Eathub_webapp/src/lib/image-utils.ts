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
