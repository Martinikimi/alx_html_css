// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Hamburger menu elements
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Contact form elements
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    // Toggle mobile menu
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update ARIA attributes
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle body scroll
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        
        // Announce menu state for screen readers
        const menuState = navMenu.classList.contains('active') ? 'Menu opened' : 'Menu closed';
        announceToScreenReader(menuState);
    }
    
    // Close mobile menu
    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Announce changes to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Initialize hamburger menu
    if (hamburger && navMenu) {
        // Set initial ARIA attributes
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'navigation-menu');
        navMenu.setAttribute('id', 'navigation-menu');
        
        // Add click event to hamburger
        hamburger.addEventListener('click', toggleMenu);
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                // Smooth scroll to section
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        event.preventDefault();
                        
                        // Close menu first
                        closeMenu();
                        
                        // Then scroll to section
                        setTimeout(() => {
                            targetSection.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 300);
                    }
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
                hamburger.focus(); // Return focus to hamburger button
            }
            
            // Trap focus inside menu when open
            if (event.key === 'Tab' && navMenu.classList.contains('active')) {
                const focusableElements = navMenu.querySelectorAll('a[href], button, input, textarea, select');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 480 && navMenu.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
        
        // Add touch events for better mobile experience
        let startX = 0;
        let currentX = 0;
        
        navMenu.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
        }, { passive: true });
        
        navMenu.addEventListener('touchmove', (event) => {
            currentX = event.touches[0].clientX;
        }, { passive: true });
        
        navMenu.addEventListener('touchend', () => {
            const swipeDistance = currentX - startX;
            
            // If swiped right more than 100px, close menu
            if (swipeDistance > 100 && navMenu.classList.contains('active')) {
                closeMenu();
            }
        }, { passive: true });
    }
    
    // Character count for message textarea
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = parseInt(this.getAttribute('maxlength'));
            charCount.textContent = `${currentLength}/${maxLength}`;
            
            // Add warning class when approaching limit
            const warningThreshold = maxLength * 0.9;
            charCount.classList.remove('warning', 'error');
            
            if (currentLength > warningThreshold && currentLength < maxLength) {
                charCount.classList.add('warning');
            }
            
            if (currentLength >= maxLength) {
                charCount.classList.add('error');
            }
        });
        
        // Initialize character count
        messageInput.dispatchEvent(new Event('input'));
    }
    
    // Form validation function
    function validateField(input, errorElement) {
        const value = input.value.trim();
        const isValid = input.checkValidity();
        
        if (errorElement) {
            if (!isValid && value !== '') {
                errorElement.textContent = getCustomErrorMessage(input);
                errorElement.classList.add('show');
                input.parentElement.classList.add('shake');
                
                // Remove shake animation after it completes
                setTimeout(() => {
                    input.parentElement.classList.remove('shake');
                }, 500);
                
                // Announce error for screen readers
                announceToScreenReader(`Error: ${errorElement.textContent}`);
            } else {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
                
                if (value !== '' && isValid) {
                    announceToScreenReader('Field validated successfully');
                }
            }
        }
        
        return isValid;
    }
    
    // Get custom error messages
    function getCustomErrorMessage(input) {
        if (input.validity.valueMissing) {
            return 'This field is required';
        }
        
        if (input.validity.typeMismatch) {
            if (input.type === 'email') {
                return 'Please enter a valid email address';
            }
        }
        
        if (input.validity.patternMismatch) {
            if (input.id === 'name') {
                return 'Name can only contain letters and spaces';
            }
            if (input.id === 'email') {
                return 'Please enter a valid email address (e.g., example@domain.com)';
            }
        }
        
        if (input.validity.tooShort) {
            return `Minimum length is ${input.getAttribute('minlength')} characters`;
        }
        
        if (input.validity.tooLong) {
            return `Maximum length is ${input.getAttribute('maxlength')} characters`;
        }
        
        return input.validationMessage;
    }
    
    // Real-time validation with debouncing
    let validationTimeout;
    
    function debounceValidation(input, errorElement, delay = 500) {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
            validateField(input, errorElement);
        }, delay);
    }
    
    // Initialize form validation
    if (nameInput) {
        const nameError = document.getElementById('nameError');
        
        nameInput.addEventListener('blur', () => {
            validateField(nameInput, nameError);
        });
        
        nameInput.addEventListener('input', () => {
            debounceValidation(nameInput, nameError);
        });
    }
    
    if (emailInput) {
        const emailError = document.getElementById('emailError');
        
        emailInput.addEventListener('blur', () => {
            validateField(emailInput, emailError);
        });
        
        emailInput.addEventListener('input', () => {
            debounceValidation(emailInput, emailError);
        });
    }
    
    if (messageInput) {
        const messageError = document.getElementById('messageError');
        
        messageInput.addEventListener('blur', () => {
            validateField(messageInput, messageError);
        });
        
        messageInput.addEventListener('input', () => {
            debounceValidation(messageInput, messageError);
        });
    }
    
    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const isNameValid = validateField(nameInput, document.getElementById('nameError'));
            const isEmailValid = validateField(emailInput, document.getElementById('emailError'));
            const isMessageValid = validateField(messageInput, document.getElementById('messageError'));
            
            if (isNameValid && isEmailValid && isMessageValid) {
                // Form is valid - simulate submission
                const submitButton = this.querySelector('.submit-button');
                const originalText = submitButton.textContent;
                const originalBgColor = submitButton.style.backgroundColor;
                
                // Show loading state
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                submitButton.classList.add('loading');
                
                // Announce submission start
                announceToScreenReader('Form submission in progress');
                
                // Simulate API call
                setTimeout(() => {
                    // Reset form
                    contactForm.reset();
                    charCount.textContent = '0/500';
                    charCount.classList.remove('warning', 'error');
                    
                    // Clear any error messages
                    document.querySelectorAll('.error-message').forEach(error => {
                        error.textContent = '';
                        error.classList.remove('show');
                    });
                    
                    // Remove validation styles
                    [nameInput, emailInput, messageInput].forEach(input => {
                        input.classList.remove('valid', 'invalid');
                    });
                    
                    // Show success message
                    submitButton.textContent = 'Message Sent! ✓';
                    submitButton.style.backgroundColor = '#4CAF50';
                    submitButton.classList.remove('loading');
                    
                    // Announce success
                    announceToScreenReader('Message sent successfully!');
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        submitButton.style.backgroundColor = originalBgColor;
                        
                        // Move focus to first form field
                        nameInput.focus();
                    }, 3000);
                }, 1500);
            } else {
                // Find first error and scroll to it
                const firstError = document.querySelector('.error-message.show');
                if (firstError) {
                    firstError.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // Focus on the first invalid field
                    const invalidField = firstError.parentElement.querySelector('.form-input, .form-textarea');
                    if (invalidField) {
                        invalidField.focus();
                    }
                }
                
                // Announce validation errors
                announceToScreenReader('Form has validation errors. Please check the highlighted fields.');
            }
        });
    }
    
    // Add smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip the logo link if it just points to #
        if (anchor.getAttribute('href') === '#') return;
        
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                // If on mobile with menu open, close it first
                if (window.innerWidth <= 480 && navMenu && navMenu.classList.contains('active')) {
                    closeMenu();
                    
                    // Wait for menu to close before scrolling
                    setTimeout(() => {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                } else {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
                
                // Announce navigation for screen readers
                const sectionName = targetSection.querySelector('.section-title')?.textContent || 'Section';
                announceToScreenReader(`Navigated to ${sectionName}`);
            }
        });
    });
    
    // Add loading state styles
    const style = document.createElement('style');
    style.textContent = `
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
        
        .loading {
            position: relative;
            pointer-events: none;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: buttonSpinner 0.8s linear infinite;
        }
        
        @keyframes buttonSpinner {
            to {
                transform: rotate(360deg);
            }
        }
        
        /* Focus styles for better accessibility */
        .nav-link:focus,
        .hamburger:focus,
        .form-input:focus,
        .form-textarea:focus,
        .cta-button:focus,
        .social-link:focus {
            outline: 3px solid #FF6565;
            outline-offset: 3px;
        }
        
        /* Skip to main content link */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: #071629;
            color: white;
            padding: 8px 16px;
            z-index: 9999;
            text-decoration: none;
            border-radius: 0 0 4px 0;
            transition: top 0.3s;
        }
        
        .skip-link:focus {
            top: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Add skip to content link for accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    
    // Make main content focusable
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Add form field validation styling
    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', function() {
                const isValid = this.checkValidity();
                const hasValue = this.value.trim() !== '';
                
                this.classList.remove('valid', 'invalid');
                
                if (hasValue) {
                    if (isValid) {
                        this.classList.add('valid');
                    } else {
                        this.classList.add('invalid');
                    }
                }
            });
            
            input.addEventListener('input', function() {
                // Remove validation styling while typing
                this.classList.remove('valid', 'invalid');
            });
        }
    });
    
    // Prevent form submission on Enter key in textarea
    if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                // Allow Ctrl+Enter to add new line
                return;
            }
            
            if (e.key === 'Enter' && this.value.length >= this.getAttribute('maxlength')) {
                e.preventDefault();
                announceToScreenReader('Character limit reached');
            }
        });
    }
    
    // Handle page visibility change (for background tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && navMenu && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Log initialization
    console.log('Headphones website initialized successfully');
});
