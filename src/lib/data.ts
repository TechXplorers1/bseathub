import type { Restaurant } from './types';

export const allRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Spoon',
    slug: 'the-golden-spoon',
    imageId: 'restaurant-1',
    cuisine: 'Italian',
    rating: 4.7,
    reviews: 1204,
    deliveryTime: 25,
    deliveryFee: 2.99,
    categories: ['Italian', 'Pasta', 'Pizza'],
    menu: [
      {
        title: 'Appetizers',
        items: [
          { id: '101', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and basil.', price: 8.99, imageId: 'food-1' },
          { id: '102', name: 'Calamari Fritti', description: 'Fried squid with a zesty marinara sauce.', price: 12.99, imageId: 'food-2' },
        ],
      },
      {
        title: 'Main Courses',
        items: [
          { id: '103', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper.', price: 18.99, imageId: 'food-3' },
          { id: '104', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 15.99, imageId: 'food-4' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Sushi Palace',
    slug: 'sushi-palace',
    imageId: 'restaurant-2',
    cuisine: 'Japanese',
    rating: 4.9,
    reviews: 2345,
    deliveryTime: 30,
    deliveryFee: 4.50,
    categories: ['Japanese', 'Sushi', 'Asian'],
    menu: [
      {
        title: 'Sushi Rolls',
        items: [
          { id: '201', name: 'California Roll', description: 'Crab, avocado, and cucumber.', price: 10.99, imageId: 'food-5' },
          { id: '202', name: 'Spicy Tuna Roll', description: 'Tuna, spicy mayo, and cucumber.', price: 12.99, imageId: 'food-6' },
        ],
      },
      {
        title: 'Nigiri',
        items: [
          { id: '203', name: 'Salmon Nigiri', description: 'Fresh salmon over vinegared rice.', price: 6.99, imageId: 'food-7' },
          { id: '204', name: 'Tuna Nigiri', description: 'Premium tuna over vinegared rice.', price: 7.99, imageId: 'food-8' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Burger Bonanza',
    slug: 'burger-bonanza',
    imageId: 'restaurant-3',
    cuisine: 'American',
    rating: 4.5,
    reviews: 876,
    deliveryTime: 20,
    deliveryFee: 1.99,
    categories: ['American', 'Burgers', 'Fast Food'],
    menu: [
      {
        title: 'Burgers',
        items: [
          { id: '301', name: 'Classic Cheeseburger', description: 'Beef patty, cheese, lettuce, tomato, and onion.', price: 11.99, imageId: 'food-9' },
          { id: '302', name: 'Bacon Avocado Burger', description: 'Beef patty, bacon, avocado, and swiss cheese.', price: 14.99, imageId: 'food-10' },
        ],
      },
      {
        title: 'Sides',
        items: [
          { id: '303', name: 'French Fries', description: 'Crispy golden fries.', price: 4.99, imageId: 'food-11' },
          { id: '304', name: 'Onion Rings', description: 'Battered and fried onion rings.', price: 5.99, imageId: 'food-12' },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Taco Town',
    slug: 'taco-town',
    imageId: 'restaurant-4',
    cuisine: 'Mexican',
    rating: 4.6,
    reviews: 998,
    deliveryTime: 25,
    deliveryFee: 3.00,
    categories: ['Mexican', 'Tacos', 'Burritos'],
    menu: [
       {
        title: 'Tacos',
        items: [
          { id: '401', name: 'Carne Asada Taco', description: 'Grilled steak in a corn tortilla.', price: 3.99, imageId: 'food-13' },
          { id: '402', name: 'Al Pastor Taco', description: 'Marinated pork with pineapple.', price: 3.99, imageId: 'food-14' },
        ],
      },
      {
        title: 'Burritos',
        items: [
          { id: '403', name: 'Bean & Cheese Burrito', description: 'A classic simple burrito.', price: 8.99, imageId: 'food-15' },
          { id: '404', name: 'California Burrito', description: 'Carne asada, fries, cheese, and guacamole.', price: 12.99, imageId: 'food-16' },
        ],
      },
    ],
  },
  {
    id: '5',
    name: 'Curry House',
    slug: 'curry-house',
    imageId: 'restaurant-5',
    cuisine: 'Indian',
    rating: 4.8,
    reviews: 1543,
    deliveryTime: 35,
    deliveryFee: 4.00,
    categories: ['Indian', 'Curry', 'Vegetarian'],
    menu: [
       {
        title: 'Curries',
        items: [
          { id: '501', name: 'Chicken Tikka Masala', description: 'Creamy tomato-based curry with chicken.', price: 16.99, imageId: 'food-17' },
          { id: '502', name: 'Paneer Butter Masala', description: 'Indian cheese in a rich, creamy sauce.', price: 15.99, imageId: 'food-18' },
        ],
      },
      {
        title: 'Breads',
        items: [
          { id: '503', name: 'Garlic Naan', description: 'Soft flatbread with garlic and butter.', price: 3.99, imageId: 'food-19' },
          { id: '504', name: 'Roti', description: 'Whole wheat flatbread.', price: 2.99, imageId: 'food-20' },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'The Green Bowl',
    slug: 'the-green-bowl',
    imageId: 'restaurant-6',
    cuisine: 'Salads',
    rating: 4.9,
    reviews: 789,
    deliveryTime: 15,
    deliveryFee: 2.50,
    categories: ['Salads', 'Healthy', 'Vegan'],
    menu: [
       {
        title: 'Signature Salads',
        items: [
          { id: '601', name: 'Cobb Salad', description: 'Greens, chicken, bacon, egg, avocado, and blue cheese.', price: 14.99, imageId: 'food-21' },
          { id: '602', name: 'Quinoa & Avocado Power Bowl', description: 'Quinoa, avocado, chickpeas, and mixed greens.', price: 13.99, imageId: 'food-22' },
        ],
      },
      {
        title: 'Create Your Own',
        items: [
          { id: '603', name: 'Custom Salad', description: 'Choose your base, toppings, and dressing.', price: 15.99, imageId: 'food-23' },
        ],
      },
    ],
  },
];
