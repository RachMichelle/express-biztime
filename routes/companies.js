const express = require('express');
const db = require('../db');
const ExpressError = require('../expressError');
const router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT code, name FROM companies`);
        return res.json({ companies: result.rows });
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError('Invoice not found', 404)
        }
        return res.json({ Company: result.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const result = await db.query(`INSERT INTO companies VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        return res.status(201).json({ company: result.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const result = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *`, [name, description, code]);
        if (result.rows.length === 0) {
            throw new ExpressError('Company not found, unable to update', 404);
        }
        return res.json({ company: result.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const result = await db.query(`DELETE FROM companies WHERE code = $1`, [code]);
        return res.json({ message: 'Deleted' });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;