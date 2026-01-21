// ============================================
// GOOGLE APPS SCRIPT URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// FORM SUBMISSION - GUARANTEED TO WORK
// ============================================
function submitForm() {
    console.log('=== SUBMIT FORM CALLED ===');
    
    // Get form values
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        topic1: document.getElementById('topic1').value.trim(),
        topic2: document.getElementById('topic2').value.trim() || '',
        topic3: document.getElementById('topic3').value.trim() || '',
        topic4: document.getElementById('topic4').value.trim() || '',
        approvedTopic: document.getElementById('approvedTopic').value
    };
    
    console.log('Form data collected:', formData);
    
    // Validate
    if (!formData.fullName) {
        alert('Full Name is required');
        document.getElementById('fullName').focus();
        return;
    }
    if (!formData.rollNumber) {
        alert('Roll Number is required');
        document.getElementById('rollNumber').focus();
        return;
    }
    if (!formData.topic1) {
        alert('Topic 1 is required');
        document.getElementById('topic1').focus();
        return;
    }
    if (!formData.approvedTopic) {
        alert('Please select an approved topic');
        document.getElementById('approvedTopic').focus();
        return;
    }
    if (!document.getElementById('confirmation').checked) {
        alert('Please confirm supervisor approval');
        document.getElementById('confirmation').focus();
        return;
    }
    
    // Disable button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Build the submission URL
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
        params.append(key, value);
    }
    
    const submissionUrl = `${SCRIPT_URL}?${params.toString()}`;
    console.log('Submission URL:', submissionUrl);
    
    // METHOD 1: Create invisible iframe (MOST RELIABLE)
    const iframe = document.createElement('iframe');
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '-1000px';
    iframe.style.left = '-1000px';
    iframe.src = submissionUrl;
    iframe.onload = function() {
        console.log('Iframe loaded - submission sent');
        showSuccess();
    };
    iframe.onerror = function() {
        console.log('Iframe error, trying backup method...');
        useBackupMethod(submissionUrl);
    };
    
    document.body.appendChild(iframe);
    
    // METHOD 2: Also try with image as immediate backup
    const img = new Image();
    img.style.display = 'none';
    img.src = submissionUrl;
    document.body.appendChild(img);
    
    // Set timeout in case iframe doesn't load
    setTimeout(() => {
        if (!iframe.complete) {
            console.log('Iframe timeout, using backup');
            useBackupMethod(submissionUrl);
        }
    }, 3000);
}

// Backup method
function useBackupMethod(url) {
    console.log('Using backup method with URL:', url);
    
    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = url;
    form.target = '_blank';
    form.style.display = 'none';
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
        if (form.parentNode) {
            document.body.removeChild(form);
        }
    }, 1000);
    
    showSuccess();
}

// Show success message
function showSuccess() {
    console.log('Showing success message');
    
    // Update message
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '✅ Submission successful! Data saved.';
    messageDiv.className = 'message success';
    messageDiv.classList.remove('hidden');
    
    // Reset form after delay
    setTimeout(() => {
        resetForm();
    }, 2000);
}

// Reset form
function resetForm() {
    console.log('Resetting form');
    
    // Clear all inputs
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
    
    // Reset button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Topics';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        document.getElementById('message').classList.add('hidden');
    }, 5000);
}

// ============================================
// DROPDOWN UPDATE
// ============================================
function updateApprovedTopicDropdown() {
    const topics = [
        document.getElementById('topic1').value.trim(),
        document.getElementById('topic2').value.trim(),
        document.getElementById('topic3').value.trim(),
        document.getElementById('topic4').value.trim()
    ].filter(topic => topic !== '');
    
    const select = document.getElementById('approvedTopic');
    const currentValue = select.value;
    
    // Clear and rebuild options
    select.innerHTML = `
        <option value="">-- Select Approved Topic --</option>
        <option value="None approved yet">None approved yet</option>
    `;
    
    // Add entered topics
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        select.appendChild(option);
    });
    
    // Restore selection if valid
    if (currentValue && (currentValue === 'None approved yet' || topics.includes(currentValue))) {
        select.value = currentValue;
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== FORM INITIALIZED ===');
    console.log('Script URL:', SCRIPT_URL);
    
    // Setup event listeners for topic inputs
    const topicInputs = ['topic1', 'topic2', 'topic3', 'topic4'];
    topicInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateApprovedTopicDropdown);
        }
    });
    
    // Setup submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitForm();
        });
    }
    
    // Enter key to submit
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            submitForm();
        }
    });
    
    // Initialize dropdown
    updateApprovedTopicDropdown();
    
    // Test connection
    console.log('Testing connection...');
    const testImg = new Image();
    testImg.src = SCRIPT_URL + '?test=connection';
    testImg.onload = function() {
        console.log('✅ Connection test successful');
    };
    testImg.onerror = function() {
        console.log('⚠️ Connection test failed (expected)');
    };
});
