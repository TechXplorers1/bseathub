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
};


export const overviewStats = {
    totalRevenue: 4250.75,
    totalOrders: 215,
    pendingOrders: 5,
    avgRating: 4.9,
};

export const recentOrders: ProviderOrder[] = [
    {
      id: 'ORD-HF001',
      customer: { name: 'Jane Doe', email: 'jane.d@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
      amount: 18.00,
      status: 'Completed',
      date: '2024-07-28',
    },
    {
      id: 'ORD-HF002',
      customer: { name: 'John Smith', email: 'john.s@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
      amount: 17.50,
      status: 'Preparing',
      date: '2024-07-28',
    },
    {
      id: 'ORD-HF003',
      customer: { name: 'Alice Johnson', email: 'alice.j@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
      amount: 36.00,
      status: 'Pending',
      date: '2024-07-28',
    },
    {
        id: 'ORD-HF004',
        customer: { name: 'Bob Brown', email: 'bob.b@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705a' },
        amount: 17.50,
        status: 'Completed',
        date: '2024-07-27',
      },
      {
        id: 'ORD-HF005',
        customer: { name: 'Charlie Davis', email: 'charlie.d@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705b' },
        amount: 18.00,
        status: 'Cancelled',
        date: '2024-07-26',
      },
  ];

  export const providerOrders: ProviderOrder[] = [
    ...recentOrders,
    {
        id: 'ORD-HF006',
        customer: { name: 'Diana Miller', email: 'diana.m@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705c' },
        amount: 35.00,
        status: 'Completed',
        date: '2024-07-25',
    },
    {
        id: 'ORD-HF007',
        customer: { name: 'Ethan Wilson', email: 'ethan.w@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
        amount: 18.00,
        status: 'Out for Delivery',
        date: '2024-07-28',
    },
  ];

  export const menuItems = [
    {
      id: 'hf101',
      name: "Grandma's Lasagna",
      price: 18.00,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1574894709920-31b297c5a426?q=80&w=2080&auto=format&fit=crop',
      isSpecial: true,
    },
    {
      id: 'hf102',
      name: 'Chicken Parmesan',
      price: 17.50,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1632778149955-6335344c1664?q=80&w=2080&auto=format&fit=crop',
      isSpecial: false,
    },
    {
        id: 'hf103',
        name: 'Garlic Bread',
        price: 6.00,
        status: 'Out of Stock',
        imageUrl: 'https://images.unsplash.com/photo-1626702329388-7c8701980a6b?q=80&w=2080&auto=format&fit=crop',
        isSpecial: false,
    }
  ];

  export const customerFeedback = [
    {
        id: '1',
        customer: { name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        rating: 5,
        dish: "Grandma's Lasagna",
        comment: "Absolutely divine! Tasted just like my grandma's. The portion was huge and worth every penny. Will be ordering again!",
        date: '2024-07-28',
    },
    {
        id: '2',
        customer: { name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
        rating: 4,
        dish: "Chicken Parmesan",
        comment: "Really good chicken parm, very crispy and the sauce was great. The packaging kept it warm. Could have used a little more cheese.",
        date: '2024-07-27',
    },
    {
        id: '3',
        customer: { name: 'Bob Brown', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705a' },
        rating: 5,
        dish: "Chicken Parmesan",
        comment: "This is the best chicken parmesan in the city, hands down. Huge portion and so flavorful. Thank you, Maria!",
        date: '2024-07-27',
    }
  ];

  export const salesPerformance = [
    { name: "Sun", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Mon", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Tue", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Wed", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Thu", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Fri", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Sat", total: Math.floor(Math.random() * 500) + 100 },
  ];

  export const topSellingDishes = [
    { name: "Grandma's Lasagna", orders: 75, revenue: 1350.00 },
    { name: 'Chicken Parmesan', orders: 60, revenue: 1050.00 },
    { name: 'Garlic Bread', orders: 40, revenue: 240.00 },
  ];
  
  export const orderTrends = [
    { day: 'Friday', peakTime: '6 PM - 8 PM', volume: 'High' },
    { day: 'Saturday', peakTime: '7 PM - 9 PM', volume: 'High' },
    { day: 'Sunday', peakTime: '12 PM - 2 PM', volume: 'Medium' },
    { day: 'Wednesday', peakTime: '5 PM - 7 PM', volume: 'Medium' },
    { day: 'Monday', peakTime: 'N/A', volume: 'Low' },
  ];
