#!/bin/bash
echo "🚀 Starting BookKeeper API on Render..."
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"
echo "🌐 Frontend URL: $FRONTEND_URL"

# Start the application
node src/server.js
