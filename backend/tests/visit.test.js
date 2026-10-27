import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { setupTestDB } from './setup.js';

describe('Visit Request State Machine Suite', () => {
  setupTestDB();

  it('Test 8: visit: past date rejected, invalid transition -> 409, double-booking -> 409', async () => {
    const pw = await User.hashPassword('Pass1234!');
    const seller = await User.create({ name: 'Seller Vis', email: 'sellervis@test.com', passwordHash: pw, role: 'seller' });
    const buyer1 = await User.create({ name: 'Buyer One', email: 'buyer1vis@test.com', passwordHash: pw, role: 'buyer' });
    const buyer2 = await User.create({ name: 'Buyer Two', email: 'buyer2vis@test.com', passwordHash: pw, role: 'buyer' });

    const property = await Property.create({
      title: 'Green Glen Layout 3 BHK',
      description: 'Well ventilated 3 BHK apartment in Green Glen Layout Bellandur.',
      price: 14000000,
      city: 'Bangalore',
      address: 'Bellandur',
      bedrooms: 3,
      bathrooms: 3,
      propertyType: 'apartment',
      listingType: 'sale',
      status: 'approved',
      owner: seller._id
    });
    const propId = property._id.toString();

    const sLogin = await request(app).post('/api/auth/login').send({ email: 'sellervis@test.com', password: 'Pass1234!' });
    const sellerCookie = sLogin.headers['set-cookie'];

    const b1Login = await request(app).post('/api/auth/login').send({ email: 'buyer1vis@test.com', password: 'Pass1234!' });
    const buyer1Cookie = b1Login.headers['set-cookie'];

    const b2Login = await request(app).post('/api/auth/login').send({ email: 'buyer2vis@test.com', password: 'Pass1234!' });
    const buyer2Cookie = b2Login.headers['set-cookie'];

    // 1. Past date rejected (400)
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
    const resPast = await request(app)
      .post(`/api/properties/${propId}/visits`)
      .set('Cookie', buyer1Cookie)
      .send({ visitDate: pastDate });
    expect(resPast.status).toBe(400);

    // 2. Future date visit 1
    const visitTime1 = new Date(Date.now() + 86400 * 1000 * 3);
    visitTime1.setHours(11, 0, 0, 0); // 11:00 AM in 3 days
    const resV1 = await request(app)
      .post(`/api/properties/${propId}/visits`)
      .set('Cookie', buyer1Cookie)
      .send({ visitDate: visitTime1.toISOString() });
    expect(resV1.status).toBe(201);
    const v1Id = resV1.body.data.visit._id;

    // 3. Invalid transition: pending -> completed (MUST fail with 409)
    const resInv = await request(app)
      .patch(`/api/visits/${v1Id}/status`)
      .set('Cookie', sellerCookie)
      .send({ status: 'completed' });
    expect(resInv.status).toBe(409);

    // 4. Confirm visit 1 (valid transition)
    const resConfirm1 = await request(app)
      .patch(`/api/visits/${v1Id}/status`)
      .set('Cookie', sellerCookie)
      .send({ status: 'confirmed' });
    expect(resConfirm1.status).toBe(200);

    // 5. Buyer 2 requests overlapping visit (11:30 AM -> inside 1 hour window)
    const visitTime2 = new Date(visitTime1.getTime() + 30 * 60 * 1000);
    const resV2 = await request(app)
      .post(`/api/properties/${propId}/visits`)
      .set('Cookie', buyer2Cookie)
      .send({ visitDate: visitTime2.toISOString() });
    expect(resV2.status).toBe(201);
    const v2Id = resV2.body.data.visit._id;

    // 6. Seller attempts to confirm visit 2: MUST fail with 409 double-booking!
    const resConfirmDouble = await request(app)
      .patch(`/api/visits/${v2Id}/status`)
      .set('Cookie', sellerCookie)
      .send({ status: 'confirmed' });
    expect(resConfirmDouble.status).toBe(409);
    expect(resConfirmDouble.body.message).toContain('Conflict');
  });
});
