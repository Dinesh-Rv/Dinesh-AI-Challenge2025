const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const errorMiddleware = require('../middlewares/errorMiddleware');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorMiddleware);

describe('User API', () => {
  let userId;
  let token;
  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    userId = res.body.user.id;
  });

  it('should login and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get all users (protected)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should get user by id (protected)', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('id', userId);
  });

  it('should update user (protected)', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.first_name || res.body.user.firstName).toBe('Updated');
  });

  it('should delete user (protected)', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
}); 