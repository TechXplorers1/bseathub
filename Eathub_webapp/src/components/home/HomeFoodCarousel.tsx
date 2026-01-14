'use client';

import { useEffect, useState } from 'react';
import { RestaurantCarousel } from './RestaurantCarousel';
import type { Restaurant } from '@/lib/types';

export function HomeFoodCarousel() {
  const [homeFoods, setHomeFoods] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeFoods = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/v1/home-food');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // Ensure the data matches the Frontend 'Restaurant' type
        // Your HomeFoodResponseDTO.java already aligns well with this
        setHomeFoods(data);
      } catch (error) {
        console.error("Error loading home foods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeFoods();
  }, []);

  if (loading) return <div>Loading Home Foods...</div>;
  if (homeFoods.length === 0) return null; // Hide if no data

  return (
    <RestaurantCarousel
      title="Home Food"
      restaurants={homeFoods}
      href="/home-food"
    />
  );
}