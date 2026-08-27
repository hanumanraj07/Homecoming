const { Router } = require('express');
const { list, getOne, create } = require('../controllers/incident.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { incidentIdValidator, createIncidentValidator } = require('../validators/incident.validators');

const router = Router();

router.use(protect);

router.get('/', list);
router.post('/', createIncidentValidator, validate, create);
router.get('/:id', incidentIdValidator, validate, getOne);

module.exports = router;
