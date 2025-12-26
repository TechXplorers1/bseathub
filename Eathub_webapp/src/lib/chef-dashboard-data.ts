

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type ChefBooking = {
  id: string;
  customer: {
    name: string;
    avatarUrl: string;
  };
  eventDate: string;
  guests: number;
  status: BookingStatus;
  total: number;
  service: string;
};

export const overviewStats = {
  totalBookings: 78,
  upcomingBookings: 12,
  completedBookings: 60,
  totalEarnings: 15600,
  avgRating: 4.9,
};

export const recentBookings: ChefBooking[] = [
  {
    id: 'BK-001',
    customer: { name: 'Alice Wonderland', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    eventDate: '2024-08-15',
    guests: 10,
    status: 'Confirmed',
    total: 1200,
    service: 'Private Dinner',
  },
  {
    id: 'BK-002',
    customer: { name: 'Bob Builder', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    eventDate: '2024-08-20',
    guests: 4,
    status: 'Pending',
    total: 600,
    service: 'Home Cooking Class',
  },
  {
    id: 'BK-003',
    customer: { name: 'Charlie Chocolate', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
    eventDate: '2024-07-25',
    guests: 20,
    status: 'Completed',
    total: 2500,
    service: 'Event Catering',
  },
  {
    id: 'BK-004',
    customer: { name: 'Diana Prince', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
    eventDate: '2024-08-05',
    guests: 2,
    status: 'Confirmed',
    total: 400,
    service: 'Private Dinner',
  },
   {
    id: 'BK-005',
    customer: { name: 'Bruce Wayne', avatarUrl: 'https://i.pravatar.cc/150?u=bruce' },
    eventDate: '2024-07-22',
    guests: 50,
    status: 'Completed',
    total: 5000,
    service: 'Event Catering',
  },
];

export let allBookings: ChefBooking[] = [
    ...recentBookings,
    {
        id: 'BK-006',
        customer: { name: 'Clark Kent', avatarUrl: 'https://i.pravatar.cc/150?u=clark' },
        eventDate: '2024-09-01',
        guests: 8,
        status: 'Pending',
        total: 1000,
        service: 'Private Dinner',
    },
    {
        id: 'BK-007',
        customer: { name: 'Selina Kyle', avatarUrl: 'https://i.pravatar.cc/150?u=selina' },
        eventDate: '2024-07-20',
        guests: 15,
        status: 'Cancelled',
        total: 1800,
        service: 'Event Catering',
    }
];

type NewBookingData = Omit<ChefBooking, 'id' | 'status' | 'total'> & { chef: { name: string } };

export const addBooking = (bookingData: NewBookingData) => {
    const newBooking: ChefBooking = {
      id: `BK-${Math.floor(Math.random() * 900) + 100}`,
      customer: bookingData.customer,
      eventDate: bookingData.eventDate,
      guests: bookingData.guests,
      service: bookingData.service,
      status: 'Pending',
      total: bookingData.guests * 100, // Dummy calculation
    };
    allBookings.unshift(newBooking);
  };

export const chefServices = [
    { id: 'serv1', name: 'Private Dinner', description: 'An exclusive multi-course dining experience for small groups.', price: 'Starts at $100/person', status: 'Active' },
    { id: 'serv2', name: 'Event Catering', description: 'Full-service catering for parties, weddings, and corporate events.', price: 'Custom Quote', status: 'Active' },
    { id: 'serv3', name: 'Home Cooking Class', description: 'Learn to cook your favorite dishes in the comfort of your own home.', price: '$75/person', status: 'Active' },
    { id: 'serv4', name: 'Meal Prep Services', description: 'Weekly meal preparation tailored to your dietary needs.', price: 'Starts at $200/week', status: 'Inactive' },
];

export const chefReviews = [
    { id: 'rev1', customer: { name: 'Alice Wonderland', avatarUrl: 'https://i.pravatar.cc/150?u=alice' }, rating: 5, comment: 'Chef Ramsey was incredible! The food was out of this world and his professionalism was top-notch. Highly recommended for any event!', date: '2024-07-26' },
    { id: 'rev2', customer: { name: 'Bruce Wayne', avatarUrl: 'https://i.pravatar.cc/150?u=bruce' }, rating: 5, comment: 'The catering for our gala was flawless. Every dish was a work of art. Chef Ramsey exceeded all expectations.', date: '2024-07-23' },
    { id: 'rev3', customer: { name: 'Peter Parker', avatarUrl: 'https://i.pravatar.cc/150?u=peter' }, rating: 4, comment: 'Great cooking class! Learned a lot, but wish we had a bit more hands-on time with the dessert portion.', date: '2024-07-20' },
];

export const bookingTrends = [
    { name: 'Jan', bookings: 5 },
    { name: 'Feb', bookings: 8 },
    { name: 'Mar', bookings: 12 },
    { name: 'Apr', bookings: 10 },
    { name: 'May', bookings: 15 },
    { name: 'Jun', bookings: 18 },
];

export const servicePopularity = [
    { name: 'Private Dinner', value: 400, fill: 'hsl(var(--primary))' },
    { name: 'Event Catering', value: 300, fill: 'hsl(var(--secondary))' },
    { name: 'Cooking Class', value: 200, fill: 'hsl(var(--accent))' },
];

export const earningsData = [
    { month: 'Jan', earnings: 5000 },
    { month: 'Feb', earnings: 7500 },
    { month: 'Mar', earnings: 11000 },
    { month: 'Apr', earnings: 9500 },
    { month: 'May', earnings: 14000 },
    { month: 'Jun', earnings: 15600 },
];
