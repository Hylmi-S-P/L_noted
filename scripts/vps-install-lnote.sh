#!/usr/bin/env bash
set -euo pipefail

# L-Note backend deployment helper for Ubuntu 22.04.
# Run on the VPS, not on the laptop.
#
# Required environment variables:
#   DB_PASSWORD='strong-password'
#
# Optional environment variables:
#   APP_DIR='/var/www/lnote-backend'
#   SERVER_NAME='your-domain.com'   # Use VPS IP if domain is not ready.
#   REPO_URL='https://github.com/your/repo.git'
#   ENABLE_FIREWALL='true'           # Opens only SSH, HTTP, HTTPS through UFW.
#   ENABLE_SSL='false'               # Set true only when SERVER_NAME is a real domain.
#
# Example:
#   DB_PASSWORD='change-me' SERVER_NAME='203.0.113.10' REPO_URL='https://github.com/Hylmi-S-P/L_noted.git' bash scripts/vps-install-lnote.sh

APP_DIR="${APP_DIR:-/var/www/lnote-backend}"
SERVER_NAME="${SERVER_NAME:-_}"
DB_NAME="${DB_NAME:-lnote}"
DB_USER="${DB_USER:-lnote}"
PHP_VERSION="${PHP_VERSION:-8.2}"
ENABLE_FIREWALL="${ENABLE_FIREWALL:-true}"
ENABLE_SSL="${ENABLE_SSL:-false}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "DB_PASSWORD is required."
  exit 1
fi

echo "Installing server packages..."
sudo apt update
sudo apt install -y software-properties-common ca-certificates lsb-release apt-transport-https unzip git curl
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y nginx mysql-server \
  "php${PHP_VERSION}" "php${PHP_VERSION}-cli" "php${PHP_VERSION}-fpm" "php${PHP_VERSION}-mysql" \
  "php${PHP_VERSION}-mbstring" "php${PHP_VERSION}-xml" "php${PHP_VERSION}-curl" "php${PHP_VERSION}-zip" \
  "php${PHP_VERSION}-bcmath" composer

if [[ "${ENABLE_FIREWALL}" == "true" ]]; then
  echo "Configuring UFW firewall..."
  sudo apt install -y ufw
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable
fi

echo "Creating database and user..."
sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

if [[ ! -d "${APP_DIR}" ]]; then
  if [[ -z "${REPO_URL:-}" ]]; then
    echo "${APP_DIR} does not exist and REPO_URL is empty."
    echo "Clone/upload lnote-backend to ${APP_DIR}, or rerun with REPO_URL."
    exit 1
  fi

  echo "Cloning repository..."
  sudo mkdir -p "$(dirname "${APP_DIR}")"
  sudo git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

if [[ -d "${APP_DIR}/lnote-backend" ]]; then
  cd "${APP_DIR}/lnote-backend"
fi

echo "Installing Laravel dependencies..."
composer install --no-dev --optimize-autoloader

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

echo "Writing production .env values..."
php -r "
\$path = '.env';
\$env = file_get_contents(\$path);
\$set = [
  'APP_ENV' => 'production',
  'APP_DEBUG' => 'false',
  'APP_URL' => 'http://${SERVER_NAME}',
  'DB_CONNECTION' => 'mysql',
  'DB_HOST' => '127.0.0.1',
  'DB_PORT' => '3306',
  'DB_DATABASE' => '${DB_NAME}',
  'DB_USERNAME' => '${DB_USER}',
  'DB_PASSWORD' => '${DB_PASSWORD}',
  'FCM_PROJECT_ID' => '',
  'FCM_CLIENT_EMAIL' => '',
  'FCM_PRIVATE_KEY' => '',
  'FCM_SERVICE_ACCOUNT_JSON' => '',
];
foreach (\$set as \$key => \$value) {
  \$line = \$key.'='.\$value;
  if (preg_match('/^'.preg_quote(\$key, '/').'=.*/m', \$env)) {
    \$env = preg_replace('/^'.preg_quote(\$key, '/').'=.*/m', \$line, \$env);
  } else {
    \$env .= PHP_EOL.\$line;
  }
}
file_put_contents(\$path, \$env);
"

echo "Running migrations and seeders..."
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache

echo "Fixing Laravel permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R ug+rwx storage bootstrap/cache

echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/lnote >/dev/null <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};
    root $(pwd)/public;

    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX

sudo ln -sfn /etc/nginx/sites-available/lnote /etc/nginx/sites-enabled/lnote
sudo nginx -t
sudo systemctl enable --now "php${PHP_VERSION}-fpm"
sudo systemctl reload nginx

echo "Creating backup folder..."
mkdir -p "${HOME}/lnote-backups"

echo "Writing backup helper..."
cat > "${HOME}/lnote-backup.sh" <<BACKUP
#!/usr/bin/env bash
set -euo pipefail
mkdir -p "\${HOME}/lnote-backups"
tmp_config="\$(mktemp)"
chmod 600 "\${tmp_config}"
cat > "\${tmp_config}" <<MYSQL
[client]
user=${DB_USER}
password=${DB_PASSWORD}
MYSQL
trap 'rm -f "\${tmp_config}"' EXIT
mysqldump --defaults-extra-file="\${tmp_config}" "${DB_NAME}" > "\${HOME}/lnote-backups/lnote-\$(date +%F-%H%M).sql"
ls -lh "\${HOME}/lnote-backups" | tail
BACKUP
chmod 700 "${HOME}/lnote-backup.sh"

echo "Writing smoke-test helper..."
cat > "${HOME}/lnote-smoke-test.sh" <<SMOKE
#!/usr/bin/env bash
set -euo pipefail
BASE_URL="\${1:-http://${SERVER_NAME}}"
curl -fsS "\${BASE_URL}/api/health"
echo
sudo nginx -t
systemctl is-active --quiet "php${PHP_VERSION}-fpm"
systemctl is-active --quiet nginx
echo "L-Note smoke test passed for \${BASE_URL}"
SMOKE
chmod 700 "${HOME}/lnote-smoke-test.sh"

if [[ "${ENABLE_SSL}" == "true" ]]; then
  if [[ "${SERVER_NAME}" == "_" || "${SERVER_NAME}" =~ ^[0-9.]+$ ]]; then
    echo "ENABLE_SSL=true requires SERVER_NAME to be a real domain, not '_' or an IP."
    exit 1
  fi

  echo "Installing HTTPS certificate with Certbot..."
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d "${SERVER_NAME}" --non-interactive --agree-tos --redirect -m "admin@${SERVER_NAME}" || {
    echo "Certbot failed. Check DNS points to this VPS, then rerun certbot manually."
    exit 1
  }
fi

echo "Deployment complete."
echo "Check: http://${SERVER_NAME}/api/health"
echo "If SERVER_NAME is '_', use your VPS IP in the browser."
echo "Backup helper: ${HOME}/lnote-backup.sh"
echo "Smoke test helper: ${HOME}/lnote-smoke-test.sh http://${SERVER_NAME}"
