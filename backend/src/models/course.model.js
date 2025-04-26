const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true,
    maxlength: [100, 'Course name cannot be more than 100 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  difficulty: {
    type: Number,
    required: [true, 'Please add a difficulty level'],
    min: 1,
    max: 3
  },
  topics: {
    type: [String],
    default: []
  },
  hoursAvailable: {
    type: Number,
    required: [true, 'Please add hours available per week'],
    min: 1,
    max: 168
  },
  completedTopics: {
    type: [String],
    default: []
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate remaining time until deadline
CourseSchema.virtual('remainingDays').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Setup cascade delete for schedules when a course is deleted
CourseSchema.pre('deleteOne', { document: true }, async function() {
  await this.model('Schedule').deleteMany({ course: this._id });
});

module.exports = mongoose.model('Course', CourseSchema); 