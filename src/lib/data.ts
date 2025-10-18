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
  {
    id: '13',
    name: 'Mediterranean Bites',
    slug: 'mediterranean-bites',
    imageId: 'restaurant-13',
    cuisine: 'Mediterranean',
    rating: 4.7,
    reviews: 850,
    deliveryTime: 28,
    deliveryFee: 3.20,
    categories: ['Mediterranean', 'Greek', 'Healthy'],
    menu: [
      {
        title: 'Plates',
        items: [
          { id: '1301', name: 'Chicken Shawarma Plate', description: 'Marinated chicken, rice, and salad.', price: 17.99, imageId: 'food-1' },
          { id: '1302', name: 'Falafel Plate', description: 'Crispy falafel with tahini sauce.', price: 14.99, imageId: 'food-2' },
        ],
      },
    ],
  },
  {
    id: '14',
    name: 'Breakfast Club',
    slug: 'breakfast-club',
    imageId: 'restaurant-14',
    cuisine: 'Breakfast',
    rating: 4.6,
    reviews: 1100,
    deliveryTime: 22,
    deliveryFee: 2.50,
    categories: ['Breakfast', 'American', 'Cafe'],
    menu: [
      {
        title: 'Classics',
        items: [
          { id: '1401', name: 'Pancakes Stack', description: 'Fluffy pancakes with syrup and butter.', price: 12.99, imageId: 'food-3' },
          { id: '1402', name: 'Eggs Benedict', description: 'Poached eggs, ham, on an English muffin with hollandaise.', price: 15.99, imageId: 'food-4' },
        ],
      },
    ],
  },
  {
    id: '15',
    name: 'The Ramen Shop',
    slug: 'the-ramen-shop',
    imageId: 'restaurant-15',
    cuisine: 'Japanese',
    rating: 4.8,
    reviews: 1300,
    deliveryTime: 33,
    deliveryFee: 3.80,
    categories: ['Japanese', 'Ramen', 'Noodles'],
    menu: [
      {
        title: 'Ramen',
        items: [
          { id: '1501', name: 'Tonkotsu Ramen', description: 'Rich pork broth with chashu pork.', price: 16.99, imageId: 'food-5' },
          { id: '1502', name: 'Miso Ramen', description: 'Soybean paste broth with vegetables.', price: 15.99, imageId: 'food-6' },
        ],
      },
    ],
  },
  {
    id: '16',
    name: 'BBQ Central',
    slug: 'bbq-central',
    imageId: 'restaurant-16',
    cuisine: 'BBQ',
    rating: 4.5,
    reviews: 950,
    deliveryTime: 45,
    deliveryFee: 4.50,
    categories: ['BBQ', 'American', 'Grill'],
    menu: [
      {
        title: 'Meats',
        items: [
          { id: '1601', name: 'Pulled Pork Sandwich', description: 'Slow-smoked pulled pork on a brioche bun.', price: 14.99, imageId: 'food-7' },
          { id: '1602', name: 'Beef Brisket', description: 'Tender beef brisket, sold by the pound.', price: 28.99, imageId: 'food-8' },
        ],
      },
    ],
  },
  {
    id: '17',
    name: 'The Sweet Spot',
    slug: 'the-sweet-spot',
    imageId: 'restaurant-17',
    cuisine: 'Desserts',
    rating: 4.9,
    reviews: 2100,
    deliveryTime: 18,
    deliveryFee: 2.00,
    categories: ['Desserts', 'Bakery', 'Sweets'],
    menu: [
      {
        title: 'Cakes',
        items: [
          { id: '1701', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center.', price: 8.99, imageId: 'food-9' },
          { id: '1702', name: 'New York Cheesecake', description: 'Classic creamy cheesecake.', price: 7.99, imageId: 'food-10' },
        ],
      },
    ],
  },
  {
    id: '18',
    name: 'Healthy Habits',
    slug: 'healthy-habits',
    imageId: 'restaurant-18',
    cuisine: 'Healthy',
    rating: 4.7,
    reviews: 780,
    deliveryTime: 20,
    deliveryFee: 3.00,
    categories: ['Healthy', 'Smoothies', 'Bowls'],
    menu: [
      {
        title: 'Smoothies',
        items: [
          { id: '1801', name: 'Green Detox Smoothie', description: 'Spinach, kale, apple, and banana.', price: 9.99, imageId: 'food-11' },
          { id: '1802', name: 'Berry Blast Smoothie', description: 'Mixed berries, yogurt, and honey.', price: 9.99, imageId: 'food-12' },
        ],
      },
    ],
  },
   {
    id: '19',
    name: 'Cluck-a-Doodle',
    slug: 'cluck-a-doodle',
    imageId: 'restaurant-19',
    cuisine: 'Chicken',
    rating: 4.6,
    reviews: 1300,
    deliveryTime: 25,
    deliveryFee: 3.50,
    categories: ['Chicken', 'Fast Food', 'American'],
    menu: [
      {
        title: 'Fried Chicken',
        items: [
          { id: '1901', name: '3-Piece Fried Chicken', description: 'Crispy and juicy fried chicken.', price: 12.99, imageId: 'food-44' },
          { id: '1902', name: 'Spicy Chicken Sandwich', description: 'A fiery chicken sandwich with pickles.', price: 9.99, imageId: 'food-45' },
        ],
      },
    ],
  },
  {
    id: '20',
    name: 'Boba Bliss',
    slug: 'boba-bliss',
    imageId: 'restaurant-20',
    cuisine: 'Bubble Tea',
    rating: 4.9,
    reviews: 2500,
    deliveryTime: 15,
    deliveryFee: 2.00,
    categories: ['Bubble Tea', 'Drinks', 'Desserts'],
    menu: [
      {
        title: 'Milk Teas',
        items: [
          { id: '2001', name: 'Classic Milk Tea', description: 'Black tea with milk and tapioca pearls.', price: 5.50, imageId: 'food-46' },
          { id: '2002', name: 'Taro Milk Tea', description: 'Creamy taro flavor with boba.', price: 6.00, imageId: 'food-47' },
        ],
      },
    ],
  },
  {
    id: '21',
    name: 'The Halal Guys',
    slug: 'the-halal-guys',
    imageId: 'restaurant-21',
    cuisine: 'Halal',
    rating: 4.7,
    reviews: 5000,
    deliveryTime: 20,
    deliveryFee: 3.00,
    categories: ['Halal', 'Mediterranean', 'Street Food'],
    menu: [
      {
        title: 'Platters',
        items: [
          { id: '2101', name: 'Chicken & Gyro Combo', description: 'A mix of chicken and gyro meat over rice.', price: 14.99, imageId: 'food-48' },
          { id: '2102', name: 'Falafel Platter', description: 'Crispy falafel over rice with white sauce.', price: 12.99, imageId: 'food-2' },
        ],
      },
    ],
  },
  {
    id: '22',
    name: 'Sublime Sandwiches',
    slug: 'sublime-sandwiches',
    imageId: 'restaurant-22',
    cuisine: 'Sandwiches',
    rating: 4.5,
    reviews: 600,
    deliveryTime: 18,
    deliveryFee: 2.50,
    categories: ['Sandwiches', 'Deli', 'Lunch'],
    menu: [
      {
        title: 'Hot Sandwiches',
        items: [
          { id: '2201', name: 'Philly Cheesesteak', description: 'Thinly-sliced beef with melted cheese and onions.', price: 13.99, imageId: 'food-49' },
          { id: '2202', name: 'Italian Meatball Sub', description: 'Meatballs in marinara with provolone.', price: 12.99, imageId: 'food-50' },
        ],
      },
    ],
  },
  {
    id: '23',
    name: 'Athens Grill',
    slug: 'athens-grill',
    imageId: 'restaurant-13',
    cuisine: 'Greek',
    rating: 4.8,
    reviews: 950,
    deliveryTime: 30,
    deliveryFee: 3.00,
    categories: ['Greek', 'Mediterranean', 'Healthy'],
    menu: [
      {
        title: 'Gyros',
        items: [
          { id: '2301', name: 'Lamb Gyro', description: 'Sliced lamb in a warm pita with tzatziki.', price: 11.99, imageId: 'food-1' },
          { id: '2302', name: 'Chicken Souvlaki Pita', description: 'Grilled chicken skewers in a pita.', price: 10.99, imageId: 'food-2' },
        ],
      },
    ],
  },
  {
    id: '24',
    name: 'Perfectly Pasta',
    slug: 'perfectly-pasta',
    imageId: 'restaurant-1',
    cuisine: 'Italian',
    rating: 4.6,
    reviews: 800,
    deliveryTime: 28,
    deliveryFee: 3.50,
    categories: ['Italian', 'Pasta', 'Noodle'],
    menu: [
      {
        title: 'Pasta',
        items: [
          { id: '2401', name: 'Fettuccine Alfredo', description: 'Creamy parmesan sauce over fettuccine.', price: 17.99, imageId: 'food-3' },
          { id: '2402', name: 'Pesto Gnocchi', description: 'Soft potato dumplings in a basil pesto sauce.', price: 18.99, imageId: 'food-4' },
        ],
      },
    ],
  },
  {
    id: '25',
    name: 'The Cake Box',
    slug: 'the-cake-box',
    imageId: 'restaurant-17',
    cuisine: 'Bakery',
    rating: 4.9,
    reviews: 1200,
    deliveryTime: 20,
    deliveryFee: 2.50,
    categories: ['Bakery', 'Desserts', 'Sweets'],
    menu: [
      {
        title: 'Cupcakes',
        items: [
          { id: '2501', name: 'Red Velvet Cupcake', description: 'Classic red velvet with cream cheese frosting.', price: 4.50, imageId: 'food-9' },
          { id: '2502', name: 'Chocolate Fudge Cupcake', description: 'Rich chocolate cupcake with fudge icing.', price: 4.50, imageId: 'food-10' },
        ],
      },
    ],
  }
];


export const allHomeFoods: Restaurant[] = [
  {
    id: 'hf1',
    name: "Maria's Kitchen",
    slug: 'marias-kitchen',
    imageId: 'food-1',
    cuisine: 'Homestyle Italian',
    rating: 4.9,
    reviews: 150,
    deliveryTime: 30,
    deliveryFee: 3.50,
    categories: ['Italian', 'Homemade', 'Pasta'],
    menu: [
      {
        title: 'Family Recipes',
        items: [
          { id: 'hf101', name: 'Grandma\'s Lasagna', description: 'Layers of pasta, ricotta, and bolognese sauce.', price: 18.00, imageId: 'food-3' },
          { id: 'hf102', name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and mozzarella.', price: 17.50, imageId: 'food-4' },
        ],
      },
    ],
  },
  {
    id: 'hf2',
    name: 'Chen\'s Dumplings',
    slug: 'chens-dumplings',
    imageId: 'food-2',
    cuisine: 'Chinese',
    rating: 4.8,
    reviews: 210,
    deliveryTime: 25,
    deliveryFee: 2.99,
    categories: ['Chinese', 'Dumplings', 'Homemade'],
    menu: [
      {
        title: 'Dumplings',
        items: [
          { id: 'hf201', name: 'Pork & Chive Dumplings (12pcs)', description: 'Hand-wrapped and pan-fried.', price: 15.00, imageId: 'food-5' },
          { id: 'hf202', name: 'Veggie Dumplings (12pcs)', description: 'Filled with mushrooms, cabbage, and carrots.', price: 14.00, imageId: 'food-6' },
        ],
      },
    ],
  },
  {
    id: 'hf3',
    name: "Javier's Tacos",
    slug: 'javiers-tacos',
    imageId: 'food-13',
    cuisine: 'Authentic Mexican',
    rating: 4.9,
    reviews: 300,
    deliveryTime: 20,
    deliveryFee: 2.50,
    categories: ['Mexican', 'Tacos', 'Homemade'],
    menu: [
      {
        title: 'Street Tacos',
        items: [
          { id: 'hf301', name: 'Carne Asada Tacos (3)', description: 'Marinated grilled steak on corn tortillas.', price: 12.00, imageId: 'food-13' },
          { id: 'hf302', name: 'Cochinita Pibil Tacos (3)', description: 'Slow-roasted pork with pickled onions.', price: 12.00, imageId: 'food-14' },
        ],
      },
    ],
  },
  {
    id: 'hf4',
    name: 'Healthy Home Bowls',
    slug: 'healthy-home-bowls',
    imageId: 'food-22',
    cuisine: 'Healthy Bowls',
    rating: 4.7,
    reviews: 95,
    deliveryTime: 15,
    deliveryFee: 4.00,
    categories: ['Healthy', 'Vegan', 'Bowls'],
    menu: [
      {
        title: 'Nourish Bowls',
        items: [
          { id: 'hf401', name: 'Quinoa & Roasted Veggie Bowl', description: 'With lemon-tahini dressing.', price: 16.00, imageId: 'food-22' },
          { id: 'hf402', name: 'Mediterranean Chicken Bowl', description: 'Grilled chicken, feta, olives, and couscous.', price: 17.00, imageId: 'food-23' },
        ],
      },
    ],
  },
  {
    id: 'hf5',
    name: "Priya's Indian Feast",
    slug: 'priyas-indian-feast',
    imageId: 'food-17',
    cuisine: 'Homestyle Indian',
    rating: 4.8,
    reviews: 180,
    deliveryTime: 35,
    deliveryFee: 3.75,
    categories: ['Indian', 'Curry', 'Homemade'],
    menu: [
      {
        title: 'Curries',
        items: [
          { id: 'hf501', name: 'Homestyle Chicken Curry', description: 'Aromatic and medium spicy.', price: 17.00, imageId: 'food-17' },
          { id: 'hf502', name: 'Dal Makhani', description: 'Creamy black lentils.', price: 15.00, imageId: 'food-18' },
        ],
      },
    ],
  },
  {
    id: 'hf6',
    name: 'Brenda\'s BBQ',
    slug: 'brendas-bbq',
    imageId: 'food-7',
    cuisine: 'Southern BBQ',
    rating: 4.9,
    reviews: 250,
    deliveryTime: 45,
    deliveryFee: 5.00,
    categories: ['BBQ', 'American', 'Homemade'],
    menu: [
      {
        title: 'BBQ Plates',
        items: [
          { id: 'hf601', name: 'Pulled Pork Plate', description: 'With coleslaw and cornbread.', price: 19.00, imageId: 'food-7' },
          { id: 'hf602', name: 'Smoked Ribs (Half Rack)', description: 'Fall-off-the-bone tender.', price: 22.00, imageId: 'food-8' },
        ],
      },
    ],
  },
  {
    id: 'hf7',
    name: 'Mama Kim\'s Korean',
    slug: 'mama-kims-korean',
    imageId: 'food-24', // Placeholder
    cuisine: 'Korean',
    rating: 4.8,
    reviews: 190,
    deliveryTime: 30,
    deliveryFee: 3.50,
    categories: ['Korean', 'Homemade', 'Spicy'],
    menu: [
      {
        title: 'Main Dishes',
        items: [
          { id: 'hf701', name: 'Bibimbap', description: 'Mixed rice with vegetables, beef, and a fried egg.', price: 18.00, imageId: 'food-24' },
          { id: 'hf702', name: 'Kimchi Jjigae', description: 'Spicy kimchi stew with pork and tofu.', price: 17.00, imageId: 'food-25' },
        ],
      },
    ],
  },
    {
    id: 'hf8',
    name: 'Sophie\'s Soups',
    slug: 'sophies-soups',
    imageId: 'food-38',
    cuisine: 'Soups & Stews',
    rating: 4.9,
    reviews: 120,
    deliveryTime: 20,
    deliveryFee: 3.00,
    categories: ['Soup', 'Comfort Food', 'Homemade'],
    menu: [
      {
        title: 'Hearty Soups',
        items: [
          { id: 'hf801', name: 'Tomato Basil Soup', description: 'Creamy and rich, served with a side of bread.', price: 12.00, imageId: 'food-38' },
          { id: 'hf802', name: 'Chicken Noodle Soup', description: 'Classic comfort in a bowl.', price: 13.00, imageId: 'food-29' },
        ],
      },
    ],
  },
  {
    id: 'hf9',
    name: 'Baker Ben\'s Breads',
    slug: 'baker-bens-breads',
    imageId: 'food-19',
    cuisine: 'Artisan Bakery',
    rating: 4.9,
    reviews: 280,
    deliveryTime: 15,
    deliveryFee: 4.00,
    categories: ['Bakery', 'Bread', 'Homemade'],
    menu: [
      {
        title: 'Freshly Baked',
        items: [
          { id: 'hf901', name: 'Sourdough Loaf', description: 'Naturally leavened and crusty.', price: 9.00, imageId: 'food-19' },
          { id: 'hf902', name: 'Chocolate Babka', description: 'Sweet braided bread with chocolate filling.', price: 14.00, imageId: 'food-27' },
        ],
      },
    ],
  },
  {
    id: 'hf10',
    name: 'Thai by Ton',
    slug: 'thai-by-ton',
    imageId: 'food-36',
    cuisine: 'Authentic Thai',
    rating: 4.8,
    reviews: 165,
    deliveryTime: 30,
    deliveryFee: 3.25,
    categories: ['Thai', 'Homemade', 'Spicy'],
    menu: [
      {
        title: 'Thai Favorites',
        items: [
          { id: 'hf1001', name: 'Green Curry with Chicken', description: 'Homemade green curry paste, coconut milk, and chicken.', price: 17.50, imageId: 'food-37' },
          { id: 'hf1002', name: 'Drunken Noodles (Pad Kee Mao)', description: 'Spicy stir-fried flat noodles with basil.', price: 16.50, imageId: 'food-36' },
        ],
      },
    ],
  },
  {
    id: 'hf11',
    name: 'Elena\'s Greek Kitchen',
    slug: 'elenas-greek-kitchen',
    imageId: 'food-21',
    cuisine: 'Greek',
    rating: 4.9,
    reviews: 195,
    deliveryTime: 30,
    deliveryFee: 3.50,
    categories: ['Greek', 'Mediterranean', 'Homemade'],
    menu: [
      {
        title: 'Greek Specialties',
        items: [
          { id: 'hf1101', name: 'Moussaka', description: 'Layered eggplant, minced meat, and béchamel sauce.', price: 19.00, imageId: 'food-21' },
          { id: 'hf1102', name: 'Spanakopita (Spinach Pie)', description: 'Flaky phyllo pastry with spinach and feta.', price: 10.00, imageId: 'food-22' },
        ],
      },
    ],
  },
  {
    id: 'hf12',
    name: 'Frank\'s Famous Chili',
    slug: 'franks-famous-chili',
    imageId: 'food-24', // Placeholder
    cuisine: 'American Comfort',
    rating: 4.7,
    reviews: 88,
    deliveryTime: 25,
    deliveryFee: 3.00,
    categories: ['Comfort Food', 'American', 'Homemade'],
    menu: [
      {
        title: 'Chili Bowls',
        items: [
          { id: 'hf1201', name: 'Classic Beef Chili', description: 'Hearty and spicy, served with sour cream and cheese.', price: 15.00, imageId: 'food-24' },
          { id: 'hf1202', name: 'Vegetarian Three-Bean Chili', description: 'A flavorful mix of beans and spices.', price: 14.00, imageId: 'food-25' },
        ],
      },
    ],
  },
];

    