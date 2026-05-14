# 📋 Dokumentasi Pengembangan Aplikasi Mobile Laundry
# **L-Note — Laundry Digital Berbasis OCR**

> *Solusi digitalisasi pencatatan transaksi untuk usaha laundry UMKM, menggantikan sistem nota kertas manual yang rawan kehilangan data dan kesalahan hitung.*

---

## Daftar Isi

1. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
2. [Technical Requirements Document (TRD)](#2-technical-requirements-document-trd)
3. [UI/UX Design Concept](#3-uiux-design-concept)
4. [App Flow](#4-app-flow)
5. [Backend Schema (ERD)](#5-backend-schema-erd)
6. [Implementation Plan](#6-implementation-plan)

---

## 1. Product Requirements Document (PRD)

### 1.1 Latar Belakang Masalah

Usaha laundry kecil hingga menengah umumnya masih bergantung pada sistem pencatatan manual menggunakan nota kertas dan buku catatan. Metode ini memiliki sejumlah kelemahan nyata yang sering terjadi dalam operasional sehari-hari:

- **Nota hilang** → Pelanggan atau pemilik kehilangan bukti transaksi, menyebabkan sengketa harga dan total tagihan.
- **Kesalahan hitung** → Penjumlahan manual rentan salah, terutama saat transaksi ramai.
- **Sulit melacak riwayat** → Mencari transaksi lama dari tumpukan nota kertas memakan waktu lama.
- **Tidak ada laporan otomatis** → Pemilik harus merekap pendapatan harian secara manual.
- **Risiko basah/robek** → Nota kertas mudah rusak karena lingkungan laundry yang lembab.

### 1.2 Tujuan Produk

Membangun aplikasi mobile **L-Note** yang memungkinkan pemilik usaha laundry untuk:

1. Mencatat transaksi secara digital dengan cepat dan mudah.
2. Membaca total biaya dari foto nota tulisan tangan secara otomatis menggunakan teknologi OCR berbasis AI.
3. Melacak status laundry setiap pelanggan secara real-time.
4. Mendapatkan ringkasan dan laporan pendapatan harian tanpa rekap manual.
5. Menyimpan data aman di cloud sehingga tidak bisa hilang meski HP rusak.

### 1.3 Target Pengguna (User Persona)

**Persona Utama: Ibu Pemilik Laundry**

| Atribut | Detail |
| :--- | :--- |
| **Profil** | Perempuan, 35–55 tahun, pemilik usaha laundry rumahan/kecil |
| **Tingkat Literasi Digital** | Rendah–Menengah (terbiasa WhatsApp, belum pernah pakai aplikasi bisnis) |
| **Perangkat** | Android kelas menengah (RAM 3–4 GB) |
| **Kebiasaan** | Mencatat di buku, menghitung dengan kalkulator |
| **Pain Point** | Nota sering hilang, salah hitung, sulit cari data pelanggan lama |
| **Motivasi** | Ingin usahanya lebih rapi dan profesional tanpa ribet belajar teknologi |

### 1.4 Fitur Utama (Feature List)

#### Fitur Wajib (Must Have)

| ID | Fitur | Deskripsi |
| :--- | :--- | :--- |
| F-01 | **Pencatatan Manual** | Form input: nama pelanggan, berat (kg), jenis layanan, harga satuan, dan total otomatis. |
| F-02 | **Smart OCR (Foto Nota)** | Ambil foto nota tulisan tangan → sistem baca angka total menggunakan AI Vision. |
| F-03 | **Riwayat Transaksi** | Daftar semua transaksi, bisa difilter berdasarkan tanggal, nama, atau status. |
| F-04 | **Status Laundry** | Penanda status: `Menunggu` → `Proses` → `Selesai` → `Diambil`. |
| F-05 | **Status Pembayaran** | Tandai transaksi sebagai `Lunas` atau `Belum Bayar`. |
| F-06 | **Ringkasan Harian** | Total pendapatan hari ini + jumlah transaksi + yang belum lunas. |

#### Fitur Tambahan (Nice to Have)

| ID | Fitur | Deskripsi |
| :--- | :--- | :--- |
| F-07 | **Notifikasi Pengingat** | Notifikasi otomatis saat laundry sudah selesai (untuk pemilik). |
| F-08 | **Ekspor Laporan** | Download laporan mingguan/bulanan dalam format PDF atau Excel sederhana. |
| F-09 | **Manajemen Harga** | Buat daftar harga layanan (cuci kering, setrika, cuci express) sebagai referensi saat input. |
| F-10 | **Backup Data** | Backup otomatis ke cloud agar data aman jika HP berganti. |

### 1.5 Batasan Produk (Out of Scope)

- Fitur untuk pelanggan (aplikasi khusus untuk pemilik laundry saja).
- Integrasi payment gateway (pembayaran tetap dilakukan secara offline/tunai).
- Multi-cabang atau multi-user dalam satu akun (versi pertama).

### 1.6 Kriteria Keberhasilan (Success Metrics)

| Metrik | Target |
| :--- | :--- |
| Waktu input transaksi manual | ≤ 60 detik |
| Akurasi OCR baca tulisan tangan | ≥ 85% angka total terbaca benar |
| Tingkat adopsi pengguna target | Pemilik laundry dapat mandiri pakai aplikasi setelah 1x demo |
| Data loss | 0% (semua data tersimpan di cloud) |

---

## 2. Technical Requirements Document (TRD)

### 2.1 Tech Stack

| Layer | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Mobile Frontend** | React Native (Expo) | Cross-platform (Android & iOS), komunitas besar, cocok untuk tim kecil |
| **Backend API** | Laravel 11 (PHP 8.2) | Stabil, ORM Eloquent ringan, cocok untuk VPS RAM terbatas |
| **Web Server** | Nginx + PHP-FPM | Jauh lebih hemat RAM dibanding Apache, ideal untuk VPS 2 GB |
| **Database** | PostgreSQL 15 | Self-hosted di VPS yang sama, hemat biaya, performa cukup untuk UMKM |
| **OCR Engine** | Google Cloud Vision API | Handwriting recognition terbaik, 1.000 req/bulan gratis |
| **Storage Gambar** | Storage lokal VPS | Simpan foto nota di disk VPS, akses via endpoint backend |
| **Authentication** | Laravel Sanctum | Token-based auth ringan, tidak butuh service tambahan |
| **Push Notification** | Firebase Cloud Messaging (FCM) | Gratis, andal untuk notifikasi Android |
| **Process Manager** | Supervisor | Kelola Laravel Queue worker agar tetap hidup di background |
| **SSL** | Let's Encrypt (Certbot) | HTTPS gratis, auto-renew setiap 90 hari |

> **Spesifikasi VPS yang digunakan:**
> `Ubuntu 22.04.5 LTS` · `Intel Xeon E5-2450 v2` · `RAM 2 GB` · `PowerEdge R420`
>
> ⚠️ **Catatan RAM:** Dengan RAM 2 GB, semua service (Nginx, PHP-FPM, PostgreSQL, Laravel) harus dikonfigurasi hemat memori. Lihat bagian 2.7 untuk panduan konfigurasi.

### 2.2 Arsitektur Sistem

```
┌─────────────────────┐         HTTPS / REST API (443)     ┌──────────────────────────────────────┐
│   Mobile App        │ ◄────────────────────────────────► │   VPS — Ubuntu 22.04 (PowerEdge R420)│
│   (React Native)    │                                     │   RAM 2 GB · Xeon E5-2450 v2         │
│                     │                                     │                                      │
│  ┌───────────────┐  │                                     │  ┌─────────────────────────────────┐ │
│  │  Camera/OCR   │  │  POST /api/ocr (multipart/image)   │  │  Nginx (Web Server / Reverse     │ │
│  │  Module       │ ──────────────────────────────────────►│  │  Proxy) + SSL Let's Encrypt      │ │
│  └───────────────┘  │                                     │  └──────────────┬──────────────────┘ │
│                     │                                     │                 │                    │
│  ┌───────────────┐  │                                     │                 ▼                    │
│  │  Transaction  │  │  POST /api/transactions             │  ┌──────────────────────────────┐   │
│  │  Form         │ ──────────────────────────────────────►│  │  PHP-FPM + Laravel 11 App    │   │
│  └───────────────┘  │                                     │  │  (API Controller, OCR, Auth) │   │
│                     │                                     │  └──────────┬───────────────────┘   │
│  ┌───────────────┐  │                                     │             │                        │
│  │  Dashboard /  │  │  GET /api/transactions              │    ┌────────┴─────────┐              │
│  │  History      │ ◄──────────────────────────────────────│    │                  │              │
│  └───────────────┘  │                                     │    ▼                  ▼              │
└─────────────────────┘                                     │  ┌──────────┐  ┌────────────────┐   │
                                                            │  │PostgreSQL│  │ Storage Lokal  │   │
                                                            │  │(port 5432│  │ /storage/nota/ │   │
           Google Cloud Vision API ◄──────── HTTPS ─────────│  │ localhost)│  │ (foto nota)    │   │
           (Handwriting OCR)                                 │  └──────────┘  └────────────────┘   │
                                                            │                                      │
           Firebase FCM ◄────────── HTTPS ──────────────────│  ┌──────────────────────────────┐   │
           (Push Notifikasi)                                 │  │  Supervisor                  │   │
                                                            │  │  (Laravel Queue Worker)      │   │
                                                            │  └──────────────────────────────┘   │
                                                            └──────────────────────────────────────┘
```

### 2.3 Spesifikasi API Endpoint

#### Autentikasi

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Login pemilik, return token |
| POST | `/api/auth/logout` | Invalidate token |

#### Pelanggan

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/api/customers` | Daftar semua pelanggan |
| POST | `/api/customers` | Tambah pelanggan baru |
| GET | `/api/customers/{id}` | Detail + riwayat transaksi pelanggan |

#### Transaksi

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/api/transactions` | Semua transaksi (support filter: date, status, customer) |
| POST | `/api/transactions` | Buat transaksi baru (manual input) |
| GET | `/api/transactions/{id}` | Detail transaksi |
| PATCH | `/api/transactions/{id}/status` | Update status laundry |
| PATCH | `/api/transactions/{id}/payment` | Update status pembayaran |
| DELETE | `/api/transactions/{id}` | Hapus transaksi |

#### OCR

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| POST | `/api/ocr/scan` | Upload gambar nota → return hasil ekstraksi (total, item, dll) |

#### Laporan

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/api/reports/daily` | Ringkasan pendapatan hari ini |
| GET | `/api/reports/summary?from=&to=` | Laporan berdasarkan rentang tanggal |

### 2.4 Alur Proses OCR

```
Pengguna foto nota
        │
        ▼
─────────────────────────────────────
TAHAP 1: KOMPRESI DI HP (Mobile)
─────────────────────────────────────
Expo ImageManipulator:
- Resize → lebar max 1200px
- Compress → quality 70% JPEG
- Hasil: ~50–150 KB (dari asal 2–5 MB)
        │
        ▼
POST /api/ocr/scan
(multipart/form-data, ukuran kecil)
        │
        ▼
─────────────────────────────────────
TAHAP 2: SAFETY NET DI BACKEND (VPS)
─────────────────────────────────────
Cek ukuran file:
- Jika < 200 KB → langsung proses
- Jika ≥ 200 KB → kompres ulang via
  Intervention Image (PHP):
  resize 1200px + quality 70% JPEG
        │
        ▼
Simpan ke disk VPS:
/storage/app/nota/{tahun}/{bulan}/
Ukuran akhir tersimpan: ~50–120 KB
        │
        ▼
Kirim gambar ke
Google Cloud Vision API
(DOCUMENT_TEXT_DETECTION)
        │
        ▼
Google Vision return raw text
        │
        ▼
Backend parsing angka:
- Cari pola "Total", "Rp", nominal terbesar
- Ekstrak angka terakhir sebagai total biaya
        │
        ▼
Return ke App:
{ total_price: 35000, raw_text: "...", confidence: 0.92 }
        │
        ▼
Pengguna review & konfirmasi
(bisa edit jika salah)
        │
        ▼
Data disimpan ke database
(path gambar disimpan di kolom receipt_image_path)
```

**Mengapa 1200px + 70% quality sudah cukup untuk OCR?**

Google Vision API tidak butuh resolusi tinggi untuk membaca angka tulisan tangan. Yang penting kontras tinta vs kertas jelas dan gambar tidak buram. Dengan ukuran 1200px, sebuah nota A6 (10×15 cm) sudah ter-render di ~280 DPI — jauh di atas minimum OCR. Kompresi 70% JPEG tidak mempengaruhi keterbacaan angka karena artefak kompresi JPEG muncul di area gradasi warna, bukan di tepi teks hitam yang kontras.

**Perkiraan penghematan disk per bulan** (asumsi 30 transaksi OCR/hari):

| Skenario | Ukuran per foto | Total/bulan |
| :--- | :--- | :--- |
| Tanpa kompresi | ~3 MB | ~2.7 GB |
| Dengan kompresi 2 tahap | ~80 KB | ~72 MB |

> Dengan kompresi, disk VPS bisa menampung foto nota selama **3+ tahun** sebelum perlu dibersihkan, bahkan jika kapasitas disk hanya 20 GB.

### 2.5 Keamanan

- Semua request wajib menggunakan HTTPS (SSL Let's Encrypt via Certbot).
- API dilindungi dengan Bearer Token (Laravel Sanctum).
- Gambar nota disimpan di direktori non-publik (`storage/app/nota/`), hanya bisa diakses lewat endpoint yang terautentikasi.
- Input form divalidasi di sisi backend untuk mencegah SQL Injection.
- Rate limiting pada endpoint OCR (max 20 request/menit) — penting untuk menjaga kuota Google Vision.
- Firewall UFW aktif: hanya buka port 22 (SSH), 80 (HTTP), 443 (HTTPS).
- PostgreSQL hanya listen di `localhost` (127.0.0.1), tidak expose ke publik.

### 2.6 Persyaratan Non-Fungsional

| Aspek | Target |
| :--- | :--- |
| Response time API (transaksi) | ≤ 500ms |
| Response time OCR | ≤ 5 detik |
| Uptime server | ≥ 99% |
| Ukuran APK | ≤ 50MB |
| Minimum Android | Android 8.0 (API Level 26) |

### 2.7 Konfigurasi VPS untuk RAM 2 GB

Dengan RAM hanya 2 GB yang dipakai bersama oleh Nginx, PHP-FPM, dan PostgreSQL, konfigurasi hemat memori adalah wajib.

**Nginx** — sudah ringan secara default, tidak perlu banyak perubahan:
```nginx
worker_processes 1;
worker_connections 256;
```

**PHP-FPM** — batasi jumlah proses agar tidak rakus RAM:
```ini
; /etc/php/8.2/fpm/pool.d/www.conf
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
```

**PostgreSQL** — turunkan buffer dari default yang terlalu besar:
```ini
; /etc/postgresql/15/main/postgresql.conf
shared_buffers = 128MB        ; default 256MB, turunkan
work_mem = 4MB                ; default 4MB, biarkan
maintenance_work_mem = 32MB   ; default 64MB, turunkan
max_connections = 20          ; cukup untuk app kecil
```

**SWAP** — tambahkan swap 1–2 GB sebagai jaring pengaman agar tidak OOM:
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Estimasi penggunaan RAM saat idle:**

| Service | RAM Estimasi |
| :--- | :--- |
| Nginx | ~15 MB |
| PHP-FPM (2 proses) | ~60 MB |
| PostgreSQL | ~130 MB |
| Supervisor + Queue | ~20 MB |
| OS + buffer | ~200 MB |
| **Total** | **~425 MB** |

> ✅ Sisa ~1.5 GB tersedia untuk lonjakan traffic dan SWAP — cukup aman untuk skala laundry UMKM.

---

### 2.8 Strategi Kompresi Foto & Manajemen Disk

Karena foto nota disimpan di disk VPS sendiri, kompresi dan manajemen disk harus dikelola secara aktif.

**Kompresi Tahap 1 — Di sisi mobile (Expo, sebelum upload):**

```javascript
// utils/compressImage.js
import * as ImageManipulator from 'expo-image-manipulator';

export const compressForOCR = async (uri) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],  // cukup untuk OCR, tidak perlu resolusi kamera penuh
    {
      compress: 0.7,                 // 70% quality — angka tulisan tangan tetap terbaca
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  // Hasil tipikal: 50–150 KB dari foto kamera yang awalnya 2–5 MB
  return result;
};
```

**Kompresi Tahap 2 — Di sisi backend (Laravel, safety net):**

Jika file yang diterima masih di atas 200 KB (misalnya pengguna pakai device lama yang tidak ter-kompres dengan baik), backend kompres ulang sebelum menyimpan ke disk:

```php
// app/Services/OcrService.php
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver; // GD sudah built-in PHP, tidak perlu ekstensi tambahan

public function saveAndCompressReceipt(UploadedFile $file, string $savePath): string
{
    $manager = new ImageManager(new Driver());
    $image   = $manager->read($file->getPathname());

    if ($file->getSize() >= 200 * 1024) { // hanya kompres jika >= 200 KB
        $image->scaleDown(width: 1200)
              ->toJpeg(quality: 70)
              ->save($savePath);
    } else {
        $file->move(dirname($savePath), basename($savePath));
    }

    return $savePath;
}
```

**Struktur folder penyimpanan:**

```
storage/app/nota/
├── 2025/
│   ├── 07/
│   │   ├── txn_00123_1720345678.jpg   (~80 KB)
│   │   └── txn_00124_1720345999.jpg   (~65 KB)
│   └── 08/
└── 2026/
```

Nama file menggunakan format `txn_{id_transaksi}_{unix_timestamp}.jpg` agar unik dan bisa ditelusuri.

**Cron job pembersihan foto lama:**

Tambahkan ke Laravel Scheduler (`app/Console/Kernel.php`) untuk hapus foto yang transaksinya sudah lebih dari 1 tahun dan berstatus `taken` (sudah diambil pelanggan):

```php
// Jalankan setiap hari jam 02.00 pagi (saat sepi traffic)
$schedule->call(function () {
    $old = Transaction::where('status', 'taken')
        ->where('updated_at', '<', now()->subYear())
        ->whereNotNull('receipt_image_path')
        ->get();

    foreach ($old as $trx) {
        Storage::disk('local')->delete($trx->receipt_image_path);
        $trx->update(['receipt_image_path' => null]);
    }
})->dailyAt('02:00');
```

Pastikan Laravel Scheduler berjalan via crontab di VPS:

```bash
* * * * * cd /var/www/lnote && php artisan schedule:run >> /dev/null 2>&1
```

**Proyeksi penggunaan disk:**

| Periode | Transaksi OCR | Ukuran Foto | Total Disk |
| :--- | :--- | :--- | :--- |
| 1 bulan | ~900 foto | ~80 KB/foto | ~72 MB |
| 1 tahun | ~10.800 foto | ~80 KB/foto | ~864 MB |
| 3 tahun (dengan auto-delete foto >1 tahun) | — | — | **< 900 MB** |

> ✅ Dengan disk VPS 20 GB sekalipun, foto nota tidak akan menjadi masalah selama cron job pembersihan aktif berjalan.

### 3.1 Prinsip Desain

Mengingat target pengguna utama adalah ibu-ibu pemilik laundry dengan literasi digital menengah ke bawah, desain mengutamakan:

| Prinsip | Implementasi |
| :--- | :--- |
| **Sederhana & Jelas** | Satu layar = satu tujuan utama. Tidak ada menu yang bertumpuk. |
| **High Contrast** | Teks hitam di background putih/cerah. Tombol utama berwarna solid kontras tinggi. |
| **Big Tap Targets** | Semua tombol utama minimal 56px tinggi agar mudah disentuh. |
| **Bahasa Indonesia** | Semua teks, label, dan pesan error dalam Bahasa Indonesia sehari-hari. |
| **Feedback Visual** | Setiap aksi memiliki respon visual (loading spinner, toast notifikasi, animasi sukses). |
| **Error Tolerant** | Semua input bisa diedit sebelum disimpan. OCR selalu bisa dikoreksi manual. |

### 3.2 Panduan Warna

| Elemen | Warna | Kode Hex |
| :--- | :--- | :--- |
| Primary (Tombol utama, header) | Biru Teal | `#0D7377` |
| Secondary (Badge status selesai) | Hijau Segar | `#32B768` |
| Warning (Belum bayar, pending) | Oranye | `#F4A442` |
| Danger (Hapus, error) | Merah | `#E53E3E` |
| Background | Abu-abu terang | `#F7F8FA` |
| Teks Utama | Hitam Gelap | `#1A202C` |
| Teks Sekunder | Abu-abu | `#718096` |

### 3.3 Deskripsi Layar Utama

#### Layar 1: Splash Screen & Login
- Logo L-Note dengan tagline *"Catat Laundry, Mudah & Rapi"*.
- Input nomor HP atau email + password.
- Tombol **Masuk** besar di bawah.
- Tidak ada registrasi mandiri (akun dibuat oleh developer saat setup awal).

---

#### Layar 2: Dashboard (Beranda)

```
┌────────────────────────────────────┐
│  🧺 L-Note           [ikon profil] │
├────────────────────────────────────┤
│                                    │
│   Hari ini, Senin 7 Juli 2025      │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  💰 Total Pendapatan Hari Ini│  │
│  │       Rp 285.000             │  │
│  │  📦 12 Transaksi             │  │
│  │  ⚠️  3 Belum Lunas           │  │
│  └──────────────────────────────┘  │
│                                    │
│   Status Laundry Aktif             │
│  ┌──────────────────────────────┐  │
│  │ Bu Rina   2.5 kg   Proses ⏳ │  │
│  ├──────────────────────────────┤  │
│  │ Pak Dedi  1.0 kg   Selesai ✅│  │
│  ├──────────────────────────────┤  │
│  │ Bu Ani    3.0 kg   Menunggu  │  │
│  └──────────────────────────────┘  │
│                                    │
│         [+ TAMBAH TRANSAKSI]       │
│                                    │
└────────────────────────────────────┘
```

**Komponen:**
- **Kartu Ringkasan Hari Ini:** Total pendapatan, jumlah transaksi, dan yang belum lunas — ditampilkan di atas sebagai info utama.
- **Daftar Aktif:** Hanya transaksi yang belum diambil ditampilkan di dashboard.
- **FAB (Floating Action Button):** Tombol `+ TAMBAH TRANSAKSI` besar dan mencolok di bagian bawah layar.

---

#### Layar 3: Pilih Metode Input (Bottom Sheet)

Muncul sebagai popup dari bawah saat tombol `+` ditekan.

```
┌────────────────────────────────────┐
│                                    │
│   Tambah Transaksi Baru            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  📷  FOTO NOTA               │  │
│  │  Foto nota tulisan tangan,   │  │
│  │  sistem hitung otomatis      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  ✏️   INPUT MANUAL            │  │
│  │  Isi form sendiri            │  │
│  └──────────────────────────────┘  │
│                                    │
│           [ Batal ]                │
└────────────────────────────────────┘
```

---

#### Layar 4A: Kamera (Foto Nota)

```
┌────────────────────────────────────┐
│  ← Kembali        Foto Nota       │
├────────────────────────────────────┤
│                                    │
│   [            ]                   │
│   [   Arahkan  ]   ← Viewfinder   │
│   [  nota ke   ]     dengan        │
│   [   kotak    ]     overlay       │
│   [    ini     ]                   │
│                                    │
│  ⚠️ Pastikan angka TOTAL terlihat  │
│     jelas dan tidak buram          │
│                                    │
│         [ 📸 Ambil Foto ]          │
└────────────────────────────────────┘
```

**Catatan UX:**
- Overlay kotak panduan membantu pengguna memposisikan nota dengan benar.
- Teks panduan singkat: *"Pastikan angka total terlihat jelas"*.
- Setelah foto diambil, ada preview + konfirmasi: **Pakai Foto Ini** / **Foto Ulang**.

---

#### Layar 4B: Review Hasil OCR

```
┌────────────────────────────────────┐
│  ← Kembali     Hasil Scan Nota    │
├────────────────────────────────────┤
│                                    │
│  [Thumbnail foto nota]             │
│                                    │
│  Hasil yang ditemukan sistem:      │
│                                    │
│  Total Biaya                       │
│  ┌──────────────────────────────┐  │
│  │  Rp 45.000              ✏️   │  │
│  └──────────────────────────────┘  │
│                                    │
│  Nama Pelanggan                    │
│  ┌──────────────────────────────┐  │
│  │  Bu Wati (atau ketik manual) │  │
│  └──────────────────────────────┘  │
│                                    │
│  Berat (kg)    Jenis Layanan       │
│  ┌──────────┐  ┌───────────────┐   │
│  │  2.5     │  │ Cuci + Setrika│   │
│  └──────────┘  └───────────────┘   │
│                                    │
│      [ 💾 SIMPAN TRANSAKSI ]       │
└────────────────────────────────────┘
```

**Catatan UX:**
- Kolom **Total Biaya** yang berhasil di-scan ditampilkan dengan latar kuning sebagai highlight.
- Pengguna bisa langsung edit jika hasil salah (ikon pensil di samping).
- Field Nama Pelanggan dan Berat wajib diisi manual atau dipilih dari daftar.

---

#### Layar 5: Input Manual

Form sederhana dengan urutan field yang logis:

1. **Nama Pelanggan** — Text field + autocomplete dari daftar pelanggan lama.
2. **Berat (kg)** — Numeric keyboard, contoh: `2.5`.
3. **Jenis Layanan** — Dropdown: *Cuci Kering, Cuci Setrika, Setrika Saja, Express*.
4. **Harga per kg** — Terisi otomatis sesuai jenis layanan (dari daftar harga).
5. **Total Biaya** — Dihitung otomatis (berat × harga), bisa di-override.
6. **Catatan** — Opsional, contoh: *"Pakaian putih dipisah"*.

---

#### Layar 6: Detail Transaksi

Menampilkan semua info transaksi + tombol ubah status secara step-by-step:

```
[ Menunggu ] → [ Proses ] → [ Selesai ] → [ Diambil ]
```

Dan tombol toggle **Lunas / Belum Lunas** untuk status pembayaran.

---

#### Layar 7: Riwayat Transaksi

- Search bar di atas untuk cari nama pelanggan.
- Filter chip: **Semua | Proses | Selesai | Belum Lunas**.
- List transaksi dengan info ringkas: nama, tanggal, total, status.
- Tap untuk buka detail.

---

## 4. App Flow

### 4.1 Flow Diagram Keseluruhan

```
START: Buka Aplikasi
        │
        ▼
   Sudah Login? ─── TIDAK ──► Halaman Login ──► Masuk
        │                                          │
       YA ◄────────────────────────────────────────┘
        │
        ▼
   DASHBOARD (Beranda)
        │
   ┌────┴──────────────────┐
   │                       │
   ▼                       ▼
[+ Tambah Transaksi]   [Lihat Riwayat]
        │                   │
        ▼                   ▼
  Pilih Metode:         Daftar Transaksi
  ┌──────┬──────┐       (dengan filter)
  │      │      │           │
  │Foto  │Manual│           ▼
  │Nota  │Input │      Tap Transaksi
  └──┬───┴──┬───┘           │
     │      │               ▼
     ▼      ▼         Detail Transaksi
  Kamera  Form Input        │
     │      │          ┌────┴─────┐
     ▼      │          │          │
  Foto   Isi Form   Update    Update
  Diambil    │       Status  Pembayaran
     │      │
     ▼      ▼
  Proses OCR  ───► Gagal ──► Toast Error + Minta Foto Ulang
     │
     ▼
  Review Hasil OCR
  (Total + Form Tambahan)
     │
  ┌──┴──────────────────┐
  │                     │
  ▼                     ▼
Edit/Koreksi        Langsung Simpan
     │                   │
     └─────────┬─────────┘
               ▼
         POST ke Backend
               │
         ┌─────┴──────┐
         │            │
        OK           ERROR
         │            │
         ▼            ▼
   ✅ Notifikasi   ❌ Toast Error
  "Berhasil Disimpan"   + Retry
         │
         ▼
    Kembali ke Dashboard
    (Transaksi baru muncul)
```

### 4.2 Flow Detail: Foto Nota (Happy Path)

| Langkah | Aksi Pengguna | Respons Sistem |
| :---: | :--- | :--- |
| 1 | Buka aplikasi | Tampilkan Dashboard |
| 2 | Tap `+ Tambah Transaksi` | Tampilkan bottom sheet pilihan metode |
| 3 | Pilih **Foto Nota** | Buka kamera dengan overlay panduan |
| 4 | Arahkan kamera ke nota, tap **Ambil Foto** | Ambil gambar, tampilkan preview |
| 5 | Tap **Pakai Foto Ini** | Upload gambar ke server, tampilkan loading |
| 6 | Tunggu proses OCR (~2–4 detik) | Proses OCR di backend via Google Vision |
| 7 | — | Tampilkan halaman Review Hasil dengan total yang terbaca |
| 8 | Cek hasil, isi Nama Pelanggan & Berat | Form review |
| 9 | Tap **Simpan Transaksi** | Kirim data ke backend, simpan ke database |
| 10 | — | Toast: *"Transaksi Berhasil Disimpan!"*, kembali ke Dashboard |

### 4.3 Flow Detail: Input Manual (Happy Path)

| Langkah | Aksi Pengguna | Respons Sistem |
| :---: | :--- | :--- |
| 1 | Tap `+ Tambah Transaksi` | Tampilkan bottom sheet |
| 2 | Pilih **Input Manual** | Buka form input |
| 3 | Isi nama pelanggan | Autocomplete dari daftar pelanggan lama |
| 4 | Isi berat (kg) | Total dihitung otomatis |
| 5 | Pilih jenis layanan | Harga per kg terisi otomatis |
| 6 | Cek total, tambah catatan (opsional) | — |
| 7 | Tap **Simpan Transaksi** | Data disimpan, kembali ke Dashboard |

### 4.4 Flow Update Status

```
Transaksi Baru ──► [Menunggu] ──► [Proses] ──► [Selesai] ──► [Diambil]
                                                   │
                                              Toggle Lunas
```

Setiap perubahan status dilakukan via tombol di halaman Detail Transaksi dan langsung tersimpan ke server.

---

## 5. Backend Schema (ERD)

### 5.1 Diagram Relasi

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   users     │         │    transactions       │         │  customers  │
├─────────────┤         ├──────────────────────┤         ├─────────────┤
│ id (PK)     │ 1     * │ id (PK)              │ *     1 │ id (PK)     │
│ name        ├─────────┤ user_id (FK)         ├─────────┤ name        │
│ email       │         │ customer_id (FK)      │         │ phone_number│
│ password    │         │ weight_kg            │         │ user_id (FK)│
│ created_at  │         │ service_type         │         │ created_at  │
│ updated_at  │         │ price_per_kg         │         │ updated_at  │
└─────────────┘         │ total_price          │         └─────────────┘
                        │ receipt_image_path   │
                        │ ocr_raw_text         │
                        │ status               │
                        │ payment_status       │
                        │ notes                │
                        │ created_at           │
                        │ updated_at           │
                        └──────────────────────┘
                                   │
                        ┌──────────┘
                        │
              ┌─────────▼──────────┐
              │    service_prices  │
              ├────────────────────┤
              │ id (PK)            │
              │ user_id (FK)       │
              │ service_type       │
              │ price_per_kg       │
              │ created_at         │
              │ updated_at         │
              └────────────────────┘
```

### 5.2 Detail Schema Per Tabel

#### Table: `users`

| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ID pemilik laundry |
| `name` | VARCHAR(100) | NOT NULL | Nama pemilik |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email untuk login |
| `password` | VARCHAR(255) | NOT NULL | Hash password |
| `created_at` | TIMESTAMP | — | — |
| `updated_at` | TIMESTAMP | — | — |

---

#### Table: `customers`

| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ID pelanggan |
| `user_id` | BIGINT UNSIGNED | FK → users.id | Pelanggan milik laundry mana |
| `name` | VARCHAR(100) | NOT NULL | Nama pelanggan |
| `phone_number` | VARCHAR(20) | NULLABLE | No. HP pelanggan |
| `created_at` | TIMESTAMP | — | — |
| `updated_at` | TIMESTAMP | — | — |

---

#### Table: `transactions`

| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ID transaksi |
| `user_id` | BIGINT UNSIGNED | FK → users.id | Pemilik laundry |
| `customer_id` | BIGINT UNSIGNED | FK → customers.id | Pelanggan |
| `weight_kg` | DECIMAL(5,2) | NOT NULL | Berat cucian (kg) |
| `service_type` | ENUM | NOT NULL | `wash_dry`, `wash_iron`, `iron_only`, `express` |
| `price_per_kg` | BIGINT UNSIGNED | NOT NULL | Harga per kg (Rupiah) |
| `total_price` | BIGINT UNSIGNED | NOT NULL | Total biaya (Rupiah) |
| `receipt_image_path` | VARCHAR(500) | NULLABLE | URL gambar nota di Cloudinary |
| `ocr_raw_text` | TEXT | NULLABLE | Raw text hasil scan OCR |
| `status` | ENUM | DEFAULT `pending` | `pending`, `process`, `done`, `taken` |
| `payment_status` | BOOLEAN | DEFAULT FALSE | `false` = belum lunas, `true` = lunas |
| `notes` | TEXT | NULLABLE | Catatan tambahan |
| `created_at` | TIMESTAMP | — | Tanggal transaksi masuk |
| `updated_at` | TIMESTAMP | — | — |

**Keterangan Enum `status`:**

| Nilai | Label di Aplikasi | Deskripsi |
| :--- | :--- | :--- |
| `pending` | ⏳ Menunggu | Baru masuk, belum diproses |
| `process` | 🔄 Proses | Sedang dicuci/disetrika |
| `done` | ✅ Selesai | Sudah selesai, siap diambil |
| `taken` | 📦 Diambil | Sudah diambil pelanggan |

---

#### Table: `service_prices`

| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | — |
| `user_id` | BIGINT UNSIGNED | FK → users.id | Harga milik laundry tertentu |
| `service_type` | ENUM | NOT NULL | `wash_dry`, `wash_iron`, `iron_only`, `express` |
| `price_per_kg` | BIGINT UNSIGNED | NOT NULL | Harga per kg (Rupiah) |
| `created_at` | TIMESTAMP | — | — |
| `updated_at` | TIMESTAMP | — | — |

**Contoh data default:**

| service_type | Harga per kg |
| :--- | :--- |
| wash_dry | Rp 5.000 |
| wash_iron | Rp 8.000 |
| iron_only | Rp 4.000 |
| express | Rp 12.000 |

---

### 5.3 Query Penting

**Total pendapatan hari ini:**
```sql
SELECT SUM(total_price) as pendapatan_hari_ini, COUNT(*) as jumlah_transaksi
FROM transactions
WHERE user_id = ? AND DATE(created_at) = CURDATE();
```

**Transaksi belum lunas:**
```sql
SELECT * FROM transactions
WHERE user_id = ? AND payment_status = FALSE AND status != 'taken'
ORDER BY created_at DESC;
```

**Riwayat pelanggan tertentu:**
```sql
SELECT t.*, c.name as customer_name
FROM transactions t
JOIN customers c ON t.customer_id = c.id
WHERE t.user_id = ? AND t.customer_id = ?
ORDER BY t.created_at DESC;
```

---

## 6. Implementation Plan

### 6.1 Ringkasan Timeline

**Total Durasi Estimasi: 9 Minggu**

```
Minggu:  1    2    3    4    5    6    7    8    9
         │    │    │    │    │    │    │    │    │
Tahap 1 ████ ░░░░
Tahap 2      ████
Tahap 3           ████ ████
Tahap 4                     ████ ████ ████
Tahap 5                                   ████
Tahap 6                                        ████
```

### 6.2 Detail Per Tahap

#### Tahap 1 — Inisiasi & Setup (Minggu 1–2)

**Durasi:** 2 Minggu

**Aktivitas:**
- Riset dan uji coba Google Cloud Vision API dengan sampel foto nota tulisan tangan lokal.
- **Setup VPS:**
  - Install Nginx, PHP 8.2, PHP-FPM, PostgreSQL 15.
  - Konfigurasi hemat RAM (lihat bagian 2.7).
  - Tambah SWAP 1 GB sebagai jaring pengaman.
  - Setup UFW firewall (buka port 22, 80, 443 saja).
  - Setup SSL Let's Encrypt dengan Certbot (auto-renew).
  - Install Supervisor untuk queue worker.
- Setup project Laravel 11 (struktur folder, config environment, koneksi DB ke PostgreSQL lokal).
- Setup Expo React Native project + navigasi dasar.
- Setup repository Git dengan branching strategy (main / develop / feature).
- Buat dokumentasi API awal (Postman Collection).

**Output:** VPS siap produksi, project Laravel berjalan, API OCR sudah diuji dengan sample foto.

---

#### Tahap 2 — UI/UX Design (Minggu 2–3)

**Durasi:** 1–1.5 Minggu

**Aktivitas:**
- Buat wireframe untuk semua layar utama (low-fidelity, bisa menggunakan Figma atau kertas).
- User testing wireframe dengan pemilik laundry (1 sesi, ~30 menit).
- Revisi berdasarkan feedback.
- Buat desain high-fidelity (mockup final) dengan panduan warna dan komponen.
- Buat design system: warna, tipografi, komponen button, card, input.

**Output:** File Figma/desain final yang siap diimplementasikan oleh developer mobile.

---

#### Tahap 3 — Backend Development (Minggu 3–5)

**Durasi:** 2 Minggu

**Aktivitas:**

| Sub-Tahap | Detail |
| :--- | :--- |
| Database | Buat migration, seeder data awal, dan Eloquent model |
| Autentikasi | Implementasi login/logout dengan Laravel Sanctum |
| API Transaksi | CRUD endpoint transaksi + customers + service_prices |
| API OCR | Endpoint upload foto → Google Vision → parsing → return hasil |
| API Laporan | Endpoint ringkasan harian dan filter riwayat |
| Validasi & Error | Request validation, error response format standar |
| Unit Testing | Test endpoint kritis (transaksi + OCR) |

**Output:** Semua endpoint tersedia dan terdokumentasi di Postman, siap dikoneksikan ke frontend.

---

#### Tahap 4 — Mobile Development (Minggu 5–8)

**Durasi:** 3 Minggu

**Aktivitas:**

| Sub-Tahap | Detail |
| :--- | :--- |
| Setup & Auth | Halaman login, token storage, axios interceptor |
| Dashboard | Halaman utama dengan ringkasan + daftar transaksi aktif |
| Kamera & OCR | Integrasi Expo Camera, upload gambar, tampilkan hasil scan |
| Form Input Manual | Form lengkap dengan validasi dan kalkulasi otomatis |
| Review OCR | Halaman konfirmasi hasil scan, form edit |
| Riwayat & Filter | Halaman riwayat dengan search dan filter chip |
| Detail Transaksi | Update status dan payment status |
| Polish UI | Animasi, loading state, empty state, error handling |

**Output:** Aplikasi mobile fungsional penuh dan bisa diuji di HP nyata.

---

#### Tahap 5 — Testing & QA (Minggu 8)

**Durasi:** 1 Minggu

**Aktivitas:**
- **Uji OCR** → Foto 20–30 nota tulisan tangan berbeda (tebal, tipis, besar, kecil, miring). Catat akurasi.
- **Uji Fungsional** → Semua flow dilakukan dari awal sampai akhir tanpa error.
- **User Acceptance Testing (UAT)** → Pemilik laundry mencoba aplikasi sendiri dengan pendampingan. Catat semua kebingungan dan kendala.
- **Bug Fixing** → Perbaikan bug yang ditemukan dari hasil testing.
- **Uji Performa** → Cek ukuran APK, kecepatan loading, dan respons OCR.

**Output:** Laporan bug + hasil akurasi OCR + revisi berdasarkan UAT.

---

#### Tahap 6 — Deployment & Handover (Minggu 9)

**Durasi:** 1 Minggu

**Aktivitas:**
- Final deploy ke VPS produksi:
  - `git pull` ke `/var/www/lnote/`, jalankan `composer install --no-dev`, `php artisan migrate --force`.
  - Konfigurasi Nginx virtual host untuk domain/IP VPS.
  - Pastikan SSL Let's Encrypt aktif dan redirect HTTP → HTTPS.
  - Set permission storage: `chown -R www-data:www-data storage/` dan `chmod -R 775 storage/`.
  - Aktifkan Supervisor untuk queue worker.
- Build APK release (Android) via `eas build` atau build lokal.
- Instalasi aplikasi di HP pemilik laundry (sideloading APK).
- Sesi pelatihan 1–2 jam bersama pemilik laundry.
- Buat panduan singkat penggunaan (1 halaman, bergambar).
- Monitoring 1 minggu pertama: cek RAM usage, log Nginx, dan log Laravel.

**Output:** Aplikasi live di VPS sendiri, pemilik laundry bisa menggunakannya secara mandiri.

---

### 6.3 Risiko & Mitigasi

| Risiko | Kemungkinan | Dampak | Mitigasi |
| :--- | :---: | :---: | :--- |
| Akurasi OCR rendah untuk tulisan tertentu | Sedang | Tinggi | Selalu tampilkan hasil OCR untuk dikonfirmasi, jangan simpan otomatis |
| Pengguna gagap teknologi (sulit pakai kamera) | Tinggi | Sedang | Desain panduan visual di layar kamera, sediakan input manual sebagai fallback |
| Kuota Google Vision API habis (>1.000 req/bulan) | Rendah | Sedang | Compress gambar sebelum upload, monitor penggunaan via Google Cloud Console |
| Koneksi internet tidak stabil di tempat laundry | Sedang | Tinggi | Tampilkan pesan error yang jelas dan tombol retry yang mudah ditemukan |
| VPS OOM (Out of Memory) — RAM 2 GB penuh | Sedang | Tinggi | Tambah SWAP 1 GB, konfigurasi PHP-FPM & PostgreSQL hemat RAM (lihat 2.7) |
| Disk VPS penuh karena foto nota menumpuk | Sedang | Sedang | Kompresi 2 tahap (mobile + backend) menjaga ukuran ~80 KB/foto. Cron job auto-delete foto transaksi >1 tahun (lihat 2.8) |
| VPS down / reboot mendadak | Rendah | Tinggi | Enable auto-start service Nginx, PHP-FPM, PostgreSQL, Supervisor via `systemctl enable` |
| Data hilang saat HP rusak | Rendah | Tinggi | Semua data tersimpan di server VPS, tidak hanya di HP |

---

### 6.4 Estimasi Biaya Operasional (per bulan)

| Komponen | Estimasi Biaya | Keterangan |
| :--- | :--- | :--- |
| VPS / Server | **Rp 0** | Pakai VPS sendiri (PowerEdge R420) yang sudah ada |
| Google Cloud Vision API | **Rp 0** | 1.000 unit/bulan gratis — cukup untuk ~33 transaksi OCR/hari |
| Storage foto nota | **Rp 0** | Disimpan di disk VPS, ukuran per foto ~200–400 KB |
| SSL/HTTPS | **Rp 0** | Let's Encrypt gratis, auto-renew tiap 90 hari |
| Firebase FCM (notifikasi) | **Rp 0** | Gratis sepenuhnya |
| Domain (opsional) | **Rp 10.000 – 15.000/bulan** | ~Rp 120–150rb/tahun, hanya jika ingin nama domain sendiri |

> ✅ **Total biaya bulanan: Rp 0** (atau Rp 10–15rb/bulan jika pakai domain custom).
>
> Satu-satunya biaya nyata adalah listrik VPS yang kemungkinan sudah berjalan untuk keperluan lain. Selama transaksi OCR di bawah 1.000/bulan, tidak ada tagihan tambahan dari layanan manapun.

---

*Dokumen ini dibuat untuk membantu digitalisasi UMKM Laundry "L-Note".*
*Versi 1.2 — Ditambahkan strategi kompresi foto dua tahap (mobile + backend) dan manajemen disk VPS.*
