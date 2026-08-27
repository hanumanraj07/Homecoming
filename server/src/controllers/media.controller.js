const { ApiError } = require('../utils/ApiError');

function uploadMedia(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'No file was uploaded');
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}

module.exports = { uploadMedia };
