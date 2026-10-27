import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

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
