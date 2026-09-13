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

describe('Jobs', () => {
  it('creates and lists jobs by date', async () => {
    const { Authorization } = await authHeader(UserRole.OPERATOR);
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

    expect(created.status).toBe(201);
    expect(created.body.data.job.vehicleNumberSnapshot).toBe('ABC-1234');

    const list = await request(app)
      .get('/api/jobs?date=2026-08-11')
      .set('Authorization', Authorization);
    expect(list.status).toBe(200);
    expect(list.body.data.jobs).toHaveLength(1);
  });

  it('updates a job while the day is open', async () => {
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

    const updated = await request(app)
      .put(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', Authorization)
      .send({ destination: 'Kandy', status: 'COMPLETED' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.job.destination).toBe('Kandy');
    expect(updated.body.data.job.status).toBe('COMPLETED');
  });

  it('deletes a job as ADMIN while the day is open', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle();
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Galle',
        status: 'PENDING',
      });

    const deleted = await request(app)
      .delete(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', Authorization);
    expect(deleted.status).toBe(200);
  });

  it('rejects invalid vehicle', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: '64b0f0f0f0f0f0f0f0f0f0f0',
        destination: 'Colombo',
        status: 'PENDING',
      });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VEHICLE_NOT_FOUND');
  });

  it('rejects inactive vehicle', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle('ZZZ-0001', false);
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'PENDING',
      });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VEHICLE_INACTIVE');
  });

  it('rejects invalid status', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: 'Colombo',
        status: 'DRIVING',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects missing destination', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleId: vehicle._id.toString(),
        destination: '',
        status: 'PENDING',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.destination).toBeTruthy();
  });
});
