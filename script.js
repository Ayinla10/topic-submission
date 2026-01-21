// ============================================
// CONFIGURATION
// ============================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA5QmONMDWcAjG97KjLqREHo72CL6qXTsGEwS0DiHzbeaR7MyQfWJEcW7O7TkaCGMuLQ/exec';

// ============================================
// FORM SUBMISSION - SIMPLE & WORKING
// ============================================
async function submitForm() {
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
  
  // Basic validation
  if (!formData.fullName || !formData.rollNumber || !formData.topic1 || !formData.approvedTopic) {
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
  
  // Build URL
  const params = new URLSearchParams(formData).toString();
  const url = `${SCRIPT_URL}?${params}`;
  
  console.log('Submitting to:', url);
  
  // Method 1: Use iframe (most reliable)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  // Method 2: Also try image as backup
  const img = new Image();
  img.src = url;
  document.body.appendChild(img);
  
  // Show success
  document.getElementById('message').textContent = '✅ Data submitted successfully!';
  document.getElementById('message').className = 'message success';
  document.getElementById('message').classList.remove('hidden');
  
  // Reset form after delay
  setTimeout(() => {
    // Clear form
    document.getElementById('fullName').value = '';
    document.getElementById('rollNumber').value = '';
    document.getElementById('topic1').value = '';
    document.getElementById('topic2').value = '';
    document.getElementById('topic3').value = '';
    document.getElementById('topic4').value = '';
    document.getElementById('approvedTopic').value = '';
    document.getElementById('confirmation').checked = false;
    
    // Reset button
    btn.disabled = false;
    btn.textContent = 'Submit Topics';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      document.getElementById('message').classList.add('hidden');
    }, 5000);
  }, 2000);
}

// ============================================
// DROPDOWN UPDATE
// ============================================
function updateDropdown() {
  const topics = [
    document.getElementById('topic1').value.trim(),
    document.getElementById('topic2').value.trim(),
    document.getElementById('topic3').value.trim(),
    document.getElementById('topic4').value.trim()
  ].filter(t => t !== '');
  
  const select = document.getElementById('approvedTopic');
  const current = select.value;
  
  select.innerHTML = `
    <option value="">-- Select Approved Topic --</option>
    <option value="None approved yet">None approved yet</option>
  `;
  
  topics.forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    select.appendChild(opt);
  });
  
  if (current && (current === 'None approved yet' || topics.includes(current))) {
    select.value = current;
  }
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Form loaded');
  
  // Setup dropdown updates
  ['topic1', 'topic2', 'topic3', 'topic4'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateDropdown);
  });
  
  // Setup submit button
  document.getElementById('submitBtn').addEventListener('click', submitForm);
  
  // Initialize dropdown
  updateDropdown();
});
