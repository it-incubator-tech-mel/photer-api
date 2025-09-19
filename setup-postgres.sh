#!/bin/bash

echo "========================================"
echo "Настройка PostgreSQL для Photer API"
echo "========================================"

echo
echo "1. Создание файла .env..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Файл .env создан из env.example"
else
    echo "Файл .env уже существует"
fi

echo
echo "2. Запуск PostgreSQL через Docker..."
docker compose -f docker-compose.postgres.yml up -d

echo
echo "3. Ожидание запуска PostgreSQL..."
sleep 10

echo
echo "4. Создание таблиц в базе данных..."
cd apps/gateway
npx prisma db push

echo
echo "5. Генерация Prisma клиента..."
npx prisma generate

echo
echo "6. Возврат в корневую папку..."
cd ../..

echo
echo "========================================"
echo "Настройка завершена!"
echo "========================================"
echo
echo "Теперь вы можете запустить приложение:"
echo "yarn start:dev:gateway"
echo
echo "PostgreSQL доступен на порту 5432"
echo "PgAdmin доступен на http://localhost:8080"
echo "  Email: admin@photer.com"
echo "  Password: admin123"
echo
