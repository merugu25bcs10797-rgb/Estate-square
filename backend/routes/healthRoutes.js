import { Router } from 'express';
import { seedDatabase } from '../utils/seed.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EstateSquare API is healthy and operational',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

router.get('/seed', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully. Admin, seller, buyer, and sample listings are ready.',
      data: {
        adminEmail: result.admin.email,
        sellerEmail: result.seller.email,
        buyerEmail: result.buyer.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Seed failed: ${error.message}`
    });
  }
});

export default router;
