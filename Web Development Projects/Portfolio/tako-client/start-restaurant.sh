#!/bin/bash

echo "🍽️ Opening the TAKO Dining Room (Client)..."
echo "================================"
echo "The dining room will open at: http://localhost:3000"
echo "Make sure the kitchen (server) is running at: http://localhost:3001"
echo ""
echo "To start the kitchen separately:"
echo "cd ../tako-server && npm run dev"
echo ""
echo "Starting dining room in 3 seconds..."
sleep 3

npm run dev