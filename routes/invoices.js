const express = require('express');
const db = require('../db');
const ExpressError = require('../expressError');
const router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT id, comp_code FROM invoices ORDER BY id`);
        return res.json({ invoices: result.rows });
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const invId = req.params.id;
        const result = await db.query(`SELECT i.id, c.code, c.name, c.description, i.amt, i.paid, i.add_date, i.paid_date FROM invoices AS i JOIN companies AS c ON i.comp_code = c.code WHERE i.id=$1`, [invId]);
        if (result.rows.length === 0) {
            throw new ExpressError('Invoice not found', 404)
        }
        const {id, amt, paid, add_date, paid_date } = result.rows[0];
        const {code, name, description} = result.rows[0];
        return res.json({ invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} });
    } catch (e) {
        return next(e)
    }
})

router.get('/companies/:code', async (req, res, next) => {
    try {
        const compCode = req.params.code;
        const compResult = db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [compCode]);
        const invResult = db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_code = $1`, [compCode])
        const [companyInfo, invoices] = await Promise.all([compResult, invResult]);
        if (companyInfo.rows.length === 0) {
            throw new ExpressError('Company not found', 404)
        }
        const company = companyInfo.rows[0];
        company.invoices = invoices.rows;
        return res.json({company});
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        const result = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *`, [amt, id]);
        if (result.rows.length === 0) {
            throw new ExpressError('Invoice not found, unable to update', 404);
        }
        return res.json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError('Invoice not found', 404);
        }
        return res.json({ message: 'Deleted' });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;