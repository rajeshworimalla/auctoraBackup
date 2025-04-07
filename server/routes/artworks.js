const express = require('express');
const router = express.Router();
const db = require('../db'); // connects to MySQL

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM artworks ORDER BY created_at DESC');
    res.json({ artworks: rows });
  } catch (err) {
    console.error("MySQL Error:", err.message);
    res.status(500).json({ message: 'Error fetching artworks' });
  }
});

module.exports = router;
