
export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Preparing' | 'Out for Delivery';

export type ProviderOrder = {
    id: string;
    customer: {
        name: string;
        email: string;
        avatarUrl: string;
    };
    amount: number;
    status: OrderStatus;
    date: string;
    items: { name: string; quantity: number; price: number }[];
};


export const overviewStats = {
    totalRevenue: 12850.50,
    totalOrders: 850,
    pendingOrders: 12,
    avgRating: 4.7,
};

export const recentOrders: ProviderOrder[] = [
    {
      id: 'ORD-GS001',
      customer: { name: 'Michael Scott', email: 'm.scott@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
      amount: 18.99,
      status: 'Completed',
      date: '2024-07-28',
      items: [{ name: "Spaghetti Carbonara", quantity: 1, price: 18.99 }],
    },
    {
      id: 'ORD-GS002',
      customer: { name: 'Dwight Schrute', email: 'd.schrute@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
      amount: 12.99,
      status: 'Preparing',
      date: '2024-07-28',
      items: [{ name: 'Calamari Fritti', quantity: 1, price: 12.99 }],
    },
    {
      id: 'ORD-GS003',
      customer: { name: 'Pam Beesly', email: 'p.beesly@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
      amount: 31.98,
      status: 'Pending',
      date: '2024-07-28',
      items: [{ name: "Margherita Pizza", quantity: 2, price: 15.99 }],
    },
    {
        id: 'ORD-GS004',
        customer: { name: 'Jim Halpert', email: 'j.halpert@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705a' },
        amount: 8.99,
        status: 'Completed',
        date: '2024-07-27',
        items: [{ name: 'Bruschetta', quantity: 1, price: 8.99 }],
      },
      {
        id: 'ORD-GS005',
        customer: { name: 'Angela Martin', email: 'a.martin@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705b' },
        amount: 18.99,
        status: 'Cancelled',
        date: '2024-07-26',
        items: [{ name: "Spaghetti Carbonara", quantity: 1, price: 18.99 }],
      },
  ];

  export const providerOrders: ProviderOrder[] = [
    ...recentOrders,
    {
        id: 'ORD-GS006',
        customer: { name: 'Kevin Malone', email: 'k.malone@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705c' },
        amount: 47.97,
        status: 'Completed',
        date: '2024-07-25',
        items: [{ name: 'Margherita Pizza', quantity: 3, price: 15.99 }],
    },
    {
        id: 'ORD-GS007',
        customer: { name: 'Oscar Martinez', email: 'o.martinez@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
        amount: 12.99,
        status: 'Out for Delivery',
        date: '2024-07-28',
        items: [{ name: "Calamari Fritti", quantity: 1, price: 12.99 }],
    },
  ];

  export const menuItems = [
    {
      id: '103',
      name: 'Spaghetti Carbonara',
      price: 18.99,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1574969903809-3f7a1668ceb0?q=80&w=2080&auto=format&fit=crop',
      isSpecial: true,
    },
    {
      id: '104',
      name: 'Margherita Pizza',
      price: 15.99,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=2080&auto=format&fit=crop',
      isSpecial: false,
    },
    {
        id: '101',
        name: 'Bruschetta',
        price: 8.99,
        status: 'Available',
        imageUrl: 'https://images.unsplash.com/photo-1574862612718-adc4a21d2204?q=80&w=2080&auto=format&fit=crop',
        isSpecial: false,
    },
    {
        id: '102',
        name: 'Calamari Fritti',
        price: 12.99,
        status: 'Out of Stock',
        imageUrl: 'https://images.unsplash.com/photo-1731633055740-790a9fbf8626?q=80&w=2080&auto=format&fit=crop',
        isSpecial: false,
    }
  ];

  export const customerFeedback = [
    {
        id: '1',
        customer: { name: 'Michael Scott', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        rating: 5,
        dish: "Spaghetti Carbonara",
        comment: "Best carbonara in the city! World's best boss, world's best pasta. It's a win-win-win.",
        date: '2024-07-28',
    },
    {
        id: '2',
        customer: { name: 'Jim Halpert', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705a' },
        rating: 4,
        dish: "Bruschetta",
        comment: "The bruschetta was great. A bit hard to eat while putting Dwight's stapler in jello, but I managed.",
        date: '2024-07-27',
    },
    {
        id: '3',
        customer: { name: 'Pam Beesly', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
        rating: 5,
        dish: "Margherita Pizza",
        comment: "So simple, yet so delicious. The crust was perfect. I could eat this all day. Maybe I will.",
        date: '2024-07-28',
    }
  ];

  export const salesPerformance = [
    { name: "Sun", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Mon", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Tue", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Wed", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Thu", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Fri", total: Math.floor(Math.random() * 1500) + 500 },
    { name: "Sat", total: Math.floor(Math.random() * 1500) + 500 },
  ];

  export const topSellingDishes = [
    { name: "Spaghetti Carbonara", orders: 250, revenue: 4747.50 },
    { name: 'Margherita Pizza', orders: 200, revenue: 3198.00 },
    { name: 'Calamari Fritti', orders: 150, revenue: 1948.50 },
    { name: 'Bruschetta', orders: 120, revenue: 1078.80 },
  ];
  
  export const orderTrends = [
    { day: 'Friday', peakTime: '7 PM - 9 PM', volume: 'High' },
    { day: 'Saturday', peakTime: '6 PM - 9 PM', volume: 'High' },
    { day: 'Thursday', peakTime: '6 PM - 8 PM', volume: 'Medium' },
    { day: 'Sunday', peakTime: '5 PM - 7 PM', volume: 'Medium' },
    { day: 'Tuesday', peakTime: 'N/A', volume: 'Low' },
  ];
