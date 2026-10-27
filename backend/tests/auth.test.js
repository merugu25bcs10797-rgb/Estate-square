import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';

describe('Auth & Roles Test Suite', () => {
  setupTestDB();

  it("Test 1: public register can't create admin (400) and register duplicate email -> 409", async () => {
    // Attempt public registration as admin
    const resAdmin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker',
        email: 'attacker@test.com',
        password: 'password123',
        role: 'admin'
      });
    expect(resAdmin.status).toBe(400);
    expect(resAdmin.body.success).toBe(false);

    // Valid buyer registration
    const resBuyer = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kavita Iyer',
        email: 'kavita@test.com',
        password: 'password123',
        role: 'buyer'
      });
    expect(resBuyer.status).toBe(201);
    expect(resBuyer.body.data.user.role).toBe('buyer');
    expect(resBuyer.body.data.user.passwordHash).toBeUndefined();

    // Duplicate email registration attempt
    const resDup = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Kavita',
        email: 'kavita@test.com',
        password: 'password999',
        role: 'buyer'
      });
    expect(resDup.status).toBe(409);
    expect(resDup.body.success).toBe(false);
  });

  it('Test 2: wrong password fails safely with 401', async () => {
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vikram Seth',
        email: 'vikram@test.com',
        password: 'correctpassword',
        role: 'seller'
      });

    // Login with wrong password
    const resWrong = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vikram@test.com',
        password: 'incorrectpassword'
      });

    expect(resWrong.status).toBe(401);
    expect(resWrong.body.success).toBe(false);
    expect(resWrong.body.message).toContain('Invalid email or password');
  });
});
