// ============================================
// GOOGLE APPS SCRIPT URL
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// MAIN SUBMIT FUNCTION
// ============================================
function handleSubmit(event) {
    console.log('=== SUBMIT PREVENTED ===');
    
    // CRITICAL: Prevent default form submission
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    // Stop form from submitting normally
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    
    console.log('Now processing form data...');
    
    // Collect data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        topic1: document.getElementById('topic1').value.trim(),
        topic2: document.getElementById('topic2').value.trim() || '',
        topic3: document.getElementById('topic3').value.trim() || '',
        topic4: document.getElementById('topic4').value.trim() || '',
        approvedTopic: document.getElementById('approvedTopic').value || ''
    };
    
    console.log('Form data:', formData);
    
    // Validate
    if (!validateForm(formData)) {
        return false;
    }
    
    // Disable button
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    
    // Build URL
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
        if (value) params.append(key, value);
    }
    
    const submissionUrl = `${SCRIPT_URL}?${params.toString()}`;
    console.log('URL:', submissionUrl);
    
    // SUBMIT WITHOUT OPENING NEW PAGE
    submitSilently(submissionUrl);
    
    // Show success
    showMessage('✅ Submission successful! Check your Google Sheet.', 'success');
    
    // Reset form after delay
    setTimeout(() => {
        resetForm();
        btn.disabled = false;
        btn.textContent = 'Submit Topics';
    }, 2000);
    
    // CRITICAL: Return false to prevent form submission
    return false;
}

// ============================================
// SILENT SUBMISSION (NO PAGE CHANGE)
// ============================================
function submitSilently(url) {
    console.log('Submitting silently to:', url);
    
    // METHOD 1: Create invisible iframe INSIDE current page
    const iframeId = 'hidden-submit-frame-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.name = iframeId;
    iframe.style.cssText = 'width:1px;height:1px;border:none;opacity:0;position:absolute;top:-100px;left:-100px;';
    iframe.sandbox = 'allow-scripts allow-same-origin'; // Important for Google Apps Script
    
    document.body.appendChild(iframe);
    
    // Create a form inside the iframe
    setTimeout(() => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const form = iframeDoc.createElement('form');
            form.method = 'GET';
            form.action = url;
            form.target = iframeId; // Submit to the iframe itself
            
            iframeDoc.body.appendChild(form);
            form.submit();
            
            console.log('Form submitted inside iframe');
        } catch (e) {
            console.log('Iframe method failed, trying image...');
            // Fallback to image
            const img = new Image();
            img.style.display = 'none';
            img.src = url;
            document.body.appendChild(img);
        }
        
        // Clean up after 5 seconds
        setTimeout(() => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        }, 5000);
    }, 100);
}

// ============================================
// VALIDATION
// ============================================
function validateForm(data) {
    // Clear previous messages
    hideMessage();
    
    if (!data.fullName) {
        showMessage('Full Name is required', 'error');
        return false;
    }
    if (!data.rollNumber) {
        showMessage('Roll Number is required', 'error');
        return false;
    }
    if (!data.topic1) {
        showMessage('At least Topic 1 is required', 'error');
        return false;
    }
    if (!data.approvedTopic) {
        showMessage('Please select an approved topic', 'error');
        return false;
    }
    if (!document.getElementById('confirmation').checked) {
        showMessage('Please confirm supervisor approval', 'error');
        return false;
    }
    
    return true;
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
    ].filter(t => t);
    
    const select = document.getElementById('approvedTopic');
    const current = select.value;
    
    select.innerHTML = `
        <option value="">-- Select Approved Topic --</option>
        <option value="None approved yet">None approved yet</option>
    `;
    
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        select.appendChild(option);
    });
    
    if (current && (current === 'None approved yet' || topics.includes(current))) {
        select.value = current;
    }
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================
function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (!msg) return;
    
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(hideMessage, 5000);
    }
}

function hideMessage() {
    const msg = document.getElementById('message');
    if (msg) msg.classList.add('hidden');
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    document.getElementById('fullName').value = '';
    document.getElementById('rollNumber').value = '';
    document.getElementById('topic1').value = '';
    document.getElementById('topic2').value = '';
    document.getElementById('topic3').value = '';
    document.getElementById('topic4').value = '';
    document.getElementById('approvedTopic').value = '';
    document.getElementById('confirmation').checked = false;
    updateApprovedTopicDropdown();
}

// ============================================
// INITIALIZATION - CRITICAL PART
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INITIALIZING FORM ===');
    
    // 1. GET THE FORM ELEMENT
    const form = document.getElementById('studentForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) {
        console.error('FORM NOT FOUND! Make sure your form has id="studentForm"');
        return;
    }
    
    if (!submitBtn) {
        console.error('SUBMIT BUTTON NOT FOUND! Make sure button has id="submitBtn"');
        return;
    }
    
    console.log('Form and button found');
    
    // 2. REMOVE ANY EXISTING EVENT LISTENERS FIRST
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // 3. SET UP NEW FORM SUBMISSION
    const currentForm = document.getElementById('studentForm');
    const currentSubmitBtn = document.getElementById('submitBtn');
    
    // IMPORTANT: Use onclick on button instead of form submit
    currentSubmitBtn.onclick = function(event) {
        console.log('Button clicked, calling handleSubmit');
        handleSubmit(event);
        return false; // Prevent default
    };
    
    // Also prevent Enter key form submission
    currentForm.onkeypress = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            return false;
        }
    };
    
    // 4. SET UP TOPIC INPUT LISTENERS
    ['topic1', 'topic2', 'topic3', 'topic4'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateApprovedTopicDropdown);
            // Also prevent Enter key in inputs
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                }
            });
        }
    });
    
    // 5. INITIALIZE DROPDOWN
    updateApprovedTopicDropdown();
    
    console.log('✅ Form initialized successfully');
    console.log('Test by filling form and clicking Submit button');
});

// ============================================
// MANUAL TEST FUNCTION
// ============================================
window.testFormSubmission = function() {
    console.log('=== RUNNING TEST ===');
    
    // Fill test data
    document.getElementById('fullName').value = 'Test User';
    document.getElementById('rollNumber').value = 'TEST' + Math.floor(Math.random() * 1000);
    document.getElementById('topic1').value = 'Test Project ' + Date.now();
    document.getElementById('approvedTopic').value = 'None approved yet';
    document.getElementById('confirmation').checked = true;
    
    updateApprovedTopicDropdown();
    
    console.log('Test data filled. Click submit button or run:');
    console.log('document.getElementById("submitBtn").click()');
};

// Add this at the VERY END of the file
setTimeout(function() {
    const form = document.getElementById('studentForm');
    if (form && form.tagName === 'DIV') {
        // Convert div to form
        const formElement = document.createElement('form');
        formElement.id = 'studentForm';
        formElement.innerHTML = form.innerHTML;
        formElement.onsubmit = function() { return false; };
        form.parentNode.replaceChild(formElement, form);
        console.log('Converted div to form with onsubmit prevention');
    }
}, 1000);
