# L-Note Project — Complete Structure Overview

## 📁 Project Layout

```
Anyer Panarukan/
├── lnote-frontend/          # React Native + Expo mobile app
├── lnote-backend/           # Laravel 11 REST API
├── Dokumentasi_LNote_Laundry.md
└── README.md (this file)
```

---

## 🎯 Quick Start

### 1️⃣ **Backend Setup** (Start First)

```bash
cd lnote-backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure PostgreSQL in .env
# Create database manually or use:
# sudo -u postgres createdb lnote

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve
# Server runs at: http://localhost:8000
```

### 2️⃣ **Frontend Setup** (After Backend)

```bash
cd lnote-frontend

# Install dependencies
npm install

# Configure API in .env
# Create .env from .env.example
# Set: EXPO_PUBLIC_API_URL=http://localhost:8000

# Start Expo development server
expo start

# Press 'i' for iOS simulator or 'a' for Android emulator
```

---

## 📱 Frontend Structure (`lnote-frontend/`)

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/screens/` | Screen components organized by feature (Auth, Dashboard, OCR, etc) |
| `src/components/` | Reusable UI components (Button, Card, Form components) |
| `src/navigation/` | React Navigation setup & routing configuration |
| `src/services/` | API client, storage, notifications |
| `src/hooks/` | Custom React hooks (useAuth, useTransactions, useOCR) |
| `src/context/` | React Context for global state (Auth, Theme) |
| `src/utils/` | Helper functions (formatting, validation, compression) |
| `src/constants/` | App-wide constants (colors, messages, enums) |
| `src/assets/` | Images, icons, fonts |

### Tech Stack
- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **HTTP:** Axios
- **Storage:** AsyncStorage + SecureStore
- **Camera:** Expo Camera + Image Manipulator
- **Notifications:** Firebase FCM

### Key Features to Build
- ✅ Login/Authentication
- ✅ Dashboard with daily summary
- ✅ Add transactions (manual + OCR)
- ✅ Camera integration with OCR scanning
- ✅ Transaction history & filters
- ✅ Status & payment management
- ✅ Daily/weekly reports

---

## 🔧 Backend Structure (`lnote-backend/`)

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/Models/` | Eloquent models (User, Customer, Transaction, ServicePrice) |
| `app/Http/Controllers/Api/` | API controllers for each resource |
| `app/Http/Requests/` | Form validation requests |
| `app/Http/Resources/` | API response formatting |
| `app/Services/` | Business logic (OCR, Reports, Images, Notifications) |
| `database/migrations/` | Database schema definitions |
| `database/seeders/` | Demo data & default values |
| `routes/api.php` | API endpoint definitions |
| `tests/` | Unit & feature tests |
| `storage/app/nota/` | Receipt images (year/month folders) |

### Tech Stack
- **Framework:** Laravel 11
- **Language:** PHP 8.2
- **Database:** PostgreSQL 15
- **Web Server:** Nginx + PHP-FPM
- **Authentication:** Laravel Sanctum (Bearer tokens)
- **OCR:** Google Cloud Vision API
- **Image Processing:** Intervention Image
- **Queue:** Laravel Queue (database driver)
- **Notifications:** Firebase Cloud Messaging

### API Endpoints Structure

```
Authentication
└── POST /api/auth/login
    POST /api/auth/logout
    GET  /api/auth/me

Transactions
└── GET    /api/transactions (list with filters)
    POST   /api/transactions (create)
    GET    /api/transactions/{id}
    PATCH  /api/transactions/{id}
    DELETE /api/transactions/{id}
    PATCH  /api/transactions/{id}/status
    PATCH  /api/transactions/{id}/payment

Customers
└── GET  /api/customers
    POST /api/customers
    GET  /api/customers/{id}
    PATCH /api/customers/{id}

OCR
└── POST /api/ocr/scan (upload & process receipt)

Reports
└── GET /api/reports/daily
    GET /api/reports/summary
```

---

## 🗄️ Database Schema

### 4 Main Tables

```sql
users
├── id, name, email, password, created_at, updated_at
└── One-to-many: customers, transactions, service_prices

customers
├── id, user_id, name, phone_number, created_at, updated_at
└── Foreign key: users.id

service_prices
├── id, user_id, service_type, price_per_kg, created_at, updated_at
└── Foreign key: users.id
└── Default services: wash_dry, wash_iron, iron_only, express

transactions
├── id, user_id, customer_id, weight_kg, service_type
├── price_per_kg, total_price, receipt_image_path, ocr_raw_text
├── status (enum: pending, process, done, taken)
├── payment_status (boolean), notes, created_at, updated_at
└── Foreign keys: users.id, customers.id
```

---

## 🔄 Data Flow

### Happy Path: Photo Receipt OCR

```
1. User opens camera in app
   ↓
2. Takes photo of handwritten receipt
   ↓
3. App compresses: resize 1200px, 70% quality JPEG (~50-150 KB)
   ↓
4. Upload to: POST /api/ocr/scan
   ↓
5. Backend receives, double-checks size, compresses if needed
   ↓
6. Send to Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)
   ↓
7. Parse raw text, extract "Total" amount (confidence score)
   ↓
8. Return to app: { total_price: 45000, confidence: 0.92, raw_text: "..." }
   ↓
9. User reviews, edits if wrong, fills name & weight
   ↓
10. Tap "Simpan Transaksi" → POST /api/transactions
    ↓
11. Backend saves transaction + image to storage
    ↓
12. Return success → Dashboard updated with new transaction
```

---

## 🚀 Development Workflow

### Phase 1: Backend Development
1. Setup Laravel project & database
2. Implement authentication (Sanctum)
3. Create CRUD endpoints for transactions, customers
4. Integrate Google Cloud Vision OCR
5. Build report endpoints
6. Write unit & feature tests
7. Document API in Postman

### Phase 2: Frontend Development
1. Setup React Native + navigation structure
2. Implement login/authentication
3. Build Dashboard screen
4. Implement transaction form (manual input)
5. Integrate camera + OCR review
6. Build history & filters
7. Add status/payment management
8. Polish UI/UX with animations

### Phase 3: Integration & Testing
1. Connect frontend to backend API
2. End-to-end testing (all flows)
3. User acceptance testing with laundry owner
4. Bug fixes & optimizations
5. Performance testing (APK size, API response times)

### Phase 4: Deployment
1. Deploy backend to VPS (Ubuntu 22.04)
2. Configure Nginx, PostgreSQL, SSL
3. Build APK for Android
4. Install on laundry owner's phone
5. Training session (1-2 hours)
6. 1-week monitoring & support

---

## 🔐 Security Considerations

### Backend
- ✅ HTTPS/SSL (Let's Encrypt, auto-renew)
- ✅ Bearer Token authentication (Laravel Sanctum)
- ✅ Input validation & sanitization
- ✅ Rate limiting on OCR endpoint (20 req/min)
- ✅ Database on localhost only (no public access)
- ✅ Firewall: UFW allows only ports 22, 80, 443
- ✅ Receipt images in non-public directory

### Frontend
- ✅ Tokens stored in SecureStore (encrypted)
- ✅ HTTPS only communication
- ✅ Image compression before upload
- ✅ Error handling & user feedback

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Manual transaction entry time | ≤ 60 seconds |
| OCR scan time (upload → result) | ≤ 5 seconds |
| API response time (transactions) | ≤ 500 ms |
| OCR accuracy (handwriting) | ≥ 85% |
| APK size | ≤ 50 MB |
| Server uptime | ≥ 99% |
| Minimum Android version | 8.0 (API 26) |

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| VPS hosting | **Rp 0** (use existing server) |
| Google Cloud Vision | **Rp 0** (1,000 req/month free) |
| Storage | **Rp 0** (local disk) |
| SSL certificate | **Rp 0** (Let's Encrypt free) |
| Firebase FCM | **Rp 0** (free tier) |
| **Custom domain** | Rp 10-15K/month (optional) |
| **TOTAL** | **Rp 0/month** |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `lnote-frontend/README.md` | Frontend setup & structure |
| `lnote-backend/README.md` | Backend setup & API info |
| `lnote-frontend/folder-structure.txt` | Detailed file listing |
| `lnote-backend/folder-structure.txt` | Detailed file listing |
| `Dokumentasi_LNote_Laundry.md` | Complete PRD, TRD, ERD, designs |

---

## 🔗 Next Steps

1. **Backend Development:**
   - Start with database migrations
   - Implement authentication endpoints
   - Build transaction CRUD API
   - Integrate Google Cloud Vision

2. **Frontend Development:**
   - Setup React Navigation
   - Build authentication screens
   - Create reusable UI components
   - Implement main screens

3. **Testing:**
   - Unit tests for services
   - Integration tests for API
   - E2E testing with real devices

4. **Deployment:**
   - Configure VPS (Nginx, PostgreSQL)
   - Deploy backend
   - Build & deploy mobile app

---

**Start Date:** May 13, 2026  
**Estimated Duration:** 9 weeks  
**Target Users:** Small laundry owners (UMKM) in Indonesia

