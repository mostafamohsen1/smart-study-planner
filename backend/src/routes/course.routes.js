const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateProgress
} = require('../controllers/course.controller');
const { generateSchedule, getCourseSchedules } = require('../controllers/schedule.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Course routes
router.route('/')
  .get(getCourses)
  .post(createCourse);

router.route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

router.put('/:id/progress', updateProgress);

// Schedule routes related to courses
router.get('/:courseId/schedules', getCourseSchedules);
router.post('/:courseId/generate-schedule', generateSchedule);

module.exports = router; 