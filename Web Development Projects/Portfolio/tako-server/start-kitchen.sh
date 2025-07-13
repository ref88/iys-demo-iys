#!/bin/bash

echo "🍳 Starting the TAKO Kitchen (Server)..."
echo "======================================="
echo "The kitchen will operate at: http://localhost:3001"
echo "API endpoints available at: http://localhost:3001/api/*"
echo ""
echo "To start the dining room separately:"
echo "cd ../tako-client && npm run dev"
echo ""
echo "Health check: curl http://localhost:3001/health"
echo ""
echo "Starting kitchen in 3 seconds..."
sleep 3

npm run dev