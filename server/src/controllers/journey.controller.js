const Journey = require('../models/Journey');
const Guardian = require('../models/Guardian');
const { ApiError } = require('../utils/ApiError');

const CHECK_IN_GRACE_MINUTES = 10;

async function list(req, res) {
  const journeys = await Journey.find({ userId: req.user._id }).sort({ startedAt: -1 });
  res.json({ journeys });
}

async function getOne(req, res) {
  const journey = await Journey.findOne({ _id: req.params.id, userId: req.user._id });
  if (!journey) {
    throw new ApiError(404, 'Journey not found');
  }
  res.json({ journey });
}

async function create(req, res) {
  const { guardianIds, origin, destination, expectedArrival } = req.body;

  const ownedCount = await Guardian.countDocuments({ _id: { $in: guardianIds }, userId: req.user._id });
  if (ownedCount !== guardianIds.length) {
    throw new ApiError(400, 'One or more guardians were not found');
  }

  const expectedArrivalDate = new Date(expectedArrival);
  const checkInDeadline = new Date(expectedArrivalDate.getTime() + CHECK_IN_GRACE_MINUTES * 60 * 1000);

  const journey = await Journey.create({
    userId: req.user._id,
    guardianIds,
    origin,
    destination,
    currentLocation: { lat: origin.lat, lng: origin.lng, updatedAt: new Date() },
    path: [{ lat: origin.lat, lng: origin.lng, at: new Date() }],
    expectedArrival: expectedArrivalDate,
    checkInDeadline,
  });

  res.status(201).json({ journey });
}

async function updateLocation(req, res) {
  const journey = await Journey.findOne({ _id: req.params.id, userId: req.user._id });
  if (!journey) {
    throw new ApiError(404, 'Journey not found');
  }
  if (journey.status !== 'active') {
    throw new ApiError(409, 'This journey is no longer active');
  }

  const { lat, lng } = req.body;
  const now = new Date();

  journey.currentLocation = { lat, lng, updatedAt: now };
  journey.path.push({ lat, lng, at: now });
  await journey.save();

  res.json({ journey });
}

async function checkIn(req, res) {
  const journey = await Journey.findOne({ _id: req.params.id, userId: req.user._id });
  if (!journey) {
    throw new ApiError(404, 'Journey not found');
  }
  if (journey.status !== 'active') {
    throw new ApiError(409, 'This journey is no longer active');
  }

  journey.status = 'completed';
  journey.endedAt = new Date();
  await journey.save();

  res.json({ journey });
}

module.exports = { list, getOne, create, updateLocation, checkIn };
