const { validationResult } = require('express-validator');

function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  const error = new Error('Validation failed');
  error.statusCode = 422;
  error.details = formatted;
  next(error);
}

module.exports = { validate };
