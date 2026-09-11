const request = require('supertest');
const app = require('../src/server');

describe('API de monitoramento', () => {
  it('retorna status de saúde', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('traz métricas básicas', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cpu');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('disk');
  });

  it('lista processos', async () => {
    const res = await request(app).get('/api/processes?limit=3');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.processes)).toBe(true);
  });
});
