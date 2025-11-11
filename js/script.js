// filepath: /Users/sgk/personal-code/personal-website/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize time slots when page loads
    initializeTimeSlots();
    
    // Initialize date restrictions
    initializeDateRestrictions();
    
    // Hamburger menu toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const servicesDropdown = document.querySelector('.services-dropdown');
    const servicesTitle = document.querySelector('.services-title');

    // Make service items clickable
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        // Add pointer cursor to indicate clickability
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking on the service link itself
            if (e.target.classList.contains('service-link')) {
                return;
            }
            
            // Find the service link within this item
            const serviceLink = item.querySelector('.service-link');
            if (serviceLink) {
                const href = serviceLink.getAttribute('href');
                if (href && href !== '#' && !serviceLink.textContent.includes('Coming Soon')) {
                    window.location.href = href;
                }
            }
        });
    });

    // Function to initialize date restrictions
    function initializeDateRestrictions() {
        const dateInput = document.getElementById('preferred-date');
        if (!dateInput) return;

        // Get today's date
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Calculate 14 days from today
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 14);
        const maxDateString = maxDate.toISOString().split('T')[0];

        // Set min and max attributes
        dateInput.setAttribute('min', todayString);
        dateInput.setAttribute('max', maxDateString);

        // Add event listener to validate date selection
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const todayDate = new Date(todayString);
            const maxAllowedDate = new Date(maxDateString);

            if (selectedDate < todayDate) {
                alert('Please select a date starting from today.');
                this.value = '';
                return;
            }

            if (selectedDate > maxAllowedDate) {
                alert('Please select a date within the next 14 days.');
                this.value = '';
                return;
            }
        });
    }

    // Function to populate time slots
    function initializeTimeSlots() {
        const timeSelect = document.getElementById('preferred-time');
        if (!timeSelect) return;

        // Clear existing options except the first one
        timeSelect.innerHTML = '<option value="">Select Available Time Slot</option>';
        
        // Create time slots from 10:30 AM to 4:30 PM in 30-minute intervals
        const slots = generateTimeSlots();
        
        slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.value;
            option.textContent = slot.display;
            timeSelect.appendChild(option);
        });
    }

    // Function to generate time slots
    function generateTimeSlots() {
        const timeSlots = [];
        
        // Start time: 10:30 AM (10.5 hours)
        // End time: 4:30 PM (16.5 hours)
        const startHour = 10.5;
        const endHour = 16.5;
        const intervalMinutes = 30;
        
        for (let hour = startHour; hour <= endHour; hour += 0.5) {
            const wholeHour = Math.floor(hour);
            const minutes = (hour % 1) === 0 ? 0 : 30;
            
            // Format for display (12-hour format)
            const displayHour = wholeHour > 12 ? wholeHour - 12 : wholeHour;
            const period = wholeHour >= 12 ? 'PM' : 'AM';
            const minutesStr = minutes.toString().padStart(2, '0');
            
            // Format for value (24-hour format for easier processing)
            const valueHour = wholeHour.toString().padStart(2, '0');
            
            timeSlots.push({
                value: `${valueHour}:${minutesStr}`,
                display: `${displayHour}:${minutesStr} ${period}`
            });
        }
        
        return timeSlots;
    }

    // Appointment form handling with Email and WhatsApp options
    const appointmentForm = document.getElementById('appointment-form');
    const emailBtn = document.getElementById('email-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    if (appointmentForm && emailBtn && whatsappBtn) {
        // Email button handler
        emailBtn.addEventListener('click', function() {
            if (validateAppointmentForm()) {
                const formData = getAppointmentFormData();
                sendAppointmentEmail(formData);
            }
        });

        // WhatsApp button handler
        whatsappBtn.addEventListener('click', function() {
            if (validateAppointmentForm()) {
                const formData = getAppointmentFormData();
                sendAppointmentWhatsApp(formatAppointmentMessage(formData));
            }
        });
    }

    // Function to validate appointment form
    function validateAppointmentForm() {
        const form = document.getElementById('appointment-form');
        const requiredFields = form.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                alert(`Please fill in the ${field.labels[0].textContent} field.`);
                field.focus();
                return false;
            }
        }

        // Additional date validation
        const dateInput = document.getElementById('preferred-date');
        if (dateInput && dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 14);
            maxDate.setHours(23, 59, 59, 999); // End of day

            if (selectedDate < today) {
                alert('Please select a date starting from today.');
                dateInput.focus();
                return false;
            }

            if (selectedDate > maxDate) {
                alert('Please select a date within the next 14 days.');
                dateInput.focus();
                return false;
            }
        }

        return true;
    }

    // Function to get appointment form data
    function getAppointmentFormData() {
        const formData = new FormData(appointmentForm);
        const dataObject = {};
        
        for (let [key, value] of formData.entries()) {
            dataObject[key] = value;
        }
        
        return dataObject;
    }

    // Function to send appointment email
    function sendAppointmentEmail(formData) {
        const serviceTypes = {
            'psychiatry': 'Psychiatric Consultation',
            'lifestyle': 'Lifestyle Medicine',
            'spiritual': 'Spiritual Wellness',
            'music': 'Music Therapy'
        };

        const serviceName = serviceTypes[formData.type] || formData.type;
        
        // Email subject
        const subject = `Appointment Request - ${serviceName} - ${formData.name}`;
        
        // Email body
        let body = `Dear Dr. Raghu,\n\n`;
        body += `I would like to request an appointment for ${serviceName}.\n\n`;
        body += `Patient Details:\n`;
        body += `Name: ${formData.name}\n`;
        body += `Email: ${formData.email}\n`;
        body += `Phone: ${formData.phone}\n`;
        body += `Service: ${serviceName}\n`;
        body += `Preferred Date: ${formatAppointmentDate(formData.date)}\n`;
        body += `Preferred Time: ${formatAppointmentTime(formData.time)}\n`;
        
        if (formData.message && formData.message.trim()) {
            body += `\nAdditional Information:\n${formData.message}\n`;
        }
        
        body += `\nThank you for your time and consideration.\n\n`;
        body += `Best regards,\n${formData.name}`;

        // Create mailto link
        const emailURL = `mailto:raghukw@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open email client
        window.location.href = emailURL;
        
        // Show confirmation and reset form
        alert('Opening your email client to send the appointment request...');
        appointmentForm.reset();
    }

    // Function to format appointment WhatsApp message
    function formatAppointmentMessage(formData) {
        const serviceTypes = {
            'psychiatry': 'Psychiatric Consultation',
            'lifestyle': 'Lifestyle Medicine',
            'spiritual': 'Spiritual Wellness',
            'music': 'Music Therapy'
        };

        const serviceName = serviceTypes[formData.type] || formData.type;
        
        let message = `*Appointment Request - Dr. Raghu*\n\n`;
        message += `Name: ${formData.name}\n`;
        message += `Email: ${formData.email}\n`;
        message += `Phone: ${formData.phone}\n`;
        message += `Service: ${serviceName}\n`;
        message += `Preferred Date: ${formatAppointmentDate(formData.date)}\n`;
        message += `Preferred Time: ${formatAppointmentTime(formData.time)}\n`;
        
        if (formData.message && formData.message.trim()) {
            message += `\nAdditional Information:\n${formData.message}\n`;
        }
        
        message += `\nThank you for choosing holistic healthcare with Dr. Raghu!`;
        
        return message;
    }

    // Function to format appointment date
    function formatAppointmentDate(dateString) {
        if (!dateString) return 'Not specified';
        
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString('en-US', options);
    }

    // Function to format appointment time
    function formatAppointmentTime(timeString) {
        if (!timeString) return 'Not specified';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const displayHour = hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        
        return `${displayHour}:${minutes} ${period}`;
    }

    // Function to send appointment WhatsApp
    function sendAppointmentWhatsApp(message) {
        const phoneNumber = '9986452879';
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab/window
        window.open(whatsappURL, '_blank');
        
        // Show confirmation and reset form
        alert('Redirecting to WhatsApp to send your appointment request...');
        appointmentForm.reset();
    }

    // Notify form handling for spiritual page
    const notifyForm = document.querySelector('.notify-form');
    if (notifyForm) {
        notifyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = notifyForm.querySelector('input[type="email"]').value;
            
            // Format WhatsApp message for notification signup
            const message = `*Spiritual Wellness Course Notification*\n\n` +
                          `Email: ${email}\n\n` +
                          `Please notify me when spiritual wellness courses are available.\n\n` +
                          `Thank you!`;
            
            // Send to WhatsApp
            const phoneNumber = '9986452879';
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
            
            alert('Thank you! You will be notified when spiritual wellness courses are available.');
            notifyForm.reset();
        });
    }
});