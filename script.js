// Add this to your existing Apps Script code
function doOptions() {
  const output = ContentService.createTextOutput('');
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

// Modify your doGet to handle the Google Forms style submission
function doGet(e) {
  // If there are parameters, treat it as a POST submission
  if (e.parameter && (e.parameter.fullName || e.parameter.callback)) {
    // Handle Google Forms style submission
    const data = {};
    for (const key in e.parameter) {
      if (key !== 'callback') {
        data[key] = e.parameter[key];
      }
    }
    
    const result = saveSubmission(data);
    
    // Handle JSONP callback
    if (e.parameter.callback) {
      const jsonpResponse = `${e.parameter.callback}(${JSON.stringify(result)})`;
      return ContentService.createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Original GET logic for admin
  if (e.parameter.action === 'getData') {
    return getSubmissions();
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid request'
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*');
}
