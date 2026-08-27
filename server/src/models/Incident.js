const mongoose = require('mongoose');

const incidentLocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const incidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey', default: null },
  type: { type: String, enum: ['sos', 'unsafe_spot'], required: true },
  location: { type: incidentLocationSchema, required: true },
  mediaUrls: { type: [String], default: [] },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Incident', incidentSchema);
