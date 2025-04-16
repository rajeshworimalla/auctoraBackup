const path = require('path');
const express = require('express');
const cors = require('cors');
const artworkRoutes = require('./routes/artworks');
const bidRoutes = require('./routes/bids');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/artworks', artworkRoutes);
app.use('/api/bids', bidRoutes);

// Optional: Fallback route for unknown API calls
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ message: '✅ DB connected!', time: result.rows[0].now });
  } catch (error) {
    console.error('❌ Test DB Error:', error.message);
    res.status(500).json({ message: '❌ Failed to connect to DB', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
