import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Favorite from '../models/Favorite.js';
import { setupTestDB } from './setup.js';

describe('Favorites Test Suite', () => {
  setupTestDB();

  it('Test 7: favorites: no duplicates, idempotent remove', async () => {
    const pw = await User.hashPassword('Pass1234!');
    const buyer = await User.create({ name: 'Buyer Test', email: 'favbuyer@test.com', passwordHash: pw, role: 'buyer' });
    const seller = await User.create({ name: 'Seller Test', email: 'favseller@test.com', passwordHash: pw, role: 'seller' });

    const property = await Property.create({
      title: 'Bangalore Lake View 2 BHK',
      description: 'Modern 2 BHK overlooking Bellandur lake with modular fittings.',
      price: 8500000,
      city: 'Bangalore',
      address: 'Outer Ring Road',
      bedrooms: 2,
      bathrooms: 2,
      propertyType: 'apartment',
      listingType: 'sale',
      status: 'approved',
      owner: seller._id
    });

    const loginRes = await request(app).post('/api/auth/login').send({ email: 'favbuyer@test.com', password: 'Pass1234!' });
    const buyerCookie = loginRes.headers['set-cookie'];

    // 1. Add to favorites
    const resAdd = await request(app)
      .post(`/api/properties/${property._id}/favorite`)
      .set('Cookie', buyerCookie);
    expect(resAdd.status).toBe(200);
    expect(resAdd.body.data.isFavorite).toBe(true);

    // Verify DB count is exactly 1
    const countAfterAdd = await Favorite.countDocuments({ user: buyer._id, property: property._id });
    expect(countAfterAdd).toBe(1);

    // 2. Toggle remove
    const resRemove = await request(app)
      .post(`/api/properties/${property._id}/favorite`)
      .set('Cookie', buyerCookie);
    expect(resRemove.status).toBe(200);
    expect(resRemove.body.data.isFavorite).toBe(false);

    // Verify DB count is 0
    const countAfterRemove = await Favorite.countDocuments({ user: buyer._id, property: property._id });
    expect(countAfterRemove).toBe(0);
  });
});
