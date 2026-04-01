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

export interface OrderRequest {
  customerId: string;
  sourceType: 'Restaurant' | 'HomeFood';
  sourceId: string;
  deliveryAddress: string;
  subtotalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: string;
  orderNotes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  itemName: string;
  itemType: string;
  itemRefId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  customerName: string;
  sourceType: string;
  sourceId: string;
  sourceName: string;
  currentStatusId: string;
  orderPlacedAt: string;
  expectedDeliveryAt: string;
  deliveryAddress: string;
  subtotalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderNotes?: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: string;
  itemName: string;
  itemType: string;
  itemRefId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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

export interface ReviewRequest {
  customerId: string;
  targetId: string;
  targetType: 'Restaurant' | 'HomeFood' | 'Chef';
  rating: number;
  comment: string;
  orderId?: string;
  menuItemId?: string;
  menuItemName?: string;
}

export interface ReviewResponse {
  id: string;
  customerId: string;
  customerName: string;
  targetId: string;
  targetType: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderId?: string;
}
