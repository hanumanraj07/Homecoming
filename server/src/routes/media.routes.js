const { Router } = require('express');
const { uploadMedia } = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = Router();

router.use(protect);

router.post('/', upload.single('file'), uploadMedia);

module.exports = router;
