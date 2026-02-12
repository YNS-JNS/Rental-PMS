import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../config/env';
import { Apartment } from '../modules/apartments/apartment.model';
import { Tenant } from '../modules/tenants/tenant.model';
import { Booking } from '../modules/bookings/booking.model';
import { Payment } from '../modules/finance/payment.model';

// Load environment variables
dotenv.config();

// ============================================
// APARTMENTS DATA
// ============================================
const sampleApartments = [
  {
    name: "Sunset Villa",
    description: "A beautiful villa with sunset view, perfect for families. Features a large garden, private pool, and modern interiors.",
    address: "123 Ocean Drive, Casablanca",
    price: 2500,
    status: "AVAILABLE",
    facilities: ["WiFi", "Pool", "Parking", "AC", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2670&auto=format&fit=crop",
    ],
  },
  {
    name: "Urban Loft Center",
    description: "Modern loft in the city center. High ceilings, industrial design, and open concept living space.",
    address: "45 Hassan II Blvd, Rabat",
    price: 1200,
    status: "AVAILABLE",
    facilities: ["WiFi", "Gym", "Elevator", "Smart TV"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2662&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop",
    ],
  },
  {
    name: "Cozy Studio near University",
    description: "Perfect for students. Compact, functional, and very bright. Located in a quiet study-friendly area.",
    address: "12 Rue de France, Marrakech",
    price: 450,
    status: "AVAILABLE",
    facilities: ["WiFi", "Heating", "Microwave"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop",
    ],
  },
  {
    name: "Beach House Tangier",
    description: "Direct access to the beach. Listen to the waves from your bedroom. Includes a large patio for BBQs.",
    address: "88 Corniche, Tangier",
    price: 3000,
    status: "AVAILABLE",
    facilities: ["WiFi", "Pool", "Garden", "BBQ", "Sea View"],
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512918760532-446595d04f67?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop",
    ],
  },
  {
    name: "Family Apartment Fes",
    description: "Spacious 3-bedroom apartment. Secure residence with playground for kids.",
    address: "Resid. Al Yassamine, Fes",
    price: 800,
    status: "AVAILABLE",
    facilities: ["Parking", "Playground", "Security", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2671&auto=format&fit=crop",
    ],
  },
  {
    name: "Luxury Penthouse",
    description: "Top-floor penthouse with panoramic views. Marble floors, designer furniture, and a private terrace.",
    address: "1 Avenue Royale, Casablanca",
    price: 5000,
    status: "AVAILABLE",
    facilities: ["WiFi", "Pool", "Gym", "Concierge", "Smart Home", "Terrace"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    ],
  },
  {
    name: "Mountain Retreat Ifrane",
    description: "Charming cedar chalet in the mountains. Perfect for winter getaways with a fireplace and forest views.",
    address: "Route de Michlifen, Ifrane",
    price: 1800,
    status: "AVAILABLE",
    facilities: ["WiFi", "Fireplace", "Parking", "Heating", "Mountain View"],
    images: [
      "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop",
    ],
  },
  {
    name: "Riad Medina",
    description: "Traditional Moroccan riad in the heart of the old medina. Authentic tiles, fountain courtyard, rooftop terrace.",
    address: "Derb Sidi Ahmed, Marrakech",
    price: 2200,
    status: "AVAILABLE",
    facilities: ["WiFi", "AC", "Rooftop Terrace", "Courtyard", "Breakfast"],
    images: [
      "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577493340887-b7bfff550145?q=80&w=2574&auto=format&fit=crop",
    ],
  },
];

// ============================================
// TENANTS DATA
// ============================================
const sampleTenants = [
  { firstName: "Youssef", lastName: "El Amrani", email: "youssef.amrani@email.com", phone: "+212 661 123 456", cinPassport: "AB123456", notes: "Returning guest — prefers quiet apartments." },
  { firstName: "Fatima", lastName: "Benkirane", email: "fatima.benk@email.com", phone: "+212 662 234 567", cinPassport: "CD789012", notes: "" },
  { firstName: "Omar", lastName: "Idrissi", email: "omar.idrissi@email.com", phone: "+212 663 345 678", cinPassport: "EF345678", notes: "Business traveler, needs fast WiFi." },
  { firstName: "Sarah", lastName: "Martin", email: "sarah.martin@email.com", phone: "+33 6 12 34 56 78", cinPassport: "FR9876543", notes: "French expat, long-term stays." },
  { firstName: "Ahmed", lastName: "Tazi", email: "ahmed.tazi@email.com", phone: "+212 664 456 789", cinPassport: "GH901234", notes: "" },
  { firstName: "Nadia", lastName: "Chraibi", email: "nadia.chraibi@email.com", phone: "+212 665 567 890", cinPassport: "IJ567890", notes: "Prefers sea view apartments." },
  { firstName: "James", lastName: "Wilson", email: "james.wilson@email.com", phone: "+44 7700 900123", cinPassport: "UK1234567", notes: "British tourist, short stays only." },
  { firstName: "Amina", lastName: "Fassi", email: "amina.fassi@email.com", phone: "+212 666 678 901", cinPassport: "KL234567", notes: "" },
  { firstName: "Karim", lastName: "Benjelloun", email: "karim.benj@email.com", phone: "+212 667 789 012", cinPassport: "MN890123", notes: "Family with 2 children." },
  { firstName: "Elena", lastName: "Rodriguez", email: "elena.rod@email.com", phone: "+34 612 345 678", cinPassport: "ES7654321", notes: "Spanish digital nomad." },
  { firstName: "Hassan", lastName: "Ouazzani", email: "hassan.ouaz@email.com", phone: "+212 668 890 123", cinPassport: "OP456789", notes: "" },
  { firstName: "Lina", lastName: "Alaoui", email: "lina.alaoui@email.com", phone: "+212 669 901 234", cinPassport: "QR012345", notes: "Student, budget-friendly options." },
];

// ============================================
// BOOKING GENERATION HELPERS
// ============================================

/** Add days to a date */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Check if a new booking would overlap with existing ones for the same apartment */
function hasOverlap(
  existingBookings: { apartment: any; startDate: Date; endDate: Date }[],
  apartmentId: any,
  startDate: Date,
  endDate: Date
): boolean {
  return existingBookings.some(
    (b) =>
      b.apartment.toString() === apartmentId.toString() &&
      startDate < b.endDate &&
      endDate > b.startDate
  );
}

/** Generate realistic bookings spread across past, present, and future */
function generateBookings(
  apartmentIds: mongoose.Types.ObjectId[],
  tenantIds: mongoose.Types.ObjectId[],
  apartmentPrices: number[]
) {
  const bookings: any[] = [];
  const now = new Date();

  const ranges = [
    { offsetStart: -45, offsetEnd: -15, status: 'COMPLETED', count: 8 },
    { offsetStart: -5, offsetEnd: 20, status: 'CONFIRMED', count: 6 },
    { offsetStart: 15, offsetEnd: 50, status: 'CONFIRMED', count: 6 },
    { offsetStart: 40, offsetEnd: 75, status: 'PENDING', count: 5 },
    { offsetStart: -30, offsetEnd: 60, status: 'CANCELLED', count: 3 },
  ];

  for (const range of ranges) {
    let created = 0;
    let attempts = 0;

    while (created < range.count && attempts < range.count * 5) {
      attempts++;

      const aptIndex = Math.floor(Math.random() * apartmentIds.length);
      const apartmentId = apartmentIds[aptIndex];
      const pricePerNight = apartmentPrices[aptIndex];
      const tenantId = tenantIds[Math.floor(Math.random() * tenantIds.length)];

      const rangeSpan = range.offsetEnd - range.offsetStart;
      const startOffset = range.offsetStart + Math.floor(Math.random() * (rangeSpan - 3));
      const startDate = addDays(now, startOffset);
      const nights = 3 + Math.floor(Math.random() * 8);
      const endDate = addDays(startDate, nights);

      if (range.status !== 'CANCELLED' && hasOverlap(bookings, apartmentId, startDate, endDate)) {
        continue;
      }

      const totalPrice = nights * pricePerNight;
      const guestCount = 1 + Math.floor(Math.random() * 4);

      bookings.push({
        apartment: apartmentId,
        tenant: tenantId,
        startDate,
        endDate,
        status: range.status,
        totalPrice,
        guestCount,
        notes: range.status === 'CANCELLED' ? 'Cancelled by guest.' : '',
        // Payment fields default (UNPAID, 0) — updated later for some bookings
        paymentStatus: 'UNPAID',
        totalPaid: 0,
      });

      created++;
    }
  }

  return bookings;
}

// ============================================
// PAYMENT GENERATION HELPERS
// ============================================

const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER'] as const;

/**
 * Generate sample payments for ~50% of COMPLETED and CONFIRMED bookings.
 * Returns payment docs and booking updates.
 */
function generatePayments(bookings: any[]) {
  const payments: any[] = [];
  const bookingUpdates: { id: any; totalPaid: number; paymentStatus: string }[] = [];

  const eligibleBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED'
  );

  // Pick ~50% of eligible bookings
  const toProcess = eligibleBookings.filter(() => Math.random() < 0.5);

  for (const booking of toProcess) {
    const totalPrice = booking.totalPrice;

    // Decide payment scenario
    const scenario = Math.random();
    let paymentsForBooking: { amount: number; daysBeforeStart: number }[] = [];

    if (scenario < 0.4) {
      // Fully paid in one payment
      paymentsForBooking = [{ amount: totalPrice, daysBeforeStart: 5 }];
    } else if (scenario < 0.7) {
      // Fully paid in two payments (deposit + rest)
      const deposit = Math.round(totalPrice * 0.3);
      paymentsForBooking = [
        { amount: deposit, daysBeforeStart: 10 },
        { amount: totalPrice - deposit, daysBeforeStart: 1 },
      ];
    } else {
      // Partially paid (only deposit)
      const deposit = Math.round(totalPrice * 0.3);
      paymentsForBooking = [{ amount: deposit, daysBeforeStart: 7 }];
    }

    let totalPaid = 0;
    for (const p of paymentsForBooking) {
      const paymentDate = addDays(booking.startDate, -p.daysBeforeStart);
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      totalPaid += p.amount;

      payments.push({
        booking: booking._id,
        amount: p.amount,
        date: paymentDate,
        method,
        reference: method === 'BANK_TRANSFER' ? `VIR-${Math.floor(Math.random() * 100000)}` :
                   method === 'CHECK' ? `CHK-${Math.floor(Math.random() * 100000)}` : '',
        notes: '',
      });
    }

    // Calculate status
    let paymentStatus: string;
    if (totalPaid >= totalPrice) {
      paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    } else {
      paymentStatus = 'UNPAID';
    }

    bookingUpdates.push({ id: booking._id, totalPaid, paymentStatus });
  }

  return { payments, bookingUpdates };
}

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clean all collections
    console.log('🧹 Clearing existing data (Payments, Bookings, Tenants, Apartments)...');
    await Payment.deleteMany({});
    await Booking.deleteMany({});
    await Tenant.deleteMany({});
    await Apartment.deleteMany({});

    // 2. Insert Apartments
    console.log('🏠 Inserting apartments...');
    const createdApartments = await Apartment.insertMany(sampleApartments);
    console.log(`   ✅ ${createdApartments.length} apartments created.`);

    // 3. Insert Tenants
    console.log('👤 Inserting tenants...');
    const createdTenants = await Tenant.insertMany(sampleTenants);
    console.log(`   ✅ ${createdTenants.length} tenants created.`);

    // 4. Generate & Insert Bookings
    console.log('📅 Generating bookings (with anti-overlap check)...');
    const apartmentIds = createdApartments.map((a) => a._id as mongoose.Types.ObjectId);
    const tenantIds = createdTenants.map((t) => t._id as mongoose.Types.ObjectId);
    const apartmentPrices = createdApartments.map((a) => a.price);

    const bookingsData = generateBookings(apartmentIds, tenantIds, apartmentPrices);
    const createdBookings = await Booking.insertMany(bookingsData);
    console.log(`   ✅ ${createdBookings.length} bookings created.`);

    // 5. Generate & Insert Payments
    console.log('💰 Generating payments for ~50% of completed/confirmed bookings...');

    // Attach _id to bookingsData for payment generation
    bookingsData.forEach((b, i) => {
      b._id = createdBookings[i]._id;
    });

    const { payments, bookingUpdates } = generatePayments(bookingsData);

    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }

    // Update booking payment statuses
    for (const update of bookingUpdates) {
      await Booking.findByIdAndUpdate(update.id, {
        totalPaid: update.totalPaid,
        paymentStatus: update.paymentStatus,
      });
    }

    console.log(`   ✅ ${payments.length} payments created.`);
    console.log(`   ✅ ${bookingUpdates.length} bookings updated with payment status.`);

    // Summary
    const statusCounts = bookingsData.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentStatusCounts = bookingUpdates.reduce((acc, u) => {
      acc[u.paymentStatus] = (acc[u.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Booking Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n💳 Payment Status Breakdown:');
    Object.entries(paymentStatusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();