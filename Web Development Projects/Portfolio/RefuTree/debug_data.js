// Simple script to check localStorage data
const STORAGE_KEYS = {
  RESIDENTS: 'vms_residents',
  LEAVE_REQUESTS: 'vms_leave_requests',
  DOCUMENTS: 'vms_documents',
  NOTIFICATIONS: 'vms_notifications',
  SHIFTS: 'vms_shifts',
  INCIDENTS: 'vms_incidents',
  LABELS: 'vms_labels',
  AUDIT_LOGS: 'vms_audit_logs',
  USER: 'vms_user'
};

// Mock localStorage for Node.js
const mockLocalStorage = {
  storage: {},
  getItem: function(key) {
    return this.storage[key] || null;
  },
  setItem: function(key, value) {
    this.storage[key] = value;
  },
  removeItem: function(key) {
    delete this.storage[key];
  }
};

// Check what would be in localStorage
console.log('Testing DataService localStorage access...');
console.log('STORAGE_KEYS:', STORAGE_KEYS);

// Since we can't actually access browser localStorage from Node.js,
// let's create a simple HTML file to check localStorage
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Debug Nocto Data</title>
</head>
<body>
    <h1>Nocto Data Debug</h1>
    <script>
        console.log('=== Nocto Data Debug ===');
        
        const STORAGE_KEYS = {
          RESIDENTS: 'vms_residents',
          LEAVE_REQUESTS: 'vms_leave_requests',
          DOCUMENTS: 'vms_documents',
          NOTIFICATIONS: 'vms_notifications',
          SHIFTS: 'vms_shifts',
          INCIDENTS: 'vms_incidents',
          LABELS: 'vms_labels',
          AUDIT_LOGS: 'vms_audit_logs',
          USER: 'vms_user'
        };
        
        Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
            const data = localStorage.getItem(storageKey);
            console.log(key + ':', data ? JSON.parse(data) : 'No data');
        });
        
        // Show specific residents data
        const residents = localStorage.getItem('vms_residents');
        if (residents) {
            const parsed = JSON.parse(residents);
            console.log('Total residents:', parsed.length);
            console.log('CNO residents:', parsed.filter(r => r.locationType === 'CNO').length);
            console.log('OEKRAINE residents:', parsed.filter(r => r.locationType === 'OEKRAINE').length);
        } else {
            console.log('No residents data found in localStorage');
        }
    </script>
</body>
</html>
`;

console.log('HTML debug file created. Open debug.html in browser to check localStorage.');