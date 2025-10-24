export type PendingRegistration = {
  id: string;
  name: string;
  type: 'Restaurant' | 'Home Food' | 'Chef';
  date: string;
};

export type PlatformOrder = {
    id: string;
    customerName: string;
    partnerName: string;
    amount: number;
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    date: string;
};

export type ChefBooking = {
    id: string;
    customer: {
        name: string;
        email: string;
    };
    chef: {
        name: string;
    };
    eventDate: string;
    guests: number;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
};

export type Activity = {
    id: string;
    name: string;
    description: string;
    time: string;
    avatarUrl: string;
};

export const adminStats = {
  totalOrders: 12530,
  activePartners: 842,
  completedBookings: 450,
  totalRevenue: 258340,
};

export const chartData = {
  revenue: [
    { name: 'Jan', restaurants: 4000, homeFood: 2400 },
    { name: 'Feb', restaurants: 3000, homeFood: 1398 },
    { name: 'Mar', restaurants: 5000, homeFood: 9800 },
    { name: 'Apr', restaurants: 4780, homeFood: 3908 },
    { name: 'May', restaurants: 5890, homeFood: 4800 },
    { name: 'Jun', restaurants: 4390, homeFood: 3800 },
  ],
  signups: [
    { name: 'Jan', restaurants: 20, homeFood: 30, chefs: 10 },
    { name: 'Feb', restaurants: 25, homeFood: 35, chefs: 12 },
    { name: 'Mar', restaurants: 30, homeFood: 40, chefs: 15 },
    { name: 'Apr', restaurants: 28, homeFood: 38, chefs: 18 },
    { name: 'May', restaurants: 35, homeFood: 45, chefs: 20 },
    { name: 'Jun', restaurants: 40, homeFood: 50, chefs: 22 },
  ],
};

export const recentActivities: Activity[] = [
    { id: '1', name: 'New Order #ORD12345', description: 'From The Golden Spoon', time: '2m ago', avatarUrl: '/icons/order.svg' },
    { id: '2', name: 'New Chef Registration', description: 'Chef Alex', time: '10m ago', avatarUrl: '/icons/chef.svg' },
    { id: '3', name: 'Order Delivered #ORD12344', description: 'To Jane Doe', time: '30m ago', avatarUrl: '/icons/delivered.svg' },
    { id: '4', name: 'New Booking #BK54321', description: 'With Chef Maria', time: '1h ago', avatarUrl: '/icons/booking.svg' },
    { id: '5', name: 'New Restaurant Registration', description: 'The Noodle Bar', time: '2h ago', avatarUrl: '/icons/restaurant.svg' },
];

export const pendingRegistrations: PendingRegistration[] = [
  { id: 'reg1', name: 'The Spicy Taco', type: 'Restaurant', date: '2024-07-28' },
  { id: 'reg2', name: "Anna's Bakery", type: 'Home Food', date: '2024-07-28' },
  { id: 'reg3', name: 'Chef Michael', type: 'Chef', date: '2024-07-27' },
  { id: 'reg4', name: 'Gourmet Grills', type: 'Restaurant', date: '2024-07-26' },
];

export const allOrders: PlatformOrder[] = [
  { id: 'ORD5551', customerName: 'John Smith', partnerName: 'The Golden Spoon', amount: 45.50, status: 'Delivered', date: '2024-07-28' },
  { id: 'ORD5552', customerName: 'Emily Jones', partnerName: "Maria's Kitchen", amount: 25.00, status: 'Preparing', date: '2024-07-28' },
  { id: 'ORD5553', customerName: 'David Williams', partnerName: 'Pizza Planet', amount: 33.20, status: 'Out for Delivery', date: '2024-07-28' },
  { id: 'ORD5554', customerName: 'Sarah Brown', partnerName: 'Sushi Palace', amount: 62.10, status: 'Pending', date: '2024-07-28' },
  { id: 'ORD5555', customerName: 'Robert Miller', partnerName: 'The Noodle Bar', amount: 18.90, status: 'Cancelled', date: '2024-07-27' },
];

export const allBookings: ChefBooking[] = [
    { id: 'BK101', customer: { name: 'Alice Wonderland', email: 'alice@example.com' }, chef: { name: 'Chef Gordon' }, eventDate: '2024-08-15', guests: 10, status: 'Confirmed' },
    { id: 'BK102', customer: { name: 'Bob Builder', email: 'bob@example.com' }, chef: { name: 'Chef Julia' }, eventDate: '2024-08-20', guests: 4, status: 'Pending' },
    { id: 'BK103', customer: { name: 'Charlie Chocolate', email: 'charlie@example.com' }, chef: { name: 'Chef Ramsey' }, eventDate: '2024-07-25', guests: 20, status: 'Completed' },
];
