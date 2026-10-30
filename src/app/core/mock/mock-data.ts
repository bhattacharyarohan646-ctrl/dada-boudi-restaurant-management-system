import { RestaurantTable } from '../models/table.model';
import { Reservation } from '../models/reservation.model';
import { Customer } from '../models/customer.model';
import { WaitlistEntry } from '../models/waitlist.model';
import { AppNotification } from '../models/notification.model';

export const INITIAL_TABLES: RestaurantTable[] = [
  // Window Zone (Row 1)
  { id: 'tbl-1', tableNumber: 'T01', capacity: 2, status: 'available', zone: 'Window', shape: 'round', gridRow: 1, gridCol: 1 },
  { id: 'tbl-2', tableNumber: 'T02', capacity: 2, status: 'occupied', zone: 'Window', shape: 'round', currentReservationId: 'res-1', gridRow: 1, gridCol: 2 },
  { id: 'tbl-3', tableNumber: 'T03', capacity: 4, status: 'reserved', zone: 'Window', shape: 'square', currentReservationId: 'res-2', gridRow: 1, gridCol: 3 },
  { id: 'tbl-4', tableNumber: 'T04', capacity: 4, status: 'available', zone: 'Window', shape: 'square', gridRow: 1, gridCol: 4 },

  // Main Dining Zone 1 (Row 2)
  { id: 'tbl-5', tableNumber: 'T05', capacity: 4, status: 'occupied', zone: 'Main Dining', shape: 'square', currentReservationId: 'res-3', gridRow: 2, gridCol: 1 },
  { id: 'tbl-6', tableNumber: 'T06', capacity: 6, status: 'reserved', zone: 'Main Dining', shape: 'rectangle', currentReservationId: 'res-4', gridRow: 2, gridCol: 2 },
  { id: 'tbl-7', tableNumber: 'T07', capacity: 4, status: 'cleaning', zone: 'Main Dining', shape: 'square', gridRow: 2, gridCol: 3 },
  { id: 'tbl-8', tableNumber: 'T08', capacity: 4, status: 'available', zone: 'Main Dining', shape: 'square', gridRow: 2, gridCol: 4 },

  // Main Dining Zone 2 (Row 3)
  { id: 'tbl-9', tableNumber: 'T09', capacity: 6, status: 'occupied', zone: 'Main Dining', shape: 'rectangle', currentReservationId: 'res-5', gridRow: 3, gridCol: 1 },
  { id: 'tbl-10', tableNumber: 'T10', capacity: 4, status: 'available', zone: 'Main Dining', shape: 'square', gridRow: 3, gridCol: 2 },
  { id: 'tbl-11', tableNumber: 'T11', capacity: 2, status: 'occupied', zone: 'Main Dining', shape: 'round', currentReservationId: 'res-6', gridRow: 3, gridCol: 3 },
  { id: 'tbl-12', tableNumber: 'T12', capacity: 4, status: 'available', zone: 'Main Dining', shape: 'square', gridRow: 3, gridCol: 4 },

  // Bar Area (Row 4)
  { id: 'tbl-13', tableNumber: 'T13', capacity: 2, status: 'occupied', zone: 'Bar Area', shape: 'round', currentReservationId: 'res-7', gridRow: 4, gridCol: 1 },
  { id: 'tbl-14', tableNumber: 'T14', capacity: 2, status: 'available', zone: 'Bar Area', shape: 'round', gridRow: 4, gridCol: 2 },
  { id: 'tbl-15', tableNumber: 'T15', capacity: 4, status: 'reserved', zone: 'Bar Area', shape: 'square', currentReservationId: 'res-8', gridRow: 4, gridCol: 3 },
  { id: 'tbl-16', tableNumber: 'T16', capacity: 2, status: 'cleaning', zone: 'Bar Area', shape: 'round', gridRow: 4, gridCol: 4 },

  // Outdoor Patio (Row 5)
  { id: 'tbl-17', tableNumber: 'T17', capacity: 4, status: 'available', zone: 'Outdoor Patio', shape: 'square', gridRow: 5, gridCol: 1 },
  { id: 'tbl-18', tableNumber: 'T18', capacity: 6, status: 'occupied', zone: 'Outdoor Patio', shape: 'rectangle', currentReservationId: 'res-9', gridRow: 5, gridCol: 2 },
  { id: 'tbl-19', tableNumber: 'T19', capacity: 4, status: 'reserved', zone: 'Outdoor Patio', shape: 'square', currentReservationId: 'res-10', gridRow: 5, gridCol: 3 },
  { id: 'tbl-20', tableNumber: 'T20', capacity: 2, status: 'available', zone: 'Outdoor Patio', shape: 'round', gridRow: 5, gridCol: 4 },

  // Private Dining Room (Row 6)
  { id: 'tbl-21', tableNumber: 'T21', capacity: 8, status: 'reserved', zone: 'Private Dining', shape: 'rectangle', currentReservationId: 'res-11', minimumSpend: 15000, gridRow: 6, gridCol: 1 },
  { id: 'tbl-22', tableNumber: 'T22', capacity: 10, status: 'available', zone: 'Private Dining', shape: 'rectangle', minimumSpend: 25000, gridRow: 6, gridCol: 2 },
  { id: 'tbl-23', tableNumber: 'T23', capacity: 6, status: 'occupied', zone: 'Private Dining', shape: 'rectangle', currentReservationId: 'res-12', minimumSpend: 12000, gridRow: 6, gridCol: 3 },
  { id: 'tbl-24', tableNumber: 'T24', capacity: 8, status: 'available', zone: 'Private Dining', shape: 'rectangle', minimumSpend: 15000, gridRow: 6, gridCol: 4 }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Rahul Sharma', phone: '+91 98201 44521', email: 'rahul.sharma@gmail.com', totalReservations: 14, totalVisits: 12, lastVisit: '2026-09-24', isVip: true, favoriteTable: 'T12', preferredTime: '19:30', tags: ['VIP', 'Corner Table', 'Red Wine Lover'] },
  { id: 'cust-2', name: 'Sneha Das', phone: '+91 97480 33219', email: 'sneha.das@outlook.com', totalReservations: 9, totalVisits: 8, lastVisit: '2026-09-22', isVip: true, favoriteTable: 'T03', preferredTime: '20:00', tags: ['VIP', 'Vegetarian', 'Window Preferred'] },
  { id: 'cust-3', name: 'Arjun Sen', phone: '+91 98311 88920', email: 'arjun.sen@techcorp.in', totalReservations: 22, totalVisits: 20, lastVisit: '2026-09-28', isVip: true, favoriteTable: 'T21', preferredTime: '20:30', tags: ['VIP', 'Corporate Host', 'Private Room'] },
  { id: 'cust-4', name: 'Priya Roy', phone: '+91 98450 11293', email: 'priya.roy@gmail.com', totalReservations: 6, totalVisits: 5, lastVisit: '2026-09-18', isVip: false, favoriteTable: 'T04', preferredTime: '19:00', tags: ['Window Seat'] },
  { id: 'cust-5', name: 'Amit Banerjee', phone: '+91 94330 67124', email: 'amit.banerjee@heritage.org', totalReservations: 11, totalVisits: 10, lastVisit: '2026-09-27', isVip: true, favoriteTable: 'T06', preferredTime: '20:00', tags: ['VIP', 'Anniversaries'] },
  { id: 'cust-6', name: 'Ananya Mukherjee', phone: '+91 98199 55432', email: 'ananya.m@creative.co', totalReservations: 5, totalVisits: 5, lastVisit: '2026-09-15', isVip: false, favoriteTable: 'T01', preferredTime: '18:30', tags: ['Quiet Table'] },
  { id: 'cust-7', name: 'Vikramaditya Singhania', phone: '+91 99200 88710', email: 'v.singhania@group.in', totalReservations: 31, totalVisits: 29, lastVisit: '2026-09-26', isVip: true, favoriteTable: 'T22', preferredTime: '21:00', tags: ['VIP Platinum', 'High Spender', 'Prefers Chef Menu'] },
  { id: 'cust-8', name: 'Rohan Mehta', phone: '+91 98212 99014', email: 'rohan.mehta@venture.capital', totalReservations: 8, totalVisits: 7, lastVisit: '2026-09-20', isVip: false, favoriteTable: 'T09', preferredTime: '19:30', tags: ['Outdoor Patio'] },
  { id: 'cust-9', name: 'Tanvi Kulkarni', phone: '+91 98901 22345', email: 'tanvi.kulkarni@designstudio.in', totalReservations: 4, totalVisits: 4, lastVisit: '2026-09-10', isVip: false, favoriteTable: 'T02', preferredTime: '19:00', tags: ['Date Night'] },
  { id: 'cust-10', name: 'Kabir Oberoi', phone: '+91 97110 44589', email: 'kabir.oberoi@globalmedia.com', totalReservations: 16, totalVisits: 15, lastVisit: '2026-09-25', isVip: true, favoriteTable: 'T15', preferredTime: '20:00', tags: ['VIP', 'Cocktails Specialist'] },
  { id: 'cust-11', name: 'Meera Iyer', phone: '+91 98402 33411', email: 'meera.iyer@healthfirst.org', totalReservations: 7, totalVisits: 6, lastVisit: '2026-09-19', isVip: false, favoriteTable: 'T08', preferredTime: '19:30', tags: ['Gluten Free', 'Non-Alcoholic'] },
  { id: 'cust-12', name: 'Aditya Verma', phone: '+91 98104 66720', email: 'aditya.verma@fintech.io', totalReservations: 12, totalVisits: 11, lastVisit: '2026-09-28', isVip: true, favoriteTable: 'T18', preferredTime: '20:15', tags: ['VIP', 'Patio Lover'] },
  { id: 'cust-13', name: 'Ritu Kapoor', phone: '+91 99100 88341', email: 'ritu.kapoor@fashionlabel.com', totalReservations: 9, totalVisits: 8, lastVisit: '2026-09-21', isVip: false, favoriteTable: 'T05', preferredTime: '20:00', tags: ['Celebrations'] },
  { id: 'cust-14', name: 'Devendra Nair', phone: '+91 94470 55198', email: 'dev.nair@coastaltech.in', totalReservations: 3, totalVisits: 3, lastVisit: '2026-09-12', isVip: false, favoriteTable: 'T13', preferredTime: '19:00', tags: ['Bar Seating'] },
  { id: 'cust-15', name: 'Simran Chadha', phone: '+91 98118 77622', email: 'simran.chadha@lifestyle.in', totalReservations: 13, totalVisits: 12, lastVisit: '2026-09-27', isVip: true, favoriteTable: 'T19', preferredTime: '20:30', tags: ['VIP', 'Birthday Celebrations'] },
  { id: 'cust-16', name: 'Karthik Raman', phone: '+91 98410 44901', email: 'karthik.raman@automotive.com', totalReservations: 5, totalVisits: 4, lastVisit: '2026-09-14', isVip: false, favoriteTable: 'T04', preferredTime: '19:45', tags: ['Family Dining'] },
  { id: 'cust-17', name: 'Zoya Akhtar', phone: '+91 98205 33812', email: 'zoya.akhtar@studioeast.in', totalReservations: 18, totalVisits: 17, lastVisit: '2026-09-26', isVip: true, favoriteTable: 'T23', preferredTime: '21:15', tags: ['VIP', 'Private Dining'] },
  { id: 'cust-18', name: 'Manish Pandey', phone: '+91 97690 12845', email: 'manish.pandey@consulting.in', totalReservations: 8, totalVisits: 7, lastVisit: '2026-09-23', isVip: false, favoriteTable: 'T10', preferredTime: '19:30', tags: ['Business Dinner'] },
  { id: 'cust-19', name: 'Pooja Agarwal', phone: '+91 98300 99412', email: 'pooja.agarwal@retailmart.com', totalReservations: 10, totalVisits: 9, lastVisit: '2026-09-25', isVip: true, favoriteTable: 'T07', preferredTime: '20:00', tags: ['VIP', 'Kids Friendly'] },
  { id: 'cust-20', name: 'Saurabh Ganguly', phone: '+91 98319 88123', email: 'saurabh.g@sportsmedia.in', totalReservations: 25, totalVisits: 24, lastVisit: '2026-09-28', isVip: true, favoriteTable: 'T21', preferredTime: '20:00', tags: ['VIP Legend', 'Signature Dish'] },
  { id: 'cust-21', name: 'Nisha Pillai', phone: '+91 98471 22894', email: 'nisha.pillai@chempharma.com', totalReservations: 4, totalVisits: 4, lastVisit: '2026-09-11', isVip: false, favoriteTable: 'T14', preferredTime: '19:15', tags: ['Casual'] },
  { id: 'cust-22', name: 'Varun Dhawan', phone: '+91 98202 77410', email: 'varun.dhawan@movieworld.in', totalReservations: 15, totalVisits: 14, lastVisit: '2026-09-24', isVip: true, favoriteTable: 'T24', preferredTime: '21:30', tags: ['VIP', 'Discreet Service'] }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  // Today's Occupied & Current
  { id: 'res-1', customerName: 'Tanvi Kulkarni', phone: '+91 98901 22345', email: 'tanvi.kulkarni@designstudio.in', guests: 2, date: '2026-09-29', time: '19:00', tableId: 'tbl-2', tableNumber: 'T02', status: 'confirmed', specialRequest: 'Near window, anniversary decor', createdAt: '2026-09-28 14:20', occasion: 'Anniversary' },
  { id: 'res-2', customerName: 'Sneha Das', phone: '+91 97480 33219', email: 'sneha.das@outlook.com', guests: 4, date: '2026-09-29', time: '19:30', tableId: 'tbl-3', tableNumber: 'T03', status: 'confirmed', specialRequest: 'Strictly vegetarian menu cards', createdAt: '2026-09-28 10:15', occasion: 'Birthday' },
  { id: 'res-3', customerName: 'Ritu Kapoor', phone: '+91 99100 88341', email: 'ritu.kapoor@fashionlabel.com', guests: 4, date: '2026-09-29', time: '19:15', tableId: 'tbl-5', tableNumber: 'T05', status: 'confirmed', specialRequest: 'Birthday cake cutting at 8:15 PM', createdAt: '2026-09-27 18:30', occasion: 'Birthday' },
  { id: 'res-4', customerName: 'Amit Banerjee', phone: '+91 94330 67124', email: 'amit.banerjee@heritage.org', guests: 5, date: '2026-09-29', time: '20:00', tableId: 'tbl-6', tableNumber: 'T06', status: 'confirmed', specialRequest: 'Slightly quieter spot preferred', createdAt: '2026-09-29 09:40', occasion: 'Family Dining' as any },
  { id: 'res-5', customerName: 'Manish Pandey', phone: '+91 97690 12845', email: 'manish.pandey@consulting.in', guests: 6, date: '2026-09-29', time: '19:00', tableId: 'tbl-9', tableNumber: 'T09', status: 'confirmed', specialRequest: 'Business dinner, separate checks', createdAt: '2026-09-26 11:20', occasion: 'Business' },
  { id: 'res-6', customerName: 'Ananya Mukherjee', phone: '+91 98199 55432', email: 'ananya.m@creative.co', guests: 2, date: '2026-09-29', time: '19:30', tableId: 'tbl-11', tableNumber: 'T11', status: 'confirmed', specialRequest: 'Quiet table for two', createdAt: '2026-09-29 12:00', occasion: 'Date Night' },
  { id: 'res-7', customerName: 'Devendra Nair', phone: '+91 94470 55198', email: 'dev.nair@coastaltech.in', guests: 2, date: '2026-09-29', time: '18:45', tableId: 'tbl-13', tableNumber: 'T13', status: 'confirmed', specialRequest: 'Bar drinks recommendation', createdAt: '2026-09-29 16:30', occasion: 'Casual' },
  { id: 'res-8', customerName: 'Kabir Oberoi', phone: '+91 97110 44589', email: 'kabir.oberoi@globalmedia.com', guests: 4, date: '2026-09-29', time: '20:00', tableId: 'tbl-15', tableNumber: 'T15', status: 'confirmed', specialRequest: 'Craft cocktail tasting menu', createdAt: '2026-09-28 21:00', occasion: 'Casual' },
  { id: 'res-9', customerName: 'Aditya Verma', phone: '+91 98104 66720', email: 'aditya.verma@fintech.io', guests: 6, date: '2026-09-29', time: '19:15', tableId: 'tbl-18', tableNumber: 'T18', status: 'confirmed', specialRequest: 'Outdoor patio heaters on please', createdAt: '2026-09-27 15:45', occasion: 'Business' },
  { id: 'res-10', customerName: 'Simran Chadha', phone: '+91 98118 77622', email: 'simran.chadha@lifestyle.in', guests: 4, date: '2026-09-29', time: '20:30', tableId: 'tbl-19', tableNumber: 'T19', status: 'confirmed', specialRequest: 'Champagne on arrival', createdAt: '2026-09-28 17:10', occasion: 'Birthday' },
  { id: 'res-11', customerName: 'Arjun Sen', phone: '+91 98311 88920', email: 'arjun.sen@techcorp.in', guests: 8, date: '2026-09-29', time: '20:00', tableId: 'tbl-21', tableNumber: 'T21', status: 'confirmed', specialRequest: 'Executive dining setup with projector', createdAt: '2026-09-25 14:00', occasion: 'Business' },
  { id: 'res-12', customerName: 'Zoya Akhtar', phone: '+91 98205 33812', email: 'zoya.akhtar@studioeast.in', guests: 6, date: '2026-09-29', time: '19:30', tableId: 'tbl-23', tableNumber: 'T23', status: 'confirmed', specialRequest: 'Private dining, sommelier pairing', createdAt: '2026-09-28 19:00', occasion: 'Celebration' as any },

  // Upcoming / Confirmed later today
  { id: 'res-13', customerName: 'Priya Roy', phone: '+91 98450 11293', email: 'priya.roy@gmail.com', guests: 4, date: '2026-09-29', time: '21:00', tableId: 'tbl-4', tableNumber: 'T04', status: 'confirmed', specialRequest: 'High chair needed for toddler', createdAt: '2026-09-29 11:30', occasion: 'Casual' },
  { id: 'res-14', customerName: 'Vikramaditya Singhania', phone: '+91 99200 88710', email: 'v.singhania@group.in', guests: 8, date: '2026-09-29', time: '21:15', tableId: 'tbl-22', tableNumber: 'T22', status: 'confirmed', specialRequest: 'VIP Chef Omakase experience', createdAt: '2026-09-26 16:00', occasion: 'Business' },
  { id: 'res-15', customerName: 'Meera Iyer', phone: '+91 98402 33411', email: 'meera.iyer@healthfirst.org', guests: 3, date: '2026-09-29', time: '20:45', tableId: 'tbl-8', tableNumber: 'T08', status: 'confirmed', specialRequest: 'Nut allergy awareness', createdAt: '2026-09-29 13:20', occasion: 'Casual' },
  { id: 'res-16', customerName: 'Karthik Raman', phone: '+91 98410 44901', email: 'karthik.raman@automotive.com', guests: 4, date: '2026-09-29', time: '21:00', tableId: 'tbl-10', tableNumber: 'T10', status: 'confirmed', specialRequest: 'Quick service requested', createdAt: '2026-09-29 14:40', occasion: 'Casual' },
  { id: 'res-17', customerName: 'Nisha Pillai', phone: '+91 98471 22894', email: 'nisha.pillai@chempharma.com', guests: 2, date: '2026-09-29', time: '20:15', tableId: 'tbl-14', tableNumber: 'T14', status: 'confirmed', specialRequest: 'Pre-ordered white wine', createdAt: '2026-09-29 15:10', occasion: 'Date Night' },
  { id: 'res-18', customerName: 'Varun Dhawan', phone: '+91 98202 77410', email: 'varun.dhawan@movieworld.in', guests: 6, date: '2026-09-29', time: '21:30', tableId: 'tbl-24', tableNumber: 'T24', status: 'confirmed', specialRequest: 'Discreet rear entrance escort', createdAt: '2026-09-28 18:20', occasion: 'Celebration' as any },

  // Completed Earlier Today
  { id: 'res-19', customerName: 'Rohit Kulkarni', phone: '+91 98200 11982', email: 'rohit.k@gmail.com', guests: 2, date: '2026-09-29', time: '13:00', tableId: 'tbl-1', tableNumber: 'T01', status: 'completed', specialRequest: 'Express lunch', createdAt: '2026-09-29 10:00', seatingTime: '13:05 - 14:15' },
  { id: 'res-20', customerName: 'Sunita Jain', phone: '+91 97188 44290', email: 'sunita.jain@textile.com', guests: 4, date: '2026-09-29', time: '13:30', tableId: 'tbl-7', tableNumber: 'T07', status: 'completed', specialRequest: 'Jain food options', createdAt: '2026-09-29 11:00', seatingTime: '13:35 - 15:00' },
  { id: 'res-21', customerName: 'Alok Nath', phone: '+91 98111 22334', email: 'alok.nath@edu.in', guests: 6, date: '2026-09-29', time: '14:00', tableId: 'tbl-12', tableNumber: 'T12', status: 'completed', specialRequest: 'Family reunion', createdAt: '2026-09-28 16:30', seatingTime: '14:05 - 15:45' },

  // Pending Confirmations
  { id: 'res-22', customerName: 'Gaurav Khanna', phone: '+91 98210 99882', email: 'gaurav.k@pharma.in', guests: 3, date: '2026-09-29', time: '21:45', tableId: 'tbl-17', tableNumber: 'T17', status: 'pending', specialRequest: 'Outdoor table if weather permits', createdAt: '2026-09-29 17:00' },
  { id: 'res-23', customerName: 'Pooja Agarwal', phone: '+91 98300 99412', email: 'pooja.agarwal@retailmart.com', guests: 4, date: '2026-09-30', time: '20:00', tableId: 'tbl-8', tableNumber: 'T08', status: 'pending', specialRequest: 'Kids cutlery and chairs', createdAt: '2026-09-29 17:40' },
  { id: 'res-24', customerName: 'Deepak Vohra', phone: '+91 99199 44321', email: 'deepak.v@finance.in', guests: 2, date: '2026-09-30', time: '19:30', tableId: 'tbl-1', tableNumber: 'T01', status: 'pending', specialRequest: 'Window table reservation for tomorrow', createdAt: '2026-09-29 18:00' },

  // Cancelled Bookings
  { id: 'res-25', customerName: 'Harsh Vardhan', phone: '+91 98103 22910', email: 'harsh.v@logistics.com', guests: 4, date: '2026-09-29', time: '19:00', tableId: 'tbl-8', tableNumber: 'T08', status: 'cancelled', specialRequest: 'Flight delayed - requested cancellation', createdAt: '2026-09-27 12:00' },
  { id: 'res-26', customerName: 'Bhavna Parekh', phone: '+91 98205 11928', email: 'bhavna.p@artgal.in', guests: 2, date: '2026-09-29', time: '20:00', tableId: 'tbl-16', tableNumber: 'T16', status: 'cancelled', specialRequest: 'Illness in family', createdAt: '2026-09-28 09:30' },

  // Additional reservations to fulfill 30+ requirements
  { id: 'res-27', customerName: 'Rajesh Mishra', phone: '+91 98390 12345', email: 'rajesh.mishra@steel.in', guests: 4, date: '2026-09-30', time: '19:00', tableId: 'tbl-4', tableNumber: 'T04', status: 'confirmed', specialRequest: 'Corporate dinner', createdAt: '2026-09-29 10:15' },
  { id: 'res-28', customerName: 'Shalini Saxena', phone: '+91 98180 55678', email: 'shalini.s@media.org', guests: 5, date: '2026-09-30', time: '20:15', tableId: 'tbl-6', tableNumber: 'T06', status: 'confirmed', specialRequest: 'Girls night out', createdAt: '2026-09-29 11:20' },
  { id: 'res-29', customerName: 'Tarun Tejpal', phone: '+91 98101 99234', email: 'tarun.t@author.in', guests: 2, date: '2026-09-30', time: '19:30', tableId: 'tbl-2', tableNumber: 'T02', status: 'confirmed', specialRequest: 'Corner table', createdAt: '2026-09-29 12:05' },
  { id: 'res-30', customerName: 'Kavita Chawla', phone: '+91 98208 44123', email: 'kavita.c@architects.in', guests: 6, date: '2026-09-30', time: '20:30', tableId: 'tbl-18', tableNumber: 'T18', status: 'confirmed', specialRequest: 'Patio seating', createdAt: '2026-09-29 13:45' },
  { id: 'res-31', customerName: 'Suresh Raina', phone: '+91 98450 77123', email: 'suresh.r@sports.in', guests: 8, date: '2026-09-30', time: '21:00', tableId: 'tbl-21', tableNumber: 'T21', status: 'confirmed', specialRequest: 'VIP dining area', createdAt: '2026-09-29 14:10' },
  { id: 'res-32', customerName: 'Anurag Kashyap', phone: '+91 98201 66543', email: 'anurag.k@cinema.in', guests: 4, date: '2026-09-30', time: '21:15', tableId: 'tbl-15', tableNumber: 'T15', status: 'confirmed', specialRequest: 'Late night discussion', createdAt: '2026-09-29 15:00' }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  { id: 'wait-1', customerName: 'Manan Joshi', phone: '+91 98200 45192', guests: 4, preferredTime: '19:45', waitingTimeMinutes: 18, priority: 'High', status: 'waiting', addedAt: '19:30', notes: 'Prefers Main Dining, willing to wait 25 mins' },
  { id: 'wait-2', customerName: 'Rashmi Deshmukh', phone: '+91 98190 77218', guests: 2, preferredTime: '20:00', waitingTimeMinutes: 12, priority: 'VIP', status: 'waiting', addedAt: '19:40', notes: 'VIP Member, any 2-seat window table' },
  { id: 'wait-3', customerName: 'Kunal Kapoor', phone: '+91 98214 33201', guests: 6, preferredTime: '20:15', waitingTimeMinutes: 8, priority: 'Normal', status: 'waiting', addedAt: '19:48', notes: 'Family walk-in, patio preferred' },
  { id: 'wait-4', customerName: 'Divya Seth', phone: '+91 98330 11980', guests: 2, preferredTime: '20:30', waitingTimeMinutes: 5, priority: 'Normal', status: 'waiting', addedAt: '19:55', notes: 'First available table for drinks and appetizers' }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'notif-1', title: 'Reservation Starting Soon', message: 'Sneha Das (4 guests) reservation at table T03 starts in 10 minutes.', time: '5m ago', type: 'reservation', read: false },
  { id: 'notif-2', title: 'Table Available', message: 'Table T04 was marked available after sanitization.', time: '12m ago', type: 'table', read: false },
  { id: 'notif-3', title: 'VIP Arrival Notice', message: 'VIP guest Rahul Sharma has placed a booking query for tonight.', time: '25m ago', type: 'vip', read: true },
  { id: 'notif-4', title: 'Waitlist Alert', message: 'Manan Joshi (party of 4) has been waiting for 18 minutes.', time: '35m ago', type: 'system', read: true }
];
