# L-Note Backend — Laravel 11 + PostgreSQL

REST API for laundry transaction management with OCR integration and real-time analytics.

## 🏗️ Project Structure

```
lnote-backend/
├── app/
│   ├── Models/                  # Eloquent models (User, Customer, Transaction, etc)
│   ├── Http/
│   │   ├── Controllers/         # API controllers
│   │   ├── Middleware/          # Auth, CORS, rate limiting
│   │   ├── Requests/            # Form request validation
│   │   └── Resources/           # API response formatting
│   ├── Services/                # Business logic (OCR, Report, etc)
│   └── Policies/                # Authorization policies
├── database/
│   ├── migrations/              # Schema migrations
│   ├── seeders/                 # Data seeders (default prices, demo data)
│   └── factories/               # Model factories for testing
├── routes/
│   ├── api.php                  # API routes
│   └── web.php                  # Web routes (admin dashboard if needed)
├── tests/
│   ├── Unit/                    # Unit tests
│   └── Feature/                 # Feature/integration tests
├── storage/
│   ├── app/
│   │   ├── nota/                # Stored receipt images (organized by year/month)
│   │   └── avatars/             # User profile pictures
│   ├── logs/                    # Application logs
│   └── cache/                   # Cache files
├── public/
│   ├── uploads/                 # Publicly accessible files
│   └── storage/                 # Symlink to storage/app
├── config/                      # Configuration files
├── .github/                     # GitHub workflows & CI/CD
├── docs/                        # API documentation & guides
├── .env.example                 # Environment variables template
├── artisan                      # Laravel CLI
└── composer.json                # PHP dependencies

```

## 🛠️ Tech Stack

- **Framework:** Laravel 11
- **Language:** PHP 8.2
- **Database:** PostgreSQL 15
- **Web Server:** Nginx + PHP-FPM
- **Authentication:** Laravel Sanctum (token-based)
- **OCR:** Google Cloud Vision API
- **Queue:** Laravel Queue + Redis/Database driver
- **Notifications:** Firebase Cloud Messaging
- **Storage:** Local disk (VPS) + symlink to public
- **Process Manager:** Supervisor

## 📦 Key Dependencies

### Core
```
laravel/framework
laravel/sanctum
laravel/tinker
```

### Database & ORM
```
laravel/tinker
doctrine/dbal
```

### Services
```
google/cloud-vision
kreait/firebase-php
intervention/image
```

### Testing
```
laravel/pint
phpunit/phpunit
pestphp/pest
```

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- PostgreSQL 15
- Composer
- Node.js (for asset compilation, optional)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd lnote-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=lnote
# DB_USERNAME=postgres
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed default data
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve
```

### Environment Setup

Create `.env` file with:
```
APP_ENV=local
APP_DEBUG=true
APP_URL=https://api.lnote.local

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=lnote
DB_USERNAME=postgres
DB_PASSWORD=your_password

GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json

FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_CREDENTIALS=path/to/firebase-credentials.json

QUEUE_CONNECTION=database
CACHE_DRIVER=file
```

## 📋 API Endpoints

### Response Envelope
All API responses use:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "errors": null
}
```

### Authentication
```
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Current user
```
Login request body:
```json
{
  "email": "test@example.com",
  "password": "password"
}
```

### Transactions
```
GET    /api/transactions          # List (with filters)
POST   /api/transactions          # Create
GET    /api/transactions/{id}     # Detail
PATCH  /api/transactions/{id}     # Update
DELETE /api/transactions/{id}     # Delete
PATCH  /api/transactions/{id}/status        # Update status
PATCH  /api/transactions/{id}/payment       # Update payment status
```
Status values: `pending`, `proses`, `selesai`, `diambil`  
Payment values: `belum_lunas`, `lunas`

### Customers
```
GET    /api/customers            # List
POST   /api/customers            # Create
GET    /api/customers/{id}       # Detail + history
PATCH  /api/customers/{id}       # Update
```

### OCR
```
POST   /api/ocr/scan             # Upload & scan receipt
```

### Reports
```
GET    /api/reports/daily        # Daily summary
GET    /api/reports/summary      # Date range summary
```

## 🔐 Security

- ✅ HTTPS/SSL (Let's Encrypt)
- ✅ Token-based authentication (Laravel Sanctum)
- ✅ Rate limiting on OCR endpoint
- ✅ Input validation & sanitization
- ✅ CORS configured for mobile origin
- ✅ Database on localhost only
- ✅ Firewall (UFW): ports 22, 80, 443 only

## 📊 Database Schema

- **users** — Laundry owner accounts
- **customers** — Customer records
- **transactions** — Laundry orders
- **service_prices** — Service pricing

## 🧪 Testing

```bash
# Run all tests
./vendor/bin/pest

# Run specific test
./vendor/bin/pest tests/Feature/TransactionTest.php

# Run with coverage
./vendor/bin/pest --coverage
```

## 📝 Code Style

```bash
# Format code (Laravel Pint)
./vendor/bin/pint
```

## 🚢 Deployment

### VPS Setup (Ubuntu 22.04)

```bash
# Install dependencies
sudo apt update && sudo apt install php8.2-fpm php8.2-pgsql php8.2-gd nginx postgresql

# Configure PHP-FPM for RAM efficiency
# Edit: /etc/php/8.2/fpm/pool.d/www.conf
# pm = dynamic
# pm.max_children = 5
# pm.start_servers = 2

# Configure PostgreSQL for 2GB RAM
# Edit: /etc/postgresql/15/main/postgresql.conf
# shared_buffers = 128MB
# max_connections = 20

# Deploy Laravel
cd /var/www/lnote
git pull origin main
composer install --no-dev
php artisan migrate --force
chown -R www-data:www-data storage/
```

### Production Checklist

- [ ] `.env` configured (secrets not in version control)
- [ ] Database migrated
- [ ] Storage symlink created
- [ ] Supervisor configured for queue worker
- [ ] SSL certificate valid
- [ ] Nginx virtual host configured
- [ ] Cron job scheduled for Laravel tasks
- [ ] Monitoring & logging configured
- [ ] Backup strategy in place

## 📚 Documentation

- [API Specification](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [OCR Integration](./docs/OCR.md)

