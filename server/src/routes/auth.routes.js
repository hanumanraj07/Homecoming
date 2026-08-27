const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validators');

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
