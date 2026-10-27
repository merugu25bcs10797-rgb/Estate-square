import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { setupTestDB } from './setup.js';

describe('Enquiries & Visits Privacy Suite', () => {
  setupTestDB();

  it("Test 9: buyer cannot read another buyer's enquiries/visits", async () => {
    const pw = await User.hashPassword('Pass1234!');
    const seller = await User.create({ name: 'Seller Pvt', email: 'sellerpvt@test.com', passwordHash: pw, role: 'seller' });
    const buyer1 = await User.create({ name: 'Buyer Pvt1', email: 'buyerpvt1@test.com', passwordHash: pw, role: 'buyer' });
    const buyer2 = await User.create({ name: 'Buyer Pvt2', email: 'buyerpvt2@test.com', passwordHash: pw, role: 'buyer' });

    const property = await Property.create({
      title: 'Private Villa in Goa',
      description: 'Luxury 3 BHK beach villa near Candolim beach with pool.',
      price: 28000000,
      city: 'Bangalore', // Using Bangalore for schema city match
      address: 'Main Beach Road',
      bedrooms: 3,
      bathrooms: 3,
      propertyType: 'villa',
      listingType: 'sale',
      status: 'approved',
      owner: seller._id
    });
    const propId = property._id.toString();

    const b1Login = await request(app).post('/api/auth/login').send({ email: 'buyerpvt1@test.com', password: 'Pass1234!' });
    const buyer1Cookie = b1Login.headers['set-cookie'];

    const b2Login = await request(app).post('/api/auth/login').send({ email: 'buyerpvt2@test.com', password: 'Pass1234!' });
    const buyer2Cookie = b2Login.headers['set-cookie'];

    // Buyer 1 submits an enquiry and schedules a visit
    await request(app)
      .post(`/api/properties/${propId}/enquiries`)
      .set('Cookie', buyer1Cookie)
      .send({
        name: 'Buyer One',
        email: 'buyerpvt1@test.com',
        phone: '+91 9999900000',
        message: 'Confidential enquiry regarding price negotiation.'
      });

    const futureDate = new Date(Date.now() + 86400 * 1000 * 4);
    await request(app)
      .post(`/api/properties/${propId}/visits`)
      .set('Cookie', buyer1Cookie)
      .send({ visitDate: futureDate.toISOString() });

    // Buyer 2 queries /api/enquiries/my
    const resBuyer2Enq = await request(app)
      .get('/api/enquiries/my')
      .set('Cookie', buyer2Cookie);
    expect(resBuyer2Enq.status).toBe(200);
    expect(resBuyer2Enq.body.data.enquiries.length).toBe(0);

    // Buyer 2 queries /api/visits/my
    const resBuyer2Vis = await request(app)
      .get('/api/visits/my')
      .set('Cookie', buyer2Cookie);
    expect(resBuyer2Vis.status).toBe(200);
    expect(resBuyer2Vis.body.data.visits.length).toBe(0);

    // Buyer 1 queries /api/enquiries/my -> sees their 1 enquiry
    const resBuyer1Enq = await request(app)
      .get('/api/enquiries/my')
      .set('Cookie', buyer1Cookie);
    expect(resBuyer1Enq.status).toBe(200);
    expect(resBuyer1Enq.body.data.enquiries.length).toBe(1);
  });
});
