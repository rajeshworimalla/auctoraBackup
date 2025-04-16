const express = require('express');
const router = express.Router();
const db = require('../db');

// GET bids for a specific artwork
router.get('/:artId', async (req, res) => {
  const { artId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM bids WHERE artwork_id = $1 ORDER BY bid_time DESC',
      [artId]
    );
    res.json({ bids: result.rows });
  } catch (err) {
    console.error('❌ Error fetching bids:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST a new bid
router.post('/', async (req, res) => {
  const { artId, amount } = req.body;

  if (!artId || !amount) {
    return res.status(400).json({ error: 'Missing artId or amount' });
  }

  try {
    const result = await db.query(
      'INSERT INTO bids (artwork_id, user_id, amount, bid_time) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [artId, 0, parseFloat(amount)]
    );

    const newBid = result.rows[0]; // PostgreSQL gives the inserted row

    res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
  } catch (err) {
    console.error('❌ Error inserting bid:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
