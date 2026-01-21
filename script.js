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
    
    // Auto-hide success messages after 5s
    if (type === 'success') {
        setTimeout(() => messageDiv.classList.add('hidden'), 5000);
    }
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    if (messageDiv) messageDiv.classList.add('hidden');
}

// ============================================
// UPDATE APPROVED TOPIC DROPDOWN
// ============================================
function updateApprovedTopicDropdown() {
    const topics = ['topic1','topic2','topic3','topic4']
        .map(id => document.getElementById(id).value.trim())
        .filter(t => t !== '');

    const dropdown = document.getElementById('approvedTopic');
    if (!dropdown) return;

    const currentValue = dropdown.value;
    dropdown.innerHTML = '';

    // Default
    dropdown.innerHTML = '<option value="">-- Select Approved Topic --</option>';
    dropdown.innerHTML += '<option value="None approved yet">None approved yet</option>';

    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        dropdown.appendChild(opt);
    });

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

    if (!fullName) return showMessage('Please enter your full name', 'error'), false;
    if (!rollNumber) return showMessage('Please enter your roll number', 'error'), false;
    if (!topic1) return showMessage('Enter at least one topic', 'error'), false;
    if (!approvedTopic) return showMessage('Select approved topic', 'error'), false;
    if (!confirmation) return showMessage('Confirm supervisor approval', 'error'), false;

    return true;
}

// ============================================
// SUBMIT FORM (POST)
// ============================================
async function submitForm(event) {
    if (event) event.preventDefault();

    if (!validateForm()) return false;

    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        topic1: document.getElementById('topic1').value.trim(),
        topic2: document.getElementById('topic2').value.trim(),
        topic3: document.getElementById('topic3').value.trim(),
        topic4: document.getElementById('topic4').value.trim(),
        approvedTopic: document.getElementById('approvedTopic').value
    };

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    submitBtn.style.opacity = '0.7';

    showMessage('⏳ Processing your submission...', 'info');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ Submission successful!', 'success');
            resetForm();
        } else {
            showMessage('❌ Submission failed: ' + result.message, 'error');
        }

    } catch (err) {
        showMessage('❌ Submission error: ' + err.toString(), 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
    }
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    ['fullName','rollNumber','topic1','topic2','topic3','topic4'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('approvedTopic').value = '';
    document.getElementById('confirmation').checked = false;
    updateApprovedTopicDropdown();
    document.getElementById('fullName').focus();
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    ['topic1','topic2','topic3','topic4'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', updateApprovedTopicDropdown);
    });

    const form = document.getElementById('studentForm');
    const submitBtn = document.getElementById('submitBtn');
    if (form) form.addEventListener('submit', submitForm);
    if (submitBtn) submitBtn.addEventListener('click', submitForm);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Form ready');
    setupEventListeners();
    updateApprovedTopicDropdown();
    document.getElementById('fullName').focus();
});
