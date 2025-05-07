const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all purchases for a user
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  // Gallery purchases
  const gallery = await db.query(
    `SELECT gp.*, a.title, a.artist_name, a.image_url, a.price, gp.purchased_at
     FROM gallery_purchases gp
     JOIN "Artwork" a ON gp.artwork_id = a.artwork_id
     WHERE gp.buyer_id = $1`, [user_id]);
  // Auction wins
  const auctions = await db.query(
    `SELECT aw.*, a.title, a.artist_name, a.image_url, aw.final_price, aw.won_at
     FROM auction_wins aw
     JOIN auctions au ON aw.auction_id = au.auction_id
     JOIN "Artwork" a ON au.artwork_id = a.artwork_id
     WHERE aw.winner_id = $1`, [user_id]);
  res.json({ gallery: gallery.rows, auctions: auctions.rows });
});

module.exports = router;