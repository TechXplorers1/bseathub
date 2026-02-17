// src/services/api.ts
const BASE_URL = 'http://localhost:8081/api/v1';

export const fetchRestaurants = async () => {
    const res = await fetch(`${BASE_URL}/restaurants`); // Matches @RequestMapping("/v1/restaurants")
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    return res.json();
};

export const fetchHomeFoods = async () => {
    // FIX: Changed from /homefood to /home-food to match Backend
    const res = await fetch(`${BASE_URL}/home-food`);
    if (!res.ok) throw new Error("Failed to fetch homefood");
    return res.json();
};

export const fetchChefs = async () => {
    const res = await fetch(`${BASE_URL}/chefs`); // Matches @RequestMapping("/v1/chefs")
    if (!res.ok) throw new Error("Failed to fetch chefs");
    return res.json();
};

export async function getMenu(providerId: string, type: 'restaurant' | 'home-food') {
    const response = await fetch(`${BASE_URL}/menu/${type}/${providerId}`);
    if (!response.ok) throw new Error('Failed to fetch menu');
    return await response.json();
}

/**
 * Registers a new partner (Restaurant, Chef, or Home Food)
 */
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

    return await response.json(); // Returns AuthResponse { token, email, role }
}