const express = require('express');
const router = express.Router();
const {
  getContacts,
  addContact,
  getContact,
  updateContact,
  deleteContact,
} = require('../controllers/guardian.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all contact routes
router.use(protect);

router.route('/')
  .get(getContacts)
  .post(addContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
