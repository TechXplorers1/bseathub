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
  cuisineType?: string;
  rating: number;
  reviews: number;
  reviewsCount?: number;
  deliveryTime: number;
  deliveryFee: number;
  categories: string[];
  services: ('delivery' | 'pickup')[];
  menu: MenuCategory[];
  type: RestaurantType;
  isOpen?: boolean;
  owner?: { id: string };
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Dynamic Profile Fields
  bio?: string;
  description?: string;
  experience?: string;
  specialty?: string;
  workingHours?: string;
  preference?: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg';
  basePrice?: number;
  totalEarnings?: number;
  distanceKm?: number;
  ownerId?: string;
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
  isSpecial?: boolean;
  isNegotiable?: boolean;
  restaurantName?: string;
  providerId?: string;
  providerName?: string;
  providerType?: 'restaurant' | 'home-food';
  providerSlug?: string;
  
  isOnOffer?: boolean;
  offerType?: string;
  offerValue?: number;
  offerDescription?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  offerStartTime?: string;
  offerEndTime?: string;
  offerMetaData?: string;
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
  cancellationReason?: string;
  cancelledBy?: string;
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
  distanceKm?: number;
  ownerId?: string;
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
  reply?: string;
  repliedAt?: string;
}

export interface ChefBooking {
  id?: string;
  customerId: string;
  customerName?: string;
  chefId: string;
  chefName?: string;
  serviceId?: string;
  serviceName?: string;
  eventDate: string;
  eventTime?: string;
  guests: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Accepted' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Paid';
  createdAt?: string;
  eventAddress: string;
  notes?: string;
  statusReason?: string;
  eventType?: string;
  customerPhone?: string;
  foodPreference?: string;
  isNegotiable?: boolean;
}
