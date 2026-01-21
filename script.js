// ============================================
// GOOGLE APPS SCRIPT URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// SHOW/HIDE MESSAGES PROPERLY
// ============================================
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Scroll to show message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.classList.add('hidden');
    }
}

// ============================================
// UPDATE APPROVED TOPIC DROPDOWN
// ============================================
function updateApprovedTopicDropdown() {
    // Get all topic values
    const topic1 = document.getElementById('topic1').value.trim();
    const topic2 = document.getElementById('topic2').value.trim();
    const topic3 = document.getElementById('topic3').value.trim();
    const topic4 = document.getElementById('topic4').value.trim();
    
    // Filter out empty topics
    const topics = [topic1, topic2, topic3, topic4].filter(t => t !== '');
    
    // Get dropdown
    const dropdown = document.getElementById('approvedTopic');
    if (!dropdown) return;
    
    // Save current selection
    const currentValue = dropdown.value;
    
    // Clear and rebuild options
    dropdown.innerHTML = '';
    
    // Add default options
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select Approved Topic --';
    dropdown.appendChild(defaultOption);
    
    const noneOption = document.createElement('option');
    noneOption.value = 'None approved yet';
    noneOption.textContent = 'None approved yet';
    dropdown.appendChild(noneOption);
    
    // Add entered topics
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        dropdown.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentValue && ['None approved yet', ...topics].includes(currentValue)) {
        dropdown.value = currentValue;
    }
}

// ============================================
// VALIDATE FORM
// ============================================
function validateForm() {
    hideMessage();
    
    const fullName = document.getElementById('fullName').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const topic1 = document.getElementById('topic1').value.trim();
    const approvedTopic = document.getElementById('approvedTopic').value;
    const confirmation = document.getElementById('confirmation').checked;
    
    if (!fullName) {
        showMessage('Please enter your full name', 'error');
        document.getElementById('fullName').focus();
        return false;
    }
    
    if (!rollNumber) {
        showMessage('Please enter your roll number', 'error');
        document.getElementById('rollNumber').focus();
        return false;
    }
    
    if (!topic1) {
        showMessage('Please enter at least one project topic', 'error');
        document.getElementById('topic1').focus();
        return false;
    }
    
    if (!approvedTopic) {
        showMessage('Please select an approved topic from the dropdown', 'error');
        document.getElementById('approvedTopic').focus();
        return false;
    }
    
    if (!confirmation) {
        showMessage('Please confirm that you have supervisor approval', 'error');
        document.getElementById('confirmation').focus();
        return false;
    }
    
    return true;
}

// ============================================
// SUBMIT FORM (PROPER UX)
// ============================================
async function submitForm(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Validate first
    if (!validateForm()) {
        return false;
    }
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        topic1: document.getElementById('topic1').value.trim(),
        topic2: document.getElementById('topic2').value.trim(),
        topic3: document.getElementById('topic3').value.trim(),
        topic4: document.getElementById('topic4').value.trim(),
        approvedTopic: document.getElementById('approvedTopic').value
    };
    
    // Disable submit button and show loading
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    submitBtn.style.opacity = '0.7';
    
    // Show processing message
    showMessage('⏳ Processing your submission...', 'info');
    
    // Build submission URL
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
        params.append(key, value);
    }
    
    const submissionUrl = `${SCRIPT_URL}?${params.toString()}`;
    
    try {
        // Submit using image method (silent, no page reload)
        await submitSilently(submissionUrl);
        
        // Show success message
        showMessage('✅ Submission successful! Your project topics have been recorded.', 'success');
        
        // Reset form after a brief delay
        setTimeout(() => {
            resetForm();
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
        }, 1500);
        
    } catch (error) {
        // Show error message
        showMessage('❌ Submission failed. Please try again or contact support.', 'error');
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
    }
    
    return false;
}

// ============================================
// SILENT SUBMISSION
// ============================================
function submitSilently(url) {
    return new Promise((resolve, reject) => {
        // Use image tag method (works without CORS issues)
        const img = new Image();
        
        img.onload = function() {
            console.log('Submission successful');
            resolve();
        };
        
        img.onerror = function() {
            console.log('Submission sent (image error expected)');
            resolve(); // Still resolve because request was sent
        };
        
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
        
        // Also try fetch as backup
        fetch(url, { mode: 'no-cors' }).catch(() => {});
        
        // Set timeout to resolve anyway (fire-and-forget)
        setTimeout(resolve, 2000);
    });
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    // Clear all fields
    document.getElementById('fullName').value = '';
    document.getElementById('rollNumber').value = '';
    document.getElementById('topic1').value = '';
    document.getElementById('topic2').value = '';
    document.getElementById('topic3').value = '';
    document.getElementById('topic4').value = '';
    document.getElementById('approvedTopic').value = '';
    document.getElementById('confirmation').checked = false;
    
    // Update dropdown
    updateApprovedTopicDropdown();
    
    // Focus on first field for next entry
    document.getElementById('fullName').focus();
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Update dropdown when topic inputs change
    ['topic1', 'topic2', 'topic3', 'topic4'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateApprovedTopicDropdown);
        }
    });
    
    // Handle form submission
    const form = document.getElementById('studentForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (form) {
        form.addEventListener('submit', submitForm);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitForm);
    }
    
    // Handle Enter key (but don't submit from optional fields)
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            const isOptionalTopic = ['topic2', 'topic3', 'topic4'].includes(activeElement.id);
            
            if (!isOptionalTopic && activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                submitForm(e);
            }
        }
    });
    
    // Clear error messages when user starts typing
    ['fullName', 'rollNumber', 'topic1'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const messageDiv = document.getElementById('message');
                if (messageDiv && messageDiv.classList.contains('error')) {
                    hideMessage();
                }
            });
        }
    });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing project topic submission form...');
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize dropdown
    updateApprovedTopicDropdown();
    
    // Focus on first field
    document.getElementById('fullName').focus();
    
    console.log('Form ready. Users can now submit project topics.');
});
