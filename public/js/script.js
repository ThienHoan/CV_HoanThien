// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('theme-light');
            const isLight = document.body.classList.contains('theme-light');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // Contact form functionality
    const contactForm = document.getElementById('contactForm');
    const messageDiv = document.getElementById('message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        
        // Add Bootstrap validation
        contactForm.addEventListener('submit', function(event) {
            if (!contactForm.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            contactForm.classList.add('was-validated');
        });
    }
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });

    // Download CV button -> trigger print to PDF
    const downloadCvBtn = document.getElementById('downloadCvBtn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', () => {
            window.print();
        });
    }
});

// Handle contact form submission with Bootstrap styling
async function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');
    
    // Get form data
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        content: formData.get('content')
    };
    
    try {
        // Show loading state with Bootstrap spinner
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Đang gửi...
        `;
        submitButton.classList.add('btn-loading');
        
        // Send request
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        // Show message with Bootstrap alert classes
        showBootstrapMessage(result.message, result.success ? 'success' : 'danger');
        
        // Reset form if successful
        if (result.success) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showBootstrapMessage('Đã xảy ra lỗi khi gửi form. Vui lòng thử lại.', 'danger');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-send"></i> Gửi Liên Hệ';
        submitButton.classList.remove('btn-loading');
    }
}

// Show message function with Bootstrap styling
function showBootstrapMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `alert alert-${type} message-fade`;
        messageDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                ${message}
            </div>
        `;
        messageDiv.classList.remove('d-none');
        
        // Add fade in animation
        setTimeout(() => {
            messageDiv.classList.add('fade-in');
        }, 10);
        
        // Auto hide message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hide');
            setTimeout(() => {
                messageDiv.classList.add('d-none');
                messageDiv.classList.remove('hide', 'fade-in');
            }, 300);
        }, 5000);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Add Bootstrap interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add focus effects to form controls
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        control.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Initialize Bootstrap tooltips if any
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Utility function for email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add real-time validation with Bootstrap styling
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const contentInput = document.getElementById('content');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });

        emailInput.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && validateEmail(this.value)) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
    
    if (contentInput) {
        const maxChars = 500;
        
        // Create character counter
        const counterDiv = document.createElement('div');
        counterDiv.className = 'form-text text-end';
        counterDiv.id = 'charCounter';
        contentInput.parentNode.appendChild(counterDiv);
        
        function updateCounter() {
            const charCount = contentInput.value.length;
            counterDiv.textContent = `${charCount}/${maxChars} ký tự`;
            
            if (charCount > maxChars) {
                contentInput.value = contentInput.value.substring(0, maxChars);
                counterDiv.textContent = `${maxChars}/${maxChars} ký tự`;
                counterDiv.className = 'form-text text-end text-danger';
            } else if (charCount > maxChars * 0.8) {
                counterDiv.className = 'form-text text-end text-warning';
            } else {
                counterDiv.className = 'form-text text-end text-muted';
            }
        }
        
        contentInput.addEventListener('input', updateCounter);
        updateCounter(); // Initialize counter
    }
});

// Add loading animation for page transitions
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in effect to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
});
