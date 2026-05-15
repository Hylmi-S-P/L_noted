# Panduan Menyalakan Android Emulator

Panduan ini dipakai setelah laptop restart atau ketika `npx expo run:android` menampilkan error bahwa emulator/perangkat Android belum ada.

## Cara Paling Mudah

1. Buka Android Studio.
2. Klik `More Actions`.
3. Klik `Virtual Device Manager`.
4. Jalankan salah satu emulator:
   - `Pixel_4`
   - `Medium_Phone_API_36.1`
5. Tunggu sampai layar Android Home muncul.
6. Buka PowerShell baru.
7. Cek perangkat:

```powershell
adb devices
```

Output yang benar kira-kira seperti ini:

```text
List of devices attached
emulator-5554 device
```

8. Jalankan app:

```powershell
cd "D:\Anyer Panarukan\lnote-frontend"
npx expo run:android
```

Jika Expo bertanya `Use port 8082 instead?`, pilih `yes`.

## Cara Command Line

Terminal 1:

```powershell
emulator -avd Pixel_4
```

Tunggu sampai layar Android Home muncul.

Terminal 2:

```powershell
adb devices
cd "D:\Anyer Panarukan\lnote-frontend"
npx expo run:android
```

## Jika Masih Error

Jika `npx expo run:android` bilang tidak ada emulator:

1. Pastikan emulator sudah benar-benar masuk layar Home.
2. Jalankan:

```powershell
adb devices
```

3. Kalau belum muncul, tutup emulator lalu buka lagi dari Android Studio.
4. Kalau port `8081` sibuk, pilih `yes` saat Expo menawarkan `8082`.

## Jalankan Backend Lokal

Kalau app terbuka tetapi login/data gagal:

```powershell
cd "D:\Anyer Panarukan\lnote-backend"
php artisan serve --host=0.0.0.0 --port=8010
```

Pastikan `lnote-frontend/.env` mengarah ke backend yang benar.
