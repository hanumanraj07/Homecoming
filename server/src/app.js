const express = require('express');
const authRoutes = require('./routes/auth.routes');
const guardianRoutes = require('./routes/guardian.routes');
const journeyRoutes = require('./routes/journey.routes');
const mediaRoutes = require('./routes/media.routes');
const incidentRoutes = require('./routes/incident.routes');
const { UPLOAD_DIR } = require('./middleware/upload.middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/incidents', incidentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
