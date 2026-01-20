// ============================================
// CONFIGURATION
// ============================================
// REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL
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
// DYNAMIC DROPDOWN UPDATE
// ============================================
function updateApprovedTopicDropdown() {
    const topics = [
        topic1Input.value.trim(),
        topic2Input.value.trim(),
        topic3Input.value.trim(),
        topic4Input.value.trim()
    ].filter(topic => topic !== '');

    const currentValue = approvedTopicSelect.value;
    
    // Clear existing options except the first two
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

    // Restore previous selection if still valid
    if (currentValue && (currentValue === 'None approved yet' || topics.includes(currentValue))) {
        approvedTopicSelect.value = currentValue;
    }
}

// Listen for changes on all topic inputs
topic1Input.addEventListener('input', updateApprovedTopicDropdown);
topic2Input.addEventListener('input', updateApprovedTopicDropdown);
topic3Input.addEventListener('input', updateApprovedTopicDropdown);
topic4Input.addEventListener('input', updateApprovedTopicDropdown);

// ============================================
// MESSAGE DISPLAY
// ============================================
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// ============================================
// FORM VALIDATION
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

    // Validate approved topic matches entered topics
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
// FORM SUBMISSION
// ============================================
async function submitForm() {
    if (!validateForm()) {
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = {
        fullName: fullNameInput.value.trim(),
        rollNumber: rollNumberInput.value.trim(),
        topic1: topic1Input.value.trim(),
        topic2: topic2Input.value.trim(),
        topic3: topic3Input.value.trim(),
        topic4: topic4Input.value.trim(),
        approvedTopic: approvedTopicSelect.value
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Submission successful! Your topics have been recorded.', 'success');
            
            // Reset form
            fullNameInput.value = '';
            rollNumberInput.value = '';
            topic1Input.value = '';
            topic2Input.value = '';
            topic3Input.value = '';
            topic4Input.value = '';
            approvedTopicSelect.value = '';
            confirmationCheckbox.checked = false;
            
            updateApprovedTopicDropdown();
        } else {
            showMessage(result.message || 'Submission failed. Please try again.', 'error');
        }

    } catch (error) {
        console.error('Submission error:', error);
        showMessage('Submission failed. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Topics';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
submitBtn.addEventListener('click', submitForm);

// Allow Enter key to submit (except in textareas)
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        submitForm();
    }
});
