function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  const details = err.details;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: message,
    ...(details ? { details } : {}),
  });
}

module.exports = { notFound, errorHandler };
