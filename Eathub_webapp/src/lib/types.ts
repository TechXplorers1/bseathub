import placeholderData from './placeholder-images.json';

type PlaceholderImageIds = (typeof placeholderData.placeholderImages)[number]['id'];
type RestaurantType = 'restaurant' | 'home-food';


export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  imageId: string | PlaceholderImageIds;
  coverImageId?: string;
  avatarUrl?: string;
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
  // Dynamic Profile Fields
  bio?: string;
  description?: string;
  experience?: string;
  specialty?: string;
  workingHours?: string;
  preference?: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg';
  city?: string;
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
  category?: string;
  type?: RestaurantType | 'chef-service';
  itemType?: 'Veg' | 'Non-Veg' | 'Vegan' | 'Other';
  isSignature?: boolean;
  isNegotiable?: boolean;
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
  experience?: string;
  workingHours?: string;
  city?: string;
  isActive?: boolean;
}
