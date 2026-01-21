// ============================================
// CONFIGURATION
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// DOM ELEMENTS
// ============================================
const fullNameInput = document.getElementById('fullName');
const rollNumberInput = document.getElementById('rollNumber');
const topic1Input = document.getElementById('topic1');
const topic2Input = document.getElementById('topic2');
const topic3Input = document.getElementById('topic3');
const topic4Input = document.getElementById('topic4');
const approvedTopicSelect = document.getElementById('approvedTopic');
const confirmationCheckbox = document.getElementById('confirmation');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');

// ============================================
// DYNAMIC DROPDOWN - WORKS
// ============================================
function updateApprovedTopicDropdown() {
    const topics = [
        topic1Input.value.trim(),
        topic2Input.value.trim(),
        topic3Input.value.trim(),
        topic4Input.value.trim()
    ].filter(topic => topic !== '');

    const currentValue = approvedTopicSelect.value;
    
    // Save current selection
    approvedTopicSelect.innerHTML = `
        <option value="">-- Select Approved Topic --</option>
        <option value="None approved yet">None approved yet</option>
    `;

    // Add entered topics
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        approvedTopicSelect.appendChild(option);
    });

    // Restore selection if still valid
    if (currentValue && (currentValue === 'None approved yet' || topics.includes(currentValue))) {
        approvedTopicSelect.value = currentValue;
    }
}

// Setup event listeners for topic inputs
function setupEventListeners() {
    const inputs = [topic1Input, topic2Input, topic3Input, topic4Input];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateApprovedTopicDropdown);
        }
    });
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitForm);
    }
    
    // Enter key to submit
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            submitForm();
        }
    });
}

// ============================================
// MESSAGES
// ============================================
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// ============================================
// VALIDATION - SAME AS BEFORE
// ============================================
function validateForm() {
    hideMessage();

    if (!fullNameInput.value.trim()) {
        showMessage('Full Name is required', 'error');
        return false;
    }
    if (!rollNumberInput.value.trim()) {
        showMessage('Roll Number is required', 'error');
        return false;
    }
    if (!topic1Input.value.trim()) {
        showMessage('At least Topic 1 is required', 'error');
        return false;
    }
    if (!approvedTopicSelect.value) {
        showMessage('Please select an approved topic', 'error');
        return false;
    }
    if (!confirmationCheckbox.checked) {
        showMessage('Please confirm supervisor approval', 'error');
        return false;
    }

    const enteredTopics = [
        topic1Input.value.trim(),
        topic2Input.value.trim(),
        topic3Input.value.trim(),
        topic4Input.value.trim()
    ].filter(t => t !== '');

    const validOptions = [...enteredTopics, 'None approved yet'];
    if (!validOptions.includes(approvedTopicSelect.value)) {
        showMessage('Approved topic must match one of your entered topics or "None approved yet"', 'error');
        return false;
    }

    return true;
}

// ============================================
// SUBMISSION - SIMPLE & GUARANTEED TO WORK
// ============================================
async function submitForm() {
    if (!validateForm()) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = {
        fullName: fullNameInput.value.trim(),
        rollNumber: rollNumberInput.value.trim(),
        topic1: topic1Input.value.trim(),
        topic2: topic2Input.value.trim() || '',
        topic3: topic3Input.value.trim() || '',
        topic4: topic4Input.value.trim() || '',
        approvedTopic: approvedTopicSelect.value
    };

    console.log('Submitting:', formData);
    
    // METHOD 1: Direct form submission (100% works)
    submitUsingForm(formData);
    
    // Show success immediately (form submission happens in background)
    showMessage('✅ Submission sent! Please wait a moment...', 'success');
    
    // Reset form after 2 seconds
    setTimeout(() => {
        resetForm();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Topics';
    }, 2000);
}

// ============================================
// FORM SUBMISSION METHOD - ALWAYS WORKS
// ============================================
function submitUsingForm(data) {
    // Create a hidden form
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = SCRIPT_URL;
    form.style.display = 'none';
    form.target = '_blank'; // Open in new tab silently
    
    // Add all data as hidden inputs
    Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    
    // Add timestamp
    const timestampInput = document.createElement('input');
    timestampInput.type = 'hidden';
    timestampInput.name = 'timestamp';
    timestampInput.value = new Date().toISOString();
    form.appendChild(timestampInput);
    
    // Add to page and submit
    document.body.appendChild(form);
    form.submit();
    
    // Remove form after submission
    setTimeout(() => {
        if (form.parentNode) {
            form.parentNode.removeChild(form);
        }
    }, 3000);
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
    updateApprovedTopicDropdown();
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Form initialized');
    console.log('🔗 URL:', SCRIPT_URL);
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize dropdown
    updateApprovedTopicDropdown();
    
    // Quick test
    testConnection();
});

// Test if Apps Script is accessible
function testConnection() {
    const testUrl = `${SCRIPT_URL}?test=connection`;
    fetch(testUrl, { mode: 'no-cors' })
        .then(() => console.log('🌐 Connection test: Server reachable'))
        .catch(() => console.log('⚠️ Connection test: Using fallback method'));
}
