const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const currentLocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pathPointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const journeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  guardianIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guardian' }],
  status: { type: String, enum: ['active', 'completed', 'missed', 'sos'], default: 'active' },
  origin: { type: pointSchema, required: true },
  destination: { type: pointSchema, required: true },
  currentLocation: { type: currentLocationSchema, default: null },
  path: { type: [pathPointSchema], default: [] },
  expectedArrival: { type: Date, required: true },
  checkInDeadline: { type: Date, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Journey', journeySchema);
