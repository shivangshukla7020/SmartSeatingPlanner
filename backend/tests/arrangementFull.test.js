const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('GET /arrangement/:id/full', () => {
  it('should return enriched seating plan', async () => {
    const res = await request(app).get('/arrangement/12345/full');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.seats)).toBe(true);
    if (res.body.seats.length > 0) {
      expect(res.body.seats[0]).toHaveProperty('name');
      expect(res.body.seats[0]).toHaveProperty('subject');
    }
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
