// src/services/api.ts
const BASE_URL = 'http://localhost:8081/api/v1';
const AUTH_URL = `${BASE_URL}/auth`;

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

export const addDishToRestaurant = async (restaurantId: string, payload: any) => {
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
    return res.text();
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

export const updateMenuItem = async (menuItemId: string, payload: any) => {
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

export const addHomeFoodDish = async (providerId: string, payload: any) => {
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

    return res;
};

export const fetchHomeFoodMenu = async (providerId: string) => {
    const res = await fetch(`${BASE_URL}/home-food/${providerId}/menu-items`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    return res.json();
};

export const fetchHomeFoodCategories = async (providerId: string) => {
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
    // Note: If backend home-food controller doesn't have slug endpoint yet, 
    // it will return 404. Assuming it might be needed.
    const res = await fetch(`${BASE_URL}/home-food/slug/${slug}`);
    if (!res.ok) throw new Error("Home food provider not found");
    return res.json();
};