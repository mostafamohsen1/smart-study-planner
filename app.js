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
let schedule = JSON.parse(localStorage.getItem('savedSchedule')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
let googleCalendarAuthorized = localStorage.getItem('googleCalendarAuthorized') === 'true';
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let userNotificationSettings = JSON.parse(localStorage.getItem('notificationSettings')) || {
    reminderTimes: [24, 2], // Default reminder times in hours before deadline
    browserNotifications: true,
    emailNotifications: false,
    emailAddress: ''
};

// Google API Client ID - Replace with your actual client ID from Google Developer Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// Animation Constants with professional timing
const ANIMATION = {
    duration: {
        short: 200,
        medium: 400,
        long: 800
    },
    easing: {
        smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0.0, 1, 1)',
        out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        bouncy: 'cubic-bezier(0.2, 0.85, 0.4, 1.275)'
    }
};

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
    
    // Set minimum date for deadline input to 2 days from today
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    const minDate = twoDaysFromNow.toISOString().split('T')[0];
    document.getElementById('deadline').min = minDate;
    
    // Initialize accessibility enhancements
    initAccessibilityFeatures();
    
    // Initialize Google API and Notification System
    initGoogleApi();
    initNotificationSystem();
    
    // Add advanced features UI
    addAdvancedFeaturesUI();
});

// Initialize all animations with performance optimization
function initializeAnimations() {
    // Render courses after a slight delay for smoother page load
    requestAnimationFrame(() => {
        setTimeout(() => {
            renderCourses();
            // Add subtle background animation
            addOptimizedBackground();
            // Add floating effects for important elements
            addSubtleFloatingEffect();
            // Add ripple effect to buttons with performance optimization
            addOptimizedRippleEffect();
        }, 100);
    });
    
    // Add event listeners with passive option for better performance
    document.addEventListener('scroll', throttle(handleScrollAnimations, 100), { passive: true });
    window.addEventListener('resize', throttle(handleResizeAnimations, 200), { passive: true });
}

// Throttle function for performance optimization
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func(...args);
        }
    };
}

// Handle scroll-based animations
function handleScrollAnimations() {
    // Performance optimized scroll-based animations
    const visibleElements = document.querySelectorAll('.course-card:not(.animated-in)');
    
    visibleElements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('animated-in');
            // Use Web Animation API for better performance
            element.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: ANIMATION.duration.medium,
                easing: ANIMATION.easing.out,
                fill: 'forwards'
            });
        }
    });
}

// Check if element is in viewport for scroll animations
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Handle resize-based layout adjustments with animation
function handleResizeAnimations() {
    // Adjust animations based on screen size
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Apply different animation settings based on device
    document.documentElement.style.setProperty(
        '--animation-scale', 
        isMobile ? '0.7' : (isTablet ? '0.85' : '1')
    );
}

// Add subtle animations to interactive elements
function highlightInteractiveElements() {
    const interactiveElements = document.querySelectorAll('button, .btn, input, select');
    
    interactiveElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.animate([
                { boxShadow: 'none' },
                { boxShadow: '0 0 0 3px rgba(var(--accent-color-rgb), 0.2)' }
            ], {
                duration: ANIMATION.duration.short,
                easing: ANIMATION.easing.out,
                fill: 'forwards'
            });
        });
        
        element.addEventListener('blur', () => {
            element.animate([
                { boxShadow: '0 0 0 3px rgba(var(--accent-color-rgb), 0.2)' },
                { boxShadow: 'none' }
            ], {
                duration: ANIMATION.duration.short,
                easing: ANIMATION.easing.out,
                fill: 'forwards'
            });
        });
    });
}

// Add optimized background with reduced DOM elements
function addOptimizedBackground() {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    // Create canvas for better performance
    const bgCanvas = document.createElement('canvas');
    bgCanvas.className = 'background-canvas';
    bgCanvas.width = mainElement.offsetWidth;
    bgCanvas.height = mainElement.offsetHeight;
    
    // Add canvas styles
    bgCanvas.style.position = 'absolute';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    bgCanvas.style.width = '100%';
    bgCanvas.style.height = '100%';
    bgCanvas.style.zIndex = '-1';
    bgCanvas.style.opacity = '0.3';
    bgCanvas.style.pointerEvents = 'none';
    
    // Prepare the canvas
    const ctx = bgCanvas.getContext('2d');
    
    // Generate dots with canvas for better performance
    const dots = [];
    for (let i = 0; i < 12; i++) {
        dots.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 4 + 2,
            xSpeed: Math.random() * 0.3 - 0.15,
            ySpeed: Math.random() * 0.3 - 0.15,
            color: `rgba(var(--primary-color-rgb), ${Math.random() * 0.1 + 0.05})`
        });
    }
    
    // Draw dots function
    function drawDots() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = dot.color;
            ctx.fill();
            
            // Move dots
            dot.x += dot.xSpeed;
            dot.y += dot.ySpeed;
            
            // Bounce off edges
            if (dot.x < 0 || dot.x > bgCanvas.width) dot.xSpeed *= -1;
            if (dot.y < 0 || dot.y > bgCanvas.height) dot.ySpeed *= -1;
        });
        
        // Only animate if page is visible for performance
        if (document.visibilityState === 'visible') {
            requestAnimationFrame(drawDots);
        }
    }
    
    // Add canvas to the main element
    mainElement.style.position = 'relative';
    mainElement.insertBefore(bgCanvas, mainElement.firstChild);
    
    // Start animation
    drawDots();
    
    // Handle visibility change for performance
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            drawDots();
        }
    });
    
    // Handle resize
    window.addEventListener('resize', throttle(() => {
        bgCanvas.width = mainElement.offsetWidth;
        bgCanvas.height = mainElement.offsetHeight;
    }, 200), { passive: true });
}

// Add subtle floating animation to important elements
function addSubtleFloatingEffect() {
    // Only animate if the user doesn't prefer reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const floatableElements = document.querySelectorAll('.form-container, .course-list, .schedule-container');
        
        floatableElements.forEach((element, index) => {
            // Use Web Animation API for better performance
            const floatAnimation = [
                { transform: 'translateY(0px)' },
                { transform: 'translateY(-5px)' },
                { transform: 'translateY(0px)' }
            ];
            
            // Animate with proper timing and offset
            const animation = element.animate(floatAnimation, {
                duration: 6000,
                iterations: Infinity,
                easing: 'ease-in-out',
                delay: index * 500
            });
            
            // Performance optimization - reduce animation work when not visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animation.play();
                    } else {
                        animation.pause();
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(element);
        });
    }
}

// Add optimized ripple effect to buttons with better visual quality
function addOptimizedRippleEffect() {
    const buttons = document.querySelectorAll('.btn, button');
    
    buttons.forEach(button => {
        button.addEventListener('pointerdown', function(e) {
            // Prevent ripple on disabled buttons
            if (this.disabled) return;
            
            // Remove any existing ripples
            const existingRipple = this.querySelector('.ripple-effect');
            if (existingRipple) {
                existingRipple.remove();
            }
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            
            // Calculate precise positioning for natural ripple origin
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            
            // Add ripple to button
            this.appendChild(ripple);
            
            // Use Web Animation API instead of CSS transitions for better control
            ripple.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.6 },
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
            ], {
                duration: 700,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            }).onfinish = () => {
                ripple.remove();
            };
        });
    });
}

// Show success feedback with optimized confetti animation
function showSuccessFeedback() {
    // Only show if not reduced motion mode
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const confettiCount = window.innerWidth < 768 ? 50 : 100;
    const container = document.body;
    const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
        '#ffffff'
    ];
    
    // Create confetti with canvas for better performance
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const confetti = [];
    
    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: -20,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 2 * Math.PI,
            rotation: Math.random() * 0.2 - 0.1,
            rotationAngle: Math.random() * Math.PI,
            opacity: 1
        });
    }
    
    let animationFrame;
    let startTime = null;
    const duration = 3000; // 3 seconds animation
    
    function animateConfetti(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let allOutside = true;
        
        for (let i = 0; i < confetti.length; i++) {
            const c = confetti[i];
            
            // Update position with gravity
            c.y += c.speed;
            c.x += Math.sin(c.angle) * 2;
            c.rotationAngle += c.rotation;
            c.opacity = 1 - (progress / duration);
            
            // Draw confetti
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotationAngle);
            ctx.globalAlpha = c.opacity;
            ctx.fillStyle = c.color;
            
            // Draw either rectangle or circle
            if (i % 2 === 0) {
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
            // Check if confetti is still on screen
            if (c.y < canvas.height) {
                allOutside = false;
            }
        }
        
        // Continue animation if confetti is still visible and animation time < duration
        if (!allOutside && progress < duration) {
            animationFrame = requestAnimationFrame(animateConfetti);
        } else {
            canvas.remove();
        }
    }
    
    // Start animation
    animationFrame = requestAnimationFrame(animateConfetti);
    
    // Cleanup if needed
    return () => {
        cancelAnimationFrame(animationFrame);
        if (canvas.parentNode) {
            canvas.remove();
        }
    };
}

// Refine notification animation with better visual feedback
function showNotification(message, type = 'info') {
    // Get or create notification container
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create icon based on notification type
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const icon = iconMap[type] || 'info-circle';
    
    // Create notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Use Web Animation API for better control and performance
    const animation = notification.animate([
        { opacity: 0, transform: 'translateX(30px)' },
        { opacity: 1, transform: 'translateX(0)' }
    ], {
        duration: ANIMATION.duration.medium,
        easing: ANIMATION.easing.out,
        fill: 'forwards'
    });
    
    // Set up dismissal
    const dismissTime = type === 'error' ? 8000 : 4000;
    let dismissTimeout;
    
    function startDismissCountdown() {
        dismissTimeout = setTimeout(() => {
            dismissNotification();
        }, dismissTime);
    }
    
    function dismissNotification() {
        notification.animate([
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(30px)' }
        ], {
            duration: ANIMATION.duration.medium,
            easing: ANIMATION.easing.out,
            fill: 'forwards'
        }).onfinish = () => {
            notification.remove();
        };
    }
    
    // Pause dismissal countdown on hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(dismissTimeout);
    });
    
    // Resume dismissal countdown on mouse leave
    notification.addEventListener('mouseleave', () => {
        startDismissCountdown();
    });
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        dismissNotification();
    });
    
    // Start dismissal countdown
    startDismissCountdown();
    
    // Add ARIA attributes for screen readers
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
}

// Modify addCourse to use the new showSuccessFeedback
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
    const topicsInput = document.getElementById('topics');
    let isValid = true;
    
    // Get form values
    const courseName = courseNameInput.value.trim();
    const deadline = deadlineInput.value;
    const difficulty = document.getElementById('difficulty').value;
    const topicsStr = topicsInput.value.trim();
    const hoursAvailable = hoursInput.value;
    
    // Validate form inputs with enhanced visual feedback
    if (!courseName) {
        highlightInvalidField(courseNameInput, 'Course name is required');
        isValid = false;
    } else if (courseName.length < 3) {
        highlightInvalidField(courseNameInput, 'Course name must be at least 3 characters');
        isValid = false;
    } else {
        resetFieldValidation(courseNameInput);
    }
    
    if (!deadline) {
        highlightInvalidField(deadlineInput, 'Deadline is required');
        isValid = false;
    } else {
        // Validate that deadline is at least 2 days in the future
        const deadlineDate = new Date(deadline);
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        
        if (deadlineDate < twoDaysFromNow) {
            highlightInvalidField(deadlineInput, 'Deadline must be at least 2 days in the future');
            isValid = false;
        } else {
            resetFieldValidation(deadlineInput);
        }
    }
    
    if (!hoursAvailable) {
        highlightInvalidField(hoursInput, 'Study hours are required');
        isValid = false;
    } else if (parseInt(hoursAvailable) <= 0) {
        highlightInvalidField(hoursInput, 'Hours must be greater than 0');
        isValid = false;
    } else if (parseInt(hoursAvailable) > 100) {
        highlightInvalidField(hoursInput, 'Hours cannot exceed 100');
        isValid = false;
    } else {
        resetFieldValidation(hoursInput);
    }
    
    // Validate topics - must have at least one valid topic
    const topics = topicsStr.split(',')
        .map(topic => topic.trim())
        .filter(topic => topic !== '');
    
    if (topics.length === 0) {
        highlightInvalidField(topicsInput, 'At least one topic is required');
        isValid = false;
    } else {
        resetFieldValidation(topicsInput);
    }
    
    // If validation fails, restore button and return
    if (!isValid) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
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
        
        // Add professional success feedback
        showSuccessFeedback();
        
        // Automatically generate a new schedule with the added course
        if (courses.length > 0) {
            generateScheduleWithAnimation();
        }
        
        // Add confetti effect for successful submission
        if (isValid) {
            showConfetti();
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
        
        // Set minimum date for deadline input to 2 days from today
        const today = new Date();
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);
        const minDate = twoDaysFromNow.toISOString().split('T')[0];
        document.getElementById('deadline').min = minDate;
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
        // Add difficulty as a data attribute for CSS styling
        courseElement.dataset.difficulty = course.difficulty;
        
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
    
    // Add ARIA attributes for screen readers
    coursesContainer.setAttribute('role', 'list');
    coursesContainer.setAttribute('aria-label', 'Your courses');
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
    
    // Change button text and styling
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Course';
    submitBtn.classList.add('update-mode');
    
    // Add edit mode banner to form container
    const formContainer = document.querySelector('.form-container');
    let editBanner = formContainer.querySelector('.edit-mode-banner');
    
    if (!editBanner) {
        editBanner = document.createElement('div');
        editBanner.className = 'edit-mode-banner';
        editBanner.innerHTML = `
            <i class="fas fa-pencil-alt"></i>
            <span>You are currently editing a course: <strong>${course.name}</strong></span>
            <button class="cancel-edit-btn"><i class="fas fa-times"></i> Cancel</button>
        `;
        formContainer.insertBefore(editBanner, formContainer.firstChild);
        
        // Add cancel button event listener
        const cancelBtn = editBanner.querySelector('.cancel-edit-btn');
        cancelBtn.addEventListener('click', cancelEdit);
    } else {
        // Update course name in existing banner
        const courseName = editBanner.querySelector('strong');
        courseName.textContent = course.name;
    }
    
    // Scroll to form
    formContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Highlight form
    formContainer.classList.add('highlight-form');
    formContainer.classList.add('edit-mode');
    
    // Set form mode to edit
    courseForm.dataset.mode = 'edit';
    courseForm.dataset.editId = id;
    
    // Change form submission handler
    courseForm.removeEventListener('submit', addCourse);
    courseForm.addEventListener('submit', updateCourse);
    
    // Show notification
    showNotification('Editing course: ' + course.name, 'info');
    
    // Add pulse animation to highlight the course being edited
    const courseElement = document.querySelector(`[data-id="${id}"]`);
    if (courseElement) {
        courseElement.animate([
            { boxShadow: 'var(--shadow-sm)', transform: 'scale(1)' },
            { boxShadow: '0 0 0 4px rgba(var(--accent-color-rgb), 0.4), var(--shadow-md)', transform: 'scale(1.02)' },
            { boxShadow: 'var(--shadow-sm)', transform: 'scale(1)' }
        ], {
            duration: 800,
            easing: 'ease-in-out'
        });
        
        // Add an "editing" indicator to the course card
        if (!courseElement.querySelector('.editing-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'editing-indicator';
            indicator.innerHTML = '<i class="fas fa-pencil-alt"></i> Editing';
            courseElement.appendChild(indicator);
        }
    }
    
    // Highlight each field as it's filled
    setTimeout(() => {
        const inputs = formContainer.querySelectorAll('input, select');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.animate([
                    { backgroundColor: 'rgba(var(--accent-color-rgb), 0.1)' },
                    { backgroundColor: 'white' }
                ], {
                    duration: 600,
                    easing: 'ease-out'
                });
            }, index * 100);
        });
    }, 300);
}

// Cancel edit mode function
function cancelEdit() {
    // Reset form
    courseForm.reset();
    
    // Change button text back to Add Course
    const submitBtn = courseForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Course';
    submitBtn.classList.remove('update-mode');
    
    // Remove edit banner
    const editBanner = document.querySelector('.edit-mode-banner');
    if (editBanner) {
        editBanner.classList.add('closing');
        setTimeout(() => {
            editBanner.remove();
        }, 300);
    }
    
    // Reset form mode
    courseForm.dataset.mode = 'add';
    delete courseForm.dataset.editId;
    
    // Remove highlight and edit mode class
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.remove('highlight-form');
    formContainer.classList.remove('edit-mode');
    
    // Reset event listeners
    courseForm.removeEventListener('submit', updateCourse);
    courseForm.addEventListener('submit', addCourse);
    
    // Remove editing indicator from any course card
    const indicator = document.querySelector('.editing-indicator');
    if (indicator) {
        indicator.parentElement.classList.add('edit-complete');
        setTimeout(() => {
            indicator.remove();
            document.querySelector('.edit-complete')?.classList.remove('edit-complete');
        }, 300);
    }
    
    // Set minimum date for deadline input
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    const minDate = twoDaysFromNow.toISOString().split('T')[0];
    document.getElementById('deadline').min = minDate;
    
    // Show notification
    showNotification('Edit mode cancelled', 'info');
}

// Update updateCourse function to also handle clean up
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
        submitBtn.classList.remove('update-mode');
        
        // Remove edit banner
        const editBanner = document.querySelector('.edit-mode-banner');
        if (editBanner) {
            editBanner.classList.add('closing');
            setTimeout(() => {
                editBanner.remove();
            }, 300);
        }
        
        // Reset form mode
        courseForm.dataset.mode = 'add';
        delete courseForm.dataset.editId;
        
        // Remove highlight and edit mode class
        document.querySelector('.form-container').classList.remove('highlight-form');
        document.querySelector('.form-container').classList.remove('edit-mode');
        
        // Reset event listeners
        courseForm.removeEventListener('submit', updateCourse);
        courseForm.addEventListener('submit', addCourse);
        
        // Remove editing indicator from course card
        const indicator = document.querySelector('.editing-indicator');
        if (indicator) {
            indicator.parentElement.classList.add('edit-complete');
            setTimeout(() => {
                indicator.remove();
                document.querySelector('.edit-complete')?.classList.remove('edit-complete');
            }, 300);
        }
        
        // Render courses
        renderCourses();
        
        // Regenerate schedule
        if (courses.length > 0) {
            generateScheduleWithAnimation();
        }
        
        // Show success notification
        showNotification('Course updated successfully!', 'success');
        
        // Set minimum date for deadline input
        const today = new Date();
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);
        const minDate = twoDaysFromNow.toISOString().split('T')[0];
        document.getElementById('deadline').min = minDate;
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
        // First shake animation
        courseElement.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 300,
            easing: 'ease-in-out'
        }).onfinish = () => {
            // Then fade out and slide
            courseElement.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
            courseElement.style.opacity = '0';
            courseElement.style.transform = 'translateY(20px) scale(0.8)';
            courseElement.style.transformOrigin = 'center bottom';
        };
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
    
    // Add export/save controls
    const scheduleControls = document.createElement('div');
    scheduleControls.className = 'schedule-controls';
    scheduleControls.innerHTML = `
        <div class="schedule-title-container">
            <h2 class="schedule-title">Your Personalized Study Schedule</h2>
            <span class="schedule-save-date">${schedule.lastSaved ? 'Last saved: ' + new Date(schedule.lastSaved).toLocaleString() : 'Not saved yet'}</span>
        </div>
        <div class="schedule-actions">
            <button id="save-schedule-btn" class="action-button save-btn">
                <i class="fas fa-save"></i> Save Schedule
            </button>
            <div class="export-dropdown">
                <button id="export-schedule-btn" class="action-button export-btn">
                    <i class="fas fa-file-export"></i> Export <i class="fas fa-chevron-down"></i>
                </button>
                <div class="export-options">
                    <button id="export-pdf-btn" class="export-option">
                        <i class="fas fa-file-pdf"></i> Export as PDF
                    </button>
                    <button id="export-image-btn" class="export-option">
                        <i class="fas fa-file-image"></i> Export as Image
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insert controls before the schedule table
    scheduleContainer.insertBefore(scheduleControls, scheduleContainer.firstChild);
    
    // Add event listeners for the buttons
    document.getElementById('save-schedule-btn').addEventListener('click', saveScheduleLocally);
    document.getElementById('export-schedule-btn').addEventListener('click', toggleExportOptions);
    document.getElementById('export-pdf-btn').addEventListener('click', exportScheduleAsPDF);
    document.getElementById('export-image-btn').addEventListener('click', exportScheduleAsImage);
    
    // Check if we have a previously saved schedule
    if (schedule.length > 0 && schedule.lastSaved) {
        showNotification('Loaded your previously saved schedule', 'info');
    }
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
    
    // Add styles for export/save controls
    const styleElement = document.createElement('style');
    styleElement.textContent += `
        .schedule-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f5f7fa, #e4e8f0);
            border-radius: 10px;
            box-shadow: var(--shadow-sm);
        }
        
        .schedule-title-container {
            display: flex;
            flex-direction: column;
        }
        
        .schedule-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-color);
        }
        
        .schedule-save-date {
            font-size: 0.85rem;
            color: #666;
            margin-top: 5px;
        }
        
        .schedule-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            box-shadow: var(--shadow-sm);
        }
        
        .save-btn {
            background-color: var(--success-color);
            color: white;
        }
        
        .save-btn:hover {
            background-color: #2a8f4a;
        }
        
        .save-btn.save-success {
            background-color: #2a8f4a;
        }
        
        .export-btn {
            background-color: var(--accent-color);
            color: white;
        }
        
        .export-btn:hover {
            background-color: #3b6c94;
        }
        
        .export-dropdown {
            position: relative;
        }
        
        .export-options {
            position: absolute;
            top: 100%;
            right: 0;
            width: 180px;
            background-color: white;
            border-radius: 6px;
            box-shadow: var(--shadow-md);
            padding: 8px;
            margin-top: 5px;
            z-index: 100;
            display: none;
            flex-direction: column;
            gap: 5px;
        }
        
        .export-options.show {
            display: flex;
        }
        
        .export-option {
            padding: 8px 12px;
            text-align: left;
            background: none;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-color);
            transition: background-color 0.2s;
        }
        
        .export-option:hover {
            background-color: #f5f7fa;
        }
        
        .export-option i {
            color: var(--accent-color);
        }
        
        /* PDF specific styles */
        .pdf-container {
            position: absolute;
            left: -9999px;
            background: white;
            padding: 20px;
            width: 1020px; /* Approximate A4 landscape width */
        }
        
        @media (max-width: 768px) {
            .schedule-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            
            .schedule-actions {
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
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

// Add user interaction detector
document.addEventListener('click', function() {
    document.documentElement.classList.add('user-interacted');
});

// Optimize the showConfetti function for better performance
function showConfetti() {
    // Detect if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // Skip animation for users who prefer reduced motion
    }
    
    // Scale confetti count based on device capability
    const isMobile = window.innerWidth < 768;
    const confettiCount = isMobile ? 50 : 100;
    const container = document.querySelector('body');
    
    // Use CSS variables for consistent colors
    const confettiColors = [
        getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
        '#ffffff'
    ];
    
    // Create canvas for better performance
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const confetti = [];
    
    // Generate confetti particles
    for (let i = 0; i < confettiCount; i++) {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const size = isMobile ? Math.random() * 6 + 3 : Math.random() * 8 + 4;
        
        confetti.push({
            x: Math.random() * canvas.width,
            y: -30,
            size: size,
            color: color,
            speed: Math.random() * 2 + 1,
            angle: Math.random() * Math.PI / 4 - Math.PI / 8,
            rotation: Math.random() * 0.2 - 0.1,
            rotationAngle: Math.random() * Math.PI,
            opacity: 1
        });
    }
    
    // Animation variables
    let animationFrame;
    let startTime = null;
    const duration = 3500; // Animation duration in ms
    
    // Animation function
    function animateConfetti(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let stillAnimating = false;
        
        // Update and draw each confetti
        for (let i = 0; i < confetti.length; i++) {
            const c = confetti[i];
            
            // Calculate fade out based on progress
            c.opacity = Math.max(0, 1 - (progress / duration));
            
            // Update position with gravity and wind effect
            c.y += c.speed + Math.sin(progress / 200) * 0.2;
            c.x += Math.sin(c.angle) + Math.sin(progress / 400) * 0.5;
            c.rotationAngle += c.rotation;
            
            // Skip drawing if outside viewport or fully transparent
            if (c.y > canvas.height || c.opacity <= 0) continue;
            
            stillAnimating = true;
            
            // Draw confetti
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotationAngle);
            ctx.globalAlpha = c.opacity;
            
            // Alternate between rectangles, circles and custom shapes
            if (i % 3 === 0) {
                // Rectangle
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            } else if (i % 3 === 1) {
                // Circle
                ctx.beginPath();
                ctx.fillStyle = c.color;
                ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Custom shape (triangle)
                ctx.beginPath();
                ctx.fillStyle = c.color;
                ctx.moveTo(0, -c.size / 2);
                ctx.lineTo(c.size / 2, c.size / 2);
                ctx.lineTo(-c.size / 2, c.size / 2);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // Continue animation if particles are still visible and within duration
        if (stillAnimating && progress < duration) {
            animationFrame = requestAnimationFrame(animateConfetti);
        } else {
            // Clean up when done
            canvas.remove();
        }
    }
    
    // Start animation
    animationFrame = requestAnimationFrame(animateConfetti);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else if (startTime && Date.now() - startTime < duration) {
            animationFrame = requestAnimationFrame(animateConfetti);
        }
    });
    
    // Clean up on window resize
    window.addEventListener('resize', function() {
        cancelAnimationFrame(animationFrame);
        if (canvas.parentNode) {
            canvas.remove();
        }
    }, { once: true });
}

// Add form input animations
function addFormInputAnimations() {
    // Add animation for form inputs
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        // Remove focus effect
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
    
    // Add styles for edit mode
    const style = document.createElement('style');
    style.textContent = `
        .edit-mode-banner {
            background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1), rgba(var(--accent-color-rgb), 0.2));
            border-left: 4px solid var(--accent-color);
            padding: 12px 15px;
            margin-bottom: 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow-sm);
            animation: slideDown 0.3s ease-out forwards;
            overflow: hidden;
        }
        
        .edit-mode-banner.closing {
            animation: slideUp 0.3s ease-out forwards;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); max-height: 0; }
            to { opacity: 1; transform: translateY(0); max-height: 100px; }
        }
        
        @keyframes slideUp {
            from { opacity: 1; transform: translateY(0); max-height: 100px; }
            to { opacity: 0; transform: translateY(-20px); max-height: 0; }
        }
        
        .edit-mode-banner i {
            color: var(--accent-color);
            font-size: 1.2rem;
            margin-right: 10px;
        }
        
        .edit-mode-banner span {
            flex: 1;
            color: #555;
        }
        
        .edit-mode-banner strong {
            color: var(--accent-color);
            font-weight: 600;
        }
        
        .cancel-edit-btn {
            background-color: transparent;
            border: 1px solid #ccc;
            color: #666;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        
        .cancel-edit-btn:hover {
            background-color: #f8f8f8;
            border-color: #999;
        }
        
        button.update-mode {
            background-color: var(--accent-color);
            border-color: var(--accent-color);
        }
        
        .form-container.edit-mode {
            border-left: 4px solid var(--accent-color);
            box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1), var(--shadow-md);
        }
        
        .editing-indicator {
            position: absolute;
            top: -10px;
            right: -10px;
            background-color: var(--accent-color);
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            box-shadow: var(--shadow-sm);
            animation: pulse 2s infinite;
            z-index: 5;
        }
        
        .editing-indicator i {
            margin-right: 3px;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .edit-complete {
            transition: all 0.3s;
            border-color: var(--success-color);
            background-color: rgba(var(--success-color-rgb), 0.05);
        }
    `;
    document.head.appendChild(style);
}

// Save schedule locally
function saveScheduleLocally() {
    // Add timestamp to the schedule
    schedule.lastSaved = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('savedSchedule', JSON.stringify(schedule));
    
    // Update the displayed save date
    const saveDateElement = document.querySelector('.schedule-save-date');
    if (saveDateElement) {
        saveDateElement.textContent = 'Last saved: ' + new Date(schedule.lastSaved).toLocaleString();
    }
    
    // Show success animation on the save button
    const saveBtn = document.getElementById('save-schedule-btn');
    const originalContent = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.classList.add('save-success');
    
    setTimeout(() => {
        saveBtn.innerHTML = originalContent;
        saveBtn.classList.remove('save-success');
    }, 2000);
    
    // Show notification
    showNotification('Schedule saved successfully!', 'success');
}

// Toggle export options dropdown
function toggleExportOptions(e) {
    const exportOptions = document.querySelector('.export-options');
    exportOptions.classList.toggle('show');
    
    // Update ARIA expanded state
    const button = document.getElementById('export-schedule-btn');
    const isExpanded = exportOptions.classList.contains('show');
    button.setAttribute('aria-expanded', isExpanded.toString());
    
    // If opening, focus first option and setup keyboard trap
    if (isExpanded) {
        const firstOption = exportOptions.querySelector('button');
        if (firstOption) {
            setTimeout(() => {
                firstOption.focus();
            }, 100);
            trapFocus(exportOptions);
        }
    }
    
    // Close dropdown when clicking outside
    if (exportOptions.classList.contains('show')) {
        document.addEventListener('click', function closeDropdown(event) {
            if (!event.target.closest('.export-dropdown')) {
                exportOptions.classList.remove('show');
                button.setAttribute('aria-expanded', 'false');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
}

// Export schedule as PDF
function exportScheduleAsPDF() {
    // Show loading animation
    const exportBtn = document.getElementById('export-pdf-btn');
    const originalContent = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Generating PDF...';
    
    // Hide export options
    document.querySelector('.export-options').classList.remove('show');
    
    // Use html2pdf library to export the schedule
    setTimeout(() => {
        // Check if html2pdf is loaded, if not, load it
        if (typeof html2pdf === 'undefined') {
            // Create script element to load html2pdf
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = function() {
                generatePDF();
            };
            document.head.appendChild(script);
        } else {
            generatePDF();
        }
        
        function generatePDF() {
            // Clone the schedule element to avoid modifying the original
            const scheduleClone = scheduleContainer.cloneNode(true);
            
            // Remove the controls from the clone
            const controls = scheduleClone.querySelector('.schedule-controls');
            if (controls) {
                controls.remove();
            }
            
            // Create a container with styles for the PDF
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-container';
            pdfContainer.appendChild(scheduleClone);
            document.body.appendChild(pdfContainer);
            
            // Set options for html2pdf
            const opt = {
                margin: [10, 10],
                filename: 'study-schedule.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };
            
            // Generate PDF
            html2pdf().set(opt).from(pdfContainer).save().then(() => {
                // Clean up
                document.body.removeChild(pdfContainer);
                exportBtn.innerHTML = originalContent;
                showNotification('Schedule exported as PDF', 'success');
            });
        }
    }, 500);
}

// Export schedule as image
function exportScheduleAsImage() {
    // Show loading animation
    const exportBtn = document.getElementById('export-image-btn');
    const originalContent = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Generating Image...';
    
    // Hide export options
    document.querySelector('.export-options').classList.remove('show');
    
    // Use html2canvas library to export the schedule
    setTimeout(() => {
        // Check if html2canvas is loaded, if not, load it
        if (typeof html2canvas === 'undefined') {
            // Create script element to load html2canvas
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = function() {
                generateImage();
            };
            document.head.appendChild(script);
        } else {
            generateImage();
        }
        
        function generateImage() {
            // Clone the schedule element to avoid modifying the original
            const scheduleClone = scheduleContainer.cloneNode(true);
            
            // Remove the controls from the clone
            const controls = scheduleClone.querySelector('.schedule-controls');
            if (controls) {
                controls.remove();
            }
            
            // Create a container with styles for the image
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            imageContainer.appendChild(scheduleClone);
            document.body.appendChild(imageContainer);
            
            // Generate image
            html2canvas(imageContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                // Create download link
                const link = document.createElement('a');
                link.download = 'study-schedule.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Clean up
                document.body.removeChild(imageContainer);
                exportBtn.innerHTML = originalContent;
                showNotification('Schedule exported as image', 'success');
            });
        }
    }, 500);
}

// Add this function to implement accessibility features
function initAccessibilityFeatures() {
    // Add skip-to-content link for keyboard users
    addSkipToContentLink();
    
    // Enhance focus styles
    addEnhancedFocusStyles();
    
    // Make all interactive elements keyboard accessible
    enhanceKeyboardNavigation();
    
    // Add ARIA attributes to improve screen reader experience
    addAriaAttributes();
    
    // Monitor for dynamic content changes and update ARIA attributes
    setupAccessibilityObserver();
    
    // Add keyboard shortcut help
    addKeyboardShortcutHelp();
    
    // Log accessibility initialization for debugging
    console.log('Accessibility features initialized');
}

// Add skip to main content link for keyboard users
function addSkipToContentLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id to the appropriate container
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
    }
    
    // Add skip link styles
    const style = document.createElement('style');
    style.textContent = `
        .skip-to-content {
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--accent-color);
            color: white;
            padding: 8px 15px;
            z-index: 100;
            transition: top 0.3s;
            border-radius: 0 0 4px 0;
            text-decoration: none;
            box-shadow: var(--shadow-md);
            font-weight: 500;
        }
        
        .skip-to-content:focus {
            top: 0;
            outline: 2px solid white;
            outline-offset: 2px;
        }
        
        #main-content:focus {
            outline: none;
        }
    `;
    document.head.appendChild(style);
}

// Enhance focus styles for better visibility
function addEnhancedFocusStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced focus styles for better visibility */
        :focus {
            outline: 2px solid var(--accent-color);
            outline-offset: 2px;
        }
        
        /* Custom focus styles for specific element types */
        button:focus, 
        a:focus, 
        select:focus, 
        input:focus, 
        textarea:focus {
            outline: 2px solid var(--accent-color);
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(var(--accent-color-rgb), 0.2);
        }
        
        /* High contrast focus indicator for keyboard users */
        .keyboard-focus:focus {
            outline: 3px solid var(--accent-color);
            outline-offset: 3px;
            box-shadow: 0 0 0 6px rgba(var(--accent-color-rgb), 0.3);
        }
        
        /* Don't show focus when using mouse */
        .using-mouse :focus {
            outline: none;
            box-shadow: none;
        }
    `;
    document.head.appendChild(style);
    
    // Detect keyboard vs mouse usage to show focus styles only for keyboard users
    document.body.classList.add('using-mouse');
    
    window.addEventListener('keydown', function(e) {
        // Check if Tab or arrow keys are pressed
        if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
            document.body.classList.remove('using-mouse');
            document.body.classList.add('using-keyboard');
        }
    });
    
    window.addEventListener('mousedown', function() {
        document.body.classList.remove('using-keyboard');
        document.body.classList.add('using-mouse');
    });
}

// Make all interactive elements keyboard navigable
function enhanceKeyboardNavigation() {
    // Ensure all interactive elements have tabindex if needed
    const interactiveElements = document.querySelectorAll('.card, .course-card, .topic-tag');
    
    interactiveElements.forEach(element => {
        // Only add tabindex if element is not naturally focusable
        if (!['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
            element.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listeners for activation with Enter/Space
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
    
    // Add keyboard support for custom dropdowns
    const dropdowns = document.querySelectorAll('.export-dropdown');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.export-options');
        
        if (button && menu) {
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            
            // Toggle menu with keyboard
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    toggleDropdownMenu(dropdown, true);
                }
            });
            
            // Handle keyboard navigation within menu
            const options = menu.querySelectorAll('button');
            
            options.forEach((option, index) => {
                option.addEventListener('keydown', function(e) {
                    let targetOption;
                    
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        targetOption = options[index + 1] || options[0];
                        targetOption.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        targetOption = options[index - 1] || options[options.length - 1];
                        targetOption.focus();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        toggleDropdownMenu(dropdown, false);
                        button.focus();
                    } else if (e.key === 'Tab' && !e.shiftKey && index === options.length - 1) {
                        toggleDropdownMenu(dropdown, false);
                    } else if (e.key === 'Tab' && e.shiftKey && index === 0) {
                        toggleDropdownMenu(dropdown, false);
                    }
                });
            });
        }
    });
    
    // Helper function to toggle dropdown menu
    function toggleDropdownMenu(dropdown, show) {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.export-options');
        
        if (show) {
            menu.classList.add('show');
            button.setAttribute('aria-expanded', 'true');
            const firstOption = menu.querySelector('button');
            if (firstOption) firstOption.focus();
        } else {
            menu.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
        }
    }
    
    // Add keyboard support for course cards
    document.addEventListener('click', function(e) {
        // Implement keyboard accessibility dynamically on newly added elements
        setTimeout(enhanceKeyboardNavigation, 500);
    });
    
    // Setup trap focus for modals
    setupFocusTrap();
}

// Set up trap focus for modals and dropdowns
function setupFocusTrap() {
    // Create and add the focus trap setup for future modals
    window.trapFocus = function(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Move focus to first element
        firstElement.focus();
        
        element.addEventListener('keydown', function(e) {
            // Trap focus inside the element while it's visible
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
            
            // Allow escape to close modal/dropdown
            if (e.key === 'Escape') {
                // Close the modal or dropdown
                if (element.classList.contains('modal')) {
                    element.classList.remove('open');
                } else if (element.classList.contains('export-options')) {
                    element.classList.remove('show');
                    const btn = element.closest('.export-dropdown').querySelector('button');
                    btn.setAttribute('aria-expanded', 'false');
                    btn.focus();
                }
            }
        });
    };
}

// Add ARIA attributes to improve screen reader experience
function addAriaAttributes() {
    // Add ARIA labels to all form elements
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (!label && !element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', element.placeholder || element.name || element.id);
        }
    });
    
    // Add roles to improve structural semantics
    const coursesList = document.getElementById('courses-container');
    if (coursesList) {
        coursesList.setAttribute('role', 'list');
        const courseItems = coursesList.querySelectorAll('.course-card');
        courseItems.forEach(item => {
            item.setAttribute('role', 'listitem');
        });
    }
    
    // Add aria-live regions for dynamic content
    const scheduleRegion = document.getElementById('schedule');
    if (scheduleRegion) {
        scheduleRegion.setAttribute('aria-live', 'polite');
        scheduleRegion.setAttribute('aria-atomic', 'true');
        scheduleRegion.setAttribute('role', 'region');
        scheduleRegion.setAttribute('aria-label', 'Study Schedule');
    }
    
    // Add aria-hidden to decorative elements
    const decorativeElements = document.querySelectorAll('.decoration, .background-decoration');
    decorativeElements.forEach(element => {
        element.setAttribute('aria-hidden', 'true');
    });
    
    // Add button instructions for screen readers
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            const icon = button.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                let buttonAction = 'Button';
                
                if (iconClass.includes('fa-trash')) buttonAction = 'Delete';
                else if (iconClass.includes('fa-edit')) buttonAction = 'Edit';
                else if (iconClass.includes('fa-save')) buttonAction = 'Save';
                else if (iconClass.includes('fa-plus')) buttonAction = 'Add';
                
                button.setAttribute('aria-label', buttonAction);
            }
        }
    });
    
    // Add descriptions to complex components
    const complexComponents = document.querySelectorAll('.form-container, .schedule-container');
    complexComponents.forEach((component, index) => {
        const componentId = component.id || `component-${index}`;
        const describedById = `${componentId}-description`;
        
        let description;
        if (component.classList.contains('form-container')) {
            description = 'Form to add or edit courses for your study plan.';
        } else if (component.classList.contains('schedule-container')) {
            description = 'Your personalized study schedule based on added courses.';
        }
        
        if (description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.id = describedById;
            descriptionElement.className = 'sr-only';
            descriptionElement.textContent = description;
            
            component.parentNode.insertBefore(descriptionElement, component);
            component.setAttribute('aria-describedby', describedById);
        }
    });
    
    // Add sr-only styles for screen reader text
    const srStyle = document.createElement('style');
    srStyle.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(srStyle);
}

// Set up observer to monitor content changes and update ARIA
function setupAccessibilityObserver() {
    // Setup MutationObserver to watch for dynamically added content
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // When new content is added, enhance its accessibility
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Process newly added elements for accessibility
                        processNodeForAccessibility(node);
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    function processNodeForAccessibility(node) {
        // Add appropriate ARIA roles and attributes
        if (node.classList && node.classList.contains('course-card')) {
            node.setAttribute('role', 'listitem');
            node.setAttribute('tabindex', '0');
        }
        
        // Find and process buttons within the new node
        const buttons = node.querySelectorAll ? node.querySelectorAll('button') : [];
        buttons.forEach(button => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    let buttonAction = 'Button';
                    
                    if (iconClass.includes('fa-trash')) buttonAction = 'Delete';
                    else if (iconClass.includes('fa-edit')) buttonAction = 'Edit';
                    else if (iconClass.includes('fa-save')) buttonAction = 'Save';
                    else if (iconClass.includes('fa-plus')) buttonAction = 'Add';
                    
                    button.setAttribute('aria-label', buttonAction);
                }
            }
            
            // Add keyboard event handling
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
        
        // Process other interactive elements
        if (node.querySelectorAll) {
            const interactiveElements = node.querySelectorAll('.interactive, [role="button"]');
            interactiveElements.forEach(element => {
                if (!element.getAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }
                
                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        element.click();
                    }
                });
            });
        }
    }
}

// Add keyboard shortcut help modal
function addKeyboardShortcutHelp() {
    // Create keyboard shortcut button
    const keyboardHelpButton = document.createElement('button');
    keyboardHelpButton.className = 'keyboard-help-button';
    keyboardHelpButton.setAttribute('aria-label', 'Keyboard shortcuts help');
    keyboardHelpButton.innerHTML = '<i class="fas fa-keyboard"></i>';
    
    // Create keyboard shortcuts modal
    const keyboardModal = document.createElement('div');
    keyboardModal.className = 'keyboard-shortcuts-modal';
    keyboardModal.setAttribute('role', 'dialog');
    keyboardModal.setAttribute('aria-modal', 'true');
    keyboardModal.setAttribute('aria-labelledby', 'keyboard-shortcuts-title');
    keyboardModal.setAttribute('tabindex', '-1');
    
    keyboardModal.innerHTML = `
        <div class="keyboard-shortcuts-content">
            <button class="close-keyboard-shortcuts" aria-label="Close keyboard shortcuts">
                <i class="fas fa-times"></i>
            </button>
            <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
            <div class="shortcuts-grid">
                <div class="shortcut-group">
                    <h3>Navigation</h3>
                    <div class="shortcut-item">
                        <span class="key">Tab</span>
                        <span class="description">Move to next focusable element</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Shift + Tab</span>
                        <span class="description">Move to previous focusable element</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">?</span>
                        <span class="description">Show/hide keyboard shortcuts</span>
                    </div>
                </div>
                <div class="shortcut-group">
                    <h3>Course Management</h3>
                    <div class="shortcut-item">
                        <span class="key">Alt + N</span>
                        <span class="description">Add new course</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Alt + G</span>
                        <span class="description">Generate schedule</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Alt + S</span>
                        <span class="description">Save schedule</span>
                    </div>
                </div>
                <div class="shortcut-group">
                    <h3>Course Actions</h3>
                    <div class="shortcut-item">
                        <span class="key">Enter</span>
                        <span class="description">Activate selected element</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Space</span>
                        <span class="description">Activate selected element</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Escape</span>
                        <span class="description">Close dialogs or cancel actions</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for keyboard help
    const keyboardHelpStyles = document.createElement('style');
    keyboardHelpStyles.textContent = `
        .keyboard-help-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: var(--accent-color);
            color: white;
            border: none;
            box-shadow: var(--shadow-md);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            opacity: 0.7;
            transition: opacity 0.2s, transform 0.2s;
        }
        
        .keyboard-help-button:hover,
        .keyboard-help-button:focus {
            opacity: 1;
            transform: scale(1.05);
        }
        
        .keyboard-shortcuts-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .keyboard-shortcuts-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .keyboard-shortcuts-content {
            background-color: white;
            border-radius: 8px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            position: relative;
        }
        
        .close-keyboard-shortcuts {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
        }
        
        #keyboard-shortcuts-title {
            margin-top: 0;
            color: var(--accent-color);
            border-bottom: 2px solid rgba(var(--accent-color-rgb), 0.2);
            padding-bottom: 10px;
        }
        
        .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .shortcut-group h3 {
            margin-top: 0;
            color: var(--text-color);
            font-size: 1.1rem;
        }
        
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .key {
            background-color: #f5f7fa;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-family: monospace;
            font-weight: bold;
            min-width: 80px;
            text-align: center;
        }
        
        .description {
            flex: 1;
            margin-left: 15px;
            color: #555;
        }
        
        @media (max-width: 600px) {
            .shortcuts-grid {
                grid-template-columns: 1fr;
            }
            
            .keyboard-shortcuts-content {
                padding: 15px;
            }
        }
    `;
    document.head.appendChild(keyboardHelpStyles);
    
    // Add to body
    document.body.appendChild(keyboardHelpButton);
    document.body.appendChild(keyboardModal);
    
    // Add event listeners
    keyboardHelpButton.addEventListener('click', function() {
        keyboardModal.classList.add('show');
        trapFocus(keyboardModal);
    });
    
    keyboardModal.querySelector('.close-keyboard-shortcuts').addEventListener('click', function() {
        keyboardModal.classList.remove('show');
        keyboardHelpButton.focus();
    });
    
    // Add keyboard shortcut to show keyboard help
    document.addEventListener('keydown', function(e) {
        // "?" key to show keyboard shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (keyboardModal.classList.contains('show')) {
                keyboardModal.classList.remove('show');
                keyboardHelpButton.focus();
            } else {
                keyboardModal.classList.add('show');
                trapFocus(keyboardModal);
            }
        }
        
        // Add keyboard shortcuts for common actions
        if (e.altKey) {
            switch (e.key) {
                case 'n': // Alt+N for new course - focus on course name field
                    e.preventDefault();
                    document.getElementById('course-name').focus();
                    break;
                case 'g': // Alt+G for generate schedule
                    e.preventDefault();
                    document.getElementById('generate-schedule').click();
                    break;
                case 's': // Alt+S for save schedule
                    e.preventDefault();
                    const saveBtn = document.getElementById('save-schedule-btn');
                    if (saveBtn) saveBtn.click();
                    break;
            }
        }
    });
}

// Add advanced features UI components
function addAdvancedFeaturesUI() {
    // Create advanced features section for settings
    const advancedSection = document.createElement('div');
    advancedSection.className = 'advanced-features-section';
    advancedSection.innerHTML = `
        <h2 class="section-title">Advanced Features</h2>
        <div class="feature-cards">
            <div class="feature-card" id="google-calendar-card">
                <div class="feature-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="feature-content">
                    <h3>Google Calendar Sync</h3>
                    <p>Sync your study schedule with Google Calendar to access it anywhere.</p>
                    <button id="google-auth-btn" class="feature-btn">
                        ${googleCalendarAuthorized ? '<i class="fas fa-check"></i> Connected' : '<i class="fab fa-google"></i> Connect'}
                    </button>
                    <button id="sync-calendar-btn" class="feature-btn ${!googleCalendarAuthorized ? 'disabled' : ''}" ${!googleCalendarAuthorized ? 'disabled' : ''}>
                        <i class="fas fa-sync"></i> Sync Now
                    </button>
                </div>
            </div>
            <div class="feature-card" id="notifications-card">
                <div class="feature-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="feature-content">
                    <h3>Reminders & Notifications</h3>
                    <p>Get notified about upcoming deadlines and study sessions.</p>
                    <button id="setup-notifications-btn" class="feature-btn">
                        <i class="fas fa-cog"></i> Configure
                    </button>
                    <div class="notification-status">
                        ${notificationsEnabled ? '<span class="status-enabled"><i class="fas fa-check-circle"></i> Enabled</span>' : '<span class="status-disabled"><i class="fas fa-times-circle"></i> Disabled</span>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');
    if (mainContent) {
        // Insert before the footer if it exists, otherwise append
        const footer = document.querySelector('footer');
        if (footer) {
            mainContent.insertBefore(advancedSection, footer);
        } else {
            mainContent.appendChild(advancedSection);
        }
    } else {
        // If no main container found, add before the schedule container
        const scheduleSection = document.querySelector('.schedule-section');
        if (scheduleSection) {
            scheduleSection.parentNode.insertBefore(advancedSection, scheduleSection.nextSibling);
        } else {
            // Last resort, add to body
            document.body.appendChild(advancedSection);
        }
    }
    
    // Add event listeners
    document.getElementById('google-auth-btn').addEventListener('click', handleGoogleAuth);
    document.getElementById('sync-calendar-btn').addEventListener('click', syncWithGoogleCalendar);
    document.getElementById('setup-notifications-btn').addEventListener('click', openNotificationSettings);
    
    // Add styles for advanced features
    addAdvancedFeaturesStyles();
}

// Add styles for advanced features
function addAdvancedFeaturesStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .advanced-features-section {
            margin-top: 60px;
            padding: 20px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .section-title {
            text-align: center;
            color: var(--text-color);
            margin-bottom: 30px;
            font-size: 1.8rem;
            position: relative;
        }
        
        .section-title:after {
            content: '';
            display: block;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, var(--accent-color), rgba(var(--accent-color-rgb), 0.5));
            margin: 10px auto 0;
            border-radius: 2px;
        }
        
        .feature-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }
        
        .feature-card {
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            padding: 25px;
            transition: transform 0.3s, box-shadow 0.3s;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }
        
        .feature-card:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: linear-gradient(90deg, var(--accent-color), rgba(var(--accent-color-rgb), 0.7));
        }
        
        .feature-icon {
            font-size: 2.5rem;
            color: var(--accent-color);
            margin-bottom: 20px;
            text-align: center;
        }
        
        .feature-content h3 {
            margin-top: 0;
            font-size: 1.4rem;
            color: var(--text-color);
            margin-bottom: 12px;
        }
        
        .feature-content p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .feature-btn {
            padding: 10px 15px;
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: background-color 0.2s;
        }
        
        .feature-btn:hover {
            background-color: #3b6c94;
        }
        
        .feature-btn.disabled {
            background-color: #ccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .notification-status {
            margin-top: 15px;
            font-size: 0.9rem;
        }
        
        .status-enabled {
            color: var(--success-color);
        }
        
        .status-disabled {
            color: #888;
        }
        
        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-container {
            background-color: white;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
            width: 90%;
            max-width: 550px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: modalSlideIn 0.3s forwards;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            margin: 0;
            color: var(--text-color);
            font-size: 1.5rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #666;
            transition: color 0.2s;
        }
        
        .modal-close:hover {
            color: #333;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .modal-btn {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .modal-btn-primary {
            background-color: var(--accent-color);
            color: white;
            border: none;
        }
        
        .modal-btn-secondary {
            background-color: #f3f3f3;
            color: #333;
            border: 1px solid #ddd;
        }
        
        /* Form Controls */
        .form-control {
            margin-bottom: 20px;
        }
        
        .form-control label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        
        .form-control input[type="text"],
        .form-control input[type="email"],
        .form-control select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
        }
        
        .form-control input[type="checkbox"] {
            margin-right: 8px;
        }
        
        .reminder-time-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .reminder-chip {
            background-color: #f3f3f3;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 5px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .reminder-chip button {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 0.8rem;
            padding: 0;
            display: flex;
            align-items: center;
        }
        
        .add-reminder-btn {
            background-color: rgba(var(--accent-color-rgb), 0.1);
            color: var(--accent-color);
            border: 1px dashed rgba(var(--accent-color-rgb), 0.3);
            border-radius: 20px;
            padding: 5px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
        }
        
        .add-reminder-btn:hover {
            background-color: rgba(var(--accent-color-rgb), 0.15);
        }
        
        @media (max-width: 768px) {
            .feature-cards {
                grid-template-columns: 1fr;
            }
            
            .modal-container {
                width: 95%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize Google API
function initGoogleApi() {
    // Create script tag to load Google API client
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleApiClient;
    document.head.appendChild(script);
}

// Initialize Google API Client
function initializeGoogleApiClient() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: GOOGLE_SCOPES
        }).then(() => {
            // Listen for sign-in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateGoogleAuthStatus);
            
            // Handle the initial sign-in state
            updateGoogleAuthStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            
            console.log('Google API initialized');
        }).catch(error => {
            console.error('Error initializing Google API:', error);
        });
    });
}

// Handle Google authorization
function handleGoogleAuth() {
    if (gapi && gapi.auth2) {
        if (googleCalendarAuthorized) {
            // Sign out of Google
            gapi.auth2.getAuthInstance().signOut().then(() => {
                updateGoogleAuthStatus(false);
                showNotification('Disconnected from Google Calendar', 'info');
            });
        } else {
            // Sign in with Google
            gapi.auth2.getAuthInstance().signIn().then(() => {
                updateGoogleAuthStatus(true);
                showNotification('Connected to Google Calendar!', 'success');
            }).catch(error => {
                console.error('Google Sign-In Error:', error);
                if (error.error !== 'popup_closed_by_user') {
                    showNotification('Error connecting to Google Calendar', 'error');
                }
            });
        }
    } else {
        console.error('Google API not loaded correctly');
        showNotification('Google Calendar API not available', 'error');
    }
}

// Update Google Auth status
function updateGoogleAuthStatus(isSignedIn) {
    googleCalendarAuthorized = isSignedIn;
    localStorage.setItem('googleCalendarAuthorized', isSignedIn);
    
    // Update UI
    const authButton = document.getElementById('google-auth-btn');
    const syncButton = document.getElementById('sync-calendar-btn');
    
    if (authButton) {
        authButton.innerHTML = isSignedIn ? 
            '<i class="fas fa-check"></i> Connected' : 
            '<i class="fab fa-google"></i> Connect';
    }
    
    if (syncButton) {
        if (isSignedIn) {
            syncButton.classList.remove('disabled');
            syncButton.disabled = false;
        } else {
            syncButton.classList.add('disabled');
            syncButton.disabled = true;
        }
    }
}

// Sync schedule with Google Calendar
function syncWithGoogleCalendar() {
    if (!googleCalendarAuthorized) {
        showNotification('Please connect to Google Calendar first', 'warning');
        return;
    }
    
    // Show loading state
    const syncButton = document.getElementById('sync-calendar-btn');
    const originalContent = syncButton.innerHTML;
    syncButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Syncing...';
    syncButton.disabled = true;
    
    // First, create a calendar if it doesn't exist or get the ID if it does
    checkOrCreateCalendar()
        .then(calendarId => {
            // Delete all events from the calendar (clean sync)
            return clearCalendarEvents(calendarId).then(() => calendarId);
        })
        .then(calendarId => {
            // Create events for all study sessions in the schedule
            return createCalendarEvents(calendarId);
        })
        .then(() => {
            // Update UI and show success message
            syncButton.innerHTML = originalContent;
            syncButton.disabled = false;
            showNotification('Schedule synced with Google Calendar!', 'success');
            showSuccessFeedback();
        })
        .catch(error => {
            console.error('Error syncing with Google Calendar:', error);
            syncButton.innerHTML = originalContent;
            syncButton.disabled = false;
            showNotification('Error syncing with Google Calendar', 'error');
        });
}

// Check if calendar exists or create it
function checkOrCreateCalendar() {
    return new Promise((resolve, reject) => {
        // First check if we already have the calendar ID saved
        const calendarId = localStorage.getItem('studyPlannerCalendarId');
        if (calendarId) {
            // Verify the calendar still exists
            gapi.client.calendar.calendars.get({
                calendarId: calendarId
            }).then(() => {
                resolve(calendarId);
            }).catch(() => {
                // Calendar not found, need to create a new one
                createNewCalendar().then(resolve).catch(reject);
            });
        } else {
            // Need to create a new calendar
            createNewCalendar().then(resolve).catch(reject);
        }
    });
}

// Create a new Google Calendar
function createNewCalendar() {
    return new Promise((resolve, reject) => {
        gapi.client.calendar.calendars.insert({
            summary: 'Smart Study Planner',
            description: 'Automatically synced study schedule',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }).then(response => {
            const calendarId = response.result.id;
            localStorage.setItem('studyPlannerCalendarId', calendarId);
            resolve(calendarId);
        }).catch(reject);
    });
}

// Clear all events from the calendar
function clearCalendarEvents(calendarId) {
    return new Promise((resolve, reject) => {
        // We'll delete all events by listing them first
        gapi.client.calendar.events.list({
            calendarId: calendarId,
            maxResults: 2500
        }).then(response => {
            const events = response.result.items;
            if (events.length === 0) {
                resolve(); // No events to delete
                return;
            }
            
            // Create a promise for each event deletion
            const deletePromises = events.map(event => {
                return gapi.client.calendar.events.delete({
                    calendarId: calendarId,
                    eventId: event.id
                });
            });
            
            // Execute all deletions
            Promise.all(deletePromises)
                .then(() => resolve())
                .catch(reject);
        }).catch(reject);
    });
}

// Create Google Calendar events for study sessions
function createCalendarEvents(calendarId) {
    return new Promise((resolve, reject) => {
        // Verify we have a schedule to sync
        if (!schedule || !schedule.days || schedule.days.length === 0) {
            reject(new Error('No schedule available to sync'));
            return;
        }
        
        // Create an event for each study session in the schedule
        const eventPromises = [];
        
        schedule.days.forEach(day => {
            const date = new Date(day.date);
            
            day.sessions.forEach(session => {
                // Parse start and end times
                const [startHour, startMinute] = session.time.split(' - ')[0].split(':').map(t => parseInt(t));
                const [endHour, endMinute] = session.time.split(' - ')[1].split(':').map(t => parseInt(t));
                
                // Create start and end datetime objects
                const startDateTime = new Date(date);
                startDateTime.setHours(startHour, startMinute, 0, 0);
                
                const endDateTime = new Date(date);
                endDateTime.setHours(endHour, endMinute, 0, 0);
                
                // Create event description
                const description = `Study session for: ${session.course.name}\n` +
                    `Difficulty: ${getDifficultyLabel(session.course.difficulty)}\n` +
                    `Topics: ${session.course.topics.join(', ')}\n` +
                    `Deadline: ${formatDate(session.course.deadline)}`;
                
                // Create the event
                const event = {
                    summary: `Study: ${session.course.name}`,
                    location: 'Study Location',
                    description: description,
                    start: {
                        dateTime: startDateTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    colorId: getColorIdForDifficulty(session.course.difficulty),
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 30 },
                            { method: 'popup', minutes: 10 }
                        ]
                    }
                };
                
                // Add promise for creating this event
                eventPromises.push(
                    gapi.client.calendar.events.insert({
                        calendarId: calendarId,
                        resource: event
                    })
                );
            });
        });
        
        // Execute all event creations
        Promise.all(eventPromises)
            .then(() => resolve())
            .catch(reject);
    });
}

// Get color ID for event based on course difficulty
function getColorIdForDifficulty(difficulty) {
    // Google Calendar color IDs: https://developers.google.com/calendar/api/v3/reference/colors/get
    switch(difficulty) {
        case 1: return '9'; // Green
        case 2: return '5'; // Yellow
        case 3: return '6'; // Orange
        case 4: return '11'; // Red
        case 5: return '4'; // Purple
        default: return '1'; // Blue (default)
    }
}

// Initialize Notification System
function initNotificationSystem() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    
    // Check if notifications are already enabled
    checkNotificationPermission();
    
    // Set up notification check interval (check every hour)
    setInterval(checkForUpcomingDeadlines, 60 * 60 * 1000);
    
    // Initial check for upcoming deadlines
    checkForUpcomingDeadlines();
}

// Check browser notification permission
function checkNotificationPermission() {
    if (Notification.permission === 'granted') {
        notificationsEnabled = true;
        localStorage.setItem('notificationsEnabled', 'true');
        updateNotificationUI();
    } else if (Notification.permission !== 'denied') {
        // We need to ask for permission
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                notificationsEnabled = true;
                localStorage.setItem('notificationsEnabled', 'true');
                updateNotificationUI();
                showNotification('Notifications enabled!', 'success');
            }
        });
    }
}

// Update notification UI elements
function updateNotificationUI() {
    const notificationStatus = document.querySelector('.notification-status');
    if (notificationStatus) {
        notificationStatus.innerHTML = notificationsEnabled ? 
            '<span class="status-enabled"><i class="fas fa-check-circle"></i> Enabled</span>' : 
            '<span class="status-disabled"><i class="fas fa-times-circle"></i> Disabled</span>';
    }
}

// Open notification settings modal
function openNotificationSettings() {
    // Create notification settings modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'notification-settings-title');
    
    modalOverlay.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="notification-settings-title" class="modal-title">
                    <i class="fas fa-bell"></i> Notification Settings
                </h2>
                <button class="modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-control">
                    <label>
                        <input type="checkbox" id="browser-notifications" ${userNotificationSettings.browserNotifications ? 'checked' : ''}>
                        Enable browser notifications
                    </label>
                    <p class="form-text text-muted">Receive notifications in your browser when deadlines are approaching.</p>
                </div>
                
                <div class="form-control">
                    <label>
                        <input type="checkbox" id="email-notifications" ${userNotificationSettings.emailNotifications ? 'checked' : ''}>
                        Enable email notifications
                    </label>
                    <p class="form-text text-muted">Receive email reminders about upcoming deadlines.</p>
                </div>
                
                <div class="form-control" id="email-input-container" style="display: ${userNotificationSettings.emailNotifications ? 'block' : 'none'}">
                    <label for="notification-email">Email address</label>
                    <input type="email" id="notification-email" value="${userNotificationSettings.emailAddress || ''}" placeholder="Enter your email address">
                </div>
                
                <div class="form-control">
                    <label>Reminder times</label>
                    <p class="form-text text-muted">Get reminders before your deadlines.</p>
                    
                    <div class="reminder-time-controls">
                        ${userNotificationSettings.reminderTimes.map(hours => `
                            <div class="reminder-chip">
                                <span>${hours} hours before</span>
                                <button class="remove-reminder-btn" data-hours="${hours}" aria-label="Remove ${hours} hour reminder">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                        
                        <button class="add-reminder-btn">
                            <i class="fas fa-plus"></i> Add time
                        </button>
                    </div>
                </div>
                
                <div class="form-control">
                    <button id="request-notification-permission" class="feature-btn" ${Notification.permission === 'granted' ? 'disabled' : ''}>
                        <i class="fas fa-check-circle"></i> ${Notification.permission === 'granted' ? 'Notifications Allowed' : 'Allow Browser Notifications'}
                    </button>
                    <p class="form-text text-muted">
                        Status: <span class="permission-status">${Notification.permission === 'granted' ? 'Granted' : Notification.permission === 'denied' ? 'Blocked' : 'Not requested'}</span>
                    </p>
                </div>
                
                <div class="form-control">
                    <button id="test-notification-btn" class="feature-btn" ${Notification.permission !== 'granted' ? 'disabled' : ''}>
                        <i class="fas fa-paper-plane"></i> Send Test Notification
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary" id="cancel-notification-settings">Cancel</button>
                <button class="modal-btn modal-btn-primary" id="save-notification-settings">Save Settings</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Show the modal with a small delay for the animation
    setTimeout(() => {
        modalOverlay.classList.add('show');
        
        // Setup focus trap for accessibility
        trapFocus(modalOverlay.querySelector('.modal-container'));
    }, 10);
    
    // Add event listeners
    const closeBtn = modalOverlay.querySelector('.modal-close');
    const cancelBtn = modalOverlay.querySelector('#cancel-notification-settings');
    const saveBtn = modalOverlay.querySelector('#save-notification-settings');
    const testBtn = modalOverlay.querySelector('#test-notification-btn');
    const requestPermissionBtn = modalOverlay.querySelector('#request-notification-permission');
    const emailCheckbox = modalOverlay.querySelector('#email-notifications');
    const emailContainer = modalOverlay.querySelector('#email-input-container');
    const addReminderBtn = modalOverlay.querySelector('.add-reminder-btn');
    
    // Close modal handlers
    const closeModal = () => {
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Email checkbox toggle
    emailCheckbox.addEventListener('change', () => {
        emailContainer.style.display = emailCheckbox.checked ? 'block' : 'none';
    });
    
    // Request browser notification permission
    requestPermissionBtn.addEventListener('click', () => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                const permStatus = modalOverlay.querySelector('.permission-status');
                if (permission === 'granted') {
                    notificationsEnabled = true;
                    localStorage.setItem('notificationsEnabled', 'true');
                    updateNotificationUI();
                    
                    // Update button state
                    requestPermissionBtn.disabled = true;
                    requestPermissionBtn.innerHTML = '<i class="fas fa-check-circle"></i> Notifications Allowed';
                    
                    // Update test button
                    testBtn.disabled = false;
                    
                    // Update status text
                    if (permStatus) permStatus.textContent = 'Granted';
                    
                    showNotification('Notifications enabled!', 'success');
                } else {
                    if (permStatus) permStatus.textContent = 'Blocked';
                }
            });
        }
    });
    
    // Test notification
    testBtn.addEventListener('click', () => {
        sendBrowserNotification(
            'Test Notification',
            'This is a test notification from Smart Study Planner. Notifications are working correctly!'
        );
    });
    
    // Add new reminder time
    addReminderBtn.addEventListener('click', () => {
        // Create custom dropdown for selecting hours
        const hoursOptions = [1, 2, 3, 6, 12, 24, 48, 72];
        
        // Create dropdown elements
        const dropdown = document.createElement('div');
        dropdown.className = 'reminder-time-dropdown';
        dropdown.innerHTML = `
            <div class="reminder-dropdown-header">Select reminder time</div>
            <div class="reminder-dropdown-options">
                ${hoursOptions.map(hours => `
                    <div class="reminder-dropdown-option" data-hours="${hours}">
                        ${hours} hours before
                    </div>
                `).join('')}
                <div class="reminder-dropdown-option custom">
                    <input type="number" class="custom-hours-input" min="1" max="168" placeholder="Custom hours">
                </div>
            </div>
        `;
        
        // Position the dropdown
        const rect = addReminderBtn.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.zIndex = '1000';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.borderRadius = '8px';
        dropdown.style.boxShadow = 'var(--shadow-md)';
        dropdown.style.width = '200px';
        dropdown.style.overflow = 'hidden';
        
        // Style the header
        const header = dropdown.querySelector('.reminder-dropdown-header');
        header.style.padding = '10px 15px';
        header.style.borderBottom = '1px solid #eee';
        header.style.fontWeight = '500';
        
        // Style the options
        const options = dropdown.querySelectorAll('.reminder-dropdown-option');
        options.forEach(option => {
            option.style.padding = '8px 15px';
            option.style.cursor = 'pointer';
            option.style.transition = 'background-color 0.2s';
            
            option.addEventListener('mouseover', () => {
                option.style.backgroundColor = '#f5f7fa';
            });
            
            option.addEventListener('mouseout', () => {
                option.style.backgroundColor = 'transparent';
            });
            
            if (!option.classList.contains('custom')) {
                option.addEventListener('click', () => {
                    const hours = parseInt(option.dataset.hours);
                    addReminderTime(hours);
                    document.body.removeChild(dropdown);
                });
            }
        });
        
        // Style and handle custom input
        const customInput = dropdown.querySelector('.custom-hours-input');
        customInput.style.width = '100%';
        customInput.style.padding = '5px';
        customInput.style.border = '1px solid #ddd';
        customInput.style.borderRadius = '4px';
        
        customInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const hours = parseInt(customInput.value);
                if (hours && hours > 0 && hours <= 168) {
                    addReminderTime(hours);
                    document.body.removeChild(dropdown);
                }
            }
        });
        
        // Add dropdown to document
        document.body.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== addReminderBtn) {
                if (document.body.contains(dropdown)) {
                    document.body.removeChild(dropdown);
                }
                document.removeEventListener('click', closeDropdown);
            }
        });
        
        // Prevent closing when clicking the button that opened it
        addReminderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
        }, { once: true });
    });
    
    // Add reminder time to the list
    function addReminderTime(hours) {
        // Check if this time already exists
        if (userNotificationSettings.reminderTimes.includes(hours)) {
            return;
        }
        
        // Add to the array
        userNotificationSettings.reminderTimes.push(hours);
        
        // Create new chip
        const chip = document.createElement('div');
        chip.className = 'reminder-chip';
        chip.innerHTML = `
            <span>${hours} hours before</span>
            <button class="remove-reminder-btn" data-hours="${hours}" aria-label="Remove ${hours} hour reminder">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove button handler
        chip.querySelector('.remove-reminder-btn').addEventListener('click', function() {
            const hoursToRemove = parseInt(this.dataset.hours);
            userNotificationSettings.reminderTimes = userNotificationSettings.reminderTimes.filter(h => h !== hoursToRemove);
            chip.remove();
        });
        
        // Add to container before the add button
        const reminderControls = modalOverlay.querySelector('.reminder-time-controls');
        reminderControls.insertBefore(chip, addReminderBtn);
    }
    
    // Handle remove buttons for existing reminders
    modalOverlay.querySelectorAll('.remove-reminder-btn').forEach(button => {
        button.addEventListener('click', function() {
            const hours = parseInt(this.dataset.hours);
            userNotificationSettings.reminderTimes = userNotificationSettings.reminderTimes.filter(h => h !== hours);
            this.closest('.reminder-chip').remove();
        });
    });
    
    // Save notification settings
    saveBtn.addEventListener('click', () => {
        // Update settings object
        userNotificationSettings.browserNotifications = modalOverlay.querySelector('#browser-notifications').checked;
        userNotificationSettings.emailNotifications = modalOverlay.querySelector('#email-notifications').checked;
        userNotificationSettings.emailAddress = modalOverlay.querySelector('#notification-email').value;
        
        // Save to localStorage
        localStorage.setItem('notificationSettings', JSON.stringify(userNotificationSettings));
        
        // Update global enabled state based on browser notifications setting
        notificationsEnabled = userNotificationSettings.browserNotifications && Notification.permission === 'granted';
        localStorage.setItem('notificationsEnabled', notificationsEnabled ? 'true' : 'false');
        
        // Update UI
        updateNotificationUI();
        
        // Close the modal
        closeModal();
        
        // Show success message
        showNotification('Notification settings saved!', 'success');
    });
}

// Check for upcoming deadlines and send notifications
function checkForUpcomingDeadlines() {
    // Only proceed if notifications are enabled
    if (!notificationsEnabled) return;
    
    // Get current date and time
    const now = new Date();
    
    // Check each course for deadlines
    courses.forEach(course => {
        // Parse deadline date
        const deadlineDate = new Date(course.deadline + 'T23:59:59');
        
        // Calculate hours until deadline
        const hoursUntilDeadline = Math.floor((deadlineDate - now) / (1000 * 60 * 60));
        
        // Check if any reminder time matches the current hours until deadline
        userNotificationSettings.reminderTimes.forEach(reminderHours => {
            if (hoursUntilDeadline > 0 && hoursUntilDeadline <= reminderHours && hoursUntilDeadline >= reminderHours - 1) {
                // Send notification for this course
                sendDeadlineNotification(course, hoursUntilDeadline);
            }
        });
    });
}

// Send browser notification for deadline
function sendDeadlineNotification(course, hoursLeft) {
    // Check if we should send browser notification
    if (userNotificationSettings.browserNotifications) {
        const title = `Upcoming Deadline: ${course.name}`;
        const options = {
            body: `${course.name} is due in ${hoursLeft} hours.\nDeadline: ${formatDate(course.deadline)}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            tag: `deadline-${course.id}`,
            renotify: false
        };
        
        sendBrowserNotification(title, options);
    }
    
    // Check if we should send email notification
    if (userNotificationSettings.emailNotifications && userNotificationSettings.emailAddress) {
        sendEmailNotification(course, hoursLeft);
    }
}

// Send browser notification
function sendBrowserNotification(title, optionsOrBody) {
    // Check if notifications are enabled and permission granted
    if (!notificationsEnabled || Notification.permission !== 'granted') return;
    
    // Handle different argument formats
    const options = typeof optionsOrBody === 'string' 
        ? { body: optionsOrBody } 
        : optionsOrBody;
    
    // Create and show notification
    const notification = new Notification(title, options);
    
    // Add click handler
    notification.onclick = function() {
        window.focus();
        notification.close();
    };
    
    // Log for debugging
    console.log('Sent browser notification:', title);
}

// Send email notification (simulated - would require backend implementation)
function sendEmailNotification(course, hoursLeft) {
    // In a real implementation, this would call a backend API to send an email
    console.log(`[Email Notification] Would send email to ${userNotificationSettings.emailAddress} about ${course.name} due in ${hoursLeft} hours`);
    
    // Example of how the backend API call would look
    /*
    fetch('/api/send-notification-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userNotificationSettings.emailAddress,
            subject: `Reminder: ${course.name} deadline approaching`,
            courseName: course.name,
            deadline: course.deadline,
            hoursLeft: hoursLeft,
            topics: course.topics
        })
    })
    .then(response => response.json())
    .then(data => console.log('Email sent:', data))
    .catch(error => console.error('Error sending email:', error));
    */
}
  