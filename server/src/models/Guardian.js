const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  relation: { type: String, default: '', trim: true },
  isPrimary: { type: Boolean, default: false },
  contactId: { type: String, default: null },
});

module.exports = mongoose.model('Guardian', guardianSchema);
