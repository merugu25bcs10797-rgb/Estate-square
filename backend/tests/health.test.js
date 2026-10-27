import request from 'supertest';
import app from '../app.js';

describe('Health Route Test', () => {
  it('Test 10: /health returns ok with 200 status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.environment).toBeDefined();
  });
});
