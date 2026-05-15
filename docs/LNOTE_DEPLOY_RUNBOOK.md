# L-Note Deploy Runbook

Panduan ini untuk deploy backend L-Note ke VPS Ubuntu 22.04. Frontend Android tinggal diarahkan ke URL API VPS.

## Keputusan Produksi Saat Ini

- OCR: dimatikan dari app. Backend endpoint masih ada, tetapi tidak dipakai oleh UI.
- FCM/notifikasi: dimatikan dari app dengan `EXPO_PUBLIC_ENABLE_PUSH=false`.
- Fokus produksi: catat transaksi, pelanggan, layanan, riwayat, laporan, dan backup.

FCM tidak akan merusak login/transaksi selama flag frontend tetap `false`. Backend juga aman jika variabel `FCM_*` kosong; fitur tes notifikasi hanya gagal jika dipanggil, dan tombolnya disembunyikan saat push dimatikan.

## 1. Siapkan Backend Di VPS

Login ke VPS:

```bash
ssh user@IP_VPS
```

Install Git jika belum ada:

```bash
sudo apt update
sudo apt install -y git
```

Clone repo atau upload folder backend. Contoh jika memakai Git:

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone REPO_URL lnote
sudo chown -R $USER:$USER /var/www/lnote
```

Jika struktur repo berisi folder `lnote-backend`, script akan masuk ke folder itu otomatis.

## 2. Jalankan Script Deploy

Dari root repo di VPS:

```bash
cd /var/www/lnote
DB_PASSWORD='GANTI_PASSWORD_KUAT' SERVER_NAME='IP_VPS_ATAU_DOMAIN' bash scripts/vps-install-lnote.sh
```

Jika belum clone repo dan ingin script yang clone:

```bash
DB_PASSWORD='GANTI_PASSWORD_KUAT' SERVER_NAME='IP_VPS_ATAU_DOMAIN' REPO_URL='REPO_URL' APP_DIR='/var/www/lnote' bash scripts/vps-install-lnote.sh
```

Default script akan:

- memakai `APP_ENV=production` dan `APP_DEBUG=false`
- membuat MySQL database/user khusus `lnote`
- mengaktifkan Nginx + PHP-FPM
- mengaktifkan UFW hanya untuk SSH, HTTP, HTTPS
- membuat `~/lnote-backup.sh`
- membuat `~/lnote-smoke-test.sh`

Jika domain sudah siap dan DNS sudah mengarah ke VPS, SSL bisa langsung dipasang:

```bash
cd /var/www/lnote
DB_PASSWORD='GANTI_PASSWORD_KUAT' SERVER_NAME='domain-anda.com' ENABLE_SSL=true bash scripts/vps-install-lnote.sh
```

## 3. Cek API

Buka di browser:

```text
http://IP_VPS_ATAU_DOMAIN/api/health
```

Expected:

```json
{"success":true,"message":"API is healthy.","data":{"status":"ok"},"errors":null}
```

Atau pakai helper:

```bash
~/lnote-smoke-test.sh http://IP_VPS_ATAU_DOMAIN
```

## 4. Update Frontend Laptop

Di laptop, ubah `lnote-frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://IP_VPS_ATAU_DOMAIN/api
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_PUSH=false
EXPO_PUBLIC_ENABLE_OCR=false
```

Build ulang Android:

```powershell
cd "D:\Anyer Panarukan\lnote-frontend"
npx expo run:android
```

## 5. Smoke Test Produksi

- Login.
- Tambah transaksi.
- Cek riwayat.
- Tandai lunas.
- Tambah pelanggan.
- Tambah layanan.
- Buka laporan.
- Cek backup database.

## 6. Backup Manual

Di VPS:

```bash
mkdir -p ~/lnote-backups
mysqldump -u lnote -p lnote > ~/lnote-backups/lnote-$(date +%F-%H%M).sql
ls -lh ~/lnote-backups
```

Atau pakai helper yang dibuat script deploy:

```bash
~/lnote-backup.sh
```

Simpan salinan backup di luar VPS secara rutin.

## 7. Jika Pakai Domain Dan SSL Nanti

Setelah domain mengarah ke VPS, pasang SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com
```

Lalu ubah frontend:

```env
EXPO_PUBLIC_API_URL=https://domain-anda.com/api
```

Build ulang Android setelah URL berubah.

## 8. Minimum Aman Yang Tidak Boleh Dilewati

- `.env` production tidak boleh masuk GitHub.
- `APP_DEBUG=false`.
- Gunakan Nginx + PHP-FPM, bukan `php artisan serve`.
- UFW hanya membuka `22`, `80`, `443`.
- Backup database sebelum update.
- OCR dan FCM tetap disabled kecuali memang akan dipakai lagi.
