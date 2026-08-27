const express = require('express');
const authRoutes = require('./routes/auth.routes');
const guardianRoutes = require('./routes/guardian.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/guardians', guardianRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
