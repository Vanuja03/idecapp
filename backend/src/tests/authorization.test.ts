import request from 'supertest';
import { UserRole } from '../types';
import { app, authHeader, createVehicle, resetDb, startMemoryDb, stopMemoryDb } from './helpers';

beforeAll(async () => {
  await startMemoryDb();
});

afterAll(async () => {
  await stopMemoryDb();
});

beforeEach(async () => {
  await resetDb();
});

describe('Authorization', () => {
  it('prevents VIEWER from creating jobs', async () => {
    const { Authorization } = await authHeader(UserRole.VIEWER);
    const vehicle = await createVehicle();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'PENDING',
      });
    expect(res.status).toBe(403);
  });

  it('prevents OPERATOR from finalizing', async () => {
    const { Authorization } = await authHeader(UserRole.OPERATOR);
    const res = await request(app)
      .post('/api/daily-jobs/2026-08-11/finalize')
      .set('Authorization', Authorization);
    expect(res.status).toBe(403);
  });

  it('prevents MANAGER from deleting jobs', async () => {
    const manager = await authHeader(UserRole.MANAGER);
    const vehicle = await createVehicle();
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', manager.Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'PENDING',
      });

    const deleted = await request(app)
      .delete(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', manager.Authorization);
    expect(deleted.status).toBe(403);
  });

  it('prevents non-admin from managing users', async () => {
    const { Authorization } = await authHeader(UserRole.MANAGER);
    const res = await request(app).get('/api/users').set('Authorization', Authorization);
    expect(res.status).toBe(403);
  });

  it('allows ADMIN to manage vehicles', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', Authorization)
      .send({ vehicleNumber: 'NEW-1111', description: 'Box truck' });
    expect(res.status).toBe(201);
  });
});
