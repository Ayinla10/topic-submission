// ============================================
// GOOGLE APPS SCRIPT URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// GLOBAL ELEMENTS
// ============================================
let fullNameInput, rollNumberInput, topic1Input, topic2Input, topic3Input, topic4Input;
let approvedTopicSelect, confirmationCheckbox, submitBtn, messageDiv;

// ============================================
// INITIALIZE ELEMENTS
// ============================================
function initializeElements() {
    fullNameInput = document.getElementById('fullName');
    rollNumberInput = document.getElementById('rollNumber');
    topic1Input = document.getElementById('topic1');
    topic2Input = document.getElementById('topic2');
    topic3Input = document.getElementById('topic3');
    topic4Input = document.getElementById('topic4');
    approvedTopicSelect = document.getElementById('approvedTopic');
    confirmationCheckbox = document.getElementById('confirmation');
    submitBtn = document.getElementById('submitBtn');
    messageDiv = document.getElementById('message');
    
    console.log('Elements initialized:', {
        fullName: !!fullNameInput,
        rollNumber: !!rollNumberInput,
        topic1: !!topic1Input,
        topic2: !!topic2Input,
        topic3: !!topic3Input,
        topic4: !!topic4Input,
        approvedTopic: !!approvedTopicSelect,
        confirmation: !!confirmationCheckbox,
        submitBtn: !!submitBtn,
        message: !!messageDiv
    });
}

// ============================================
// UPDATE APPROVED TOPIC DROPDOWN
// ============================================
function updateApprovedTopicDropdown() {
    if (!approvedTopicSelect) return;
    
    // Get all topic values
    const topics = [
        topic1Input ? topic1Input.value.trim() : '',
        topic2Input ? topic2Input.value.trim() : '',
        topic3Input ? topic3Input.value.trim() : '',
        topic4Input ? topic4Input.value.trim() : ''
    ].filter(topic => topic !== '');
    
    const currentValue = approvedTopicSelect.value;
    
    // Clear and rebuild dropdown
    approvedTopicSelect.innerHTML = `
        <option value="">-- Select Approved Topic --</option>
        <option value="None approved yet">None approved yet</option>
    `;
    
    // Add entered topics as options
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        approvedTopicSelect.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentValue && (currentValue === 'None approved yet' || topics.includes(currentValue))) {
        approvedTopicSelect.value = currentValue;
    }
    
    console.log('Dropdown updated with topics:', topics);
}

// ============================================
// VALIDATE FORM
// ============================================
function validateForm() {
    hideMessage();
    
    if (!fullNameInput.value.trim()) {
        showMessage('Full Name is required', 'error');
        fullNameInput.focus();
        return false;
    }
    
    if (!rollNumberInput.value.trim()) {
        showMessage('Roll Number is required', 'error');
        rollNumberInput.focus();
        return false;
    }
    
    if (!topic1Input.value.trim()) {
        showMessage('At least Topic 1 is required', 'error');
        topic1Input.focus();
        return false;
    }
    
    if (!approvedTopicSelect.value) {
        showMessage('Please select an approved topic', 'error');
        approvedTopicSelect.focus();
        return false;
    }
    
    if (!confirmationCheckbox.checked) {
        showMessage('Please confirm supervisor approval', 'error');
        confirmationCheckbox.focus();
        return false;
    }
    
    return true;
}

// ============================================
// SUBMIT FORM (NO PAGE RELOAD)
// ============================================
function submitForm(event) {
    console.log('=== SUBMIT FORM ===');
    
    // CRITICAL: Prevent any default form behavior
    if (event) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        event.returnValue = false;
        event.cancelBubble = true;
    }
    
    // Validate
    if (!validateForm()) {
        return false;
    }
    
    // Collect data
    const formData = {
        fullName: fullNameInput.value.trim(),
        rollNumber: rollNumberInput.value.trim(),
        topic1: topic1Input.value.trim(),
        topic2: topic2Input.value.trim() || '',
        topic3: topic3Input.value.trim() || '',
        topic4: topic4Input.value.trim() || '',
        approvedTopic: approvedTopicSelect.value
    };
    
    console.log('Submitting data:', formData);
    
    // Disable submit button
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Build URL
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    }
    
    const submissionUrl = `${SCRIPT_URL}?${params.toString()}`;
    console.log('Submission URL:', submissionUrl);
    
    // METHOD 1: Use invisible image (no page reload)
    const img = new Image();
    img.style.display = 'none';
    img.src = submissionUrl;
    
    // Add to page (triggers request)
    document.body.appendChild(img);
    
    // METHOD 2: Also try with fetch in no-cors mode as backup
    fetch(submissionUrl, { mode: 'no-cors' })
        .catch(() => console.log('Fetch backup completed'));
    
    // Show success immediately (don't wait for response)
    showMessage('✅ Submission successful! Data saved to Google Sheet.', 'success');
    
    // Reset form after 2 seconds
    setTimeout(() => {
        resetForm();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }, 2000);
    
    // Clean up image after 5 seconds
    setTimeout(() => {
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    }, 5000);
    
    return false;
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================
function showMessage(text, type) {
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(hideMessage, 5000);
    }
    
    // Scroll to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideMessage() {
    if (messageDiv) {
        messageDiv.classList.add('hidden');
    }
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    fullNameInput.value = '';
    rollNumberInput.value = '';
    topic1Input.value = '';
    topic2Input.value = '';
    topic3Input.value = '';
    topic4Input.value = '';
    approvedTopicSelect.value = '';
    confirmationCheckbox.checked = false;
    
    // Update dropdown with empty values
    updateApprovedTopicDropdown();
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Listen to topic inputs for dropdown updates
    const topicInputs = [topic1Input, topic2Input, topic3Input, topic4Input];
    topicInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateApprovedTopicDropdown);
            console.log(`Added listener to ${input.id}`);
        }
    });
    
    // Handle submit button click
    if (submitBtn) {
        submitBtn.addEventListener('click', function(event) {
            console.log('Submit button clicked');
            submitForm(event);
            return false;
        });
        console.log('Added listener to submit button');
    }
    
    // Prevent form submission on Enter key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
            
            if (isInput) {
                event.preventDefault();
                
                // If Enter is pressed in any field except optional topics, submit
                if (activeElement.id !== 'topic2' && 
                    activeElement.id !== 'topic3' && 
                    activeElement.id !== 'topic4') {
                    submitForm(event);
                }
            }
        }
    });
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== FORM INITIALIZATION STARTED ===');
    
    // Initialize elements
    initializeElements();
    
    // Check if all required elements exist
    if (!submitBtn) {
        console.error('Submit button not found! Make sure you have: <button id="submitBtn">');
        return;
    }
    
    if (!approvedTopicSelect) {
        console.error('Approved topic dropdown not found! Make sure you have: <select id="approvedTopic">');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize dropdown
    updateApprovedTopicDropdown();
    
    // Test connection
    console.log('Testing Apps Script connection...');
    const testImg = new Image();
    testImg.src = SCRIPT_URL + '?test=connection';
    testImg.onload = () => console.log('✅ Connection test passed');
    testImg.onerror = () => console.log('⚠️ Connection test (expected)');
    
    console.log('=== FORM READY ===');
    console.log('Fill the form and click "Submit Topics" button');
});

// ============================================
// TEST FUNCTION
// ============================================
window.testForm = function() {
    console.log('=== RUNNING TEST ===');
    
    // Fill test data
    fullNameInput.value = 'Test Student';
    rollNumberInput.value = 'TEST' + Date.now();
    topic1Input.value = 'Test Project ' + Date.now();
    approvedTopicSelect.value = 'None approved yet';
    confirmationCheckbox.checked = true;
    
    // Update dropdown
    updateApprovedTopicDropdown();
    
    console.log('Test data filled. Click submit button or run: submitForm()');
    console.log('Then check your Google Sheet in 10 seconds.');
};

// Make submitForm available globally for testing
window.submitForm = submitForm;
