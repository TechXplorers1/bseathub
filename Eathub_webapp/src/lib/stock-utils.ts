/**
 * Utility functions for determining and filtering dish/item stock availability.
 */

export interface StockCheckableItem {
  status?: string | null;
  isAvailable?: boolean | null;
  inStock?: boolean | null;
  available?: boolean | null;
  stock?: number | null;
  [key: string]: any;
}

/**
 * Checks whether an item is currently in stock and available for customers.
 * Returns false if:
 * - isAvailable === false
 * - inStock === false
 * - available === false
 * - stock <= 0 (if explicit numeric stock is provided)
 * - status matches "Out of Stock", "Unavailable", "Inactive", "Sold Out", etc.
 */
export function isItemInStock(item?: StockCheckableItem | null): boolean {
  if (!item) return false;

  // Direct boolean availability indicators
  if (item.isAvailable === false) return false;
  if (item.inStock === false) return false;
  if (item.available === false) return false;

  // Numeric stock level check
  if (typeof item.stock === 'number' && item.stock <= 0) return false;

  // Status string check (case, spacing, hyphen and underscore insensitive)
  if (item.status && typeof item.status === 'string') {
    const normalized = item.status.trim().toLowerCase().replace(/[\s_\-]+/g, '');
    if (
      normalized === 'outofstock' ||
      normalized === 'unavailable' ||
      normalized === 'inactive' ||
      normalized === 'soldout' ||
      normalized === 'out'
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Filters a list of menu categories to only include in-stock items,
 * and strips empty categories that have zero in-stock items remaining.
 */
export function filterInStockCategories<T extends { items?: any[] }>(categories?: T[] | null): T[] {
  if (!Array.isArray(categories)) return [];

  return categories
    .map((category) => ({
      ...category,
      items: Array.isArray(category.items)
        ? category.items.filter((item) => isItemInStock(item))
        : [],
    }))
    .filter((category) => Array.isArray(category.items) && category.items.length > 0);
}
