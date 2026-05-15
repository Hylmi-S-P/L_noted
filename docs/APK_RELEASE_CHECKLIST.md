# Checklist APK Trial L-Note

Gunakan checklist ini setiap kali APK diberikan ke client.

## Data Release

- Tanggal build:
- Nama client:
- Username client:
- API URL:
- APK diberikan lewat:
- Device client:
- Catatan:

## Sebelum Build

Pastikan `lnote-frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://IP_VPS_ATAU_DOMAIN/api
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_PUSH=false
EXPO_PUBLIC_ENABLE_OCR=false
```

Jalankan:

```powershell
cd "D:\Anyer Panarukan\lnote-frontend"
npx tsc --noEmit
```

## Build Dan Install

Untuk development build ke device/emulator:

```powershell
npx expo run:android
```

Jika membuat APK file untuk dikirim manual, simpan nama file dengan tanggal, contoh:

```text
LNote-trial-2026-05-16.apk
```

## Test Setelah Install

- Login.
- App tetap login setelah ditutup dan dibuka lagi.
- Tambah pelanggan.
- Tambah layanan jika diperlukan.
- Tambah transaksi.
- Tandai lunas.
- Cek laporan.
- Logout hanya jika memang ingin test login ulang.

## Catatan Penting

- APK tidak update otomatis.
- Backend bisa diupdate dari VPS tanpa install ulang APK, selama API contract tidak berubah.
- Perubahan UI/frontend butuh APK baru.
- Jika API URL berubah dari IP ke domain/HTTPS, APK harus dibuild ulang.
