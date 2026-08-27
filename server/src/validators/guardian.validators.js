const { body, param } = require('express-validator');

const guardianIdValidator = [param('id').isMongoId().withMessage('Invalid guardian id')];

const createGuardianValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('relation').optional().trim(),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be true or false'),
  body('contactId').optional({ nullable: true }).trim(),
];

const updateGuardianValidator = [
  ...guardianIdValidator,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('relation').optional().trim(),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be true or false'),
];

module.exports = { guardianIdValidator, createGuardianValidator, updateGuardianValidator };
