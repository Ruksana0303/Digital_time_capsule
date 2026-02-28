const express = require('express');
const router = express.Router();
const { createCapsule, getCapsules, getCapsule, deleteCapsule, getSharedCapsule, regenerateShareToken } = require('../controllers/capsuleController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public route
router.get('/share/:token', getSharedCapsule);

// Protected routes
router.use(protect);
router.get('/', getCapsules);
router.post('/', upload.array('media', 10), createCapsule);
router.get('/:id', getCapsule);
router.delete('/:id', deleteCapsule);
router.post('/:id/regenerate-token', regenerateShareToken);

module.exports = router;
