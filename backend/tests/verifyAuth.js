import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

async function verifyAuthStage() {
  console.log('--- Verifying Stage 2 Auth Routes ---');
  await connectDB('memory');

  // 1. Test public registration with admin role (MUST fail with 400)
  const resAdmin = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Hacker',
      email: 'hacker@admin.com',
      password: 'password123',
      role: 'admin'
    });
  console.log('1. Register as admin status:', resAdmin.status, '(expected 400)');
  if (resAdmin.status !== 400) throw new Error('Expected 400 for admin registration attempt');

  // 2. Test valid buyer registration
  const resBuyer = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Aditi Rao',
      email: 'aditi@example.com',
      password: 'password123',
      role: 'buyer'
    });
  console.log('2. Valid buyer registration status:', resBuyer.status, '(expected 201)');
  if (resBuyer.status !== 201) throw new Error('Expected 201 for valid buyer registration');
  if (resBuyer.body.data.user.passwordHash) throw new Error('passwordHash leaked in response!');
  const cookie = resBuyer.headers['set-cookie'];
  console.log('   Received set-cookie header:', Boolean(cookie));

  // 3. Duplicate email registration (MUST fail with 409)
  const resDup = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Aditi Duplicate',
      email: 'aditi@example.com',
      password: 'password123',
      role: 'buyer'
    });
  console.log('3. Duplicate email status:', resDup.status, '(expected 409)');
  if (resDup.status !== 409) throw new Error('Expected 409 for duplicate email');

  // 4. Login with wrong password (MUST fail safely with 401)
  const resWrongPass = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'aditi@example.com',
      password: 'wrongpassword'
    });
  console.log('4. Wrong password status:', resWrongPass.status, '(expected 401)');
  if (resWrongPass.status !== 401) throw new Error('Expected 401 for wrong password');

  // 5. Login with correct password (MUST succeed with 200)
  const resLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'aditi@example.com',
      password: 'password123'
    });
  console.log('5. Valid login status:', resLogin.status, '(expected 200)');
  if (resLogin.status !== 200) throw new Error('Expected 200 for valid login');

  const authCookie = resLogin.headers['set-cookie'];

  // 6. GET /api/auth/me with cookie
  const resMe = await request(app)
    .get('/api/auth/me')
    .set('Cookie', authCookie);
  console.log('6. GET /api/auth/me status:', resMe.status, '(expected 200)');
  console.log('   User name:', resMe.body.data.user.name, 'Role:', resMe.body.data.user.role);
  if (resMe.status !== 200 || resMe.body.data.user.email !== 'aditi@example.com') {
    throw new Error('Expected valid user details in /me');
  }

  // 7. Logout
  const resLogout = await request(app).post('/api/auth/logout');
  console.log('7. Logout status:', resLogout.status, '(expected 200)');

  await disconnectDB();
  console.log('--- Stage 2 Auth Verification Passed! ---');
}

verifyAuthStage().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
