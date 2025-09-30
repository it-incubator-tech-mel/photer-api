@echo off
echo Starting Photer API Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Start infrastructure services
echo Starting infrastructure services (PostgreSQL, RabbitMQ, Redis)...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if .env.development exists
if not exist .env.development (
    echo Creating .env.development from env.example...
    copy env.example .env.development
    echo Please update .env.development with your configuration values.
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Run database migrations
echo Running database migrations...
npm run migrate:dev

REM Seed database
echo Seeding database...
npm run db:seed

echo Development environment is ready!
echo You can now start the services:
echo   - Gateway: npm run start:dev:gateway
echo   - Storage: npm run start:dev:storage
echo.
echo API Documentation will be available at: http://localhost:3001/api
pause
