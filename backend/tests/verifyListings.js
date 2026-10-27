import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

async function verifyListingsStage() {
  console.log('--- Verifying Stage 3 Listings & Moderation & Search ---');
  await connectDB('memory');

  // Setup: Create 2 sellers and 1 admin
  const seller1Pass = await User.hashPassword('pass1234');
  const seller1 = await User.create({
    name: 'Seller One',
    email: 'seller1@test.com',
    passwordHash: seller1Pass,
    role: 'seller'
  });

  const seller2 = await User.create({
    name: 'Seller Two',
    email: 'seller2@test.com',
    passwordHash: seller1Pass,
    role: 'seller'
  });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    passwordHash: seller1Pass,
    role: 'admin'
  });

  // Login seller1 to get cookie
  const seller1Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'seller1@test.com', password: 'pass1234' });
  const seller1Cookie = seller1Login.headers['set-cookie'];

  // Login seller2 to get cookie
  const seller2Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'seller2@test.com', password: 'pass1234' });
  const seller2Cookie = seller2Login.headers['set-cookie'];

  // Login admin to get cookie
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'pass1234' });
  const adminCookie = adminLogin.headers['set-cookie'];

  // 1. Unauthenticated create listing (MUST return 401)
  const resUnauth = await request(app)
    .post('/api/properties')
    .send({ title: 'Nice house in Bangalore', price: 5000000 });
  console.log('1. Unauthenticated create listing:', resUnauth.status, '(expected 401)');
  if (resUnauth.status !== 401) throw new Error('Expected 401 for unauthenticated create listing');

  // 2. Seller1 creates listing (MUST be created with status 'pending')
  const resCreate = await request(app)
    .post('/api/properties')
    .set('Cookie', seller1Cookie)
    .send({
      title: 'Luxury 3 BHK Penthouse in Bangalore',
      description: 'East facing 3 BHK apartment with marble flooring and car parking.',
      price: 15000000,
      city: 'Bangalore',
      address: '100ft Road, Indiranagar',
      bedrooms: 3,
      bathrooms: 3,
      propertyType: 'apartment',
      listingType: 'sale',
      areaSqFt: 2200
    });
  console.log('2. Seller creates listing status:', resCreate.status, '(expected 201)');
  if (resCreate.status !== 201) throw new Error('Expected 201 for seller listing creation');
  const propertyId = resCreate.body.data.property._id;
  const initialStatus = resCreate.body.data.property.status;
  console.log('   Created property ID:', propertyId, 'Status:', initialStatus, '(expected pending)');
  if (initialStatus !== 'pending') throw new Error('Expected new listing status to be pending');

  // 3. Pending listings are absent from public search
  const resPublic1 = await request(app).get('/api/properties?city=Bangalore');
  console.log('3. Public search count for Bangalore:', resPublic1.body.data.total, '(expected 0)');
  if (resPublic1.body.data.total !== 0) throw new Error('Pending listing must not appear in public search');

  // 4. Admin sees pending listings
  const resPending = await request(app)
    .get('/api/admin/properties/pending')
    .set('Cookie', adminCookie);
  console.log('4. Admin pending list length:', resPending.body.data.properties.length, '(expected 1)');
  if (resPending.body.data.properties.length !== 1) throw new Error('Admin must see pending listing');

  // 5. Admin approves listing
  const resApprove = await request(app)
    .patch(`/api/admin/properties/${propertyId}/approve`)
    .set('Cookie', adminCookie);
  console.log('5. Admin approve status:', resApprove.status, '(expected 200)');
  if (resApprove.status !== 200 || resApprove.body.data.property.status !== 'approved') {
    throw new Error('Expected property to be approved');
  }

  // 6. Approved listing now appears in public search
  const resPublic2 = await request(app).get('/api/properties?city=Bangalore');
  console.log('6. Public search after approval:', resPublic2.body.data.total, '(expected 1)');
  if (resPublic2.body.data.total !== 1) throw new Error('Approved listing must appear in public search');

  // 7. Search filters, sort, and pagination work
  const resFiltered = await request(app)
    .get('/api/properties?city=Bangalore&listingType=sale&minPrice=10000000&sort=price_desc&page=1&limit=9');
  console.log('7. Valid filter query status:', resFiltered.status, '(expected 200)');
  if (resFiltered.status !== 200 || resFiltered.body.data.properties.length !== 1) {
    throw new Error('Search filters failed');
  }

  // 8. Invalid query params -> 400
  const resInvalidQuery = await request(app).get('/api/properties?listingType=invalid_type');
  console.log('8. Invalid query param status:', resInvalidQuery.status, '(expected 400)');
  if (resInvalidQuery.status !== 400) throw new Error('Expected 400 for invalid query parameter');

  // 9. Seller2 cannot edit Seller1's listing (MUST return 403)
  const resEditForbidden = await request(app)
    .put(`/api/properties/${propertyId}`)
    .set('Cookie', seller2Cookie)
    .send({ title: 'Hacked Title Attempt' });
  console.log('9. Seller2 editing Seller1 listing:', resEditForbidden.status, '(expected 403)');
  if (resEditForbidden.status !== 403) throw new Error('Expected 403 for unauthorized edit');

  // 10. Seller1 edits approved listing -> status resets to 'pending'
  const resEditOwner = await request(app)
    .put(`/api/properties/${propertyId}`)
    .set('Cookie', seller1Cookie)
    .send({ title: 'Updated Luxury 3 BHK Penthouse in Bangalore' });
  console.log('10. Owner edits key field status:', resEditOwner.status, '(expected 200)');
  console.log('    New status after edit:', resEditOwner.body.data.property.status, '(expected pending)');
  if (resEditOwner.body.data.property.status !== 'pending') {
    throw new Error('Editing approved listing must reset status back to pending');
  }

  // 11. Admin rejects with reason (min 5 chars)
  const resReject = await request(app)
    .patch(`/api/admin/properties/${propertyId}/reject`)
    .set('Cookie', adminCookie)
    .send({ reason: 'Title change requires updated property tax receipt' });
  console.log('11. Admin reject status:', resReject.status, '(expected 200)');
  console.log('    Rejection reason stored:', resReject.body.data.property.rejectionReason);
  if (resReject.status !== 200 || resReject.body.data.property.status !== 'rejected') {
    throw new Error('Expected listing to be rejected with reason');
  }

  // 12. Admin rejects without reason -> 400
  const resRejectNoReason = await request(app)
    .patch(`/api/admin/properties/${propertyId}/reject`)
    .set('Cookie', adminCookie)
    .send({ reason: '' });
  console.log('12. Reject without reason status:', resRejectNoReason.status, '(expected 400)');
  if (resRejectNoReason.status !== 400) throw new Error('Expected 400 when rejection reason is missing');

  await disconnectDB();
  console.log('--- Stage 3 Verification Passed Successfully! ---');
}

verifyListingsStage().catch((err) => {
  console.error('Stage 3 verification error:', err);
  process.exit(1);
});
