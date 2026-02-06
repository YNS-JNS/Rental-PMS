import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../config/env';
import { Apartment } from '../modules/apartments/apartment.model';

// Load environment variables
dotenv.config();

const sampleApartments = [
  {
    name: "Sunset Villa",
    description: "A beautiful villa with sunset view, perfect for families. Features a large garden, private pool, and modern interiors.",
    address: "123 Ocean Drive, Casablanca",
    price: 2500,
    status: "AVAILABLE",
    facilities: ["WiFi", "Pool", "Parking", "AC", "Garden"],
    // 3 Images for Carousel
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop", // Exterior
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop", // Pool
      "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2670&auto=format&fit=crop"  // Interior
    ],
  },
  {
    name: "Urban Loft Center",
    description: "Modern loft in the city center. High ceilings, industrial design, and open concept living space.",
    address: "45 Hassan II Blvd, Rabat",
    price: 1200,
    status: "RENTED",
    facilities: ["WiFi", "Gym", "Elevator", "Smart TV"],
    // 3 Images for Carousel
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2662&auto=format&fit=crop", // Living Room
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop", // Room
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop"  // Decor
    ],
  },
  {
    name: "Cozy Studio near University",
    description: "Perfect for students. Compact, functional, and very bright. Located in a quiet study-friendly area.",
    address: "12 Rue de France, Marrakech",
    price: 450,
    status: "AVAILABLE",
    facilities: ["WiFi", "Heating", "Microwave"],
    // 2 Images
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop"
    ],
  },
  {
    name: "Beach House Tangier",
    description: "Direct access to the beach. Listen to the waves from your bedroom. Includes a large patio for BBQs.",
    address: "88 Corniche, Tangier",
    price: 3000,
    status: "MAINTENANCE",
    facilities: ["WiFi", "Pool", "Garden", "BBQ", "Sea View"],
    // 3 Images
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512918760532-446595d04f67?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop"
    ],
  },
  {
    name: "Family Apartment Fes",
    description: "Spacious 3-bedroom apartment. Secure residence with playground for kids.",
    address: "Resid. Al Yassamine, Fes",
    price: 800,
    status: "RENTED",
    facilities: ["Parking", "Playground", "Security", "Balcony"],
    // 1 Image (To test single image display)
    images: [
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2671&auto=format&fit=crop"
    ],
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

    console.log('📝 Inserting sample data with galleries...');
    
    // Insert base data
    // We can duplicate if needed, but let's keep it clean with 5 distinct properties first
    // to easily check the images.
    const dataToInsert = [...sampleApartments];
    
    await Apartment.insertMany(dataToInsert);

    console.log(`✅ Seeding completed! ${dataToInsert.length} apartments created with multiple images.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();