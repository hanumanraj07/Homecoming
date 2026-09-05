const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  relationship: {
    type: String,
    trim: true,
  },
  isTrusted: {
    type: Boolean,
    default: true,
  },
  isPriority: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Guardian', guardianSchema);
