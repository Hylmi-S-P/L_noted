# Runbook Trial 30 Hari L-Note

Panduan ini untuk menjaga aplikasi tetap stabil selama trial client. Fokusnya sederhana: backend hidup, data aman, dan bug penting dicatat.

## Sebelum Trial Dimulai

1. Pull versi terbaru di VPS:

```bash
cd /var/www/L_noted
git pull origin main
```

2. Pastikan backend production:

```bash
cd /var/www/L_noted/lnote-backend
php artisan config:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache
```

3. Cek server dan buat backup awal:

```bash
~/lnote-smoke-test.sh http://IP_VPS_ATAU_DOMAIN
~/lnote-backup.sh
```

4. Pastikan APK client memakai API VPS:

```env
EXPO_PUBLIC_API_URL=http://IP_VPS_ATAU_DOMAIN/api
EXPO_PUBLIC_ENABLE_PUSH=false
EXPO_PUBLIC_ENABLE_OCR=false
```

5. Test sekali bersama client:

- Login.
- Tambah pelanggan real.
- Tambah transaksi real.
- Tandai lunas.
- Buka laporan.

## Rutinitas Harian

Jalankan di VPS:

```bash
~/lnote-smoke-test.sh http://IP_VPS_ATAU_DOMAIN
~/lnote-backup.sh
ls -lh ~/lnote-backups
```

Cek cepat:

- API sehat.
- Backup baru terbentuk.
- Client tidak melaporkan gagal login/simpan transaksi.

## Rutinitas Setiap 3-4 Hari

Tanya client:

- Ada transaksi yang gagal disimpan?
- Ada harga layanan yang salah?
- Ada tombol yang membingungkan?
- Laporan harian cocok dengan catatan manual?
- Aplikasi terasa lambat?

Catat jawaban di `docs/TRIAL_NOTES.md` jika diperlukan.

## Aturan Update Selama Trial

Hindari update besar. Perbaiki hanya hal yang memblokir:

- login gagal
- transaksi gagal disimpan
- total harga salah
- laporan salah
- tombol penting membingungkan

Sebelum update:

```bash
~/lnote-backup.sh
```

Setelah update:

```bash
~/lnote-smoke-test.sh http://IP_VPS_ATAU_DOMAIN
```

Jika update menyentuh frontend, client harus install APK baru.

## Akhir Trial

Review:

- Berapa transaksi yang dicatat?
- Apakah client bisa pakai tanpa dibantu?
- Apakah perlu offline/cache?
- Apakah perlu fitur cetak/nota/share?
- Apakah VPS cukup stabil?
- Apakah backup rutin berjalan?

Keputusan setelah trial:

- lanjut pakai app apa adanya
- lanjut dengan perbaikan kecil
- tambah fitur besar setelah trial selesai
