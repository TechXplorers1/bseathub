import placeholderData from './placeholder-images.json';

type PlaceholderImageIds = (typeof placeholderData.placeholderImages)[number]['id'];
type RestaurantType = 'restaurant' | 'home-food';


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
  services: ('delivery' | 'pickup')[];
  menu: MenuCategory[];
  type: RestaurantType;
  isOpen?: boolean;
  owner?: { id: string };
}

export interface MenuCategory {
  id?: string;
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: PlaceholderImageIds;
  type?: RestaurantType;
  restaurantName?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  restaurant: string;
  restaurantId: string;
  items: string[];
  amount: number;
  status: 'Delivered' | 'Preparing' | 'Confirmed' | 'Cancelled' | 'Pickup';
  date: string;
}

export interface Chef {
  id?: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  slug: string;
  preference?: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg';
  rating?: number;
  reviews?: number;
  bio?: string;
  restaurantName?: string;
  restaurantImageId?: string;
  categories?: string[];
}
