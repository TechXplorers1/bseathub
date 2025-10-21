import placeholderData from './placeholder-images.json';

type PlaceholderImageIds = (typeof placeholderData.placeholderImages)[number]['id'];

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  imageId: PlaceholderImageIds;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: number;
  deliveryFee: number;
  categories: string[];
  menu: MenuCategory[];
  type: 'restaurant' | 'home-food';
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: PlaceholderImageIds;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
