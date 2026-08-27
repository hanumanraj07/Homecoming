const { Router } = require('express');
const { list, getOne, create, updateLocation, checkIn } = require('../controllers/journey.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  journeyIdValidator,
  createJourneyValidator,
  updateLocationValidator,
} = require('../validators/journey.validators');

const router = Router();

router.use(protect);

router.get('/', list);
router.post('/', createJourneyValidator, validate, create);
router.get('/:id', journeyIdValidator, validate, getOne);
router.patch('/:id/location', updateLocationValidator, validate, updateLocation);
router.post('/:id/check-in', journeyIdValidator, validate, checkIn);

module.exports = router;
