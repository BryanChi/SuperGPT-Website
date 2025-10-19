// SuperGPT Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initScrollAnimations();
    initVideoControls();
    initVideoAutoplay();
    initSmoothScrolling();
    initNavbarScroll();
    initInteractiveElements();
    initLoadingStates();
});

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Hero section animations
    const heroElements = document.querySelectorAll('.hero-title, .hero-description, .hero-buttons, .hero-visual');
    heroElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(el);
    });
}

// Video Controls
function initVideoControls() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        const container = video.closest('.feature-video, .demo-video');
        const overlay = container?.querySelector('.video-overlay');
        const controls = container?.querySelector('.video-controls');
        const progressBar = container?.querySelector('.video-progress-bar');
        const progressFilled = container?.querySelector('.video-progress-filled');
        const progressHandle = container?.querySelector('.video-progress-handle');
        const currentTimeEl = container?.querySelector('.current-time');
        const durationEl = container?.querySelector('.duration');
        
        // Format time helper function
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        // Update progress bar
        const updateProgress = () => {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                progressFilled.style.width = `${progress}%`;
                progressHandle.style.left = `${progress}%`;
                currentTimeEl.textContent = formatTime(video.currentTime);
            }
        };
        
        // Update duration when metadata is loaded
        const updateDuration = () => {
            if (video.duration) {
                durationEl.textContent = formatTime(video.duration);
            }
        };
        
        // Seek to position on progress bar click
        const seekToPosition = (event) => {
            if (!video.duration) return;
            
            const rect = progressBar.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * video.duration;
            
            video.currentTime = newTime;
        };
        
        // Event listeners
        if (overlay) {
            // Click overlay to play/pause video
            overlay.addEventListener('click', () => {
                if (video.paused) {
                    video.play().then(() => {
                        overlay.style.opacity = '0';
                    }).catch(error => {
                        console.log('Play failed:', error);
                    });
                } else {
                    video.pause();
                    overlay.style.opacity = '1';
                }
            });
            
            // Show overlay when video is paused (but not for autoplay)
            video.addEventListener('pause', () => {
                // Only show overlay if video was manually paused
                if (!video.dataset.autoplayPaused) {
                    overlay.style.opacity = '1';
                }
            });
            
            // Hide overlay when video is playing
            video.addEventListener('play', () => {
                overlay.style.opacity = '0';
                video.dataset.autoplayPaused = 'false';
            });
            
            // Show overlay when video ends
            video.addEventListener('ended', () => {
                overlay.style.opacity = '1';
            });
        }
        
        // Progress bar interactions
        if (progressBar) {
            progressBar.addEventListener('click', seekToPosition);
            
            // Drag functionality for progress handle
            let isDragging = false;
            
            progressHandle.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging && video.duration) {
                    const rect = progressBar.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
                    const newTime = percentage * video.duration;
                    
                    video.currentTime = newTime;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
        
        // Video event listeners
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('durationchange', updateDuration);
        
        // Add loading state
        video.addEventListener('loadstart', () => {
            container?.classList.add('loading');
        });
        
        video.addEventListener('canplay', () => {
            container?.classList.remove('loading');
        });
        
        // Initialize duration if already loaded
        if (video.readyState >= 1) {
            updateDuration();
        }
    });
}

// Video Autoplay on Scroll
function initVideoAutoplay() {
    const videos = document.querySelectorAll('video');
    
    // Intersection Observer options
    const observerOptions = {
        threshold: 0.5, // Trigger when 50% of video is visible
        rootMargin: '0px 0px -10% 0px' // Start playing slightly before fully in view
    };
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const container = video.closest('.feature-video, .demo-video');
            const overlay = container?.querySelector('.video-overlay');
            
            if (entry.isIntersecting) {
                // Video is in view - try to play
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Video started playing successfully
                        if (overlay) {
                            overlay.style.opacity = '0';
                        }
                    }).catch(error => {
                        // Autoplay failed (likely due to browser policy)
                        console.log('Autoplay prevented:', error);
                        // Keep overlay visible for manual play
                        if (overlay) {
                            overlay.style.opacity = '1';
                        }
                    });
                }
            } else {
                // Video is out of view - pause it
                video.dataset.autoplayPaused = 'true';
                video.pause();
                if (overlay) {
                    overlay.style.opacity = '1';
                }
            }
        });
    }, observerOptions);
    
    // Observe all videos
    videos.forEach(video => {
        videoObserver.observe(video);
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effects
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background when scrolled
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Interactive Elements
function initInteractiveElements() {
    // Feature card hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.primary-button, .secondary-button, .pricing-button, .download-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
    
    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (element.textContent.includes('K')) {
                element.textContent = Math.floor(current) + 'K+';
            } else if (element.textContent.includes('★')) {
                element.textContent = Math.floor(current * 10) / 10 + '★';
            } else if (element.textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            }
        }, 16);
    };
    
    // Trigger counter animation when stats come into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                if (text.includes('K')) {
                    animateCounter(entry.target, 10);
                } else if (text.includes('★')) {
                    animateCounter(entry.target, 4.9);
                } else if (text.includes('%')) {
                    animateCounter(entry.target, 100);
                }
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Loading States
function initLoadingStates() {
    // Simulate loading for demo purposes
    const loadingElements = document.querySelectorAll('.loading');
    
    loadingElements.forEach(element => {
        setTimeout(() => {
            element.classList.remove('loading');
        }, Math.random() * 2000 + 1000);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Landing page error:', e.error);
});

// Performance Monitoring
window.addEventListener('load', () => {
    // Log page load time
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    
    // Remove loading states
    document.body.classList.remove('loading');
});

// Mobile Menu Toggle (if needed)
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            }
        });
    }
}

// Form Handling (if forms are added)
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Add form submission logic here
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Form submitted:', data);
            
            // Show success message
            showNotification('Form submitted successfully!', 'success');
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // ESC key closes any open modals or menus
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.active');
        openModals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Accessibility Improvements
function initAccessibility() {
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #3b82f6';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
    
    // Add ARIA labels where needed
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (!video.getAttribute('aria-label')) {
            video.setAttribute('aria-label', 'Feature demonstration video');
        }
    });
}

// Initialize accessibility features
initAccessibility();

// Export functions for external use
window.ChatGPTEnhancerLanding = {
    showNotification,
    debounce,
    throttle
};
