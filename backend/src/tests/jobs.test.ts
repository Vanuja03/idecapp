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

  it('creates a job for a temporary (other) lorry with a manual number', async () => {
    const { Authorization } = await authHeader(UserRole.OPERATOR);
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleSource: 'OTHER',
        otherVehicleNumber: ' wp  lb-4521 ',
        destination: 'Colombo',
        status: 'PENDING',
        notes: 'Perera Transport',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.job.vehicleSource).toBe('OTHER');
    expect(res.body.data.job.vehicleId).toBeNull();
    expect(res.body.data.job.vehicleNumberSnapshot).toBe('WP LB-4521');
    expect(res.body.data.job.notes).toBe('Perera Transport');
  });

  it('rejects an other lorry job without a lorry number', async () => {
    const { Authorization } = await authHeader(UserRole.OPERATOR);
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleSource: 'OTHER',
        destination: 'Colombo',
        status: 'PENDING',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.otherVehicleNumber).toBeTruthy();
  });

  it('does not allow changing the lorry type after creation', async () => {
    const { Authorization } = await authHeader(UserRole.MANAGER);
    const vehicle = await createVehicle();
    const own = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({ jobDate: '2026-08-11', vehicleId: vehicle._id.toString(), destination: 'Colombo', status: 'PENDING' });
    const other = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleSource: 'OTHER',
        otherVehicleNumber: 'TMP-1',
        destination: 'Galle',
        status: 'PENDING',
      });

    const ownToOther = await request(app)
      .put(`/api/jobs/${own.body.data.job._id}`)
      .set('Authorization', Authorization)
      .send({ vehicleSource: 'OTHER', otherVehicleNumber: 'TMP-2' });
    expect(ownToOther.status).toBe(400);
    expect(ownToOther.body.errorCode).toBe('VEHICLE_SOURCE_LOCKED');

    const otherToOwn = await request(app)
      .put(`/api/jobs/${other.body.data.job._id}`)
      .set('Authorization', Authorization)
      .send({ vehicleSource: 'OWN', vehicleId: vehicle._id.toString() });
    expect(otherToOwn.status).toBe(400);
    expect(otherToOwn.body.errorCode).toBe('VEHICLE_SOURCE_LOCKED');
  });

  it('updates the lorry number of an other lorry job', async () => {
    const { Authorization } = await authHeader(UserRole.MANAGER);
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({
        jobDate: '2026-08-11',
        vehicleSource: 'OTHER',
        otherVehicleNumber: 'TMP-1',
        destination: 'Galle',
        status: 'PENDING',
      });

    const updated = await request(app)
      .put(`/api/jobs/${created.body.data.job._id}`)
      .set('Authorization', Authorization)
      .send({ vehicleSource: 'OTHER', otherVehicleNumber: 'tmp-7' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.job.vehicleSource).toBe('OTHER');
    expect(updated.body.data.job.vehicleNumberSnapshot).toBe('TMP-7');
  });

  it('excludes other lorries from analytics', async () => {
    const { Authorization } = await authHeader(UserRole.ADMIN);
    const vehicle = await createVehicle();
    const base = { jobDate: '2026-08-11', destination: 'Colombo', status: 'COMPLETED' };
    await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({ ...base, vehicleId: vehicle._id.toString() });
    await request(app)
      .post('/api/jobs')
      .set('Authorization', Authorization)
      .send({ ...base, vehicleSource: 'OTHER', otherVehicleNumber: 'TMP-9' });

    const res = await request(app)
      .get('/api/analytics/completed-by-vehicle?period=week&date=2026-08-11')
      .set('Authorization', Authorization);

    expect(res.status).toBe(200);
    expect(res.body.data.hires).toBe(1);
    expect(res.body.data.trucks).toEqual([{ vehicleNumber: 'ABC-1234', completed: 1 }]);
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
