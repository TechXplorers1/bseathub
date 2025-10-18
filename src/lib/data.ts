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
  {
    id: '7',
    name: 'The Noodle Bar',
    slug: 'the-noodle-bar',
    imageId: 'restaurant-7',
    cuisine: 'Vietnamese',
    rating: 4.7,
    reviews: 890,
    deliveryTime: 30,
    deliveryFee: 3.50,
    categories: ['Vietnamese', 'Noodles', 'Pho'],
    menu: [
      {
        title: 'Pho',
        items: [
          { id: '701', name: 'Classic Beef Pho', description: 'Rich beef broth with rice noodles and sliced beef.', price: 13.99, imageId: 'food-28' },
          { id: '702', name: 'Chicken Pho', description: 'Savory chicken broth with shredded chicken.', price: 12.99, imageId: 'food-29' },
        ],
      },
      {
        title: 'Appetizers',
        items: [
          { id: '703', name: 'Fresh Spring Rolls', description: 'Shrimp, pork, and herbs wrapped in rice paper.', price: 7.99, imageId: 'food-26' },
        ],
      },
    ],
  },
  {
    id: '8',
    name: 'Pizza Planet',
    slug: 'pizza-planet',
    imageId: 'restaurant-8',
    cuisine: 'Pizza',
    rating: 4.4,
    reviews: 654,
    deliveryTime: 25,
    deliveryFee: 2.99,
    categories: ['Pizza', 'Italian', 'Fast Food'],
    menu: [
      {
        title: 'Specialty Pizzas',
        items: [
          { id: '801', name: 'Pepperoni Overload', description: 'Covered in classic pepperoni slices.', price: 17.99, imageId: 'food-30' },
          { id: '802', name: 'Veggie Supreme', description: 'Onions, peppers, olives, and mushrooms.', price: 16.99, imageId: 'food-31' },
        ],
      },
      {
        title: 'Sides',
        items: [
          { id: '803', name: 'Garlic Knots', description: 'Buttery garlic knots with marinara.', price: 6.99, imageId: 'food-32' },
        ],
      },
    ],
  },
  {
    id: '9',
    name: 'The Daily Grind',
    slug: 'the-daily-grind',
    imageId: 'restaurant-9',
    cuisine: 'Cafe',
    rating: 4.8,
    reviews: 1102,
    deliveryTime: 10,
    deliveryFee: 1.50,
    categories: ['Coffee', 'Cafe', 'Breakfast'],
    menu: [
      {
        title: 'Coffee & Tea',
        items: [
          { id: '901', name: 'Iced Latte', description: 'Espresso with chilled milk over ice.', price: 4.99, imageId: 'food-33' },
          { id: '902', name: 'Matcha Green Tea', description: 'Ceremonial grade matcha with steamed milk.', price: 5.49, imageId: 'food-34' },
        ],
      },
      {
        title: 'Pastries',
        items: [
          { id: '903', name: 'Croissant', description: 'Flaky, buttery, and freshly baked.', price: 3.50, imageId: 'food-35' },
        ],
      },
    ],
  },
  {
    id: '10',
    name: 'Bangkok Spice',
    slug: 'bangkok-spice',
    imageId: 'restaurant-10',
    cuisine: 'Thai',
    rating: 4.6,
    reviews: 932,
    deliveryTime: 30,
    deliveryFee: 3.00,
    categories: ['Thai', 'Curry', 'Asian'],
    menu: [
      {
        title: 'Main Dishes',
        items: [
          { id: '1001', name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp, tofu, and peanuts.', price: 15.99, imageId: 'food-36' },
          { id: '1002', name: 'Green Curry', description: 'Spicy green curry with chicken and bamboo shoots.', price: 16.99, imageId: 'food-37' },
        ],
      },
      {
        title: 'Appetizers',
        items: [
          { id: '1003', name: 'Tom Yum Soup', description: 'Hot and sour soup with shrimp and mushrooms.', price: 8.99, imageId: 'food-38' },
        ],
      },
    ],
  },
  {
    id: '11',
    name: 'The Vegan Spot',
    slug: 'the-vegan-spot',
    imageId: 'restaurant-11',
    cuisine: 'Vegan',
    rating: 4.9,
    reviews: 1500,
    deliveryTime: 20,
    deliveryFee: 2.99,
    categories: ['Vegan', 'Healthy', 'Salads'],
    menu: [
      {
        title: 'Bowls',
        items: [
          { id: '1101', name: 'Buddha Bowl', description: 'Roasted veggies, quinoa, and a tahini dressing.', price: 14.99, imageId: 'food-25' },
          { id: '1102', name: 'Spicy "Tuna" Bowl', description: 'Plant-based tuna with avocado and brown rice.', price: 15.99, imageId: 'food-39' },
        ],
      },
      {
        title: 'Burgers',
        items: [
          { id: '1103', name: 'Impossible Burger', description: 'A delicious plant-based patty with all the fixings.', price: 16.99, imageId: 'food-40' },
        ],
      },
    ],
  },
  {
    id: '12',
    name: 'Steakhouse Supreme',
    slug: 'steakhouse-supreme',
    imageId: 'restaurant-12',
    cuisine: 'Steakhouse',
    rating: 4.8,
    reviews: 1800,
    deliveryTime: 40,
    deliveryFee: 5.00,
    categories: ['Steak', 'American', 'Fine Dining'],
    menu: [
      {
        title: 'Steaks',
        items: [
          { id: '1201', name: 'Filet Mignon (8oz)', description: 'The most tender cut, cooked to perfection.', price: 45.99, imageId: 'food-41' },
          { id: '1202', name: 'Ribeye (12oz)', description: 'Well-marbled for peak flavor.', price: 39.99, imageId: 'food-42' },
        ],
      },
      {
        title: 'Sides',
        items: [
          { id: '1203', name: 'Creamed Spinach', description: 'A classic steakhouse side.', price: 9.99, imageId: 'food-43' },
        ],
      },
    ],
  },
];
