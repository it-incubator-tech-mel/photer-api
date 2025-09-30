# Photer API

Полнофункциональное API для приложения Photer с поддержкой аутентификации,
загрузки фотографий и управления пользователями.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- yarn
- Docker Desktop (для PostgreSQL)
- Git

### Установка и настройка

1. **Клонирование репозитория**

```bash
git clone <repository-url>
cd photer-fullstack/photer-api-dev
```

2. **Установка зависимостей**

```bash
yarn install
```

3. **Настройка PostgreSQL (автоматически)**

```bash
# Windows
setup-postgres.bat

# Linux/macOS
./setup-postgres.sh
```

4. **Запуск приложения**

```bash
yarn start:dev:gateway
```

## 🗄️ База данных

Проект использует **PostgreSQL** как основную базу данных.

### Автоматическая настройка

- Запускает PostgreSQL в Docker контейнере
- Создает базу данных `photer_dev`
- Настраивает пользователя `photer_user`
- Инициализирует схему Prisma

### Ручная настройка

Если у вас уже установлен PostgreSQL, создайте базу данных вручную:

```sql
CREATE DATABASE photer_dev;
CREATE USER photer_user WITH PASSWORD 'photer_password';
GRANT ALL PRIVILEGES ON DATABASE photer_dev TO photer_user;
```

Затем скопируйте `env.example` в `.env` и запустите:

```bash
cd apps/gateway
npx prisma db push
npx prisma generate
```

## 🔐 API Аутентификации

### Регистрация пользователя

```http
POST /api/v1/auth/registration
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### OAuth Аутентификация

Поддерживаются Google и GitHub OAuth через универсальные эндпоинты:

```http
# Google OAuth
GET /api/v1/auth/oauth/google/login
GET /api/v1/auth/oauth/google/callback

# GitHub OAuth
GET /api/v1/auth/oauth/github/login
GET /api/v1/auth/oauth/github/callback
```

> 📖 **Подробнее:** См. [OAuth Refactoring Documentation](./OAUTH-REFACTORING.md)

### Подтверждение регистрации

```http
POST /api/v1/auth/registration-confirmation
Content-Type: application/json

{
  "code": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Повторная отправка email

```http
POST /api/v1/auth/registration-email-resending
Content-Type: application/json

{
  "email": "john@example.com"
}
```

## 📁 Структура проекта

```text
photer-api-dev/
├── apps/
│   ├── gateway/           # Основное API приложение
│   │   ├── src/
│   │   │   ├── auth/      # Аутентификация и авторизация
│   │   │   ├── users/     # Управление пользователями
│   │   │   ├── photos/    # Управление фотографиями
│   │   │   └── storage/   # Файловое хранилище
│   │   └── prisma/        # Схема базы данных
│   └── storage/           # Микросервис для файлов
├── docker-compose.postgres.yml  # PostgreSQL конфигурация
├── setup-postgres.bat     # Скрипт настройки для Windows
├── setup-postgres.sh      # Скрипт настройки для Linux/macOS
└── SETUP-POSTGRES.md      # Подробные инструкции по настройке
```

## 🛠️ Разработка

### Доступные команды

```bash
# Запуск gateway в режиме разработки
yarn start:dev:gateway

# Запуск storage в режиме разработки
yarn start:dev:storage

# Сборка всех приложений
yarn build:all

# Тестирование
yarn test
yarn test:e2e:gateway

# Линтинг и форматирование
yarn lint
yarn format
```

### База данных

```bash
# Создание миграции
cd apps/gateway
npx prisma migrate dev --name migration_name

# Применение миграций
npx prisma migrate deploy

# Сброс базы данных
npx prisma migrate reset

# Просмотр базы данных
npx prisma studio
```

## 🌐 Доступ к сервисам

- **API Gateway**: <http://localhost:3001>
- **PostgreSQL**: localhost:5432
- **PgAdmin**: <http://localhost:8080> (admin@photer.com / admin123)

## 📚 Документация API

После запуска приложения Swagger документация доступна по адресу:
<http://localhost:3001/api>

## 🔧 Переменные окружения

Скопируйте `env.example` в `.env` и настройте:

```env
# База данных
DATABASE_URL="postgresql://photer_user:photer_password@localhost:5432/photer_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# OAuth (опционально)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🐛 Устранение проблем

### Проблемы с базой данных

1. Убедитесь, что PostgreSQL запущен
2. Проверьте настройки в `.env` файле
3. Перезапустите Docker контейнеры

### Проблемы с зависимостями

```bash
rm -rf node_modules yarn.lock
yarn install
```

### Проблемы с Prisma

```bash
cd apps/gateway
npx prisma generate
npx prisma db push
```

## 📄 Лицензия

Этот проект является приватным и не подлежит распространению.

## 🤝 Поддержка

Для получения помощи обратитесь к команде разработки или создайте issue в репозитории.
