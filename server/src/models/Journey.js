const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  status: {
    type: String,
    enum: ['SAFE', 'MISSED', 'ESCALATED', 'EMERGENCY'],
    default: 'SAFE',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

const locationHistorySchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  speed: Number,
  heading: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const journeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  transportMode: {
    type: String,
    enum: ['walking', 'driving', 'cycling', 'bus'],
    default: 'walking',
  },
  destination: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  startLocation: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  status: {
    type: String,
    enum: ['PLANNED', 'ACTIVE', 'CHECK-IN_PENDING', 'SAFE', 'CHECK-IN_MISSED', 'ESCALATED', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNED',
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
  },
  checkInInterval: {
    type: Number, // in minutes
    default: 15,
  },
  gracePeriod: {
    type: Number, // in minutes
    default: 5,
  },
  startTime: {
    type: Date,
  },
  expectedArrival: {
    type: Date,
  },
  actualArrival: {
    type: Date,
  },
  lastCheckIn: {
    type: Date,
  },
  trustedContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian',
  }],
  checkIns: [checkInSchema],
  locationHistory: [locationHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Journey', journeySchema);
