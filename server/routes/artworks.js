const express = require('express');
const router = express.Router();
const db = require('../db'); // connects to PostgreSQL now

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM artworks ORDER BY created_at DESC');
    res.json({ artworks: result.rows });
  } catch (err) {
    console.error("PostgreSQL Error:", err.message);
    res.status(500).json({ message: 'Error fetching artworks' });
  }
});

module.exports = router;
