import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Visit from '../models/Visit.js';
import Enquiry from '../models/Enquiry.js';
import Favorite from '../models/Favorite.js';

async function verifyInteractionsStage() {
  console.log('--- Verifying Stage 4: Visits State Machine, Enquiries, Favorites ---');
  await connectDB('memory');

  const pwHash = await User.hashPassword('Pass1234!');

  // Create Seller, Buyer 1, and Buyer 2
  const seller = await User.create({
    name: 'Suresh Seller',
    email: 'suresh@seller.com',
    passwordHash: pwHash,
    role: 'seller'
  });

  const buyer1 = await User.create({
    name: 'Ananya Buyer1',
    email: 'ananya@buyer.com',
    passwordHash: pwHash,
    role: 'buyer'
  });

  const buyer2 = await User.create({
    name: 'Rahul Buyer2',
    email: 'rahul@buyer.com',
    passwordHash: pwHash,
    role: 'buyer'
  });

  // Login cookies
  const sellerLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'suresh@seller.com', password: 'Pass1234!' });
  const sellerCookie = sellerLogin.headers['set-cookie'];

  const buyer1Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'ananya@buyer.com', password: 'Pass1234!' });
  const buyer1Cookie = buyer1Login.headers['set-cookie'];

  const buyer2Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rahul@buyer.com', password: 'Pass1234!' });
  const buyer2Cookie = buyer2Login.headers['set-cookie'];

  // Create an approved property for seller
  const property = await Property.create({
    title: 'Prestige Lakeside Habitat Villa',
    description: 'Beautiful 4 BHK villa with private garden in Varthur Bangalore.',
    price: 32000000,
    city: 'Bangalore',
    address: 'Whitefield-Sarjapur Road',
    bedrooms: 4,
    bathrooms: 4,
    propertyType: 'villa',
    listingType: 'sale',
    areaSqFt: 3100,
    status: 'approved',
    owner: seller._id
  });
  const propId = property._id.toString();

  // 1. Visit: Past date must be rejected with 400
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const resPast = await request(app)
    .post(`/api/properties/${propId}/visits`)
    .set('Cookie', buyer1Cookie)
    .send({ visitDate: pastDate });
  console.log('1. Past visit date status:', resPast.status, '(expected 400)');
  if (resPast.status !== 400) throw new Error('Expected 400 for past date');

  // 2. Visit: Future date succeeds with 201
  const futureDate1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  futureDate1.setHours(10, 0, 0, 0); // 10:00 AM in 2 days
  const resVisit1 = await request(app)
    .post(`/api/properties/${propId}/visits`)
    .set('Cookie', buyer1Cookie)
    .send({ visitDate: futureDate1.toISOString(), note: 'Looking forward to viewing.' });
  console.log('2. Buyer1 requests visit status:', resVisit1.status, '(expected 201)');
  if (resVisit1.status !== 201) throw new Error('Expected 201 for valid visit request');
  const visit1Id = resVisit1.body.data.visit._id;

  // 3. Invalid transition: directly completing a pending visit (MUST fail with 409)
  const resInvalidTrans = await request(app)
    .patch(`/api/visits/${visit1Id}/status`)
    .set('Cookie', sellerCookie)
    .send({ status: 'completed' });
  console.log('3. Invalid state transition (pending -> completed):', resInvalidTrans.status, '(expected 409)');
  if (resInvalidTrans.status !== 409) throw new Error('Expected 409 for invalid transition');

  // 4. Seller confirms visit 1
  const resConfirm1 = await request(app)
    .patch(`/api/visits/${visit1Id}/status`)
    .set('Cookie', sellerCookie)
    .send({ status: 'confirmed' });
  console.log('4. Seller confirms visit 1 status:', resConfirm1.status, '(expected 200)');
  if (resConfirm1.status !== 200 || resConfirm1.body.data.visit.status !== 'confirmed') {
    throw new Error('Expected visit 1 to be confirmed');
  }

  // 5. Buyer2 requests visit at 10:30 AM (same day, 30 min later -> overlaps 1-hour slot!)
  const overlappingDate = new Date(futureDate1.getTime() + 30 * 60 * 1000); // 10:30 AM
  const resVisit2 = await request(app)
    .post(`/api/properties/${propId}/visits`)
    .set('Cookie', buyer2Cookie)
    .send({ visitDate: overlappingDate.toISOString() });
  console.log('5. Buyer2 requests overlapping visit:', resVisit2.status, '(expected 201 pending)');
  const visit2Id = resVisit2.body.data.visit._id;

  // Seller attempts to confirm visit 2: MUST fail with 409 Conflict due to 1-hour slot double-booking!
  const resConfirmOverlap = await request(app)
    .patch(`/api/visits/${visit2Id}/status`)
    .set('Cookie', sellerCookie)
    .send({ status: 'confirmed' });
  console.log('5b. Double-booking confirmation status:', resConfirmOverlap.status, '(expected 409 Conflict)');
  if (resConfirmOverlap.status !== 409) throw new Error('Expected 409 double-booking prevention');

  // 6. Buyer cancels visit 1
  const resCancel = await request(app)
    .patch(`/api/visits/${visit1Id}/status`)
    .set('Cookie', buyer1Cookie)
    .send({ status: 'cancelled' });
  console.log('6. Buyer cancels confirmed visit status:', resCancel.status, '(expected 200)');
  if (resCancel.status !== 200 || resCancel.body.data.visit.status !== 'cancelled') {
    throw new Error('Expected visit 1 to be cancelled');
  }

  // 7. Enquiries: Buyer1 sends enquiry
  const resEnq = await request(app)
    .post(`/api/properties/${propId}/enquiries`)
    .set('Cookie', buyer1Cookie)
    .send({
      name: 'Ananya Buyer1',
      email: 'ananya@buyer.com',
      phone: '+91 9845011111',
      message: 'Is the pricing negotiable for early cash settlement?'
    });
  console.log('7. Enquiry submission status:', resEnq.status, '(expected 201)');
  if (resEnq.status !== 201) throw new Error('Expected 201 for enquiry');
  const enqId = resEnq.body.data.enquiry._id;

  // 8. Seller gets received enquiries
  const resSellerEnq = await request(app)
    .get('/api/enquiries/received')
    .set('Cookie', sellerCookie);
  console.log('8. Seller received enquiries count:', resSellerEnq.body.data.enquiries.length, '(expected 1)');
  if (resSellerEnq.body.data.enquiries.length !== 1) throw new Error('Seller should see received enquiry');

  // 9. Buyer2 cannot see Buyer1's enquiries (returns empty or 403)
  const resBuyer2Enq = await request(app)
    .get('/api/enquiries/my')
    .set('Cookie', buyer2Cookie);
  console.log('9. Buyer2 my enquiries count:', resBuyer2Enq.body.data.enquiries.length, '(expected 0)');
  if (resBuyer2Enq.body.data.enquiries.length !== 0) throw new Error('Buyer2 must not see Buyer1 enquiries');

  // 10. Favorites: Idempotent toggle and uniqueness
  const resFavAdd = await request(app)
    .post(`/api/properties/${propId}/favorite`)
    .set('Cookie', buyer1Cookie);
  console.log('10a. Favorite toggle ADD status:', resFavAdd.status, 'isFavorite:', resFavAdd.body.data.isFavorite, '(expected true)');
  if (!resFavAdd.body.data.isFavorite) throw new Error('Expected isFavorite: true');

  const resFavRemove = await request(app)
    .post(`/api/properties/${propId}/favorite`)
    .set('Cookie', buyer1Cookie);
  console.log('10b. Favorite toggle REMOVE status:', resFavRemove.status, 'isFavorite:', resFavRemove.body.data.isFavorite, '(expected false)');
  if (resFavRemove.body.data.isFavorite) throw new Error('Expected isFavorite: false');

  await disconnectDB();
  console.log('--- Stage 4 Verification Passed Successfully! ---');
}

verifyInteractionsStage().catch((err) => {
  console.error('Stage 4 verification error:', err);
  process.exit(1);
});
