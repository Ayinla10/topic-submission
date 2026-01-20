// ============================================
// CONFIGURATION
// ============================================
// REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweMCHLI43XSw4QBrk5x0R38fnxvgTFZLjXIrBJ3xQoDz_47OS7-AvG_uY_ph5lkMMumw/exec';

// CHANGE THIS TO YOUR DESIRED ADMIN PASSWORD
const ADMIN_PASSWORD = 'admin@1012';

// ============================================
// GLOBAL DATA STORAGE
// ============================================
let allData = [];
let filteredData = [];

// ============================================
// AUTHENTICATION
// ============================================
function login() {
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadData();
    } else {
        errorDiv.textContent = 'Incorrect password';
    }
}

// Allow Enter key to login
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});

// ============================================
// DATA LOADING
// ============================================
async function loadData() {
    const loading = document.getElementById('loading');
    const noData = document.getElementById('noData');
    const table = document.getElementById('dataTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getData`);
        const result = await response.json();

        if (result.success) {
            allData = result.data;
            filteredData = allData;
            updateStats();
            renderTable();
            
            loading.style.display = 'none';
            if (allData.length === 0) {
                noData.style.display = 'block';
            } else {
                table.style.display = 'table';
            }
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        loading.textContent = 'Error loading data. Please refresh the page.';
    }
}

function refreshData() {
    loadData();
}

// ============================================
// STATISTICS UPDATE
// ============================================
function updateStats() {
    const total = allData.length;
    const approved = allData.filter(row => row[7] !== 'None approved yet').length;
    const pending = total - approved;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('pendingCount').textContent = pending;
}

// ============================================
// FILTERING
// ============================================
function filterData() {
    const filterValue = document.getElementById('filterSelect').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    filteredData = allData.filter(row => {
        // Filter by approval status
        let statusMatch = true;
        if (filterValue === 'approved') {
            statusMatch = row[7] !== 'None approved yet';
        } else if (filterValue === 'pending') {
            statusMatch = row[7] === 'None approved yet';
        }

        // Filter by search term (name or roll number)
        let searchMatch = true;
        if (searchValue) {
            const name = row[1].toLowerCase();
            const rollNumber = row[2].toLowerCase();
            searchMatch = name.includes(searchValue) || rollNumber.includes(searchValue);
        }

        return statusMatch && searchMatch;
    });

    renderTable();
}

// ============================================
// TABLE RENDERING
// ============================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const noData = document.getElementById('noData');
    const table = document.getElementById('dataTable');

    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        table.style.display = 'none';
        noData.style.display = 'block';
        noData.textContent = 'No submissions match your filters';
        return;
    }

    table.style.display = 'table';
    noData.style.display = 'none';

    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Timestamp
        const tdTimestamp = document.createElement('td');
        tdTimestamp.textContent = row[0];
        tr.appendChild(tdTimestamp);

        // Full Name
        const tdName = document.createElement('td');
        tdName.textContent = row[1];
        tr.appendChild(tdName);

        // Roll Number
        const tdRoll = document.createElement('td');
        tdRoll.textContent = row[2];
        tr.appendChild(tdRoll);

        // Topics 1-4
        for (let i = 3; i <= 6; i++) {
            const td = document.createElement('td');
            td.textContent = row[i] || '-';
            tr.appendChild(td);
        }

        // Approved Topic
        const tdApproved = document.createElement('td');
        tdApproved.textContent = row[7];
        tr.appendChild(tdApproved);

        // Status Badge
        const tdStatus = document.createElement('td');
        const isApproved = row[7] !== 'None approved yet';
        tdStatus.innerHTML = isApproved 
            ? '<span class="approved-badge">Approved</span>' 
            : '<span class="pending-badge">Pending</span>';
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}

// ============================================
// CSV EXPORT
// ============================================
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Timestamp', 'Full Name', 'Roll Number', 'Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Approved Topic', 'Status'];
    
    let csv = headers.join(',') + '\n';

    filteredData.forEach(row => {
        const status = row[7] !== 'None approved yet' ? 'Approved' : 'Pending';
        const rowData = [...row, status].map(cell => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        });
        csv += rowData.join(',') + '\n';
    });

    downloadFile(csv, 'topic_submissions.csv', 'text/csv');
}

// ============================================
// EXCEL EXPORT (CSV format compatible with Excel)
// ============================================
function exportToExcel() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }

    // Create CSV in Excel-compatible format
    const headers = ['Timestamp', 'Full Name', 'Roll Number', 'Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Approved Topic', 'Status'];
    
    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += headers.join(',') + '\n';

    filteredData.forEach(row => {
        const status = row[7] !== 'None approved yet' ? 'Approved' : 'Pending';
        const rowData = [...row, status].map(cell => {
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        });
        csv += rowData.join(',') + '\n';
    });

    downloadFile(csv, 'topic_submissions.xlsx', 'application/vnd.ms-excel');
}

// ============================================
// FILE DOWNLOAD HELPER
// ============================================
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
