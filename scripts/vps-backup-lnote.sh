#!/usr/bin/env bash
set -euo pipefail

# Manual L-Note database backup helper for VPS.
# Usage:
#   DB_PASSWORD='your-db-password' bash scripts/vps-backup-lnote.sh

DB_NAME="${DB_NAME:-lnote}"
DB_USER="${DB_USER:-lnote}"
BACKUP_DIR="${BACKUP_DIR:-${HOME}/lnote-backups}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "DB_PASSWORD is required."
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

backup_file="${BACKUP_DIR}/lnote-$(date +%F-%H%M).sql"
tmp_config="$(mktemp)"
chmod 600 "${tmp_config}"
cat > "${tmp_config}" <<MYSQL
[client]
user=${DB_USER}
password=${DB_PASSWORD}
MYSQL
trap 'rm -f "${tmp_config}"' EXIT

mysqldump --defaults-extra-file="${tmp_config}" "${DB_NAME}" > "${backup_file}"
chmod 600 "${backup_file}"

echo "Backup created: ${backup_file}"
ls -lh "${backup_file}"
