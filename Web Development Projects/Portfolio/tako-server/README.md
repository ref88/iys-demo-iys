# 🍳 TAKO VMS Server - The Kitchen

## 🏗️ What This Is (Restaurant Analogy)

Think of this as the **kitchen** of a restaurant:
- **Where all the cooking happens** - Data processing and business logic
- **Receives orders** from waiters (API requests from client)
- **Prepares food** (processes data, manages database)
- **Sends meals back** (returns JSON responses)
- **Hidden from customers** - Runs behind the scenes

## 🚀 Quick Start

```bash
# Install kitchen equipment (dependencies)
npm install

# Start the kitchen (development mode)
npm run dev

# Health check (is the kitchen running?)
npm run health
```

## 🔧 How It Works

### The Order Processing System
```javascript
// Waiter brings order from dining room
app.get('/api/residents', async (req, res) => {
  // Chef prepares the data
  const residents = await readDataFile('residents');
  // Send meal back to dining room
  res.json(residents);
});
```

### Kitchen Stations (API Endpoints)
- **`/api/residents`** - Customer database management
- **`/api/leave-requests`** - Vacation request processing  
- **`/api/incidents`** - Incident report handling
- **`/api/labels`** - Category management
- **`/api/health`** - Kitchen status check

## 📁 Kitchen Layout (Directory Structure)

```
.
├── index.js             # Head chef (main server file)
├── data/                # Pantry (data storage)
│   ├── residents.json   # Customer records
│   └── incidents.json   # Incident reports
├── package.json         # Kitchen equipment list
├── .env.development     # Kitchen settings (development)
└── .env.production      # Kitchen settings (production)
```

## 🛠️ Kitchen Commands

```bash
npm run dev          # Start kitchen with hot reloading
npm run start        # Start production kitchen
npm run dev:env      # Start with development environment
npm run start:prod   # Start with production environment
npm run test         # Quality control tests
npm run health       # Check if kitchen is operational
```

## 🌐 Environment Setup

### Development Kitchen (.env.development)
```bash
PORT=3001                          # Kitchen operates on port 3001
NODE_ENV=development               # Development mode
CLIENT_URL=http://localhost:3000   # Where the dining room is located
```

### Production Kitchen (.env.production)
```bash
PORT=3001                       # Production port
NODE_ENV=production             # Production optimizations
CLIENT_URL=https://yourdomain.com  # Production dining room
```

## 🔐 Security Features

### Kitchen Safety Measures
- **CORS Protection** - Only allows orders from authorized dining rooms
- **Helmet Security** - Protects against common attacks
- **Request Limits** - Prevents kitchen overload (50mb limit)
- **Environment Variables** - Keeps secrets safe

### Request Logging
Every order is logged with details:
- What was ordered (endpoint)
- When it was ordered (timestamp)
- Who ordered it (IP address)
- How long it took to prepare

## 📊 API Documentation

### Residents Management (Customer Database)
```bash
GET    /api/residents           # Get all customer records
POST   /api/residents           # Add new customer
PUT    /api/residents/:id       # Update customer info
DELETE /api/residents/:id       # Remove customer
```

### Leave Requests (Vacation Processing)
```bash
GET    /api/leave-requests      # Get all vacation requests
POST   /api/leave-requests      # Submit new request
PUT    /api/leave-requests/:id  # Update request status
```

### Incidents (Problem Reports)
```bash
GET    /api/incidents           # Get all incident reports
POST   /api/incidents           # File new incident
PUT    /api/incidents/:id       # Update incident
```

### Health Check (Kitchen Status)
```bash
GET    /api/health              # Returns kitchen operational status
```

## 🗄️ Data Storage (Pantry System)

### File-Based Storage
Currently uses JSON files for simplicity:
- **`residents.json`** - Customer information
- **`incidents.json`** - Incident records
- **`leave-requests.json`** - Vacation requests

### Future Database Integration
Ready for upgrade to professional databases:
- **PostgreSQL** - For complex relational data
- **MongoDB** - For flexible document storage
- **Redis** - For fast caching

## 🔧 Middleware Stack (Kitchen Stations)

### Request Processing Pipeline
1. **CORS** - Check if order comes from authorized dining room
2. **Helmet** - Security screening
3. **Morgan** - Log the order
4. **Compression** - Package response efficiently
5. **JSON Parser** - Understand the order format
6. **Route Handler** - Prepare the specific dish
7. **Response** - Send meal back to dining room

## 🚀 Deployment Options

### Development Deployment
```bash
# Local kitchen
npm run dev
```

### Production Deployment
```bash
# Professional kitchen setup
npm run start:prod

# Or with process manager
pm2 start index.js --name tako-server
```

### Docker Kitchen (Coming Soon)
```dockerfile
# Containerized kitchen
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Monitoring & Debugging

### Kitchen Health Checks
```bash
# Check if kitchen is running
curl http://localhost:3001/health

# Test specific station
curl http://localhost:3001/api/residents
```

### Common Kitchen Problems
- **Port already in use** - Another kitchen is running
- **CORS errors** - Dining room not authorized
- **File not found** - Data files missing
- **JSON parse errors** - Malformed orders

## 🤝 Contributing to the Kitchen

1. **Learn the kitchen layout** - Understand the codebase
2. **Test your cooking** - Add tests for new features
3. **Follow food safety** - Security and validation
4. **Document your recipes** - Update API documentation

## 🔗 Related Restaurants

- **tako-client** - The dining room (frontend)
- **tako-docs** - Restaurant operations manual

## 🎯 Future Kitchen Upgrades

### Coming Soon
- **Authentication System** - Staff login and permissions
- **Database Integration** - Professional data storage
- **Real-time Updates** - WebSocket support
- **Advanced Logging** - Comprehensive monitoring
- **Docker Support** - Containerized deployment

### When You'll Need These
- **Authentication** - When multiple staff need different access levels
- **Database** - When data grows beyond JSON files
- **Real-time** - When dining room needs instant updates
- **Docker** - When deploying to production servers

---

**TAKO VMS Server** - Where data is cooked to perfection! 🍳👨‍🍳