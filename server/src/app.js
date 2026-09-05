const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const guardianRoutes = require('./routes/guardian.routes');
const journeyRoutes = require('./routes/journey.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', guardianRoutes);
app.use('/api/journeys', journeyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
