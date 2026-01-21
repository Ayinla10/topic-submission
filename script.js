// ============================================
// GOOGLE APPS SCRIPT URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// SHOW/HIDE MESSAGES
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
    const topics = ['topic1','topic2','topic3','topic4'].map(id => document.getElementById(id)?.value.trim()).filter(t => t);
    const dropdown = document.getElementById('approvedTopic');
    if (!dropdown) return;

    const current = dropdown.value;
    dropdown.innerHTML = '';

    // Default options
    dropdown.appendChild(new Option('-- Select Approved Topic --',''));
    dropdown.appendChild(new Option('None approved yet','None approved yet'));

    // Add entered topics
    topics.forEach(topic => dropdown.appendChild(new Option(topic, topic)));

    if (current && ['None approved yet', ...topics].includes(current)) dropdown.value = current;
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

    if (!fullName) { showMessage('Please enter your full name','error'); document.getElementById('fullName').focus(); return false; }
    if (!rollNumber) { showMessage('Please enter your roll number','error'); document.getElementById('rollNumber').focus(); return false; }
    if (!topic1) { showMessage('Please enter at least one project topic','error'); document.getElementById('topic1').focus(); return false; }
    if (!approvedTopic) { showMessage('Please select an approved topic','error'); document.getElementById('approvedTopic').focus(); return false; }
    if (!confirmation) { showMessage('Please confirm that you have supervisor approval','error'); document.getElementById('confirmation').focus(); return false; }

    return true;
}

// ============================================
// SUBMIT FORM USING POST
// ============================================
async function submitForm(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

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
            showMessage('✅ Submission successful! Your project topics have been recorded.', 'success');
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

    return false;
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
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    ['topic1','topic2','topic3','topic4'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateApprovedTopicDropdown);
    });

    document.getElementById('studentForm')?.addEventListener('submit', submitForm);
    document.getElementById('submitBtn')?.addEventListener('click', submitForm);

    ['fullName','rollNumber','topic1'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', hideMessage);
    });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateApprovedTopicDropdown();
    document.getElementById('fullName').focus();
});
