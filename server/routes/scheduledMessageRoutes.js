const express = require('express');
const router = express.Router();
const { createScheduledMessage, getScheduledMessages, deleteScheduledMessage } = require('../controllers/scheduledMessageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getScheduledMessages);
router.post('/', createScheduledMessage);
router.delete('/:id', deleteScheduledMessage);

module.exports = router;
