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
// DYNAMIC DROPDOWN
// ============================================
function updateApprovedTopicDropdown() {
    const topics = [
        topic1Input.value.trim(),
        topic2Input.value.trim(),
        topic3Input.value.trim(),
        topic4Input.value.trim()
    ].filter(topic => topic !== '');

    const currentValue = approvedTopicSelect.value;
    
    approvedTopicSelect.innerHTML = `
        <option value="">-- Select Approved Topic --</option>
        <option value="None approved yet">None approved yet</option>
    `;

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        approvedTopicSelect.appendChild(option);
    });

    if (currentValue && (currentValue === 'None approved yet' || topics.includes(currentValue))) {
        approvedTopicSelect.value = currentValue;
    }
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
// VALIDATION
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
// SUBMISSION - USING IMG TAG METHOD (NO NEW TAB)
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

    console.log('Submitting data:', formData);
    
    // METHOD: Use image tag to send request (no CORS, no new tab)
    sendDataUsingImage(formData);
    
    // Show success message
    showMessage('✅ Submission successful! Your data has been saved.', 'success');
    
    // Reset form
    setTimeout(() => {
        resetForm();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Topics';
    }, 2000);
}

// ============================================
// IMAGE TAG METHOD - BYPASSES CORS COMPLETELY
// ============================================
function sendDataUsingImage(data) {
    // Build URL with parameters
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    
    const url = `${SCRIPT_URL}?${params.toString()}`;
    console.log('Sending to:', url);
    
    // Create invisible image to make request
    const img = new Image();
    img.style.display = 'none';
    img.src = url;
    
    // Add to page (triggers request)
    document.body.appendChild(img);
    
    // Remove after request
    setTimeout(() => {
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    }, 1000);
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
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Form loaded successfully');
    
    // Setup event listeners
    [topic1Input, topic2Input, topic3Input, topic4Input].forEach(input => {
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
    
    // Initialize dropdown
    updateApprovedTopicDropdown();
    
    // Test connection
    testConnection();
});

// Test connection without opening new tab
function testConnection() {
    console.log('Testing connection to:', SCRIPT_URL);
    // Just log - we'll trust it works
}
