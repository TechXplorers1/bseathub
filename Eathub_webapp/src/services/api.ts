// src/services/api.ts
export const BASE_URL = 'http://localhost:8081/api/v1';
export const AUTH_URL = `${BASE_URL}/auth`;

export const fetchRestaurants = async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    return res.json();
};

export const fetchHomeFoods = async () => {
    const res = await fetch(`${BASE_URL}/home-food`);
    if (!res.ok) throw new Error("Failed to fetch homefood");
    return res.json();
};

export const fetchChefs = async () => {
    const res = await fetch(`${BASE_URL}/chefs`);
    if (!res.ok) throw new Error("Failed to fetch chefs");
    return res.json();
};

export async function getMenu(providerId: string, type: 'restaurant' | 'home-food') {
    const response = await fetch(`${BASE_URL}/menu/${type}/${providerId}`);
    if (!response.ok) throw new Error('Failed to fetch menu');
    return await response.json();
}

export async function fetchGroupedMenu(providerId: string, type: 'restaurant' | 'home-food') {
    const response = await fetch(`${BASE_URL}/menu/provider/${providerId}/grouped?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch grouped menu');
    return await response.json();
}

export async function registerPartner(payload: { type: string; data: any }) {
    const response = await fetch(`${AUTH_URL}/partner/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
}

export const addDishToRestaurant = async (restaurantId: string, payload: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/menu-items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add dish");
    }
    return res.json();
};

export const login = async (credentials: any) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json();
};

export const fetchItemsByRestaurant = async (restaurantId: string) => {
    const res = await fetch(`${BASE_URL}/menu/restaurants/${restaurantId}`);
    if (!res.ok) throw new Error("Failed to fetch restaurant menu items");
    return res.json();
};

export const updateMenuItem = async (menuItemId: string, payload: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/menu/${menuItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update menu item");
    }

    return res.json();
};

export const deleteMenuItem = async (id: string) => {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete menu item");
};

export const toggleFeatured = async (id: string, isSpecial: boolean) => {
    const res = await fetch(`${BASE_URL}/menu/${id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSpecial }),
    });

    if (!res.ok) throw new Error("Failed to update featured");
};

export const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/menu/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Failed to update status");
};

export const addHomeFoodDish = async (providerId: string, payload: any): Promise<any> => {
    const url = `${BASE_URL}/home-food/${providerId}/menu-items`;
    const res = await fetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to add dish");
    }

    return res.json();
};

export const fetchHomeFoodMenu = async (providerId: string) => {
    const res = await fetch(`${BASE_URL}/home-food/${providerId}/menu-items`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    return res.json();
};

export const fetchHomeFoodMenuCategories = async (providerId: string) => {
    const res = await fetch(`${BASE_URL}/menu/categories/home-food/${providerId}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
};

/* ================= CHEF SERVICES ================= */

export const fetchChefServices = async (chefId: string) => {
    const res = await fetch(`${BASE_URL}/chefs/${chefId}/services`);
    if (!res.ok) throw new Error("Failed to fetch chef services");
    return res.json();
};

export const addChefService = async (chefId: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/chefs/${chefId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to add service");
    }
    return res.json();
};

export const updateChefService = async (serviceId: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/chefs/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update service");
    }
    return res.json();
};

export const deleteChefService = async (serviceId: string) => {
    const res = await fetch(`${BASE_URL}/chefs/services/${serviceId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete service");
};

export const fetchGroupedChefServices = async (id: string) => {
    const res = await fetch(`${BASE_URL}/chefs/${id}/services/grouped`);
    if (!res.ok) throw new Error("Failed to fetch grouped chef services");
    return res.json();
};

/* ================= SLUG BASED FETCHING ================= */

export const fetchRestaurantBySlug = async (slug: string) => {
    const res = await fetch(`${BASE_URL}/restaurants/${slug}`);
    if (!res.ok) throw new Error("Restaurant not found");
    return res.json();
};

export const fetchChefBySlug = async (slug: string) => {
    const res = await fetch(`${BASE_URL}/chefs/slug/${slug}`);
    if (!res.ok) throw new Error("Chef not found");
    return res.json();
};

export const fetchHomeFoodBySlug = async (slug: string) => {
    const res = await fetch(`${BASE_URL}/home-food/slug/${slug}`);
    if (!res.ok) throw new Error("Home food provider not found");
    return res.json();
};

export const fetchHomeFoodById = async (id: string) => {
    const res = await fetch(`${BASE_URL}/home-food/slug/${id}`);
    if (!res.ok) throw new Error("Home food provider not found");
    return res.json();
};

export const fetchRestaurantById = async (id: string) => {
    const res = await fetch(`${BASE_URL}/restaurants/id/${id}`);
    if (!res.ok) throw new Error("Restaurant not found");
    return res.json();
};

export const fetchChefById = async (id: string) => {
    const res = await fetch(`${BASE_URL}/chefs/slug/${id}`);
    if (!res.ok) throw new Error("Chef not found");
    return res.json();
};

export const updateProfile = async (payload: any) => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
    }
    return res.json();
};

export const fetchUserProfile = async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    if (!res.ok) {
        const error = new Error("Failed to fetch profile");
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

/* ================= RESTAURANT PROFILE SETTINGS ================= */

export const fetchRestaurantProfile = async (restaurantId: string) => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/profile`);
    if (!res.ok) throw new Error("Failed to fetch restaurant profile");
    return res.json();
};

export const updateRestaurantProfile = async (restaurantId: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update restaurant profile");
    }
    return res.json();
};

export const updateRestaurantAddress = async (restaurantId: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update restaurant address");
    }
    return res.json();
};

export const updateRestaurantLegal = async (restaurantId: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/legal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update restaurant legal details");
    }
    return res.json();
};

/* ================= HOME FOOD PROFILE SETTINGS ================= */

export const fetchHomeFoodProfile = async (id: string) => {
    const res = await fetch(`${BASE_URL}/home-food/${id}`);
    if (!res.ok) throw new Error("Failed to fetch home food profile");
    return res.json();
};

export const updateHomeFoodProfile = async (id: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/home-food/${id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update home food profile");
    }
    return res.json();
};

export const updateHomeFoodAddress = async (id: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/home-food/${id}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update home food address");
    }
    return res.json();
};

export const updateHomeFoodLegal = async (id: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/home-food/${id}/legal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update home food legal details");
    }
    return res.json();
};

/* ================= CHEF PROFILE SETTINGS ================= */

export const fetchChefProfile = async (id: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chefs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch chef profile');
    return response.json();
};

export const fetchChefProfileByOwner = async (ownerId: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chefs/owner/${ownerId}`);
    if (!response.ok) throw new Error('Failed to fetch chef profile by owner');
    return response.json();
};

export const updateChefProfile = async (id: string, data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chefs/${id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update chef profile');
    return response.json();
};

export const updateChefAddress = async (id: string, data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chefs/${id}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update chef address');
    return response.json();
};

export const updateChefLegal = async (id: string, data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chefs/${id}/legal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update chef legal/bank details');
    return response.json();
};

/* ================= AUTH / OTP SERVICES ================= */

export const sendOtp = async (email: string) => {
    const res = await fetch(`${AUTH_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send OTP');
    }
    return res.json();
};

export const verifyOtp = async (email: string, otp: string) => {
    const res = await fetch(`${AUTH_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Invalid or expired OTP');
    }
    return res.json();
};

/* ================= REVIEWS ================= */

import type { OrderRequest, OrderResponse, ReviewRequest, ReviewResponse, ChefBooking } from '@/lib/types';

export const createOrder = async (payload: OrderRequest): Promise<OrderResponse> => {
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
    }
    return res.json();
};

/* ================= CHEF BOOKINGS ================= */

export const fetchCustomerBookings = async (customerId: string): Promise<ChefBooking[]> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/customer/${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch customer bookings");
    return res.json();
};

export const createChefBooking = async (payload: ChefBooking): Promise<ChefBooking> => {
    const res = await fetch(`${BASE_URL}/chef-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create chef booking");
    return res.json();
};

export const fetchChefBookings = async (chefId: string): Promise<ChefBooking[]> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/chef/${chefId}`);
    if (!res.ok) throw new Error("Failed to fetch chef bookings");
    return res.json();
};

export const fetchChefBookingsByOwner = async (ownerId: string): Promise<ChefBooking[]> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/owner/${ownerId}`);
    if (!res.ok) throw new Error("Failed to fetch chef bookings");
    return res.json();
};

export const fetchChefEarnings = async (chefId: string): Promise<number> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/chef/${chefId}/earnings`);
    if (!res.ok) throw new Error("Failed to fetch chef earnings");
    const data = await res.json();
    return data.earnings || 0;
};

export const fetchReviewsForProvider = async (targetId: string, type: 'Restaurant' | 'HomeFood' | 'Chef'): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/reviews/provider/${targetId}?type=${type}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
};

export const fetchChefEarningsByOwner = async (ownerId: string): Promise<number> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/owner/${ownerId}/earnings`);
    if (!res.ok) throw new Error("Failed to fetch chef earnings");
    const data = await res.json();
    return data.earnings || 0;
};

export const updateBookingStatus = async (bookingId: string, status: string, reason?: string): Promise<ChefBooking> => {
    let url = `${BASE_URL}/chef-bookings/${bookingId}/status?status=${status}`;
    if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
    }
    const res = await fetch(url, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error("Failed to update booking status");
    return res.json();
};

export const updateBookingPaymentStatus = async (bookingId: string, paymentStatus: string): Promise<ChefBooking> => {
    const res = await fetch(`${BASE_URL}/chef-bookings/${bookingId}/payment?paymentStatus=${paymentStatus}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error("Failed to update booking payment status");
    return res.json();
};

export const fetchOrderById = async (orderId: string): Promise<OrderResponse> => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order details");
    return res.json();
};

export const fetchOrdersByCustomer = async (customerId: string): Promise<OrderResponse[]> => {
    const res = await fetch(`${BASE_URL}/orders/customer/${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch customer orders");
    return res.json();
};

export const fetchOrdersByRestaurant = async (restaurantId: string): Promise<OrderResponse[]> => {
    const res = await fetch(`${BASE_URL}/orders/restaurant/${restaurantId}`);
    if (!res.ok) throw new Error("Failed to fetch restaurant orders");
    return res.json();
};

export const cancelOrder = async (orderId: string, reason?: string, cancelledBy?: string): Promise<OrderResponse> => {
    let url = `${BASE_URL}/orders/${orderId}/cancel?`;
    if (reason) url += `reason=${encodeURIComponent(reason)}&`;
    if (cancelledBy) url += `cancelledBy=${encodeURIComponent(cancelledBy)}`;
    
    const res = await fetch(url, {
        method: 'POST',
    });
    if (!res.ok) throw new Error("Failed to cancel order");
    return res.json();
};

export const submitReview = async (payload: ReviewRequest): Promise<ReviewResponse> => {
    const res = await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit review');
    }
    return res.json();
};

export const getReviewsForProvider = async (
    targetId: string,
    type: 'Restaurant' | 'HomeFood' | 'Chef'
): Promise<ReviewResponse[]> => {
    const res = await fetch(`${BASE_URL}/reviews/provider/${targetId}?type=${type}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
};

export const getReviewsForOwner = async (ownerId: string, type: string): Promise<ReviewResponse[]> => {
    const res = await fetch(`${BASE_URL}/reviews/owner/${ownerId}?type=${type}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
};

export const getReviewsByCustomer = async (customerId: string): Promise<ReviewResponse[]> => {
    const res = await fetch(`${BASE_URL}/reviews/customer/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch customer reviews');
    return res.json();
};

export const checkAlreadyReviewed = async (
    customerId: string,
    targetId: string,
    menuItemId?: string,
    orderId?: string
): Promise<boolean> => {
    let url = `${BASE_URL}/reviews/check?`;
    if (orderId) url += `orderId=${orderId}`;
    else {
        url += `customerId=${customerId}&targetId=${targetId}`;
        if (menuItemId) url += `&menuItemId=${menuItemId}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return data.reviewed ?? false;
};

export const createRazorpayOrder = async (amount: number) => {
    const res = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR' })
    });
    if (!res.ok) throw new Error("Failed to create Razorpay order");
    try {
        const text = await res.text();
        return JSON.parse(text);
    } catch {
        throw new Error("Failed to parse Razorpay order response");
    }
};

export const updateFcmToken = async (fcmToken: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const res = await fetch(`${BASE_URL}/users/fcm-token`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fcmToken }),
    });
    if (!res.ok && res.status !== 401) {
        console.warn('Failed to update FCM token on backend');
    }
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: string): Promise<OrderResponse> => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/payment?paymentStatus=${paymentStatus}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error("Failed to update payment status");
    return res.json();
};

export const fetchMyOrders = async (): Promise<OrderResponse[]> => {
    const res = await fetch(`${BASE_URL}/orders/mine`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch my orders");
    return res.json();
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<OrderResponse> => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status?status=${status}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
};
export const replyToReview = async (reviewId: string, reply: string): Promise<ReviewResponse> => {
    const res = await fetch(`${BASE_URL}/reviews/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reply }),
    });
    if (!res.ok) throw new Error("Failed to reply to review");
    return res.json();
};
