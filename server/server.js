const path = require('path');
const express = require('express');
const cors = require('cors');
const artworkRoutes = require('./routes/artworks');
const bidRoutes = require('./routes/bids');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/artworks', artworkRoutes);
app.use('/api/bids', bidRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // ✅ Final safe catch-all route
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
