const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or malformed authorization header'));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return next(new ApiError(401, 'User no longer exists'));
  }
  req.user = user;
  next();
}

module.exports = { protect };
