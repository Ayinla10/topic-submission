// ============================================
// CONFIGURATION
// ============================================
// Your Google Apps Script URL
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

// ============================================
// MESSAGE DISPLAY
// ============================================
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
    
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
// FORM SUBMISSION (CORS WORKAROUND)
// ============================================
async function submitForm() {
    console.log('Submit function called');
    
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
        topic2: topic2Input.value.trim() || '',
        topic3: topic3Input.value.trim() || '',
        topic4: topic4Input.value.trim() || '',
        approvedTopic: approvedTopicSelect.value
    };

    console.log('Submitting data:', formData);

    // METHOD 1: Try direct fetch first
    try {
        console.log('Trying direct fetch...');
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response received, status:', response.status);
        const result = await response.json();
        console.log('Result:', result);

        if (result.success) {
            showMessage(result.message || 'Submission successful!', 'success');
            resetForm();
        } else {
            showMessage(result.message || 'Submission failed. Please try again.', 'error');
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Topics';
        return;
        
    } catch (error) {
        console.log('Direct fetch failed, trying CORS workaround...', error);
    }

    // METHOD 2: Google Forms style submission (GET with parameters)
    try {
        console.log('Trying Google Forms style submission...');
        
        // Convert to URL parameters
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(formData)) {
            params.append(key, value);
        }
        
        // Add timestamp
        params.append('timestamp', new Date().toISOString());
        
        // Use GET with parameters (Google Forms style)
        const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        console.log('Google Forms style submission sent');
        showMessage('Submission sent! Please check your Google Sheet to confirm.', 'success');
        resetForm();
        
    } catch (error) {
        console.log('Google Forms style failed, trying alternative method...', error);
        
        // METHOD 3: Form submission workaround
        try {
            submitWithFormWorkaround(formData);
            showMessage('Submission sent! If you see a new tab, close it and continue.', 'success');
            resetForm();
        } catch (workaroundError) {
            console.error('All methods failed:', workaroundError);
            
            // METHOD 4: Show data for manual entry
            showManualEntryMessage(formData);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Topics';
    }
}

// Form submission workaround (opens new tab/window)
function submitWithFormWorkaround(data) {
    // Create a form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = SCRIPT_URL;
    form.target = '_blank'; // Open in new tab
    form.style.display = 'none';
    
    // Add all data as hidden inputs
    for (const [key, value] of Object.entries(data)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }
    
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
        if (document.body.contains(form)) {
            document.body.removeChild(form);
        }
    }, 3000);
}

// Show manual entry option
function showManualEntryMessage(data) {
    const message = 
        `Due to browser restrictions, automatic submission failed.\n\n` +
        `Please copy this information and submit it manually:\n\n` +
        `📝 **Student Information:**\n` +
        `• Full Name: ${data.fullName}\n` +
        `• Roll Number: ${data.rollNumber}\n\n` +
        `🎯 **Project Topics:**\n` +
        `1. ${data.topic1}\n` +
        `${data.topic2 ? `2. ${data.topic2}\n` : ''}` +
        `${data.topic3 ? `3. ${data.topic3}\n` : ''}` +
        `${data.topic4 ? `4. ${data.topic4}\n` : ''}` +
        `\n✅ **Approved Topic:** ${data.approvedTopic}\n\n` +
        `Please save this information and contact your supervisor.`;
    
    showMessage(message, 'error');
    
    // Also log to console for easy copying
    console.log('=== MANUAL ENTRY REQUIRED ===');
    console.log('Full Name:', data.fullName);
    console.log('Roll Number:', data.rollNumber);
    console.log('Topic 1:', data.topic1);
    console.log('Topic 2:', data.topic2);
    console.log('Topic 3:', data.topic3);
    console.log('Topic 4:', data.topic4);
    console.log('Approved Topic:', data.approvedTopic);
    console.log('===========================');
}

// Reset form
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
// EVENT LISTENERS
// ============================================
if (submitBtn) {
    submitBtn.addEventListener('click', submitForm);
}

// Listen for changes on all topic inputs to update dropdown
[topic1Input, topic2Input, topic3Input, topic4Input].forEach(input => {
    if (input) {
        input.addEventListener('input', updateApprovedTopicDropdown);
    }
});

// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        
        // Don't submit if focused on optional fields
        const focusedId = document.activeElement.id;
        if (['topic2', 'topic3', 'topic4'].includes(focusedId)) {
            return; // Let user press Enter in optional fields
        }
        
        submitForm();
    }
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Student form loaded');
    console.log('Script URL:', SCRIPT_URL);
    
    // Initialize the dropdown
    updateApprovedTopicDropdown();
    
    // Test connection (optional)
    testConnection();
});

// Test connection to Apps Script (optional)
async function testConnection() {
    try {
        console.log('Testing connection to Apps Script...');
        
        // Try GET request
        const response = await fetch(`${SCRIPT_URL}?action=getData`);
        if (response.ok) {
            const text = await response.text();
            console.log('Connection test response:', text);
        }
    } catch (error) {
        console.warn('Connection test failed (expected for CORS):', error.message);
    }
}
