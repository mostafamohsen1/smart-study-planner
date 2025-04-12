// DOM Elements
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const formInputs = document.querySelectorAll('.auth-form input');
const socialButtons = document.querySelectorAll('.social-btn');
const passwordToggles = document.querySelectorAll('.password-toggle');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const enableTwoFactorCheckbox = document.getElementById('enable-2fa');
const twoFactorContainer = document.getElementById('two-factor-container');
const registerPassword = document.getElementById('register-password');
const strengthBars = document.querySelector('.strength-bars');
const strengthLabel = document.querySelector('.strength-label');

// Animation timing variables
const ANIMATION_DELAY = 100;

// Initialize particles.js
document.addEventListener('DOMContentLoaded', () => {
    initializeParticles();
    
    // Apply staggered animation to form inputs
    animateFormElements();
    
    // Set up tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Skip if clicking the already active tab
            if (tab.classList.contains('active')) return;
            
            // Update active tab with animation
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Hide forgot password form if visible
            if (forgotPasswordForm.classList.contains('active')) {
                forgotPasswordForm.style.animation = 'slideOutFade 0.3s forwards';
                setTimeout(() => {
                    forgotPasswordForm.classList.remove('active');
                    forgotPasswordForm.style.animation = '';
                }, 300);
            }
            
            // Add slide-out animation to current form
            authForms.forEach(form => {
                if (form.classList.contains('active') && form !== forgotPasswordForm) {
                    form.style.animation = 'slideOutFade 0.3s forwards';
                    
                    // Wait for animation to complete before hiding
                    setTimeout(() => {
                        form.classList.remove('active');
                        form.style.animation = '';
                        
                        // Show the corresponding form with animation
                        const targetForm = document.getElementById(`${targetTab}-form`);
                        if (targetForm) {
                            targetForm.classList.add('active');
                            
                            // Animate form elements
                            animateFormElements(targetForm);
                        }
                    }, 300);
                }
            });
        });
    });
    
    // Add input focus effects
    formInputs.forEach(input => {
        // Create floating label effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Check initial state
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Password strength meter
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }
    
    // Password visibility toggles
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', togglePasswordVisibility);
    });
    
    // Forgot password link
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordForm();
        });
    }
    
    // Back to login link
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideForgotPasswordForm();
        });
    }
    
    // Two-factor authentication toggle
    if (enableTwoFactorCheckbox) {
        enableTwoFactorCheckbox.addEventListener('change', () => {
            // In a real app, this would trigger 2FA setup flow
            if (enableTwoFactorCheckbox.checked) {
                showAuthNotification('Two-factor authentication will be enabled upon registration', 'info');
            }
        });
    }
    
    // Login form submission with animation
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading animation to button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon i');
        btnText.textContent = 'Signing In...';
        btnIcon.className = 'fas fa-circle-notch fa-spin';
        submitBtn.disabled = true;
        
        // Perform validation with visual feedback
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const rememberMe = document.getElementById('remember-me').checked;
        
        let isValid = true;
        
        if (!validateEmail(email.value)) {
            showInputError(email, 'Please enter a valid email');
            isValid = false;
        } else {
            clearInputError(email);
        }
        
        if (!password.value) {
            showInputError(password, 'Password is required');
            isValid = false;
        } else {
            clearInputError(password);
        }
        
        if (!isValid) {
            // Reset button if validation fails
            setTimeout(() => {
                btnText.textContent = 'Sign In';
                btnIcon.className = 'fas fa-arrow-right';
                submitBtn.disabled = false;
                
                // Shake the form on error
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }, 500);
            return;
        }
        
        // Simulate 2FA check
        const shouldShow2FA = Math.random() > 0.5; // Randomly show 2FA for demo
        
        if (shouldShow2FA && !twoFactorContainer.style.display === 'block') {
            // Show 2FA input
            setTimeout(() => {
                btnText.textContent = 'Sign In';
                btnIcon.className = 'fas fa-arrow-right';
                submitBtn.disabled = false;
                
                twoFactorContainer.style.display = 'block';
                
                // Focus the 2FA input
                const twoFactorInput = document.getElementById('two-factor-code');
                if (twoFactorInput) {
                    twoFactorInput.focus();
                }
                
                showAuthNotification('Two-factor authentication required', 'info');
            }, 1000);
            return;
        }
        
        // Check 2FA code if visible
        if (twoFactorContainer.style.display === 'block') {
            const twoFactorCode = document.getElementById('two-factor-code').value;
            if (!twoFactorCode || twoFactorCode.length < 6) {
                showInputError(document.getElementById('two-factor-code'), 'Please enter a valid 2FA code');
                
                setTimeout(() => {
                    btnText.textContent = 'Sign In';
                    btnIcon.className = 'fas fa-arrow-right';
                    submitBtn.disabled = false;
                }, 500);
                return;
            }
        }
        
        // In a real app, you would make an API request to authenticate the user
        // For this demo, we'll simulate a successful login with a delay
        setTimeout(() => {
            // Store user info (in a real app, store auth token instead)
            if (rememberMe) {
                localStorage.setItem('userEmail', email.value);
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                sessionStorage.setItem('userEmail', email.value);
                sessionStorage.setItem('isLoggedIn', 'true');
            }
            
            // Show success message with animation
            showAuthNotification('Login successful! Redirecting...', 'success');
            
            // Add success animation to form
            loginForm.classList.add('success');
            
            // Redirect to home page after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 1500);
    });
    
    // Register form submission with animation
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading animation to button
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon i');
        btnText.textContent = 'Creating Account...';
        btnIcon.className = 'fas fa-circle-notch fa-spin';
        submitBtn.disabled = true;
        
        // Get form values and validate
        const name = document.getElementById('register-name');
        const email = document.getElementById('register-email');
        const password = document.getElementById('register-password');
        const confirmPassword = document.getElementById('register-confirm-password');
        const termsCheckbox = document.getElementById('terms');
        const enable2FA = document.getElementById('enable-2fa').checked;
        
        let isValid = true;
        
        if (!name.value.trim()) {
            showInputError(name, 'Name is required');
            isValid = false;
        } else {
            clearInputError(name);
        }
        
        if (!validateEmail(email.value)) {
            showInputError(email, 'Please enter a valid email');
            isValid = false;
        } else {
            clearInputError(email);
        }
        
        // Check password strength
        const strength = checkPasswordStrength(password.value);
        if (strength === 'weak') {
            showInputError(password, 'Password is too weak');
            isValid = false;
        } else if (password.value.length < 6) {
            showInputError(password, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            clearInputError(password);
        }
        
        if (password.value !== confirmPassword.value) {
            showInputError(confirmPassword, 'Passwords do not match');
            isValid = false;
        } else if (confirmPassword.value) {
            clearInputError(confirmPassword);
        }
        
        if (!termsCheckbox.checked) {
            showAuthNotification('Please accept the Terms of Service', 'error');
            isValid = false;
        }
        
        if (!isValid) {
            // Reset button if validation fails
            setTimeout(() => {
                btnText.textContent = 'Create Account';
                btnIcon.className = 'fas fa-user-plus';
                submitBtn.disabled = false;
                
                // Shake the form on error
                registerForm.classList.add('shake');
                setTimeout(() => registerForm.classList.remove('shake'), 500);
            }, 500);
            return;
        }
        
        // If 2FA is enabled, show additional setup steps in a real app
        if (enable2FA) {
            // Simulate 2FA setup (in a real app, this would show QR code, etc.)
            showAuthNotification('Setting up two-factor authentication...', 'info');
        }
        
        // Simulate registration success after a delay
        setTimeout(() => {
            // Store user info
            localStorage.setItem('userName', name.value);
            localStorage.setItem('userEmail', email.value);
            localStorage.setItem('isLoggedIn', 'true');
            if (enable2FA) {
                localStorage.setItem('has2FA', 'true');
            }
            
            // Show success message
            showAuthNotification('Registration successful! Redirecting...', 'success');
            
            // Add success animation to form
            registerForm.classList.add('success');
            
            // Redirect to home page after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 1500);
    });
    
    // Forgot password form submission
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading animation to button
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon i');
        btnText.textContent = 'Sending...';
        btnIcon.className = 'fas fa-circle-notch fa-spin';
        submitBtn.disabled = true;
        
        const email = document.getElementById('forgot-email');
        
        if (!validateEmail(email.value)) {
            showInputError(email, 'Please enter a valid email');
            
            setTimeout(() => {
                btnText.textContent = 'Send Reset Link';
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 500);
            return;
        }
        
        // Simulate sending password reset email
        setTimeout(() => {
            showAuthNotification(`Password reset link sent to ${email.value}`, 'success');
            
            // Return to login form after a delay
            setTimeout(() => {
                hideForgotPasswordForm();
                
                btnText.textContent = 'Send Reset Link';
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 1500);
        }, 1500);
    });
    
    // Social auth buttons with interactive effects
    socialButtons.forEach(btn => {
        btn.addEventListener('click', handleSocialAuth);
        
        // Add hover effects
        btn.addEventListener('mouseenter', () => {
            const img = btn.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.1)';
                img.style.transition = 'transform 0.3s ease';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            const img = btn.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });
});

// Initialize particles.js background effect
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#5e72e4" },
                shape: { type: "circle" },
                opacity: { value: 0.2, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#5e72e4",
                    opacity: 0.15,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.3 } },
                    push: { particles_nb: 3 }
                }
            },
            retina_detect: true
        });
    }
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const toggle = e.currentTarget;
    const passwordField = toggle.parentElement.querySelector('input');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggle.innerHTML = '<i class="far fa-eye-slash"></i>';
    } else {
        passwordField.type = 'password';
        toggle.innerHTML = '<i class="far fa-eye"></i>';
    }
    
    // Add subtle animation
    toggle.style.transform = 'scale(1.2)';
    setTimeout(() => {
        toggle.style.transform = 'scale(1)';
    }, 200);
}

// Show forgot password form
function showForgotPasswordForm() {
    // Hide login form with animation
    if (loginForm.classList.contains('active')) {
        loginForm.style.animation = 'slideOutFade 0.3s forwards';
        
        setTimeout(() => {
            loginForm.classList.remove('active');
            loginForm.style.animation = '';
            
            // Show forgot password form
            forgotPasswordForm.classList.add('active');
            
            // Animate form elements
            animateFormElements(forgotPasswordForm);
            
            // Focus email field
            document.getElementById('forgot-email').focus();
        }, 300);
    }
}

// Hide forgot password form and show login form
function hideForgotPasswordForm() {
    if (forgotPasswordForm.classList.contains('active')) {
        forgotPasswordForm.style.animation = 'slideOutFade 0.3s forwards';
        
        setTimeout(() => {
            forgotPasswordForm.classList.remove('active');
            forgotPasswordForm.style.animation = '';
            
            // Show login form
            loginForm.classList.add('active');
            
            // Animate form elements
            animateFormElements(loginForm);
        }, 300);
    }
}

// Check password strength and update UI
function updatePasswordStrength() {
    const password = registerPassword.value;
    const strength = checkPasswordStrength(password);
    
    // Remove existing classes
    strengthBars.className = 'strength-bars';
    strengthLabel.className = 'strength-label';
    
    // Update UI based on strength
    if (password.length === 0) {
        strengthLabel.textContent = 'Password strength';
    } else {
        strengthBars.classList.add(strength);
        strengthLabel.classList.add(strength);
        
        if (strength === 'weak') {
            strengthLabel.textContent = 'Weak password';
        } else if (strength === 'medium') {
            strengthLabel.textContent = 'Medium password';
        } else if (strength === 'strong') {
            strengthLabel.textContent = 'Strong password';
        } else if (strength === 'very-strong') {
            strengthLabel.textContent = 'Very strong password';
        }
    }
}

// Check password strength
function checkPasswordStrength(password) {
    if (password.length === 0) return '';
    
    // Define criteria
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    
    // Count criteria matched
    let strength = 0;
    if (hasLowercase) strength++;
    if (hasUppercase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecial) strength++;
    if (isLongEnough) strength++;
    
    // Determine strength level
    if (password.length < 6) {
        return 'weak';
    } else if (strength < 3) {
        return 'medium';
    } else if (strength < 5) {
        return 'strong';
    } else {
        return 'very-strong';
    }
}

// Animate form elements with staggered delay
function animateFormElements(targetForm = null) {
    const form = targetForm || document.querySelector('.auth-form.active');
    if (!form) return;
    
    const elements = form.querySelectorAll('.form-group, button, .forgot-password, .form-row, .password-strength-meter, .form-title, .back-to-login');
    
    elements.forEach((el, index) => {
        // Reset animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        // Apply staggered animation
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, ANIMATION_DELAY * index);
    });
}

// Handle social authentication with improved UX
function handleSocialAuth(e) {
    e.preventDefault();
    
    // Get the provider name
    const btn = e.currentTarget;
    let provider = 'Unknown';
    
    if (btn.classList.contains('google')) {
        provider = 'Google';
    } else if (btn.classList.contains('github')) {
        provider = 'GitHub';
    }
    
    // Add loading animation
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<div class="spinner"></div> Connecting...`;
    btn.disabled = true;
    
    // In a real app, you would implement OAuth flow with the provider
    setTimeout(() => {
        // Simulate success or failure randomly
        const isSuccess = Math.random() > 0.3;
        
        if (isSuccess) {
            // Store authentication details
            localStorage.setItem('userEmail', `user@${provider.toLowerCase()}.com`);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('authProvider', provider);
            
            // Show success message
            showAuthNotification(`Successfully signed in with ${provider}`, 'success');
            
            // Redirect to home
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Reset button and show error
            btn.innerHTML = originalContent;
            btn.disabled = false;
            
            showAuthNotification(`${provider} authentication failed. Please try again.`, 'error');
        }
    }, 1500);
}

// Show notification with enhanced animations
function showAuthNotification(message, type = 'info') {
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
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Display input error with animation
function showInputError(inputElement, message) {
    // Get or create error message
    const formGroup = inputElement.parentElement;
    formGroup.classList.add('error');
    
    let errorElement = formGroup.querySelector('.input-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Add shake animation to input
    inputElement.classList.add('shake');
    setTimeout(() => {
        inputElement.classList.remove('shake');
    }, 500);
}

// Clear input error
function clearInputError(inputElement) {
    const formGroup = inputElement.parentElement;
    formGroup.classList.remove('error');
    
    const errorElement = formGroup.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
} 