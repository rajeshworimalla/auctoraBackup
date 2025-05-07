const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all listings for a user
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  // Gallery listings
  const gallery = await db.query(
    `SELECT g.*, a.title, a.artist_name, a.image_url, a.price, a.is_sold
     FROM gallery g
     JOIN "Artwork" a ON g.artwork_id = a.artwork_id
     WHERE a.owner_id = $1`, [user_id]);
  // Auction listings
  const auctions = await db.query(
    `SELECT au.*, a.title, a.artist_name, a.image_url, au.starting_price, au.status
     FROM auctions au
     JOIN "Artwork" a ON au.artwork_id = a.artwork_id
     WHERE a.owner_id = $1`, [user_id]);
  res.json({ gallery: gallery.rows, auctions: auctions.rows });
});

module.exports = router;