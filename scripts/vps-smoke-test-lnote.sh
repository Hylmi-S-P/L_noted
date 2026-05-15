#!/usr/bin/env bash
set -euo pipefail

# Lightweight production check for L-Note VPS.
# Usage:
#   BASE_URL='http://203.0.113.10' bash scripts/vps-smoke-test-lnote.sh
#   BASE_URL='https://domain-anda.com' bash scripts/vps-smoke-test-lnote.sh

BASE_URL="${BASE_URL:-http://127.0.0.1}"
PHP_VERSION="${PHP_VERSION:-8.2}"

echo "Checking API health at ${BASE_URL}/api/health..."
curl -fsS "${BASE_URL}/api/health"
echo

echo "Checking Nginx config..."
sudo nginx -t

echo "Checking services..."
systemctl is-active --quiet nginx
systemctl is-active --quiet "php${PHP_VERSION}-fpm"

echo "L-Note production smoke test passed."
