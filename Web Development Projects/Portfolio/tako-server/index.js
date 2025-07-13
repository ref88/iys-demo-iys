const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Generic data file operations
const readDataFile = async (filename) => {
  try {
    const data = await fs.readFile(
      path.join(DATA_DIR, `${filename}.json`),
      'utf8'
    );
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeDataFile = async (filename, data) => {
  await fs.writeFile(
    path.join(DATA_DIR, `${filename}.json`),
    JSON.stringify(data, null, 2),
    'utf8'
  );
};

// API Routes

// Residents API
app.get('/api/residents', async (req, res) => {
  try {
    const residents = await readDataFile('residents');
    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

app.post('/api/residents', async (req, res) => {
  try {
    const residents = await readDataFile('residents');
    const newResident = {
      id: `r${Date.now()}`,
      ...req.body,
      registrationDate: new Date().toISOString().split('T')[0],
      archived: false,
    };
    residents.push(newResident);
    await writeDataFile('residents', residents);
    res.status(201).json(newResident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resident' });
  }
});

app.put('/api/residents/:id', async (req, res) => {
  try {
    const residents = await readDataFile('residents');
    const index = residents.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    residents[index] = { ...residents[index], ...req.body };
    await writeDataFile('residents', residents);
    res.json(residents[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

app.delete('/api/residents/:id', async (req, res) => {
  try {
    const residents = await readDataFile('residents');
    const filteredResidents = residents.filter((r) => r.id !== req.params.id);
    await writeDataFile('residents', filteredResidents);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});

// Leave Requests API
app.get('/api/leave-requests', async (req, res) => {
  try {
    const requests = await readDataFile('leave_requests');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

app.post('/api/leave-requests', async (req, res) => {
  try {
    const requests = await readDataFile('leave_requests');
    const newRequest = {
      id: `lr${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    requests.push(newRequest);
    await writeDataFile('leave_requests', requests);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const requests = await readDataFile('leave_requests');
    const index = requests.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    requests[index] = { ...requests[index], ...req.body };
    await writeDataFile('leave_requests', requests);
    res.json(requests[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// Incidents API
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await readDataFile('incidents');
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const incidents = await readDataFile('incidents');
    const newIncident = {
      id: `inc${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    incidents.push(newIncident);
    await writeDataFile('incidents', incidents);
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

app.put('/api/incidents/:id', async (req, res) => {
  try {
    const incidents = await readDataFile('incidents');
    const index = incidents.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    incidents[index] = { ...incidents[index], ...req.body };
    await writeDataFile('incidents', incidents);
    res.json(incidents[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Labels API
app.get('/api/labels', async (req, res) => {
  try {
    const labels = await readDataFile('labels');
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

app.post('/api/labels', async (req, res) => {
  try {
    const labels = await readDataFile('labels');
    const newLabel = {
      id: `l${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    labels.push(newLabel);
    await writeDataFile('labels', labels);
    res.status(201).json(newLabel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// Documents API
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await readDataFile('documents');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const documents = await readDataFile('documents');
    const newDocument = {
      id: `doc${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    documents.push(newDocument);
    await writeDataFile('documents', documents);
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Shifts API
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await readDataFile('shifts');
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

app.post('/api/shifts', async (req, res) => {
  try {
    const shifts = await readDataFile('shifts');
    const newShift = {
      id: `shift${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    shifts.push(newShift);
    await writeDataFile('shifts', shifts);
    res.status(201).json(newShift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await readDataFile('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const users = await readDataFile('users');
    const newUser = {
      id: `user${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeDataFile('users', users);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await readDataFile('audit_logs');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const logs = await readDataFile('audit_logs');
    const newLog = {
      id: `log${Date.now()}`,
      ...req.body,
      timestamp: new Date().toISOString(),
    };
    logs.push(newLog);

    // Keep only last 10,000 entries
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }

    await writeDataFile('audit_logs', logs);
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`🚀 TAKO VMS Server running on port ${PORT}`);
    console.log(`📂 Data directory: ${DATA_DIR}`);
    console.log(`🌐 API endpoints available at http://localhost:${PORT}/api/`);
  });
};

startServer().catch(console.error);

module.exports = app;
