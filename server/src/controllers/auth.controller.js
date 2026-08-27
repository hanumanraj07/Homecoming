const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { ApiError } = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, phone, passwordHash });

  const token = signToken({ sub: user._id.toString() });
  res.status(201).json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ sub: user._id.toString() });
  res.json({ token, user });
}

module.exports = { register, login };
