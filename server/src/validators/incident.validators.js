const { body, param } = require('express-validator');

const incidentIdValidator = [param('id').isMongoId().withMessage('Invalid incident id')];

const createIncidentValidator = [
  body('type').isIn(['sos', 'unsafe_spot']).withMessage('type must be sos or unsafe_spot'),
  body('journeyId').optional({ nullable: true }).isMongoId().withMessage('Invalid journey id'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('location.lat must be a valid latitude'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('location.lng must be a valid longitude'),
  body('location.address').optional().trim(),
  body('mediaUrls').optional().isArray().withMessage('mediaUrls must be an array'),
  body('mediaUrls.*').optional().isString(),
  body('note').optional().trim(),
];

module.exports = { incidentIdValidator, createIncidentValidator };
