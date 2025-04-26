const Schedule = require('../models/schedule.model');
const Course = require('../models/course.model');

// @desc    Get all schedules for logged in user
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user.id })
      .populate('course', 'name');

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get schedules for a specific course
// @route   GET /api/courses/:courseId/schedules
// @access  Private
exports.getCourseSchedules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user owns the course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }

    const schedules = await Schedule.find({ 
      course: req.params.courseId,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('course', 'name topics');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this schedule'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private
exports.createSchedule = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Verify the course exists and belongs to user
    const course = await Course.findById(req.body.course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create schedule for this course'
      });
    }

    // Create schedule
    const schedule = await Schedule.create(req.body);

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    // If course ID is being changed, verify ownership
    if (req.body.course && req.body.course !== schedule.course.toString()) {
      const course = await Course.findById(req.body.course);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to use this course'
        });
      }
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule item completion status
// @route   PUT /api/schedules/:id/items/:itemId
// @access  Private
exports.updateScheduleItem = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    // Find the schedule item
    const item = schedule.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }

    // Update the item's completed status
    item.completed = req.body.completed;
    
    // Save the updated schedule
    await schedule.save();

    // If item was marked as completed, update course progress
    if (req.body.completed && req.body.updateCourseProgress) {
      const course = await Course.findById(schedule.course);
      
      if (course) {
        // Add to completed topics if not already there
        if (!course.completedTopics.includes(item.topic)) {
          course.completedTopics.push(item.topic);
          
          // Calculate new progress percentage
          const totalTopics = course.topics.length;
          const completedCount = course.completedTopics.length;
          
          if (totalTopics > 0) {
            course.progress = Math.round((completedCount / totalTopics) * 100);
          }
          
          await course.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate a study schedule
// @route   POST /api/courses/:courseId/generate-schedule
// @access  Private
exports.generateSchedule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user owns the course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }
    
    const { startDate, endDate, daysPerWeek = 5, hoursPerSession = 2 } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }
    
    // Generate schedule logic
    const scheduleItems = [];
    const topics = course.topics;
    const now = new Date();
    
    // Start date
    const start = new Date(startDate);
    
    // End date
    const end = new Date(endDate);
    
    // Validate dates
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Days of the week to study (default: Mon-Fri)
    const studyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, daysPerWeek);
    
    // Create a schedule with study sessions distributed evenly
    const totalTopics = topics.length;
    let currentTopic = 0;
    
    // Calculate number of days between start and end
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Number of study days available
    const totalStudyDays = Math.floor(daysDiff * (daysPerWeek / 7));
    
    // Sessions per topic
    const sessionsPerTopic = Math.max(1, Math.ceil(totalStudyDays / totalTopics));
    
    // Create schedule items
    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + day);
      
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
      
      // Skip if not a study day
      if (!studyDays.includes(dayName)) {
        continue;
      }
      
      // Add a study session for the current day
      const topic = topics[currentTopic % totalTopics];
      
      scheduleItems.push({
        day: dayName,
        startTime: '18:00',
        endTime: `${18 + hoursPerSession}:00`,
        topic,
        completed: false
      });
      
      // Move to next topic after enough sessions for the current one
      if ((scheduleItems.length % sessionsPerTopic) === 0) {
        currentTopic++;
      }
    }
    
    // Create the schedule
    const schedule = await Schedule.create({
      name: `${course.name} Study Plan`,
      course: course._id,
      user: req.user.id,
      items: scheduleItems,
      startDate: start,
      endDate: end
    });

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 