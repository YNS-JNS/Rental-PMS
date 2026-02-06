import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../config/env';
import { Apartment } from '../modules/apartments/apartment.model';

// Load environment variables
dotenv.config();

const sampleApartments = [
  {
    name: "Sunset Villa",
    description: "A beautiful villa with sunset view, perfect for families. Features a large garden and private pool.",
    address: "123 Ocean Drive, Casablanca",
    price: 2500,
    status: "AVAILABLE",
    facilities: ["WiFi", "Pool", "Parking", "AC", "Garden"],
    // Image: Luxury Villa Exterior
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop"],
  },
  {
    name: "Urban Loft Center",
    description: "Modern loft in the city center, close to all amenities. High ceilings and industrial design.",
    address: "45 Hassan II Blvd, Rabat",
    price: 1200,
    status: "RENTED",
    facilities: ["WiFi", "Gym", "Elevator", "Smart TV"],
    // Image: Modern Loft Interior
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2662&auto=format&fit=crop"],
  },
  {
    name: "Cozy Studio near University",
    description: "Perfect for students or singles. Quiet area, fully furnished with modern appliances.",
    address: "12 Rue de France, Marrakech",
    price: 450,
    status: "AVAILABLE",
    facilities: ["WiFi", "Heating", "Microwave"],
    // Image: Cozy Studio
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2574&auto=format&fit=crop"],
  },
  {
    name: "Beach House Tangier",
    description: "Direct access to the beach with a stunning patio. Hear the waves from your bedroom.",
    address: "88 Corniche, Tangier",
    price: 3000,
    status: "MAINTENANCE",
    facilities: ["WiFi", "Pool", "Garden", "BBQ", "Sea View"],
    // Image: Beach House
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2670&auto=format&fit=crop"],
  },
  {
    name: "Family Apartment Fes",
    description: "Spacious 3-bedroom apartment in a secure residence. Close to schools and parks.",
    address: "Resid. Al Yassamine, Fes",
    price: 800,
    status: "RENTED",
    facilities: ["Parking", "Playground", "Security", "Balcony"],
    // Image: Spacious Living Room
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop"],
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('🧹 Clearing existing apartments...');
    await Apartment.deleteMany({});

    console.log('📝 Inserting sample data...');
    
    // Duplicate sample data to create more entries (Triple the data = 15 items)
    // We modify names slightly to distinguish them
    const dataToInsert = [
      ...sampleApartments,
      ...sampleApartments.map(a => ({ 
        ...a, 
        name: a.name + " (North)", 
        address: "North " + a.address,
        price: a.price + 100 
      })),
      ...sampleApartments.map(a => ({ 
        ...a, 
        name: a.name + " (South)", 
        address: "South " + a.address,
        price: a.price - 50
      })),
    ];
    
    await Apartment.insertMany(dataToInsert);

    console.log(`✅ Seeding completed! ${dataToInsert.length} apartments created with images.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();