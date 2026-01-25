const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');

const router = express.Router();
const upload = multer();

// list ONLY found items with pagination
router.get('/', async (req, res) => {
    const kind = 'found'; // force filter to found items only

    const currentPage = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (currentPage - 1) * limit;

    // Count total found items
    const countQuery = 'SELECT COUNT(*) FROM items WHERE kind=$1';
    const countParams = [kind];

    const countResult = await db.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch found items for current page
    const dataQuery = `
        SELECT * FROM items
        WHERE kind=$1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const dataParams = [kind, limit, offset];

    const { rows } = await db.query(dataQuery, dataParams);

    res.render('index', {
        items: rows,
        filter: 'found',
        currentPage,
        totalPages,
        kind: 'found'
    });
});

// show form to post found item
router.get('/post-found', (req, res) => {
    res.render('post_found', { errors: [], data: {} });
});

router.get('/post-lost', (req, res) => res.render('post_lost'));

// create item (common handler)
const createValidators = [
    body('kind').isIn(['found', 'lost']),
    body('item_type').isLength({ min: 1 }),
    body('item_name').isLength({ min: 1 }),
    body('place').isLength({ min: 1 }),
    body('poster_name').isLength({ min: 1 }),
    body('poster_phone').isLength({ min: 8 }).trim(),
];

router.post('/create', upload.none(), createValidators, async (req, res) => {
    const errors = validationResult(req);
    const kindValue = req.body.kind || "found";

    if (!errors.isEmpty()) {
        const formView = kindValue === "lost" ? "post_lost" : "post_found";
        return res.status(422).render(formView, {
            errors: errors.array(),
            data: req.body
        });
    }

    let {
        kind,
        item_type,
        item_name,
        item_number,
        place,
        poster_name,
        poster_phone
    } = req.body;

    // 🔹 Normalize (UPPERCASE) before DB insert
    item_type   = item_type;
    item_name   = item_name?.trim().toUpperCase();
    item_number = item_number?.trim().toUpperCase() || null;
    place       = place?.trim().toUpperCase();
    poster_name = poster_name?.trim().toUpperCase();

    const insertQuery = `
        INSERT INTO items(
            kind, item_type, item_name, item_number, place,
            poster_name, poster_phone
        )
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING id;
    `;

    await db.query(insertQuery, [
        kind,
        item_type,
        item_name,
        item_number,
        place,
        poster_name,
        poster_phone
    ]);

    req.flash('success', 'Murakoze. Gutanga amakuru ku cyangombwa byagenze neza');
    res.redirect('/items');
});


router.get('/search', async (req, res) => {
    try {
        let { type, query } = req.query;

        if (!type || !query) {
            req.flash("error", "Please select a card category and enter a lost card number");
            return res.redirect('/items');
        }

        // 🔹 Normalize inputs
        type = type;
        query = query.trim().toUpperCase();

        const sql = `
            SELECT * FROM items 
            WHERE kind = 'found'
            AND item_type = $1 
            AND item_number = $2
        `;

        const result = await db.query(sql, [type, query]);

        if (result.rows.length === 0) {
            req.flash("error", "Icyangombwa cyanyu nticyiraboneka. Muzongere mushakishe ubutaha");
            return res.redirect('/items');
        }

        res.render('index', {
            items: result.rows,
            currentPage: 1,
            totalPages: 1,
            kind: 'found'
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Gushakisha icyangombwa ntago bigenze neza. Mwongere mugerageze");
        res.redirect('/items');
    }
});


module.exports = router;
