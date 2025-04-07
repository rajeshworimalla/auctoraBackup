const path = require('path');
const express = require('express');
const cors = require('cors');
const artworkRoutes = require('./routes/artworks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//API Routes
app.use('/api/artworks', artworkRoutes);

//Only serve frontend in production (so dev doesn’t crash)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Catch-all route for React (only in prod)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
