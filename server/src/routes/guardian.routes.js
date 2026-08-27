const { Router } = require('express');
const { list, create, update, remove } = require('../controllers/guardian.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  guardianIdValidator,
  createGuardianValidator,
  updateGuardianValidator,
} = require('../validators/guardian.validators');

const router = Router();

router.use(protect);

router.get('/', list);
router.post('/', createGuardianValidator, validate, create);
router.patch('/:id', updateGuardianValidator, validate, update);
router.delete('/:id', guardianIdValidator, validate, remove);

module.exports = router;
