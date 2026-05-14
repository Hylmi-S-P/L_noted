

## Auto-generated signatures
<!-- Updated by gen-context.js -->
You are a coding assistant with complete knowledge of this codebase.
The following code signatures were extracted by SigMap v6.10.10 on 2026-05-14T06:59:15.146Z.

These signatures represent every public function, class, and type in the project.
Refer to them when answering questions about code structure, APIs, and implementation.
Before answering questions about specific code areas, suggest running `sigmap ask "<query>"` to get the most relevant files. After config changes, `sigmap validate` confirms coverage.

## Code Signatures

## deps
```
lnote-frontend\App.tsx ← src/screens/AddTransactionScreen
```

## lnote-backend

### lnote-backend\.github\copilot-instructions.md
```
h2 Auto-generated signatures
h2 SigMap commands
h1 Code signatures
h2 app
h3 app\Http\Controllers\Api\CustomerController.php
h3 app\Http\Controllers\Api\TransactionController.php
h3 app\Http\Controllers\Controller.php
h3 app\Models\Customer.php
h3 app\Models\ServicePrice.php
h3 app\Models\Transaction.php
h3 app\Models\User.php
h3 app\Providers\AppServiceProvider.php
h2 app-src
h3 app-src\app\Http\Controllers\Controller.php
h3 app-src\app\Models\User.php
h3 app-src\app\Providers\AppServiceProvider.php
h3 app-src\database\factories\UserFactory.php
h3 app-src\database\seeders\DatabaseSeeder.php
h3 app-src\phpunit.xml
h3 app-src\README.md
h3 app-src\tests\Feature\ExampleTest.php
h3 app-src\tests\TestCase.php
h3 app-src\tests\Unit\ExampleTest.php
h2 database
h3 database\factories\UserFactory.php
```

### lnote-backend\app\Http\Controllers\Api\CustomerController.php
```
class CustomerController
  function index()
  function store(Request $request)
  function show($id)
  function update(Request $request, $id)
  function destroy($id)
```

### lnote-backend\app\Http\Controllers\Api\TransactionController.php
```
class TransactionController
  function index()
  function store(Request $request)
  function show($id)
  function update(Request $request, $id)
  function destroy($id)
```

### lnote-backend\app\Http\Controllers\Controller.php
```
class Controller
```

### lnote-backend\app\Models\Customer.php
```
class Customer
  function transactions()
```

### lnote-backend\app\Models\ServicePrice.php
```
class ServicePrice
  function transactions()
```

### lnote-backend\app\Models\Transaction.php
```
class Transaction
  function user()
  function customer()
  function servicePrice()
```

### lnote-backend\app\Models\User.php
```
class User
  function casts() → array
```

### lnote-backend\app\Providers\AppServiceProvider.php
```
class AppServiceProvider
  function register() → void
  function boot() → void
```

### lnote-backend\app-src\app\Http\Controllers\Controller.php
```
class Controller
```

### lnote-backend\app-src\app\Models\User.php
```
class User
  function casts() → array
```

### lnote-backend\app-src\app\Providers\AppServiceProvider.php
```
class AppServiceProvider
  function register() → void
  function boot() → void
```

### lnote-backend\app-src\database\factories\UserFactory.php
```
class UserFactory
  function definition() → array
  function unverified() → static
```

### lnote-backend\app-src\database\seeders\DatabaseSeeder.php
```
class DatabaseSeeder
  function run() → void
```

### lnote-backend\app-src\phpunit.xml
```
root phpunit
testsuite[name=Unit]
testsuite[name=Feature]
env[name=APP_ENV]
env[name=APP_MAINTENANCE_DRIVER]
env[name=BCRYPT_ROUNDS]
env[name=CACHE_STORE]
env[name=MAIL_MAILER]
env[name=PULSE_ENABLED]
env[name=QUEUE_CONNECTION]
env[name=SESSION_DRIVER]
env[name=TELESCOPE_ENABLED]
```

### lnote-backend\app-src\README.md
```
h2 About Laravel
h2 Learning Laravel
h2 Laravel Sponsors
h3 Premium Partners
h2 Contributing
h2 Code of Conduct
h2 Security Vulnerabilities
h2 License
```

### lnote-backend\app-src\tests\Feature\ExampleTest.php
```
class ExampleTest
  function test_the_application_returns_a_successful_response() → void
```

### lnote-backend\app-src\tests\TestCase.php
```
class TestCase
```

### lnote-backend\app-src\tests\Unit\ExampleTest.php
```
class ExampleTest
  function test_that_true_is_true() → void
```

### lnote-backend\database\factories\UserFactory.php
```
class UserFactory
  function definition() → array
  function unverified() → static
```

### lnote-backend\database\seeders\CustomerSeeder.php
```
class CustomerSeeder
  function run() → void
```

### lnote-backend\database\seeders\DatabaseSeeder.php
```
class DatabaseSeeder
  function run() → void
```

### lnote-backend\database\seeders\ServicePriceSeeder.php
```
class ServicePriceSeeder
  function run() → void
```

### lnote-backend\phpunit.xml
```
root phpunit
testsuite[name=Unit]
testsuite[name=Feature]
env[name=APP_ENV]
env[name=APP_MAINTENANCE_DRIVER]
env[name=BCRYPT_ROUNDS]
env[name=CACHE_STORE]
env[name=MAIL_MAILER]
env[name=PULSE_ENABLED]
env[name=QUEUE_CONNECTION]
env[name=SESSION_DRIVER]
env[name=TELESCOPE_ENABLED]
```

### lnote-backend\README.md
```
h1 L-Note Backend — Laravel 11 + PostgreSQL
h2 🏗️ Project Structure
h2 🛠️ Tech Stack
h2 📦 Key Dependencies
h3 Core
h3 Database & ORM
h3 Services
h3 Testing
h2 🚀 Getting Started
h3 Prerequisites
h3 Installation
h1 Clone repository
h1 Install dependencies
h1 Copy environment file
h1 Generate app key
h1 Configure database in .env
h1 DB_CONNECTION=pgsql
h1 DB_HOST=127.0.0.1
h1 DB_PORT=5432
h1 DB_DATABASE=lnote
h1 DB_USERNAME=postgres
h1 DB_PASSWORD=
h1 Run migrations
h1 Seed default data
h1 Create storage symlink
```

### lnote-backend\tests\Feature\ExampleTest.php
```
class ExampleTest
  function test_the_application_returns_a_successful_response() → void
```

### lnote-backend\tests\TestCase.php
```
class TestCase
```

### lnote-backend\tests\Unit\ExampleTest.php
```
class ExampleTest
  function test_that_true_is_true() → void
```

## lnote-frontend

### lnote-frontend\app-src\App.tsx
```
component App
```

### lnote-frontend\App.tsx
```
component DashboardScreen
component App
hook useState
hook useEffect
```

### lnote-frontend\README.md
```
h1 L-Note Frontend — React Native + Expo
h2 📱 Project Structure
h2 🛠️ Tech Stack
h2 📦 Dependencies
h3 Core
h3 Services
h3 Utils
h2 🚀 Getting Started
h1 Install dependencies
h1 Start dev server
h1 Run on iOS/Android
h1 Press 'i' for iOS or 'a' for Android
h2 📋 Features to Implement
h2 🔐 Environment Variables
h2 📱 Build for Production
h1 Build APK for Android
h1 Build IPA for iOS
h2 📚 Documentation
code-fence plain
code-fence expo
code-fence axios
code-fence dayjs
code-fence bash
```

### lnote-frontend\src\screens\AddTransactionScreen.tsx
```
component AddTransactionScreen
hook useState
hook useEffect
handler onChangeText
handler onPress
```
