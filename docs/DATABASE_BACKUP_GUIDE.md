# Panduan Backup Database

Backup wajib dilakukan sebelum update besar dan secara rutin setelah aplikasi dipakai client.

## Backup Manual di VPS

Buat folder backup:

```bash
mkdir -p ~/lnote-backups
```

Backup:

```bash
mysqldump -u lnote -p lnote > ~/lnote-backups/lnote-$(date +%F-%H%M).sql
```

Jika memakai script dari repo:

```bash
cd /var/www/lnote
DB_PASSWORD='PASSWORD_DATABASE_LNOTE' bash scripts/vps-backup-lnote.sh
```

Jika deploy memakai `scripts/vps-install-lnote.sh`, helper juga dibuat di home user VPS:

```bash
~/lnote-backup.sh
```

Cek hasil:

```bash
ls -lh ~/lnote-backups
```

## Restore Database

Hati-hati: restore akan menimpa data database saat ini.

```bash
mysql -u lnote -p lnote < ~/lnote-backups/NAMA_FILE_BACKUP.sql
```

## Rekomendasi Praktis

- Backup minimal 1 kali sehari jika aplikasi sudah dipakai.
- Simpan salinan backup di luar VPS, misalnya laptop atau Google Drive.
- Sebelum deploy/update, selalu backup dulu.
- Simpan nama file dengan tanggal agar mudah dicari.
- File backup berisi data pelanggan/transaksi, jadi jangan dibagikan sembarangan.
