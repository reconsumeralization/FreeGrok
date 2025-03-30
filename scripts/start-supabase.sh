#!/bin/bash

# Start local Supabase instance
echo "Starting local Supabase instance..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Start Supabase containers
if [ -f "docker-compose.yml" ]; then
  echo "Using project's docker-compose.yml"
  docker-compose up -d
else
  echo "Using Supabase CLI"
  npx supabase start
fi

# Wait for Supabase to be ready
echo "Waiting for Supabase to be ready..."
sleep 5

# Display Supabase local URLs
echo "Supabase started successfully!"
echo "------------------------------"
echo "Studio URL: http://localhost:8000"
echo "API URL: http://localhost:54321"
echo "------------------------------"
echo "Update your .env.local file with these credentials if needed."
