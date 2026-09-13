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

describe('Daily finalization', () => {
  it('keeps an OPEN day editable', async () => {
    const { Authorization } = await authHeader(UserRole.MANAGER);
    const vehicle = await createVehicle();
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'PENDING',
      });

    const day = await request(app)
      .get('/api/daily-jobs/2026-08-11')
      .set('Authorization', Authorization);
    expect(day.body.data.status).toBe('OPEN');

    const updated = await request(app)
      .put(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', Authorization)
      .send({ status: 'COMPLETED' });
    expect(updated.status).toBe(200);
  });

  it('rejects create, update, and delete after finalization', async () => {
    const admin = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle();
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', admin.Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'PENDING',
      });

    const finalized = await request(app)
      .post('/api/daily-jobs/2026-08-11/finalize')
      .set('Authorization', admin.Authorization);
    expect(finalized.status).toBe(200);
    expect(finalized.body.data.status).toBe('FINALIZED');

    const createAfter = await request(app)
      .post('/api/jobs')
      .set('Authorization', admin.Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Kandy',
        status: 'PENDING',
      });
    expect(createAfter.status).toBe(403);
    expect(createAfter.body.message).toBe(
      'Jobs for this date have been finalized and cannot be modified.',
    );

    const updateAfter = await request(app)
      .put(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', admin.Authorization)
      .send({ status: 'COMPLETED' });
    expect(updateAfter.status).toBe(403);

    const deleteAfter = await request(app)
      .delete(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', admin.Authorization);
    expect(deleteAfter.status).toBe(403);
  });

  it('allows finalizing a day with zero jobs', async () => {
    const { Authorization } = await authHeader(UserRole.MANAGER);
    const res = await request(app)
      .post('/api/daily-jobs/2026-08-12/finalize')
      .set('Authorization', Authorization);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('FINALIZED');
    expect(res.body.data.counts.total).toBe(0);
  });

  it('does not reopen a finalized day', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    await request(app).post('/api/daily-jobs/2026-08-11/finalize').set('Authorization', Authorization);
    const again = await request(app)
      .post('/api/daily-jobs/2026-08-11/finalize')
      .set('Authorization', Authorization);
    expect(again.status).toBe(409);
  });
});
