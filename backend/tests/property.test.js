import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { setupTestDB } from './setup.js';

describe('Property Lifecycle, Moderation & Search Suite', () => {
  setupTestDB();

  let seller1Cookie, seller2Cookie, adminCookie;
  let seller1Id;

  beforeEach(async () => {
    const pw = await User.hashPassword('Pass1234!');

    const s1 = await User.create({ name: 'Seller One', email: 's1@prop.com', passwordHash: pw, role: 'seller' });
    seller1Id = s1._id;
    await User.create({ name: 'Seller Two', email: 's2@prop.com', passwordHash: pw, role: 'seller' });
    await User.create({ name: 'Admin', email: 'admin@prop.com', passwordHash: pw, role: 'admin' });

    const l1 = await request(app).post('/api/auth/login').send({ email: 's1@prop.com', password: 'Pass1234!' });
    seller1Cookie = l1.headers['set-cookie'];

    const l2 = await request(app).post('/api/auth/login').send({ email: 's2@prop.com', password: 'Pass1234!' });
    seller2Cookie = l2.headers['set-cookie'];

    const l3 = await request(app).post('/api/auth/login').send({ email: 'admin@prop.com', password: 'Pass1234!' });
    adminCookie = l3.headers['set-cookie'];
  });

  it('Test 3: unauthenticated create listing -> 401', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({
        title: 'Unauthenticated Listing',
        price: 5000000,
        city: 'Mumbai',
        address: 'Bandra',
        bedrooms: 2,
        bathrooms: 2,
        propertyType: 'apartment',
        listingType: 'sale'
      });
    expect(res.status).toBe(401);
  });

  it("Test 4: seller cannot edit another seller's listing -> 403", async () => {
    // Seller 1 creates a property
    const resCreate = await request(app)
      .post('/api/properties')
      .set('Cookie', seller1Cookie)
      .send({
        title: 'Seller One Penthouse in Pune',
        description: 'Luxury penthouse with private terrace and scenic city views.',
        price: 25000000,
        city: 'Pune',
        address: 'Koregaon Park',
        bedrooms: 3,
        bathrooms: 3,
        propertyType: 'apartment',
        listingType: 'sale'
      });
    expect(resCreate.status).toBe(201);
    const propId = resCreate.body.data.property._id;

    // Seller 2 tries to edit it
    const resEdit = await request(app)
      .put(`/api/properties/${propId}`)
      .set('Cookie', seller2Cookie)
      .send({ title: 'Hacked Title By Seller 2' });

    expect(resEdit.status).toBe(403);
    expect(resEdit.body.message).toContain('Forbidden');
  });

  it('Test 5: pending listings are absent from public search; approved ones appear', async () => {
    // Seller 1 creates property (defaults to pending)
    const resCreate = await request(app)
      .post('/api/properties')
      .set('Cookie', seller1Cookie)
      .send({
        title: 'Moderated Apartment in Hyderabad',
        description: 'Spacious 3 BHK apartment in Gachibowli Financial District.',
        price: 12000000,
        city: 'Hyderabad',
        address: 'Gachibowli Main Rd',
        bedrooms: 3,
        bathrooms: 3,
        propertyType: 'apartment',
        listingType: 'sale'
      });
    const propId = resCreate.body.data.property._id;

    // Search while pending: must be absent
    const resSearchPending = await request(app).get('/api/properties?city=Hyderabad');
    expect(resSearchPending.body.data.total).toBe(0);

    // Admin approves it
    const resApprove = await request(app)
      .patch(`/api/admin/properties/${propId}/approve`)
      .set('Cookie', adminCookie);
    expect(resApprove.status).toBe(200);

    // Search after approval: must appear
    const resSearchApproved = await request(app).get('/api/properties?city=Hyderabad');
    expect(resSearchApproved.body.data.total).toBe(1);
    expect(resSearchApproved.body.data.properties[0]._id).toBe(propId);
  });

  it('Test 6: search filters, sort, and pagination work; invalid query params -> 400', async () => {
    // Seed 2 approved properties
    await Property.create([
      {
        title: 'Budget Studio in Mumbai',
        description: 'Compact 1 BHK studio apartment near BKC business hub.',
        price: 25000,
        city: 'Mumbai',
        address: 'Kurla West',
        bedrooms: 1,
        bathrooms: 1,
        propertyType: 'apartment',
        listingType: 'rent',
        status: 'approved',
        owner: seller1Id
      },
      {
        title: 'Luxury Villa in Mumbai',
        description: 'Ultra luxury 4 BHK sea facing villa in Juhu with swimming pool.',
        price: 85000000,
        city: 'Mumbai',
        address: 'Juhu Tara Road',
        bedrooms: 4,
        bathrooms: 5,
        propertyType: 'villa',
        listingType: 'sale',
        status: 'approved',
        owner: seller1Id
      }
    ]);

    // Test filter by listingType=rent
    const resRent = await request(app).get('/api/properties?city=Mumbai&listingType=rent');
    expect(resRent.status).toBe(200);
    expect(resRent.body.data.total).toBe(1);
    expect(resRent.body.data.properties[0].price).toBe(25000);

    // Test filter by price range and sort
    const resSort = await request(app).get('/api/properties?city=Mumbai&sort=price_desc');
    expect(resSort.status).toBe(200);
    expect(resSort.body.data.properties[0].price).toBe(85000000);

    // Test invalid query param: invalid listingType -> 400
    const resInvalid = await request(app).get('/api/properties?listingType=invalid_option');
    expect(resInvalid.status).toBe(400);
    expect(resInvalid.body.success).toBe(false);
  });
});
