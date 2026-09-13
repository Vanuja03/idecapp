import request from 'supertest';
import { UserRole } from '../types';
import { app, createUser, resetDb, startMemoryDb, stopMemoryDb } from './helpers';

beforeAll(async () => {
  await startMemoryDb();
});

afterAll(async () => {
  await stopMemoryDb();
});

beforeEach(async () => {
  await resetDb();
});

describe('Authentication', () => {
  it('logs in with valid credentials', async () => {
    await createUser(UserRole.ADMIN, { username: 'admin', password: 'Admin@123' });
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'Admin@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects wrong password', async () => {
    await createUser(UserRole.ADMIN, { username: 'admin', password: 'Admin@123' });
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects inactive user', async () => {
    await createUser(UserRole.OPERATOR, { username: 'ops', password: 'Password@123', isActive: false });
    const res = await request(app).post('/api/auth/login').send({
      username: 'ops',
      password: 'Password@123',
    });
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('USER_INACTIVE');
  });

  it('rejects missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('returns current user for /me', async () => {
    await createUser(UserRole.MANAGER, { username: 'manager', password: 'Password@123' });
    const login = await request(app).post('/api/auth/login').send({
      username: 'manager',
      password: 'Password@123',
    });
    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.username).toBe('manager');
  });
});
