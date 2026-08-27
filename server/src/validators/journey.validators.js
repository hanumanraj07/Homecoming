const { body, param } = require('express-validator');

const journeyIdValidator = [param('id').isMongoId().withMessage('Invalid journey id')];

const pointValidator = (field) => [
  body(`${field}.lat`).isFloat({ min: -90, max: 90 }).withMessage(`${field}.lat must be a valid latitude`),
  body(`${field}.lng`).isFloat({ min: -180, max: 180 }).withMessage(`${field}.lng must be a valid longitude`),
  body(`${field}.address`).optional().trim(),
];

const createJourneyValidator = [
  body('guardianIds').isArray({ min: 1 }).withMessage('Choose at least one guardian'),
  body('guardianIds.*').isMongoId().withMessage('Invalid guardian id'),
  ...pointValidator('origin'),
  ...pointValidator('destination'),
  body('expectedArrival')
    .isISO8601()
    .withMessage('expectedArrival must be a valid date')
    .custom((value) => new Date(value) > new Date())
    .withMessage('expectedArrival must be in the future'),
];

const updateLocationValidator = [
  ...journeyIdValidator,
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a valid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be a valid longitude'),
];

module.exports = { journeyIdValidator, createJourneyValidator, updateLocationValidator };
