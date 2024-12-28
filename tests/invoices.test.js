process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
let db = require('../db');

let testInvoice;
let testCompany;

beforeAll(async () => {
    let result = await db.query(`INSERT INTO companies VALUES ('test', 'Test Company', 'For testing') RETURNING code, name, description`);
    testCompany = result.rows[0];
})

beforeEach(async () => {
    let result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', 200) RETURNING *`);
    testInvoice = result.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
})

afterAll(async () => {
    await db.query(`DELETE FROM companies`);
    await db.end();
})

describe('GET /', () => {
    test('Get all invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoices: [{id: testInvoice.id, comp_code: testInvoice.comp_code}]});
    })
})

describe('GET /:id', () => {
    test('Get single invoice by id', async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice:{id: testInvoice.id, amt: testInvoice.amt, paid: testInvoice.paid, add_date: expect.any(String), paid_date:testInvoice.paid_date, company: testCompany}});
        // need to expect any string for date--testInvoice not converting date to string but response body is since app returns JSON.
    })
    test('404 if id not found', async () => {
        const res = await request(app).get('/invoices/0');
        expect(res.statusCode).toBe(404);
    })
})

describe('POST /', () => {
    test('Add an invoice', async () => {
        const res = await request(app).post('/invoices').send({comp_code: 'test', amt: 150});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({invoice: {id: expect.any(Number), comp_code: 'test', amt: 150, paid: false, add_date: expect.any(String), paid_date: null}})
    })
})

describe('PUT /:id', () => {
    test('Update an invoice by id', async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({amt: 250});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('invoice.amt', 250);
    })
    test('404 if id not found', async () => {
        const res = await request(app).put('/invoices/0').send({amt: 250});
        expect(res.statusCode).toBe(404);
    })
})

describe('DELETE /:id', () => {
    test('Delete an invoice by id', async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Deleted' })
    })
    test('404 if id not found', async () => {
        const res = await request(app).delete('/invoices/0');
        expect(res.statusCode).toBe(404);
    })
})

describe('GET /companies/:code', () => {
    test('Get all invoices for specified company', async () => {
        const res = await request(app).get(`/invoices/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: testCompany.code, name: testCompany.name, description: testCompany.description, invoices: [{id: testInvoice.id, amt: testInvoice.amt, paid: false, add_date: expect.any(String), paid_date: null}]}})
    })
    test('404 if code not found', async () => {
        const res = await request(app).get('/invoices/companies/none');
        expect(res.statusCode).toBe(404);
    })
})