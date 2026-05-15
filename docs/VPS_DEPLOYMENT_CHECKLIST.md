# Checklist Deploy VPS L-Note

Target: Ubuntu 22.04 VPS untuk Laravel backend. Frontend Android diarahkan ke URL API VPS.

## 1. Paket Server

Laravel backend membutuhkan PHP 8.2 atau lebih baru. Di Ubuntu 22.04, gunakan PPA PHP 8.2:

```bash
sudo apt update
sudo apt install -y software-properties-common ca-certificates lsb-release apt-transport-https
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y nginx mysql-server php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip unzip git composer
```

## 2. Database

Buat database dan user MySQL:

```bash
sudo mysql
```

```sql
CREATE DATABASE lnote CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lnote'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON lnote.* TO 'lnote'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Backend Laravel

Upload/clone project ke VPS, lalu:

```bash
cd /var/www/lnote-backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

Isi `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lnote
DB_USERNAME=lnote
DB_PASSWORD=GANTI_PASSWORD_KUAT
```

Jalankan database:

```bash
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
```

Permission:

```bash
sudo chown -R www-data:www-data /var/www/lnote-backend/storage /var/www/lnote-backend/bootstrap/cache
sudo chmod -R ug+rwx /var/www/lnote-backend/storage /var/www/lnote-backend/bootstrap/cache
```

## 4. Nginx

Contoh config:

```nginx
server {
    listen 80;
    server_name domain-anda.com;
    root /var/www/lnote-backend/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/lnote /etc/nginx/sites-enabled/lnote
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Frontend API URL

Di laptop, ubah `lnote-frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://domain-anda.com/api
EXPO_PUBLIC_ENABLE_PUSH=false
EXPO_PUBLIC_ENABLE_OCR=false
```

Untuk deploy awal dengan IP VPS tanpa SSL, gunakan:

```env
EXPO_PUBLIC_API_URL=http://IP_VPS/api
EXPO_PUBLIC_ENABLE_PUSH=false
EXPO_PUBLIC_ENABLE_OCR=false
```

Catatan produksi saat ini:

- OCR tidak dipakai oleh UI aplikasi.
- FCM/notifikasi dimatikan agar aplikasi tetap sederhana untuk client.
- Variabel backend `FCM_*` boleh dibiarkan kosong.

Build ulang Android setelah API URL berubah:

```powershell
cd "D:\Anyer Panarukan\lnote-frontend"
npx expo run:android
```

## 6. Cek Produksi

- Login berhasil.
- Tambah transaksi berhasil.
- Riwayat muncul.
- Tandai lunas berhasil.
- Laporan muncul.
- Backup database bisa dibuat.
