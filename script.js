// DOM elements
const bookingForm = document.getElementById('bookingForm');
const bookingsContainer = document.getElementById('bookingsContainer');
const bookingsLoading = document.getElementById('bookingsLoading');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('serviceDate').min = today;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for filters
    searchInput.addEventListener('input', filterBookings);
    statusFilter.addEventListener('change', filterBookings);
});

// Handle form submission with AJAX
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    submitBooking();
});

// Function to submit booking
async function submitBooking() {
    // Get form data
    const formData = new FormData(bookingForm);
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('submit_booking.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showAlert(successAlert);
            
            // Reset form
            bookingForm.reset();
            
            // Reload bookings
            loadBookings();
        } else {
            throw new Error(result.message || 'Failed to submit booking');
        }
    } catch (error) {
        // Show error message
        showError(error.message);
        console.error('Error submitting booking:', error);
    } finally {
        // Reset button state
        submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Service';
        submitBtn.disabled = false;
    }
}

// Function to load bookings via AJAX
async function loadBookings() {
    bookingsLoading.style.display = 'block';
    
    try {
        const response = await fetch('fetch_bookings.php');
        const html = await response.text();
        
        bookingsContainer.innerHTML = html;
    } catch (error) {
        bookingsContainer.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load bookings. Please try again later.</p>
            </div>
        `;
        console.error('Error loading bookings:', error);
    } finally {
        bookingsLoading.style.display = 'none';
    }
}

// Function to filter bookings
function filterBookings() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    
    const bookingCards = bookingsContainer.querySelectorAll('.booking-card');
    
    bookingCards.forEach(card => {
        const customerName = card.querySelector('.booking-customer h4').textContent.toLowerCase();
        const vehicleReg = card.querySelector('.booking-customer p').textContent.toLowerCase();
        const serviceType = card.querySelector('.detail-item:nth-child(1) .detail-value').textContent.toLowerCase();
        const status = card.querySelector('.booking-status').textContent;
        
        const matchesSearch = 
            customerName.includes(searchTerm) ||
            vehicleReg.includes(searchTerm) ||
            serviceType.includes(searchTerm);
        
        const matchesStatus = statusFilterValue === 'all' || status === statusFilterValue;
        
        if (matchesSearch && matchesStatus) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no results message if all cards are hidden
    const visibleCards = Array.from(bookingCards).filter(card => card.style.display !== 'none');
    const noBookingsElement = bookingsContainer.querySelector('.no-bookings');
    
    if (visibleCards.length === 0 && !noBookingsElement) {
        bookingsContainer.innerHTML += `
            <div class="no-bookings">
                <i class="fas fa-search"></i>
                <p>No bookings match your search criteria.</p>
            </div>
        `;
    } else if (visibleCards.length > 0 && noBookingsElement) {
        noBookingsElement.remove();
    }
}

// Function to validate form
function validateForm(formData) {
    const customerName = formData.get('customerName');
    const vehicleReg = formData.get('vehicleReg');
    const serviceType = formData.get('serviceType');
    const serviceDate = formData.get('serviceDate');
    const contactNumber = formData.get('contactNumber');
    const mechanicAssigned = formData.get('mechanicAssigned');
    
    if (!customerName.trim()) {
        showError('Please enter customer name');
        return false;
    }
    
    if (!vehicleReg.trim()) {
        showError('Please enter vehicle registration number');
        return false;
    }
    
    if (!serviceType) {
        showError('Please select service type');
        return false;
    }
    
    if (!serviceDate) {
        showError('Please select service date');
        return false;
    }
    
    // Check if date is in the past
    const selectedDate = new Date(serviceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError('Please select a future date');
        return false;
    }
    
    if (!contactNumber.trim()) {
        showError('Please enter contact number');
        return false;
    }
    
    if (!mechanicAssigned) {
        showError('Please assign a mechanic');
        return false;
    }
    
    return true;
}

// Function to show error
function showError(message) {
    errorMessage.textContent = message;
    showAlert(errorAlert);
}

// Function to show alert
function showAlert(alertElement) {
    // Hide all alerts first
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    
    // Show the specified alert
    alertElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}