# Настройка PostgreSQL для Photer API

## Вариант 1: Docker (рекомендуется)

### 1. Установите Docker Desktop

Скачайте и установите [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Запустите PostgreSQL

```bash
docker compose -f docker-compose.postgres.yml up -d
```

### 3. Проверьте статус

```bash
docker compose -f docker-compose.postgres.yml ps
```

## Вариант 2: Локальная установка PostgreSQL

### 1. Установите PostgreSQL

- **Windows**: Скачайте с [официального сайта](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Создайте базу данных

```sql
CREATE DATABASE photer_dev;
CREATE USER photer_user WITH PASSWORD 'photer_password';
GRANT ALL PRIVILEGES ON DATABASE photer_dev TO photer_user;
```

## Настройка переменных окружения

### 1. Создайте файл .env

Скопируйте содержимое из `env.example` в новый файл `.env`:

```bash
cp env.example .env
```

### 2. Проверьте настройки

Убедитесь, что в `.env` файле указан правильный `DATABASE_URL`:

```env
DATABASE_URL="postgresql://photer_user:photer_password@localhost:5432/photer_dev?schema=public"
```

## Инициализация базы данных

### 1. Создайте таблицы

```bash
cd apps/gateway
npx prisma db push
```

### 2. Сгенерируйте Prisma клиент

```bash
npx prisma generate
```

### 3. Запустите приложение

```bash
cd ../..
yarn start:dev:gateway
```

## Доступ к базе данных

### PgAdmin (если используете Docker)

- URL: <http://localhost:8080>
- Email: admin@photer.com
- Password: admin123

### Подключение через psql

```bash
psql -h localhost -U photer_user -d photer_dev
```

## Проверка работы API

После запуска приложения протестируйте API:

```bash
# Регистрация пользователя
curl -X POST http://localhost:3001/api/v1/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Ожидаемый ответ: 204 No Content
```

## Устранение проблем

### Ошибка подключения к базе данных

- Проверьте, что PostgreSQL запущен
- Проверьте настройки в `.env` файле
- Убедитесь, что порт 5432 не занят

### Ошибка миграции

- Удалите существующую базу данных и создайте заново
- Используйте `npx prisma db push --force-reset` (осторожно!)

### Проблемы с правами доступа

- Убедитесь, что пользователь `photer_user` имеет права на создание таблиц
- Проверьте настройки аутентификации PostgreSQL
