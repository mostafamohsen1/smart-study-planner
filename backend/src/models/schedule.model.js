const mongoose = require('mongoose');

const ScheduleItemSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a schedule name'],
    trim: true,
    maxlength: [100, 'Schedule name cannot be more than 100 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [ScheduleItemSchema],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp before save
ScheduleSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Calculate completion percentage
ScheduleSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  
  const completedItems = this.items.filter(item => item.completed).length;
  return Math.round((completedItems / this.items.length) * 100);
});

module.exports = mongoose.model('Schedule', ScheduleSchema); 