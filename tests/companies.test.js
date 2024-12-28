process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
let db = require('../db');

let testCompany;

beforeEach(async () => {
    let result = await db.query(`INSERT INTO companies VALUES ('test', 'Test Company', 'For testing') RETURNING code, name, description`);
    testCompany = result.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
})

afterAll(async () => {
    await db.end();
})

describe('GET /', () => {
    test('Get list of all companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [{ code: testCompany.code, name: testCompany.name }] })
    })
})

describe('GET /:code', () => {
    test('Get single company by code', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany });
    })
    test('404 if code not found', async () => {
        const res = await request(app).get('/companies/none');
        expect(res.statusCode).toBe(404);
    })
})

describe('POST /', () => {
    test('Add a company', async () => {
        const res = await request(app).post('/companies').send({ code: 'test2', name: 'Test Company 2', description: 'A second test company' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ company: { code: 'test2', name: 'Test Company 2', description: 'A second test company' } })
    })
})

describe('PUT /:code', () => {
    test('Update a company by code', async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: 'Test Company Inc.', description: 'Company for testing' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: { code: testCompany.code, name: 'Test Company Inc.', description: 'Company for testing' } })
    })
    test('404 if code not found', async () => {
        const res = await request(app).put('/companies/none').send({ name: 'Test Company Inc.', description: 'Company for testing' });
        expect(res.statusCode).toBe(404);
    })
})

describe('DELETE /:code', () => {
    test('Delete a company by code', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Deleted' })
    })
    test('404 if code not found', async () => {
        const res = await request(app).delete('/companies/none');
        expect(res.statusCode).toBe(404);
    })
})