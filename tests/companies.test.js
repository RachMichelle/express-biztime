proccess.env.NODE_ENV = 'test';

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

decribe('GET /', () => {
    test('Get list of all companies')
})

describe('GET /:code', () => {
    test('Get single company by code')
    test('404 if code not found')
})

describe('POST /', () => {
    test('Add a company')
})

describe('PUT /:code', () => {
    test('Update a company by code')
    test('404 if code not found')
})

describe('DELETE /:code', () => {
    test('Delete a company by code')
    test('404 if code not found')
})