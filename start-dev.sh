#!/bin/bash

echo "Starting Photer API Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Start infrastructure services
echo "Starting infrastructure services (PostgreSQL, RabbitMQ, Redis)..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "Creating .env.development from env.example..."
    cp env.example .env.development
    echo "Please update .env.development with your configuration values."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run database migrations
echo "Running database migrations..."
npm run migrate:dev

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Development environment is ready!"
echo "You can now start the services:"
echo "  - Gateway: npm run start:dev:gateway"
echo "  - Storage: npm run start:dev:storage"
echo ""
echo "API Documentation will be available at: http://localhost:3001/api"
