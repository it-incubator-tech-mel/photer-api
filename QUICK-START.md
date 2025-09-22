# 🚀 Быстрый запуск Photer API

## Предварительные требования

- ✅ Node.js 18+
- ✅ yarn
- ✅ Docker Desktop

## Пошаговая настройка

### 1. Установка зависимостей

```bash
yarn install
```

### 2. Автоматическая настройка PostgreSQL

**Windows:**

```bash
setup-postgres.bat
```

**Linux/macOS:**

```bash
./setup-postgres.sh
```

### 3. Запуск приложения

```bash
yarn start:dev:gateway
```

## 🎯 Что происходит автоматически

1. **Создается файл .env** из env.example
2. **Запускается PostgreSQL** в Docker контейнере
3. **Создаются таблицы** в базе данных
4. **Генерируется Prisma клиент**

## 🌐 Доступ к сервисам

- **API**: <http://localhost:3001>
- **Swagger**: <http://localhost:3001/api>
- **PostgreSQL**: localhost:5432
- **PgAdmin**: <http://localhost:8080> (admin@photer.com / admin123)

## 🧪 Тестирование API

```bash
# Регистрация пользователя
curl -X POST http://localhost:3001/api/v1/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🐛 Если что-то пошло не так

### Проблемы с Docker

```bash
# Проверить статус контейнеров
docker compose -f docker-compose.postgres.yml ps

# Перезапустить
docker compose -f docker-compose.postgres.yml restart
```

### Проблемы с зависимостями

```bash
rm -rf node_modules yarn.lock
yarn install
```

### Проблемы с базой данных

```bash
cd apps/gateway
npx prisma db push
npx prisma generate
```

## 📚 Подробная документация

- **README.md** - полное описание проекта
- **SETUP-POSTGRES.md** - детальные инструкции по настройке
