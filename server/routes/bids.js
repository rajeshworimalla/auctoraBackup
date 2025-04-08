// server/routes/bids.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // using the pool from db.js

// GET bids for a specific artwork
router.get('/:artId', async (req, res) => {
    const { artId } = req.params;
    try {
      const [rows] = await db.query(
        'SELECT * FROM bids WHERE artwork_id = ? ORDER BY bid_time DESC',
        [artId]
      );
      res.json({ bids: rows });
    } catch (err) {
      console.error('❌ Error fetching bids:', err);
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
      const [result] = await db.query(
        'INSERT INTO bids (artwork_id, user_id, amount, bid_time) VALUES (?, ?, ?, NOW())',
        [artId, 0, parseFloat(amount)] // using user_id = 0 for guests
      );
  
      const newBid = {
        id: result.insertId,
        artwork_id: artId,
        user_id: 0,
        amount: parseFloat(amount),
        bid_time: new Date().toISOString()
      };
  
      res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
    } catch (err) {
      console.error('Error inserting bid:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });  

module.exports = router;
