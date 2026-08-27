const Incident = require('../models/Incident');
const { ApiError } = require('../utils/ApiError');

async function list(req, res) {
  const incidents = await Incident.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ incidents });
}

async function getOne(req, res) {
  const incident = await Incident.findOne({ _id: req.params.id, userId: req.user._id });
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }
  res.json({ incident });
}

async function create(req, res) {
  const { type, journeyId, location, mediaUrls, note } = req.body;

  const incident = await Incident.create({
    userId: req.user._id,
    journeyId: journeyId ?? null,
    type,
    location,
    mediaUrls: mediaUrls ?? [],
    note: note ?? '',
  });

  res.status(201).json({ incident });
}

module.exports = { list, getOne, create };
