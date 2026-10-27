import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

export const samplePropertiesData = [
  {
    title: 'Luxury 3 BHK High-Rise Apartment in Indiranagar',
    description: 'Stunning east-facing 3 BHK with panoramic skyline views, Italian marble flooring, 2 covered car parks, and club house access. Located 500m from 100ft Road.',
    price: 18500000, // 1.85 Cr
    city: 'Bangalore',
    address: '12th Main, HAL 2nd Stage, Indiranagar',
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'apartment',
    listingType: 'sale',
    areaSqFt: 2150,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', public_id: '' },
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Modern 2 BHK Gated Community Flat in Whitefield',
    description: 'Fully furnished 2 BHK apartment near ITPL with modular kitchen, piped gas, swimming pool, badminton court, and 24/7 power backup. Ready to move in.',
    price: 42000, // 42k/mo
    city: 'Bangalore',
    address: 'Prestige Boulevard, ECC Road, Whitefield',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    listingType: 'rent',
    areaSqFt: 1250,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Sea Facing 4 BHK Penthouse in Bandra West',
    description: 'Spectacular Arabian Sea views, private terrace garden, dedicated concierge, biometric security, and state-of-the-art home automation. Prime location off Carter Road.',
    price: 95000000, // 9.5 Cr
    city: 'Mumbai',
    address: 'Perry Cross Road, Bandra West',
    bedrooms: 4,
    bathrooms: 5,
    propertyType: 'apartment',
    listingType: 'sale',
    areaSqFt: 3800,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', public_id: '' },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Spacious 2 BHK Apartment for Rent in Powai',
    description: 'Well ventilated flat overlooking Powai Lake, close to Hiranandani gardens, international schools, and tech parks. Modular kitchen with chimney included.',
    price: 65000,
    city: 'Mumbai',
    address: 'Lake Superior Heights, Central Avenue, Powai',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    listingType: 'rent',
    areaSqFt: 1100,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Elegant 4 BHK Independent Villa in Jubilee Hills',
    description: 'Designer independent duplex villa on 400 sq yards plot. Private lap pool, landscaped lawn, home theatre, and servant quarters in prestigious enclave.',
    price: 65000000, // 6.5 Cr
    city: 'Hyderabad',
    address: 'Road No 36, Jubilee Hills',
    bedrooms: 4,
    bathrooms: 5,
    propertyType: 'villa',
    listingType: 'sale',
    areaSqFt: 4600,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Cozy 3 BHK Flat in Gachibowli Financial District',
    description: 'Ideal for tech professionals. Premium gated community with 50,000 sqft clubhouse, tennis court, supermarket, and pharmacy within premises.',
    price: 48000,
    city: 'Hyderabad',
    address: 'My Home Bhooja, Silpa Gram Craft Village, Gachibowli',
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'apartment',
    listingType: 'rent',
    areaSqFt: 1980,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Premium 3 BHK Builder Floor in Greater Kailash 1',
    description: 'Brand new luxury builder floor with stilt parking, private Otis lift, Italian marble, VRV air conditioning, and modular German kitchen.',
    price: 38000000,
    city: 'Delhi NCR',
    address: 'B-Block, Greater Kailash 1, South Delhi',
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'independent_house',
    listingType: 'sale',
    areaSqFt: 2200,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Furnished 3 BHK in Cyber City DLF Phase 2 Gurgaon',
    description: 'Walking distance to Cyber Hub and Sikanderpur Metro. Tastefully furnished with king size beds, Smart TVs, and high-speed fiber internet.',
    price: 75000,
    city: 'Delhi NCR',
    address: 'Oakwood Estate, DLF Phase 2, Gurgaon',
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'apartment',
    listingType: 'rent',
    areaSqFt: 1750,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Scenic 4 BHK Villa with Garden in Koregaon Park',
    description: 'Serene bungalow nestled in lush Koregaon Park greenery. Features vintage high ceilings, private sit-out veranda, teak wood fixtures, and solar heating.',
    price: 45000000,
    city: 'Pune',
    address: 'Lane 7, Koregaon Park',
    bedrooms: 4,
    bathrooms: 4,
    propertyType: 'villa',
    listingType: 'sale',
    areaSqFt: 3500,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Chic 1 BHK Studio for Rent in Viman Nagar',
    description: 'Compact, ultra-modern furnished studio apartment suitable for young corporate executives. Near Phoenix Marketcity and Pune Airport.',
    price: 24000,
    city: 'Pune',
    address: 'Clover Park, Viman Nagar',
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'apartment',
    listingType: 'rent',
    areaSqFt: 620,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Gated Villa Plot in Devanahalli Airport Corridor',
    description: 'BIAAPA approved residential plot in 25-acre township. 40ft wide asphalt roads, underground cabling, water connection, and RERA certified.',
    price: 6800000,
    city: 'Bangalore',
    address: 'Ozone Urbana Enclave, Devanahalli',
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'plot',
    listingType: 'sale',
    areaSqFt: 2400,
    status: 'approved',
    images: [
      { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Pending Moderation: 3 BHK Apartment in HSR Layout',
    description: 'Recently listed brand new 3 BHK flat awaiting admin review. Spacious living dining, corner unit with cross ventilation.',
    price: 13500000,
    city: 'Bangalore',
    address: 'Sector 2, HSR Layout',
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    listingType: 'sale',
    areaSqFt: 1650,
    status: 'pending',
    images: [
      { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  },
  {
    title: 'Rejected Listing: Duplex Flat in Koramangala',
    description: 'Duplex flat with incomplete documentation and blurred exterior images provided by owner.',
    price: 19000000,
    city: 'Bangalore',
    address: '4th Block, Koramangala',
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'apartment',
    listingType: 'sale',
    areaSqFt: 2100,
    status: 'rejected',
    rejectionReason: 'Property title documentation missing and interior photographs are low-resolution. Please re-upload clear photos.',
    images: [
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', public_id: '' }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    } else {
      console.log('[Seed] Using existing database connection...');
    }

    console.log('[Seed] Ensuring Admin user exists...');
    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const passwordHash = await User.hashPassword(env.ADMIN_PASSWORD);
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        phone: '+91 9876543210'
      });
      console.log(`[Seed] Created Admin user: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
    }

    // Ensure sample seller exists
    const sellerEmail = 'seller@propertyhub.com';
    let seller = await User.findOne({ email: sellerEmail });
    if (!seller) {
      const sellerHash = await User.hashPassword('Seller123!');
      seller = await User.create({
        name: 'Rajesh Sharma (Verified Seller)',
        email: sellerEmail,
        passwordHash: sellerHash,
        role: 'seller',
        phone: '+91 9845012345'
      });
      console.log(`[Seed] Created Sample Seller: ${sellerEmail}`);
    }

    // Ensure sample buyer exists
    const buyerEmail = 'buyer@propertyhub.com';
    let buyer = await User.findOne({ email: buyerEmail });
    if (!buyer) {
      const buyerHash = await User.hashPassword('Buyer123!');
      buyer = await User.create({
        name: 'Priya Patel (Home Buyer)',
        email: buyerEmail,
        passwordHash: buyerHash,
        role: 'buyer',
        phone: '+91 9820054321'
      });
      console.log(`[Seed] Created Sample Buyer: ${buyerEmail}`);
    }

    // Seed Properties if not already present
    const existingPropertiesCount = await Property.countDocuments();
    console.log(`[Seed] Current properties count: ${existingPropertiesCount}`);

    if (existingPropertiesCount === 0) {
      console.log(`[Seed] Seeding ${samplePropertiesData.length} sample Indian properties...`);
      for (const item of samplePropertiesData) {
        await Property.create({
          ...item,
          owner: seller._id
        });
      }
      console.log('[Seed] Sample properties created successfully.');
    } else {
      console.log('[Seed] Properties already seeded. Skipping property insertion.');
    }

    console.log('[Seed] Seeding completed successfully!');
    return { admin, seller, buyer };
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}
