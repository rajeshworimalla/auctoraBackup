const path = require('path');
const express = require('express');
const cors = require('cors');
const artworkRoutes = require('./routes/artworks');
const bidRoutes = require('./routes/bids');

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
