// DOM Elements
const courseForm = document.getElementById('course-form');
const coursesContainer = document.getElementById('courses-container');
const emptyMessage = document.querySelector('.empty-message');
const generateScheduleBtn = document.getElementById('generate-schedule');
const scheduleContainer = document.getElementById('schedule');
const authButton = document.getElementById('auth-button');
const userProfile = document.getElementById('user-profile');
const userEmail = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

// State
let courses = JSON.parse(localStorage.getItem('courses')) || [];
let schedule = [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Add schedule button icon
    generateScheduleBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Generate Schedule';
    
    // Add form submit button icon if not already added in HTML
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    if (!submitBtn.querySelector('i')) {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Course';
    }

    // Check if user is logged in
    updateAuthUI();
    
    // Render courses with animation delay
    setTimeout(() => {
        renderCourses();
    }, 300);
    
    // Event listeners
    courseForm.addEventListener('submit', addCourse);
    generateScheduleBtn.addEventListener('click', generateScheduleWithAnimation);
    
    // Logout event listener
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Add form input animations
    addFormInputAnimations();
    
    // Add hover effects for interactive elements
    addHoverEffects();
    
    // Set minimum date for deadline input to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadline').min = today;
});

// Add animations to form inputs
function addFormInputAnimations() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group select');
    
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
            input.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            input.style.borderColor = '';
        });
        
        // Add label animation
        const label = input.parentElement.querySelector('label');
        if (label) {
            input.addEventListener('focus', () => {
                label.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            });
            
            input.addEventListener('blur', () => {
                label.style.color = '';
            });
        }
    });
}

// Add hover effects for interactive elements
function addHoverEffects() {
    // Add hover effect to the generate schedule button
    generateScheduleBtn.addEventListener('mouseenter', () => {
        generateScheduleBtn.querySelector('i').classList.add('fa-spin');
    });
    
    generateScheduleBtn.addEventListener('mouseleave', () => {
        generateScheduleBtn.querySelector('i').classList.remove('fa-spin');
    });
}

// Update authentication UI
function updateAuthUI() {
    if (isLoggedIn) {
        // User is logged in
        const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'User';
        
        if (authButton) authButton.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            if (userEmail) userEmail.textContent = email;
        }
    } else {
        // User is not logged in
        if (authButton) authButton.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// Handle logout with animation
function handleLogout() {
    // Add loading animation
    logoutButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging out...';
    logoutButton.disabled = true;
    
    // Simulate logout process
    setTimeout(() => {
        // Clear auth data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        
        // Update state
        isLoggedIn = false;
        
        // Update UI
        updateAuthUI();
        
        // Show notification
        showNotification('Logged out successfully', 'info');
        
        // Reset button
        logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutButton.disabled = false;
    }, 800);
}

// Add a new course with animation
function addCourse(e) {
    e.preventDefault();
    
    // Add loading animation to button
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Adding...';
    submitBtn.disabled = true;
    
    // Add form validation visual cues
    const courseNameInput = document.getElementById('course-name');
    const deadlineInput = document.getElementById('deadline');
    const hoursInput = document.getElementById('hours-available');
    let isValid = true;
    
    // Get form values
    const courseName = courseNameInput.value;
    const deadline = deadlineInput.value;
    const difficulty = document.getElementById('difficulty').value;
    const topicsStr = document.getElementById('topics').value;
    const hoursAvailable = hoursInput.value;
    
    // Validate form inputs with visual feedback
    if (!courseName) {
        highlightInvalidField(courseNameInput, 'Course name is required');
        isValid = false;
    } else {
        resetFieldValidation(courseNameInput);
    }
    
    if (!deadline) {
        highlightInvalidField(deadlineInput, 'Deadline is required');
        isValid = false;
    } else {
        resetFieldValidation(deadlineInput);
    }
    
    if (!hoursAvailable || parseInt(hoursAvailable) <= 0) {
        highlightInvalidField(hoursInput, 'Hours must be greater than 0');
        isValid = false;
    } else {
        resetFieldValidation(hoursInput);
    }
    
    // If validation fails, restore button and return
    if (!isValid) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Process topics
    const topics = topicsStr.split(',')
        .map(topic => topic.trim())
        .filter(topic => topic !== '');
    
    // Create course object
    const course = {
        id: Date.now().toString(),
        name: courseName,
        deadline,
        difficulty: parseInt(difficulty),
        topics,
        hoursAvailable: parseInt(hoursAvailable),
        progress: 0, // Add progress tracking to the course object
        completedTopics: [] // Track completed topics
    };
    
    // Add visual feedback - shake form container gently
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.add('processing');
    
    // Simulate server processing
    setTimeout(() => {
        // Add to courses array
        courses.push(course);
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Reset form with animation
        resetFormWithAnimation();
        
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Course';
        submitBtn.disabled = false;
        
        // Remove processing class
        formContainer.classList.remove('processing');
        
        // Render courses
        renderCourses();
        
        // Show success notification
        showNotification('Course added successfully!', 'success');
        
        // Automatically generate a new schedule with the added course
        if (courses.length > 0) {
            generateScheduleWithAnimation();
        }
    }, 800);
}

// Helper function to highlight invalid fields
function highlightInvalidField(inputElement, message) {
    inputElement.classList.add('invalid');
    
    // Add error message if not already present
    let errorSpan = inputElement.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains('error-message')) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        inputElement.parentElement.appendChild(errorSpan);
        
        // Animate the error message
        errorSpan.style.opacity = '0';
        errorSpan.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            errorSpan.style.transition = 'all 0.3s ease';
            errorSpan.style.opacity = '1';
            errorSpan.style.transform = 'translateY(0)';
        }, 10);
    }
}

// Helper function to reset field validation
function resetFieldValidation(inputElement) {
    inputElement.classList.remove('invalid');
    
    // Remove error message if present
    const errorSpan = inputElement.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.style.opacity = '0';
        errorSpan.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            errorSpan.remove();
        }, 300);
    }
}

// Reset form with animation
function resetFormWithAnimation() {
    // Collect all form inputs
    const formInputs = courseForm.querySelectorAll('input, select');
    
    // Add transition effect to each input
    formInputs.forEach(input => {
        input.style.transition = 'all 0.3s ease';
        input.style.backgroundColor = 'rgba(var(--success-color-rgb), 0.1)';
    });
    
    // After a short delay, reset the form and remove the effect
    setTimeout(() => {
        courseForm.reset();
        
        formInputs.forEach(input => {
            input.style.backgroundColor = '';
        });
        
        // Set minimum date for deadline input to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('deadline').min = today;
    }, 500);
}

// Render all courses with animations
function renderCourses() {
    if (courses.length === 0) {
        emptyMessage.style.display = 'block';
        coursesContainer.innerHTML = '';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    // Sort courses by deadline
    const sortedCourses = [...courses].sort((a, b) => {
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    // Clear container first
    coursesContainer.innerHTML = '';
    
    // Check if quick tips section already exists
    let existingQuickTips = document.querySelector('.quick-tips');
    
    // Only add quick tips if it doesn't already exist
    if (!existingQuickTips) {
        const quickTips = document.createElement('div');
        quickTips.className = 'quick-tips';
        quickTips.innerHTML = `
            <h3><i class="fas fa-lightbulb"></i> Tips for Effective Study Planning</h3>
            <ul>
                <li>Break down large courses into smaller, manageable topics</li>
                <li>Be realistic about difficulty levels - this affects study time allocation</li>
                <li>Set reasonable deadlines that allow for consistent study sessions</li>
                <li>Update your progress regularly to stay on track</li>
            </ul>
        `;
        
        // Insert tips before the courses container
        coursesContainer.parentNode.insertBefore(quickTips, coursesContainer);
    }
    
    // Add each course with staggered animation and improved loading
    sortedCourses.forEach((course, index) => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card';
        courseElement.dataset.id = course.id;
        
        // Add animation delay based on index for staggered appearance
        courseElement.style.animationDelay = `${index * 0.1}s`;
        
        // Calculate days until deadline
        const today = new Date();
        const deadlineDate = new Date(course.deadline);
        const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine countdown class based on days left
        let countdownClass = 'plenty';
        if (daysLeft <= 3) {
            countdownClass = 'urgent';
        } else if (daysLeft <= 7) {
            countdownClass = 'soon';
        }
        
        // Calculate actual progress (not random)
        // If you have actual progress tracking, use that data instead
        const progress = course.progress || 0;
        
        // Generate topic tags with animation delays
        const topicTags = course.topics.length > 0 
            ? `<div class="topics">
                <p><i class="fas fa-book"></i> Topics:</p>
                <div class="topic-tags">
                    ${course.topics.map((topic, i) => `
                        <span class="topic-tag" style="animation-delay: ${0.2 + (i * 0.1)}s">${topic}</span>
                    `).join('')}
                </div>
              </div>`
            : '';
        
        courseElement.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
                <div class="course-badges">
                    <span class="difficulty difficulty-${course.difficulty}">
                        ${getDifficultyLabel(course.difficulty)}
                    </span>
                </div>
            </div>
            
            <div class="course-body">
                <p class="deadline"><i class="far fa-calendar-alt"></i> Deadline: 
                    <span class="deadline-date">${formatDate(course.deadline)}</span>
                    <span class="countdown ${countdownClass}">${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</span>
                </p>
                <p><i class="far fa-clock"></i> Hours per week: ${course.hoursAvailable}</p>
                ${topicTags}
                
                <div class="progress-container">
                    <div class="progress-bar progress-${course.difficulty}" style="width: ${progress}%"></div>
                    <span class="progress-text">${progress}% complete</span>
                </div>
            </div>
            
            <div class="course-actions">
                <button class="edit-btn" title="Edit course">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${course.id}" title="Delete course">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add to DOM
        coursesContainer.appendChild(courseElement);
        
        // Add delete event listener
        const deleteBtn = courseElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteCourse(course.id));
        
        // Add edit event listener
        const editBtn = courseElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => editCourse(course.id));
    });
}

// Edit course function
function editCourse(id) {
    const course = courses.find(course => course.id === id);
    
    if (!course) return;
    
    // Fill the form with course data
    document.getElementById('course-name').value = course.name;
    document.getElementById('deadline').value = course.deadline;
    document.getElementById('difficulty').value = course.difficulty;
    document.getElementById('topics').value = course.topics.join(', ');
    document.getElementById('hours-available').value = course.hoursAvailable;
    
    // Change button text
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Course';
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    
    // Highlight form
    document.querySelector('.form-container').classList.add('highlight-form');
    
    // Set form mode to edit
    courseForm.dataset.mode = 'edit';
    courseForm.dataset.editId = id;
    
    // Change form submission handler
    courseForm.removeEventListener('submit', addCourse);
    courseForm.addEventListener('submit', updateCourse);
    
    // Show notification
    showNotification('Editing course: ' + course.name, 'info');
}

// Update course function
function updateCourse(e) {
    e.preventDefault();
    
    // Get form values
    const courseName = document.getElementById('course-name').value;
    const deadline = document.getElementById('deadline').value;
    const difficulty = document.getElementById('difficulty').value;
    const topicsStr = document.getElementById('topics').value;
    const hoursAvailable = document.getElementById('hours-available').value;
    
    // Validate form inputs
    if (!courseName || !deadline) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Process topics
    const topics = topicsStr.split(',')
        .map(topic => topic.trim())
        .filter(topic => topic !== '');
    
    // Get course ID
    const id = courseForm.dataset.editId;
    
    // Find course index
    const courseIndex = courses.findIndex(course => course.id === id);
    
    if (courseIndex === -1) {
        showNotification('Course not found', 'error');
        return;
    }
    
    // Add loading animation to button
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Updating...';
    submitBtn.disabled = true;
    
    // Simulate server processing
    setTimeout(() => {
        // Update course
        courses[courseIndex] = {
            ...courses[courseIndex],
            name: courseName,
            deadline,
            difficulty: parseInt(difficulty),
            topics,
            hoursAvailable: parseInt(hoursAvailable)
        };
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Reset form
        courseForm.reset();
        
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Course';
        submitBtn.disabled = false;
        
        // Reset form mode
        courseForm.dataset.mode = 'add';
        delete courseForm.dataset.editId;
        
        // Remove highlight
        document.querySelector('.form-container').classList.remove('highlight-form');
        
        // Reset event listeners
        courseForm.removeEventListener('submit', updateCourse);
        courseForm.addEventListener('submit', addCourse);
        
        // Render courses
        renderCourses();
        
        // Regenerate schedule
        if (courses.length > 0) {
            generateScheduleWithAnimation();
        }
        
        // Show success notification
        showNotification('Course updated successfully!', 'success');
    }, 800);
}

// Delete a course with animation
function deleteCourse(id) {
    // Get the course element
    const courseElement = document.querySelector(`[data-id="${id}"]`);
    
    // Check if we're currently editing this course
    if (courseForm.dataset.mode === 'edit' && courseForm.dataset.editId === id) {
        // Reset the form to "Add Course" mode
        courseForm.reset();
        
        // Change button text back to Add Course
        const submitBtn = courseForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Course';
        submitBtn.disabled = false;
        
        // Reset form mode
        courseForm.dataset.mode = 'add';
        delete courseForm.dataset.editId;
        
        // Remove highlight
        document.querySelector('.form-container').classList.remove('highlight-form');
        
        // Reset event listeners
        courseForm.removeEventListener('submit', updateCourse);
        courseForm.addEventListener('submit', addCourse);
        
        // Show notification
        showNotification('Course deleted while editing. Form reset to Add mode.', 'info');
    }
    
    // Add delete animation
    if (courseElement) {
        courseElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        courseElement.style.opacity = '0';
        courseElement.style.transform = 'translateY(20px)';
    }
    
    // Remove after animation completes
    setTimeout(() => {
        // Update courses array
        courses = courses.filter(course => course.id !== id);
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Render courses
        renderCourses();
        
        // Check if there are remaining courses and regenerate schedule
        if (courses.length > 0) {
            // Generate a new schedule with remaining courses
            showNotification('Regenerating schedule with updated courses...', 'info');
            generateScheduleWithAnimation();
        } else {
            // Clear schedule if no courses remain
            schedule = [];
            scheduleContainer.innerHTML = '';
            showNotification('All courses deleted. Add courses to generate a schedule.', 'warning');
        }
    }, 500);
}

// Generate schedule with loading animation
function generateScheduleWithAnimation() {
    if (courses.length === 0) {
        showNotification('Add courses first to generate a schedule.', 'error');
        return;
    }
    
    // Add loading animation
    generateScheduleBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Generating...';
    generateScheduleBtn.disabled = true;
    
    // Show loading overlay on schedule container
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'schedule-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Optimizing your study plan...</p>
    `;
    
    // Add loading overlay styles
    const style = document.createElement('style');
    style.textContent = `
        .schedule-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(74, 111, 165, 0.2);
            border-top: 5px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Clear existing schedule
    scheduleContainer.innerHTML = '';
    scheduleContainer.style.position = 'relative';
    scheduleContainer.appendChild(loadingOverlay);
    
    // Scroll to schedule
    scheduleContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Simulate processing time for better UX
    setTimeout(() => {
        // Generate schedule
        generateSchedule();
        
        // Remove loading overlay
        scheduleContainer.removeChild(loadingOverlay);
        
        // Reset button
        generateScheduleBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Generate Schedule';
        generateScheduleBtn.disabled = false;
        
        // Show success notification
        showNotification('Schedule generated successfully!', 'success');
    }, 1500);
}

// Generate study schedule with improved algorithm
function generateSchedule() {
    // Clear existing schedule
    schedule = [];
    
    // Sort courses by deadline and difficulty
    const prioritizedCourses = [...courses].sort((a, b) => {
        // First sort by deadline
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        
        // Calculate days until deadline
        const today = new Date();
        const daysUntilA = Math.max(1, Math.ceil((dateA - today) / (1000 * 60 * 60 * 24)));
        const daysUntilB = Math.max(1, Math.ceil((dateB - today) / (1000 * 60 * 60 * 24)));
        
        // Create priority score (lower is higher priority)
        // Enhanced priority calculation that includes urgency component
        const urgencyFactorA = Math.pow(1.5, Math.max(0, 10 - daysUntilA) / 3); // Exponential urgency for close deadlines
        const urgencyFactorB = Math.pow(1.5, Math.max(0, 10 - daysUntilB) / 3);
        
        const difficultyFactorA = Math.max(1, parseInt(a.difficulty));
        const difficultyFactorB = Math.max(1, parseInt(b.difficulty));
        
        // Priority scores weighted with urgency and difficulty
        const priorityA = daysUntilA / (difficultyFactorA * 1.5 * urgencyFactorA);
        const priorityB = daysUntilB / (difficultyFactorB * 1.5 * urgencyFactorB);
        
        return priorityA - priorityB;
    });
    
    // Calculate days until deadline for each course
    const today = new Date();
    prioritizedCourses.forEach(course => {
        const deadlineDate = new Date(course.deadline);
        const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        course.daysLeft = Math.max(1, daysLeft); // At least 1 day
        
        // Calculate urgency factor (1-10 scale)
        course.urgency = Math.min(10, Math.ceil(10 / (course.daysLeft / 7 + 0.1)));
        
        // Scale time allocation by difficulty (more hours for harder courses, but ensure mins for easy ones)
        // Use adjusted difficulty factor to prevent easy courses from being under-allocated
        const adjustedDifficulty = course.difficulty === 1 ? 1.3 : course.difficulty; // Boost easy courses slightly more
        course.difficultyFactor = Math.pow(adjustedDifficulty / 2, 1.2);
        
        // Ensure easy courses get proper treatment
        if (course.difficulty === 1) {
            // Even for easy courses, maintain a minimum scaling factor
            course.difficultyFactor = Math.max(0.85, course.difficultyFactor);
        }
        
        // Track remaining topics to study for this course
        course.remainingTopics = [...course.topics];
    });
    
    // Create a 7-day schedule with optimized study windows
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayPreferences = {
        // Weekend days get more hours for harder subjects but with breaks to prevent fatigue
        'Saturday': { preference: 1.5, focusHours: [10, 18], breakTimes: [13, 14] }, 
        'Sunday': { preference: 1.5, focusHours: [10, 18], breakTimes: [13, 14] },
        // Weekdays have standard distribution with evening focus
        'Monday': { preference: 1, focusHours: [15, 21], breakTimes: [18, 18.5] },
        'Tuesday': { preference: 1, focusHours: [15, 21], breakTimes: [18, 18.5] },
        'Wednesday': { preference: 1, focusHours: [15, 21], breakTimes: [18, 18.5] },
        'Thursday': { preference: 1, focusHours: [15, 21], breakTimes: [18, 18.5] },
        'Friday': { preference: 0.8, focusHours: [15, 20], breakTimes: [17.5, 18] } // Less on Friday
    };
    
    // Distribute total hours needed with difficulty scaling
    const totalHoursAvailable = prioritizedCourses.reduce((total, course) => 
        total + parseInt(course.hoursAvailable), 0);
    
    // Calculate difficulty-weighted hours with learning curve adjustment
    let totalWeightedHours = 0;
    prioritizedCourses.forEach(course => {
        // More difficult courses need more study time proportionally
        // Apply learning curve adjustment - harder courses need initial deeper focus
        let learningCurveAdjustment = 1;
        if (course.difficulty === 3) {
            learningCurveAdjustment = 1.2; // More initial time for hard courses
        } else if (course.difficulty === 1) {
            learningCurveAdjustment = 0.9; // Slightly less initial time, more reinforcement later
        }
        
        course.weightedHours = Math.ceil(course.hoursAvailable * course.difficultyFactor * learningCurveAdjustment);
        totalWeightedHours += course.weightedHours;
    });
    
    // Normalize to fit within available hours if needed
    const scaleFactor = Math.min(1, totalHoursAvailable / totalWeightedHours);
    prioritizedCourses.forEach(course => {
        course.allocatedWeeklyHours = Math.round(course.weightedHours * scaleFactor);
        // Ensure at least minimum hours per course, especially for easy ones
        const minHours = course.difficulty === 1 ? Math.min(2, course.hoursAvailable) : Math.min(3, course.hoursAvailable);
        course.allocatedWeeklyHours = Math.max(minHours, course.allocatedWeeklyHours);
        
        // Create a distribution of hours across days based on difficulty with cognitive optimizations
        course.dailyDistribution = {};
        let remainingHours = course.allocatedWeeklyHours;
        
        // Get optimal distribution pattern based on cognitive science
        // Hard topics: Concentrated study with adequate breaks
        // Medium topics: Balanced distribution
        // Easy topics: Spaced repetition
        
        // Distribute by difficulty level with cognitive optimization
        if (course.difficulty >= 3) {
            // Hard courses: focus more on weekends but with 2-day gap between intense sessions
            ['Saturday', 'Tuesday', 'Thursday'].forEach(day => {
                if (remainingHours <= 0) return;
                
                // Deeper focus on primary study days
                const dayHours = Math.min(
                    Math.ceil(course.allocatedWeeklyHours * 0.3),
                    remainingHours
                );
                course.dailyDistribution[day] = dayHours;
                remainingHours -= dayHours;
            });
            
            // Add a review session a day after primary studies (reinforcement effect)
            ['Sunday', 'Wednesday', 'Friday'].forEach(day => {
                if (remainingHours <= 0) return;
                
                // Lighter review sessions
                const dayHours = Math.min(
                    Math.ceil(course.allocatedWeeklyHours * 0.15),
                    remainingHours
                );
                course.dailyDistribution[day] = dayHours;
                remainingHours -= dayHours;
            });
            
            // Any remaining hours
            if (remainingHours > 0) {
                const remainingDays = weekdays.filter(day => !course.dailyDistribution[day]);
                if (remainingDays.length > 0) {
                    const hoursPerDay = Math.ceil(remainingHours / remainingDays.length);
                    remainingDays.forEach(day => {
                        if (remainingHours <= 0) return;
                        const dayHours = Math.min(hoursPerDay, remainingHours);
                        course.dailyDistribution[day] = dayHours;
                        remainingHours -= dayHours;
                    });
                }
            }
        } else if (course.difficulty === 2) {
            // Medium courses: balanced approach with optimal spacing
            // Primary study days with moderate sessions
            ['Monday', 'Thursday', 'Saturday'].forEach(day => {
                if (remainingHours <= 0) return;
                
                const dayHours = Math.min(
                    Math.ceil(course.allocatedWeeklyHours * 0.25),
                    remainingHours
                );
                course.dailyDistribution[day] = dayHours;
                remainingHours -= dayHours;
            });
            
            // Secondary review days
            ['Wednesday', 'Sunday'].forEach(day => {
                if (remainingHours <= 0) return;
                
                const dayHours = Math.min(
                    Math.ceil(course.allocatedWeeklyHours * 0.15),
                    remainingHours
                );
                course.dailyDistribution[day] = dayHours;
                remainingHours -= dayHours;
            });
            
            // Any remaining hours - distribute to remaining days
            if (remainingHours > 0) {
                const remainingDays = weekdays.filter(day => !course.dailyDistribution[day]);
                if (remainingDays.length > 0) {
                    const hoursPerDay = Math.ceil(remainingHours / remainingDays.length);
                    remainingDays.forEach(day => {
                        if (remainingHours <= 0) return;
                        const dayHours = Math.min(hoursPerDay, remainingHours);
                        course.dailyDistribution[day] = dayHours;
                        remainingHours -= dayHours;
                    });
                }
            }
        } else {
            // Easy courses: optimal spaced repetition approach (smaller, frequent sessions)
            // Based on learning science for better long-term retention
            
            // Determine ideal distribution for spaced repetition (typically every other day)
            const spacedDays = ['Monday', 'Wednesday', 'Friday', 'Sunday'];
            
            // Calculate appropriate session duration based on total hours
            // For easy topics, shorter, more frequent sessions are better for retention
            const sessionsCount = Math.min(spacedDays.length, Math.max(2, Math.floor(course.allocatedWeeklyHours)));
            const selectedDays = spacedDays.slice(0, sessionsCount);
            
            // Initial learning session is slightly longer
            if (selectedDays.length > 0 && remainingHours > 0) {
                const firstDay = selectedDays[0];
                const dayHours = Math.min(
                    Math.ceil(course.allocatedWeeklyHours * 0.4),
                    remainingHours
                );
                course.dailyDistribution[firstDay] = dayHours;
                remainingHours -= dayHours;
                selectedDays.shift(); // Remove first day from array
            }
            
            // Distribute remaining hours optimally for reinforcement
            if (selectedDays.length > 0 && remainingHours > 0) {
                const hoursPerSession = Math.max(1, Math.ceil(remainingHours / selectedDays.length));
                selectedDays.forEach(day => {
                    if (remainingHours <= 0) return;
                    const dayHours = Math.min(hoursPerSession, remainingHours);
                    course.dailyDistribution[day] = dayHours;
                    remainingHours -= dayHours;
                });
            }
            
            // If there are still hours, add a weekend review session
            if (remainingHours > 0 && !course.dailyDistribution['Saturday']) {
                const reviewHours = Math.min(1, remainingHours);
                course.dailyDistribution['Saturday'] = reviewHours;
                remainingHours -= reviewHours;
            }
            
            // Any final remaining hours - distribute to remaining days
            if (remainingHours > 0) {
                const remainingDays = weekdays.filter(day => !course.dailyDistribution[day]);
                if (remainingDays.length > 0) {
                    const hoursPerDay = Math.ceil(remainingHours / remainingDays.length);
                    remainingDays.forEach(day => {
                        if (remainingHours <= 0) return;
                        const dayHours = Math.min(hoursPerDay, remainingHours);
                        course.dailyDistribution[day] = dayHours;
                        remainingHours -= dayHours;
                    });
                }
            }
        }
    });
    
    // Calculate max hours per day to prevent exhaustion
    const MAX_DAILY_HOURS = 6; // Maximum hours on any given day
    
    // Create daily schedules with smarter topic rotation and prevent fatigue
    for (let i = 0; i < 7; i++) {
        const dayName = weekdays[i];
        const day = {
            name: dayName,
            sessions: [],
            totalHours: 0,
            focusHours: dayPreferences[dayName].focusHours,
            breakTimes: dayPreferences[dayName].breakTimes // Add break times
        };
        
        // Get all courses that have hours allocated for this day
        const coursesForToday = prioritizedCourses
            .filter(course => (course.dailyDistribution[dayName] || 0) > 0)
            .sort((a, b) => {
                // Order by difficulty, then by urgency
                if (a.difficulty !== b.difficulty) {
                    return b.difficulty - a.difficulty; // Harder courses earlier in the day
                }
                return b.urgency - a.urgency; // More urgent courses earlier
            });
        
        // Track occupied time slots to avoid overlaps
        const occupiedSlots = [];
        // Add break times to occupied slots
        if (day.breakTimes) {
            occupiedSlots.push({
                start: day.breakTimes[0],
                end: day.breakTimes[1]
            });
        }
        
        // Prevent overloading any day - cap total hours
        let availableHoursForDay = MAX_DAILY_HOURS;
        let totalPlannedHours = coursesForToday.reduce((sum, course) => 
            sum + course.dailyDistribution[dayName], 0);
            
        // If day is overloaded, scale back proportionally
        if (totalPlannedHours > availableHoursForDay) {
            const scaleFactor = availableHoursForDay / totalPlannedHours;
            coursesForToday.forEach(course => {
                const originalHours = course.dailyDistribution[dayName];
                const scaledHours = Math.max(1, Math.floor(originalHours * scaleFactor));
                course.dailyDistribution[dayName] = scaledHours;
            });
        }
        
        // Assign study sessions based on optimal learning sequence
        coursesForToday.forEach(course => {
            const hoursForToday = course.dailyDistribution[dayName] || 0;
            
            if (hoursForToday > 0) {
                // Select topics intelligently - prioritize topics not yet covered
                let topicsToStudy = [];
                
                if (course.topics.length > 0) {
                    // If all topics have been covered at least once, reset the tracking
                    if (course.remainingTopics.length === 0) {
                        course.remainingTopics = [...course.topics];
                    }
                    
                    // Take topics from remaining ones, with a limit based on difficulty
                    let maxTopicsPerSession;
                    if (course.difficulty === 1) {
                        // Easy courses: cover more topics per session
                        maxTopicsPerSession = Math.min(course.topics.length, Math.max(2, 5 - course.difficulty));
                    } else if (course.difficulty === 2) {
                        // Medium courses: balanced approach
                        maxTopicsPerSession = Math.max(1, 3 - Math.floor(course.difficulty / 2));
                    } else {
                        // Hard courses: focus deeply on fewer topics
                        maxTopicsPerSession = Math.max(1, 4 - course.difficulty);
                    }
                    
                    const numTopics = Math.min(course.remainingTopics.length, maxTopicsPerSession);
                    
                    // Select topics from remaining ones
                    topicsToStudy = course.remainingTopics.slice(0, numTopics);
                    
                    // Remove these topics from remaining
                    course.remainingTopics = course.remainingTopics.filter(
                        topic => !topicsToStudy.includes(topic)
                    );
                }
                
                // Find optimal time slot considering cognitive performance
                // Hard subjects earlier in the day's study window when focus is higher
                const focusHours = day.focusHours;
                
                // Adjust start time based on difficulty and cognitive performance
                let startHourOffset = 0;
                let preferredPosition;
                
                if (course.difficulty === 3) {
                    // Hard courses at peak cognitive hours
                    preferredPosition = 'early'; // Early in study window
                } else if (course.difficulty === 2) {
                    // Medium courses in middle of study window
                    preferredPosition = 'middle';
                } else {
                    // Easy courses more flexible, can be later
                    preferredPosition = 'late';
                }
                
                // Find available time slot based on preference
                let startHour;
                let endHour;
                let timeSlotFound = false;
                
                // Calculate window boundaries
                const windowStart = focusHours[0];
                const windowEnd = focusHours[1];
                const windowDuration = windowEnd - windowStart;
                
                // Try to find slot based on preference
                if (preferredPosition === 'early') {
                    // Try early slots first
                    for (let h = windowStart; h <= windowEnd - hoursForToday; h += 0.5) {
                        if (isTimeSlotAvailable(h, h + hoursForToday, occupiedSlots)) {
                            startHour = h;
                            endHour = h + hoursForToday;
                            timeSlotFound = true;
                            break;
                        }
                    }
                } else if (preferredPosition === 'late') {
                    // Try later slots first
                    for (let h = windowEnd - hoursForToday; h >= windowStart; h -= 0.5) {
                        if (isTimeSlotAvailable(h, h + hoursForToday, occupiedSlots)) {
                            startHour = h;
                            endHour = h + hoursForToday;
                            timeSlotFound = true;
                            break;
                        }
                    }
                } else {
                    // Middle preference - start from middle of window
                    const middleHour = windowStart + (windowDuration / 2) - (hoursForToday / 2);
                    // Try slots around the middle
                    for (let offset = 0; offset <= windowDuration / 2; offset += 0.5) {
                        // Try middle, then slightly before, then slightly after
                        const tryHour = middleHour - offset;
                        if (tryHour >= windowStart && tryHour + hoursForToday <= windowEnd) {
                            if (isTimeSlotAvailable(tryHour, tryHour + hoursForToday, occupiedSlots)) {
                                startHour = tryHour;
                                endHour = tryHour + hoursForToday;
                                timeSlotFound = true;
                                break;
                            }
                        }
                        
                        // Try the other direction from middle
                        const tryHourAlt = middleHour + offset;
                        if (offset > 0 && tryHourAlt >= windowStart && tryHourAlt + hoursForToday <= windowEnd) {
                            if (isTimeSlotAvailable(tryHourAlt, tryHourAlt + hoursForToday, occupiedSlots)) {
                                startHour = tryHourAlt;
                                endHour = tryHourAlt + hoursForToday;
                                timeSlotFound = true;
                                break;
                            }
                        }
                    }
                }
                
                // If no slot found based on preference, find any available slot
                if (!timeSlotFound) {
                    for (let h = windowStart; h <= windowEnd - hoursForToday; h += 0.5) {
                        if (isTimeSlotAvailable(h, h + hoursForToday, occupiedSlots)) {
                            startHour = h;
                            endHour = h + hoursForToday;
                            timeSlotFound = true;
                            break;
                        }
                    }
                }
                
                // If still no slot found, just use the first available time
                if (!timeSlotFound) {
                    startHour = windowStart;
                    endHour = windowStart + hoursForToday;
                }
                
                // Mark this time slot as occupied
                occupiedSlots.push({
                    start: startHour,
                    end: endHour
                });
                
                // Create a study session with difficulty-specific styling
                day.sessions.push({
                    course: course.name,
                    topics: topicsToStudy,
                    hours: hoursForToday,
                    startTime: formatTimeForDisplay(startHour, [0, 15, 30, 45]),
                    endTime: formatTimeForDisplay(endHour, [0, 15, 30, 45]),
                    difficulty: course.difficulty,
                    urgency: course.urgency,
                    daysUntilDeadline: course.daysLeft
                });
                
                // Update day's total hours
                day.totalHours += hoursForToday;
            }
        });
        
        // Sort sessions by start time
        day.sessions.sort((a, b) => {
            return convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime);
        });
        
        // Add break session if there are study sessions
        if (day.sessions.length > 0 && day.breakTimes) {
            const breakStartTime = formatTimeForDisplay(day.breakTimes[0], [0, 15, 30, 45]);
            const breakEndTime = formatTimeForDisplay(day.breakTimes[1], [0, 15, 30, 45]);
            
            // Insert break session at the right position
            const breakMinutes = convertTimeToMinutes(breakStartTime);
            let breakIndex = 0;
            
            while (breakIndex < day.sessions.length && 
                   convertTimeToMinutes(day.sessions[breakIndex].startTime) < breakMinutes) {
                breakIndex++;
            }
            
            day.sessions.splice(breakIndex, 0, {
                isBreak: true,
                startTime: breakStartTime,
                endTime: breakEndTime,
                hours: day.breakTimes[1] - day.breakTimes[0]
            });
        }
        
        schedule.push(day);
    }
    
    // Render schedule
    renderEnhancedSchedule();
}

// Helper function to check if a time slot is available
function isTimeSlotAvailable(start, end, occupiedSlots) {
    for (const slot of occupiedSlots) {
        // Check if there's any overlap
        if (!(end <= slot.start || start >= slot.end)) {
            return false;
        }
    }
    return true;
}

// Helper function to format time for display
function formatTimeForDisplay(hour, minuteOptions) {
    const hourInt = Math.floor(hour);
    const minutesFraction = hour - hourInt;
    
    // Convert minute fraction to closest allowed minute option
    const minutePercent = minutesFraction * 60;
    const minute = minuteOptions.reduce((prev, curr) => {
        return (Math.abs(curr - minutePercent) < Math.abs(prev - minutePercent) ? curr : prev);
    });
    
    // Format time
    const hourFormatted = hourInt % 12 === 0 ? 12 : hourInt % 12;
    const amPm = hourInt < 12 ? 'AM' : 'PM';
    const minutesFormatted = minute < 10 ? `0${minute}` : minute;
    
    return `${hourFormatted}:${minutesFormatted} ${amPm}`;
}

// Convert time string to minutes for comparison
function convertTimeToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + minutes;
}

// Render the generated schedule with enhanced animations and visualization
function renderEnhancedSchedule() {
    if (schedule.length === 0) {
        scheduleContainer.innerHTML = '<p class="empty-message">No schedule generated yet.</p>';
        return;
    }
    
    scheduleContainer.innerHTML = ''; // Clear container
    
    // Add summary section
    const summaryElement = document.createElement('div');
    summaryElement.className = 'schedule-summary';
    summaryElement.style.opacity = '0';
    summaryElement.style.transform = 'translateY(20px)';
    
    // Calculate total study hours and distribution
    const totalHours = schedule.reduce((sum, day) => 
        sum + day.sessions.reduce((daySum, session) => 
            session.isBreak ? daySum : daySum + session.hours, 0), 0);
    
    // Group by course to see distribution
    const courseHours = {};
    schedule.forEach(day => {
        day.sessions.forEach(session => {
            if (session.isBreak) return; // Skip break sessions
            if (!courseHours[session.course]) {
                courseHours[session.course] = 0;
            }
            courseHours[session.course] += session.hours;
        });
    });
    
    // Create summary content
    summaryElement.innerHTML = `
        <h3>Weekly Study Plan Summary</h3>
        <div class="summary-stats">
            <div class="summary-stat">
                <span class="stat-value">${totalHours}</span>
                <span class="stat-label">Total Study Hours</span>
            </div>
            <div class="summary-stat">
                <span class="stat-value">${schedule.filter(day => day.sessions.some(s => !s.isBreak)).length}</span>
                <span class="stat-label">Study Days</span>
            </div>
            <div class="summary-stat">
                <span class="stat-value">${Object.keys(courseHours).length}</span>
                <span class="stat-label">Courses</span>
            </div>
        </div>
        <div class="schedule-tips">
            <h4>Study Tips</h4>
            <ul>
                <li>Break times are scheduled to prevent fatigue and improve retention</li>
                <li>Hard courses are placed at optimal times for peak focus</li>
                <li>Easy courses use spaced repetition for better long-term recall</li>
            </ul>
        </div>
        <div class="course-distribution">
            <h4>Study Hours Distribution</h4>
            <div class="distribution-chart">
                ${Object.entries(courseHours).map(([course, hours]) => `
                    <div class="chart-bar" style="--width: ${Math.round(hours/totalHours * 100)}%;">
                        <div class="bar-label">${course}</div>
                        <div class="bar-value">${hours}h</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add to DOM
    scheduleContainer.appendChild(summaryElement);
    
    // Add each day with staggered animation
    schedule.forEach((day, dayIndex) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'schedule-day';
        dayElement.style.opacity = '0';
        dayElement.style.transform = 'translateY(20px)';
        
        // Calculate actual study hours (excluding breaks)
        const studyHours = day.sessions.reduce((sum, session) => 
            session.isBreak ? sum : sum + session.hours, 0);
        
        // Add day header with day information
        dayElement.innerHTML = `
            <div class="day-header">
                <span class="day-name">${day.name}</span>
                <span class="day-hours">${studyHours} study hours</span>
            </div>
            ${day.sessions.length > 0 ? day.sessions.map((session, sessionIndex) => {
                // Handle break sessions
                if (session.isBreak) {
                    return `
                    <div class="break-session" data-day="${dayIndex}" data-session="${sessionIndex}">
                        <div class="session-header">
                            <p class="session-time">
                                <span class="time-range">${session.startTime} - ${session.endTime}</span>
                                <span class="break-badge">Break Time</span>
                            </p>
                        </div>
                        <div class="break-content">
                            <i class="fas fa-coffee break-icon"></i>
                            <p class="break-message">Take a break to recharge</p>
                            <p class="break-tip">Try: stretching, hydrating, or a short walk</p>
                        </div>
                    </div>
                    `;
                }
                
                // Regular study session
                const difficultyClass = `difficulty-${session.difficulty}`;
                
                return `
                <div class="study-session ${difficultyClass}" data-day="${dayIndex}" data-session="${sessionIndex}">
                    <div class="session-header">
                        <p class="session-time">
                            <span class="time-range">${session.startTime} - ${session.endTime}</span>
                            <span class="hours-badge">${session.hours} ${session.hours > 1 ? 'hours' : 'hour'}</span>
                        </p>
                        <p class="deadline-info">Due in ${session.daysUntilDeadline} days</p>
                    </div>
                    <h3 class="session-course">${session.course}</h3>
                    <p class="session-difficulty">${getDifficultyLabel(session.difficulty)}</p>
                    ${session.topics.length > 0 ? `
                        <div class="session-topics">
                            <p class="topics-heading">Focus areas:</p>
                            <div class="topic-tags">
                                ${session.topics.map(topic => `
                                    <span class="session-topic-tag">${topic}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="session-progress">
                        <div class="progress-bar difficulty-${session.difficulty}" style="--progress-width: ${Math.min(100, (1 - session.daysUntilDeadline / 14) * 100)}%"></div>
                    </div>
                </div>
                `;
            }).join('') : '<div class="study-session empty-day"><p>No sessions scheduled for this day.</p><p class="relax-message">Take some time to relax!</p></div>'}
        `;
        
        // Add to DOM
        scheduleContainer.appendChild(dayElement);
    });
    
    // Add styles for enhanced schedule
    addEnhancedScheduleStyles();
    
    // Animate elements with sequence
    setTimeout(() => {
        // First animate summary
        summaryElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        summaryElement.style.opacity = '1';
        summaryElement.style.transform = 'translateY(0)';
        
        // Then animate days one by one with staggered delay
        const dayElements = scheduleContainer.querySelectorAll('.schedule-day');
        dayElements.forEach((dayEl, dayIndex) => {
            setTimeout(() => {
                dayEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                dayEl.style.opacity = '1';
                dayEl.style.transform = 'translateY(0)';
                
                // Animate sessions within each day
                const sessions = dayEl.querySelectorAll('.study-session, .break-session');
                sessions.forEach((session, sessionIndex) => {
                    session.style.opacity = '0';
                    session.style.transform = 'translateX(-20px)';
                    
                    setTimeout(() => {
                        session.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        session.style.opacity = '1';
                        session.style.transform = 'translateX(0)';
                        
                        // Animate progress bars after sessions appear
                        const progressBar = session.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.width = '0';
                            setTimeout(() => {
                                progressBar.style.transition = 'width 1s ease-out';
                                progressBar.style.width = progressBar.style.getPropertyValue('--progress-width');
                            }, 300);
                        }
                    }, 100 * (sessionIndex + 1));
                });
            }, 250 * (dayIndex + 1));
        });
        
        // Animate chart bars in summary
        setTimeout(() => {
            const chartBars = summaryElement.querySelectorAll('.chart-bar');
            chartBars.forEach((bar, index) => {
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.transition = 'width 1s ease-out';
                    bar.style.width = bar.style.getPropertyValue('--width');
                }, 100 * index);
            });
        }, 800);
    }, 300);
}

// Add styles for enhanced schedule
function addEnhancedScheduleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .schedule-summary {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: var(--border-radius);
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: var(--shadow-md);
            border-left: 5px solid var(--primary-color);
        }
        
        .schedule-summary h3 {
            color: var(--secondary-color);
            margin-bottom: 20px;
            font-size: 1.4rem;
        }
        
        .schedule-summary h4 {
            color: var(--primary-color);
            margin: 15px 0;
            font-size: 1.1rem;
        }
        
        .summary-stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .summary-stat {
            text-align: center;
            padding: 15px;
            flex: 1;
            min-width: 100px;
        }
        
        .stat-value {
            display: block;
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
        }
        
        .schedule-tips {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px 20px;
            margin: 15px 0 25px;
            border-left: 4px solid var(--accent-color);
        }
        
        .schedule-tips h4 {
            color: var(--accent-color);
            margin-bottom: 10px;
            margin-top: 0;
        }
        
        .schedule-tips ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .schedule-tips li {
            margin-bottom: 8px;
            color: #555;
            font-size: 0.95rem;
        }
        
        .schedule-tips li:last-child {
            margin-bottom: 0;
        }
        
        .course-distribution {
            margin-top: 20px;
        }
        
        .distribution-chart {
            margin-top: 15px;
        }
        
        .chart-bar {
            height: 35px;
            margin-bottom: 10px;
            position: relative;
            width: 0%;
            background: linear-gradient(90deg, var(--primary-light), var(--primary-color));
            border-radius: 4px;
            color: white;
            display: flex;
            align-items: center;
            padding: 0 15px;
            justify-content: space-between;
            font-weight: 500;
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .chart-bar .bar-label {
            z-index: 2;
            max-width: 70%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .chart-bar .bar-value {
            z-index: 2;
            font-weight: 700;
        }
        
        /* Break session styling */
        .break-session {
            padding: 15px 20px;
            background-color: rgba(125, 211, 252, 0.1);
            border-left: 4px solid #0ea5e9;
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            box-shadow: var(--shadow-sm);
        }
        
        .break-badge {
            background-color: #0ea5e9;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            margin-left: 8px;
        }
        
        .break-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-top: 10px;
        }
        
        .break-icon {
            font-size: 1.8rem;
            color: #0ea5e9;
            margin-bottom: 10px;
        }
        
        .break-message {
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 5px;
        }
        
        .break-tip {
            font-size: 0.85rem;
            color: #666;
            margin: 0;
        }
        
        /* Session enhancements */
        .study-session {
            padding: 20px;
            border-left: 4px solid transparent;
            transition: all 0.3s ease;
        }
        
        /* Difficulty-based styling for study sessions */
        .study-session.difficulty-1 {
            border-left-color: #28a745; /* Green for easy */
            background-color: rgba(40, 167, 69, 0.05);
        }
        
        .study-session.difficulty-2 {
            border-left-color: #ffc107; /* Yellow for medium */
            background-color: rgba(255, 193, 7, 0.05);
        }
        
        .study-session.difficulty-3 {
            border-left-color: #dc3545; /* Red for hard */
            background-color: rgba(220, 53, 69, 0.05);
        }
        
        .session-difficulty {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
            margin-top: 5px;
            margin-bottom: 8px;
        }
        
        .study-session.difficulty-1 .session-difficulty {
            background-color: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }
        
        .study-session.difficulty-2 .session-difficulty {
            background-color: rgba(255, 193, 7, 0.1);
            color: #d39e00;
        }
        
        .study-session.difficulty-3 .session-difficulty {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
        }
        
        /* Progress bar colors by difficulty */
        .progress-bar.difficulty-1 {
            background: linear-gradient(90deg, #28a745, #5cb85c);
        }
        
        .progress-bar.difficulty-2 {
            background: linear-gradient(90deg, #ffc107, #ffdb58);
        }
        
        .progress-bar.difficulty-3 {
            background: linear-gradient(90deg, #dc3545, #f86384);
        }
        
        .session-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .time-range {
            font-weight: 500;
        }
        
        .hours-badge {
            background-color: var(--accent-color);
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            margin-left: 8px;
        }
        
        .deadline-info {
            font-size: 0.85rem;
            color: var(--danger-color);
            font-weight: 500;
        }
        
        .session-topics {
            margin-top: 12px;
        }
        
        .topics-heading {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 8px;
        }
        
        .topic-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .session-topic-tag {
            background-color: rgba(25, 160, 201, 0.1);
            color: var(--accent-color);
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.85rem;
            transition: all 0.3s;
        }
        
        .session-topic-tag:hover {
            background-color: var(--accent-color);
            color: white;
            transform: translateY(-2px);
        }
        
        .session-progress {
            height: 5px;
            background-color: #e9ecef;
            border-radius: 3px;
            margin-top: 15px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            border-radius: 3px;
            width: 0;
        }
        
        .empty-day {
            text-align: center;
            color: #888;
        }
        
        .relax-message {
            color: var(--success-color);
            font-weight: 500;
            margin-top: 5px;
        }
        
        /* Day header enhancements */
        .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eaeaea;
            background-color: var(--primary-color);
            border-radius: 8px;
            padding: 10px 15px;
            color: white;
        }
        
        .day-name {
            font-weight: 600;
            font-size: 1.1rem;
            color: white;
        }
        
        .day-hours {
            font-size: 0.9rem;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 3px 10px;
            border-radius: 20px;
            font-weight: 500;
            color: white;
        }
        
        @media (max-width: 768px) {
            .session-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .deadline-info {
                margin-top: 5px;
            }
            
            .summary-stat {
                padding: 10px;
            }
            
            .break-content {
                padding: 10px 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Helper Functions
function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

function getDifficultyLabel(difficulty) {
    switch (parseInt(difficulty)) {
        case 1: return 'Easy';
        case 2: return 'Medium';
        case 3: return 'Hard';
        default: return 'Unknown';
    }
}

function getRandomTime(min, max) {
    // Generate a random hour between min and max
    const hour = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Random minutes (0, 15, 30, 45)
    const minutesOptions = [0, 15, 30, 45];
    const minutes = minutesOptions[Math.floor(Math.random() * minutesOptions.length)];
    
    // Format time
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = hour < 12 ? 'AM' : 'PM';
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hourFormatted}:${minutesFormatted} ${amPm}`;
}

// Enhanced notification with animations
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on notification type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove after a delay
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles to head
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            display: flex;
            align-items: center;
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            max-width: 350px;
            z-index: 1000;
            opacity: 0;
            transform: translateX(30px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .notification i {
            margin-right: 12px;
            font-size: 1.2rem;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .notification.slide-out {
            transform: translateX(100px);
            opacity: 0;
        }
        
        .notification.success {
            background: linear-gradient(45deg, #28a745, #20c997);
            border-left: 5px solid #1e7e34;
        }
        
        .notification.error {
            background: linear-gradient(45deg, #dc3545, #f86384);
            border-left: 5px solid #bd2130;
        }
        
        .notification.warning {
            background: linear-gradient(45deg, #ffc107, #ffcd39);
            color: #333;
            border-left: 5px solid #d39e00;
        }
        
        .notification.info {
            background: linear-gradient(45deg, var(--accent-color), #63c5da);
            border-left: 5px solid var(--secondary-color);
        }
    `;
    document.head.appendChild(style);
})(); 