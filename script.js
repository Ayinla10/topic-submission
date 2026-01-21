// ULTRA SIMPLE VERSION
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// Update dropdown when topics change
document.getElementById('topic1').oninput = updateDropdown;
document.getElementById('topic2').oninput = updateDropdown;
document.getElementById('topic3').oninput = updateDropdown;
document.getElementById('topic4').oninput = updateDropdown;

// Submit button
document.getElementById('submitBtn').onclick = submitForm;

function updateDropdown() {
    // Get all topic values
    const topics = [
        document.getElementById('topic1').value.trim(),
        document.getElementById('topic2').value.trim(),
        document.getElementById('topic3').value.trim(),
        document.getElementById('topic4').value.trim()
    ].filter(t => t);
    
    // Get dropdown
    const select = document.getElementById('approvedTopic');
    const current = select.value;
    
    // Clear and rebuild
    select.innerHTML = '<option value="">-- Select --</option><option value="None approved yet">None approved yet</option>';
    
    // Add topics
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
    
    // Keep selection if still valid
    if (current && ['None approved yet', ...topics].includes(current)) {
        select.value = current;
    }
}

function submitForm() {
    // Get values
    const data = {
        fullName: document.getElementById('fullName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        topic1: document.getElementById('topic1').value.trim(),
        topic2: document.getElementById('topic2').value.trim(),
        topic3: document.getElementById('topic3').value.trim(),
        topic4: document.getElementById('topic4').value.trim(),
        approvedTopic: document.getElementById('approvedTopic').value
    };
    
    // Simple validation
    if (!data.fullName || !data.rollNumber || !data.topic1 || !data.approvedTopic) {
        alert('Please fill all required fields');
        return;
    }
    if (!document.getElementById('confirmation').checked) {
        alert('Please confirm supervisor approval');
        return;
    }
    
    // Disable button
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    
    // Build URL and submit
    const params = new URLSearchParams(data);
    const url = SCRIPT_URL + '?' + params.toString();
    
    // Use image to submit (no page reload)
    const img = new Image();
    img.src = url;
    document.body.appendChild(img);
    
    // Show success
    alert('✅ Submitted successfully! Check Google Sheet.');
    
    // Reset form
    document.getElementById('fullName').value = '';
    document.getElementById('rollNumber').value = '';
    document.getElementById('topic1').value = '';
    document.getElementById('topic2').value = '';
    document.getElementById('topic3').value = '';
    document.getElementById('topic4').value = '';
    document.getElementById('approvedTopic').value = '';
    document.getElementById('confirmation').checked = false;
    
    // Update dropdown
    updateDropdown();
    
    // Reset button
    btn.disabled = false;
    btn.textContent = 'Submit Topics';
}

// Initialize dropdown
updateDropdown();
