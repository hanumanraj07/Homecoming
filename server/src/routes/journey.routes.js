const express = require('express');
const router = express.Router();
const {
  getJourneys,
  createJourney,
  getJourney,
  startJourney,
  checkInJourney,
  endJourney,
  updateLocation,
  triggerEmergency,
  deleteJourney,
} = require('../controllers/journey.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all journey routes
router.use(protect);

router.route('/')
  .get(getJourneys)
  .post(createJourney);

router.route('/:id')
  .get(getJourney)
  .delete(deleteJourney);

router.post('/:id/start', startJourney);
router.post('/:id/check-in', checkInJourney);
router.post('/:id/end', endJourney);
router.post('/:id/location', updateLocation);
router.post('/:id/emergency', triggerEmergency);

module.exports = router;
