const express = require('express');
const router = express.Router();
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateScheduleItem
} = require('../controllers/schedule.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Schedule routes
router.route('/')
  .get(getSchedules)
  .post(createSchedule);

router.route('/:id')
  .get(getSchedule)
  .put(updateSchedule)
  .delete(deleteSchedule);

router.put('/:id/items/:itemId', updateScheduleItem);

module.exports = router; 