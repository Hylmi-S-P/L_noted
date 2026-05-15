# L-Note Implementation Snapshot (Updated Handover)

Generated: 2026-05-15
Current local branch at update: feature/transactions-filter-v1

## Local Continuation Since Snapshot

Latest continuation (reference UI pass, 2026-05-15):
- Ruflo MCP availability confirmed in this session:
  - tool namespace exposed as `mcp__ruflo__`
  - initialized tracked swarm `swarm-1778823252155-qqdyr8`
  - registered UI-auditor agent record `agent-1778823255920-ccacpj`
  - note: current Ruflo tool surface tracks/coordinates state; local implementation was completed directly in Codex.
- Re-read handover and reference UI sources:
  - `refrence ui_ux/warm_reliable_laundry_assistant/DESIGN.md`
  - `refrence ui_ux/dashboard_l_note/code.html`
  - `refrence ui_ux/riwayat_transaksi/code.html`
  - `refrence ui_ux/detail_transaksi/code.html`
  - `refrence ui_ux/pilih_metode_transaksi/code.html`
- Frontend UI refactor started/completed for active validation flow:
  - added shared native design tokens:
    - `lnote-frontend/src/constants/theme.ts`
  - added shared RN UI primitives:
    - `lnote-frontend/src/components/UI/LNoteUI.tsx`
    - includes screen shell, top bar, bottom nav, card, button, badge, input, loading/empty states, status/payment labels
  - rebuilt dashboard toward reference style:
    - `lnote-frontend/src/screens/DashboardScreen.tsx`
    - teal daily revenue hero, active laundry cards, primary add action, bottom nav
  - rebuilt history toward reference style:
    - `lnote-frontend/src/screens/HistoryScreen.tsx`
    - search/date filters, status chips, transaction cards, status/payment badges, bottom nav
  - rebuilt add transaction toward reference style:
    - `lnote-frontend/src/screens/AddTransactionScreen.tsx`
    - customer/service selectable cards, improved empty/loading states, total card, large save button
  - rebuilt transaction detail toward reference style:
    - `lnote-frontend/src/screens/TransactionDetailScreen.tsx`
    - title changed from raw `Transaction #id` to `Detail Transaksi` with `Nota #id` as subtitle
    - customer and order detail cards, status/payment badges, status stepper, clearer update actions
  - updated simple router wiring:
    - `lnote-frontend/App.tsx`
    - history bottom nav can reset to dashboard; status bar/background aligned with new theme
  - aligned Expo SDK 54 native package versions after Metro compatibility warning:
    - `expo-secure-store` -> `~15.0.8`
    - `react-native-gesture-handler` -> `~2.28.0`
    - `react-native-safe-area-context` -> `~5.6.0`
    - `react-native-screens` -> `~4.16.0`
    - files: `lnote-frontend/package.json`, `lnote-frontend/package-lock.json`
  - removed explicit `newArchEnabled: false` from `lnote-frontend/app.json` because Expo Go SDK 54 always enables New Architecture
  - ignored transient Metro/debug logs via `lnote-frontend/.gitignore`
- Validation:
  - frontend: `npx tsc --noEmit` passes
  - Expo Metro: started with `npx expo start --lan`, waiting on `http://localhost:8081`
  - SigMap: `sigmap validate` passes config validity with existing warnings:
    - unknown config key `minCoverage`
    - `maxTokens` very high
    - coverage remains `0%`
- Remaining UI gaps at that point:
  - OCR camera/review and Settings were still pending, then completed in the next continuation entry below.
  - Run on Expo Go phone for visual spacing/safe-area inspection after Metro reload.

Latest continuation (OCR/settings UI completion, 2026-05-15):
- Continued reference-style frontend implementation after the dashboard/history/add/detail pass.
- Added Expo Go compatible receipt capture dependency:
  - `expo-image-picker`
  - updated `lnote-frontend/package.json`
  - updated `lnote-frontend/package-lock.json`
  - added Android camera/gallery permissions in `lnote-frontend/app.json`
- Added OCR frontend API wiring:
  - `lnote-frontend/src/services/api/ocrService.ts`
  - type: `OcrScanResult` in `lnote-frontend/src/types/domain.ts`
  - posts multipart image payload to `POST /api/ocr/scan`
- Added reference-style OCR screens:
  - `lnote-frontend/src/screens/ReceiptCaptureScreen.tsx`
    - camera/gallery picker entry
    - receipt framing guide
    - scan action with OCR handoff
  - `lnote-frontend/src/screens/OcrReviewScreen.tsx`
    - scanned image thumbnail
    - detected total/confidence card
    - customer/service selection
    - transaction save action
- Added Settings/integration status screen so bottom nav no longer has a dead destination:
  - `lnote-frontend/src/screens/SettingsScreen.tsx`
  - `lnote-frontend/src/services/api/integrationService.ts`
  - type: `IntegrationStatus` in `lnote-frontend/src/types/domain.ts`
  - uses:
    - `GET /api/integrations/status`
    - `POST /api/integrations/test-notification`
- Router/navigation updates:
  - `lnote-frontend/App.tsx`
  - new screens:
    - `scan`
    - `ocrReview`
    - `settings`
  - Dashboard now exposes:
    - `Tambah Transaksi`
    - `Scan Nota`
    - `Lihat semua riwayat transaksi`
  - bottom nav now routes `Atur` to Settings.
- Validation:
  - frontend: `npx tsc --noEmit` passes
  - backend: `php artisan test` passes functionally with existing PDO deprecation notices
  - SigMap: `sigmap validate` passes config validity with existing warnings:
    - unknown config key `minCoverage`
    - `maxTokens` very high
    - coverage remains `0%`
  - Expo Metro restarted with `npx expo start --lan`, waiting on `http://localhost:8081`, no package compatibility warnings in latest log.
- Remaining UI/product gaps:
  - Phone visual QA is still needed for OCR camera/review, especially camera permission flow on the physical Android device.
  - OCR review currently creates a normal server-computed transaction; detected OCR total is shown for operator comparison but is not forced into transaction amount because backend transaction creation still computes totals from selected service and quantity.
  - FCM device token registration from the mobile app still needs a true frontend notification-token implementation if push notifications must be validated end-to-end on device.

Latest continuation (login validation fix, 2026-05-15):
- User reported Expo app login showed generic "login failed, check credentials/backend connection".
- Verified frontend API URL:
  - `lnote-frontend/.env` points to `http://192.168.111.2:8010/api`
- Verified backend reachability:
  - `POST http://127.0.0.1:8010/api/auth/login`
  - `POST http://192.168.111.2:8010/api/auth/login`
- Root cause:
  - `test@example.com` did not exist in the current local MariaDB `lnote` database.
- Restored local validation account:
  - email: `test@example.com`
  - password: `password`
  - user id created/updated locally: `20`
- Restored user-scoped validation data:
  - 2 customers
  - 3 service prices
- Verified login now returns success through LAN URL.
- Frontend login error handling improved:
  - `lnote-frontend/src/screens/LoginScreen.tsx`
  - now displays backend error message or network-specific message instead of one generic credentials/backend alert.
- Validation:
  - frontend: `npx tsc --noEmit` passes

Latest continuation (OCR provider diagnosis + demo seed hardening, 2026-05-15):
- User reported high-resolution receipt photos still produce `Belum terdeteksi` / `0% yakin`.
- Checked Laravel logs and live OCR endpoint with user-provided receipt sample.
- Root cause:
  - Google Vision API is rejecting requests with `403 BILLING_DISABLED`.
  - Exact provider code returned by live probe: `BILLING_DISABLED`.
  - Camera resolution is not the current blocker; backend receives the image but Google Vision returns no OCR text because billing is disabled for the Google Cloud project.
- Backend OCR response improved:
  - `lnote-backend/app/Services/OcrService.php`
  - now returns:
    - `provider_status`
    - `provider_error_code`
    - `provider_error_message`
  - frontend can show the real provider reason instead of only `Belum terdeteksi`.
- OCR amount parsing hardened for the current nota format:
  - prefers amounts near `TOTAL`, `jumlah`, or `tagihan`
  - handles `8.000`, `8-000`, `8 000`
  - ignores date-like values such as `02-04-26`
  - tests added in `lnote-backend/tests/Unit/OcrServiceTest.php`
- Integration status hardened:
  - `lnote-backend/app/Http/Controllers/Api/IntegrationController.php`
  - now checks whether Google Vision is actually ready, not only whether an API key exists.
  - Settings screen now displays Vision provider error details.
- Frontend OCR review updated:
  - `lnote-frontend/src/screens/OcrReviewScreen.tsx`
  - displays provider error card when OCR provider fails.
- Demo data issue discovered:
  - Running `php artisan test` with `RefreshDatabase` wipes the local DB used by manual testing.
  - That removed `test@example.com`, causing login to fail again after tests.
- Seeders hardened:
  - `lnote-backend/database/seeders/DatabaseSeeder.php`
    - now recreates `test@example.com` with password `password`
  - `lnote-backend/database/seeders/CustomerSeeder.php`
    - now uses `updateOrCreate`
  - `lnote-backend/database/seeders/ServicePriceSeeder.php`
    - now uses `updateOrCreate`
- Reseeded local DB:
  - `php artisan db:seed`
  - verified `POST /api/auth/login` succeeds for `test@example.com/password`.
- Important operational note:
  - after running backend tests locally, run `php artisan db:seed` again before phone/manual validation.
- Validation:
  - backend targeted: `php artisan test --filter='Ocr|Integration'` passes functionally with existing PDO deprecation notices
  - frontend: `npx tsc --noEmit` passes

Latest continuation (manual-only transaction pivot, 2026-05-15):
- Product decision:
  - OCR is no longer part of the active user flow.
  - Transaction creation is manual input only.
- Frontend OCR removal:
  - removed visible `Scan Nota` action from Dashboard
  - removed `scan` and `ocrReview` screens from `lnote-frontend/App.tsx`
  - deleted:
    - `lnote-frontend/src/screens/ReceiptCaptureScreen.tsx`
    - `lnote-frontend/src/screens/OcrReviewScreen.tsx`
    - `lnote-frontend/src/services/api/ocrService.ts`
  - removed `OcrScanResult` frontend type
  - removed Google Vision/OCR row from Settings screen
  - removed `expo-image-picker` dependency and Android camera/gallery permissions
- Backend OCR code remains parked but unused by the app:
  - no active frontend route calls `POST /api/ocr/scan`
  - can be removed later if final scope stays manual-only
- Validation:
  - frontend: `npx tsc --noEmit` passes
  - search check confirmed no OCR/scan references remain in active frontend source/package/app config

Status: `schema-alignment-v1` implementation continued on current local branch (not yet split/pushed as its own branch).

Latest continuation (safe mode, 2026-05-15):
- Frontend compatibility completed for transaction totals in list/detail views:
  - `lnote-frontend/src/screens/HistoryScreen.tsx` now renders `total_price ?? amount`
  - `lnote-frontend/src/screens/TransactionDetailScreen.tsx` now renders `total_price ?? amount`
- Validation rerun:
  - `npx tsc --noEmit` passes
  - `php artisan test` passes functionally
- Note on test execution:
  - Running multiple `php artisan test` commands in parallel against the same MySQL test DB can cause migration-table race failures (`migrations`/`password_reset_tokens` exists/missing). Sequential execution is stable.
- Added backend feature completion for next roadmap items:
  - Service price CRUD API:
    - `GET/POST/GET{id}/PUT/DELETE /api/service-prices`
    - files:
      - `lnote-backend/app/Http/Controllers/Api/ServicePriceController.php`
      - `lnote-backend/app/Http/Requests/ServicePrice/StoreServicePriceRequest.php`
      - `lnote-backend/app/Http/Requests/ServicePrice/UpdateServicePriceRequest.php`
  - Reports API + CSV export:
    - `GET /api/reports/daily`
    - `GET /api/reports/summary?from=&to=`
    - `GET /api/reports/export?from=&to=` (CSV stream download)
    - file:
      - `lnote-backend/app/Http/Controllers/Api/ReportController.php`
  - OCR endpoint baseline + throttling:
    - `POST /api/ocr/scan` (stores image and returns stable OCR contract payload)
    - route middleware `throttle:ocr` (20/min per user/IP)
    - files:
      - `lnote-backend/app/Http/Controllers/Api/OcrController.php`
      - `lnote-backend/app/Providers/AppServiceProvider.php`
  - Status/payment compatibility widening:
    - accepts both EN aliases and existing ID values:
      - status: `process/done/taken` -> normalized to `proses/selesai/diambil`
      - payment: bool/`paid`/`unpaid` -> normalized to `lunas`/`belum_lunas`
    - files:
      - `lnote-backend/app/Http/Controllers/Api/TransactionController.php`
      - `lnote-backend/app/Http/Requests/Transaction/UpdateTransactionRequest.php`
      - `lnote-backend/app/Http/Requests/Transaction/UpdateTransactionStatusRequest.php`
      - `lnote-backend/app/Http/Requests/Transaction/UpdateTransactionPaymentRequest.php`
  - Reminder hook on completion status:
    - logs reminder trigger when status enters `selesai/diambil`
    - file:
      - `lnote-backend/app/Services/NotificationService.php`
  - Scheduled receipt cleanup job:
    - daily 02:00 delete old receipt files (>1 year, taken/diambil) and null DB path
    - file:
      - `lnote-backend/routes/console.php`
- Added/updated frontend API wiring:
  - `lnote-frontend/src/services/api/transactionService.ts`
    - service price create/update/delete
    - daily report + summary report helper
    - export URL helper
  - `lnote-frontend/src/screens/DashboardScreen.tsx`
    - daily summary card using `/reports/daily`
- Added backend feature tests:
  - `lnote-backend/tests/Feature/ServicePriceApiTest.php`
  - `lnote-backend/tests/Feature/ReportApiTest.php`
  - `lnote-backend/tests/Feature/OcrApiTest.php`
- Production-readiness continuation (2026-05-15):
  - Real Google Vision OCR integration path added (env-gated):
    - `GOOGLE_VISION_API_KEY` used for `DOCUMENT_TEXT_DETECTION`
    - total extraction heuristic from OCR text maintained
    - files:
      - `lnote-backend/app/Services/OcrService.php`
      - `lnote-backend/app/Http/Controllers/Api/OcrController.php`
      - `lnote-backend/config/services.php`
  - Real FCM send path added (env-gated):
    - `FCM_SERVER_KEY` used for push send to registered device token
    - file:
      - `lnote-backend/app/Services/NotificationService.php`
  - Device token registration endpoint added:
    - `POST /api/auth/device-token`
    - files:
      - `lnote-backend/app/Http/Requests/Auth/StoreDeviceTokenRequest.php`
      - `lnote-backend/app/Http/Controllers/Api/AuthController.php`
      - `lnote-backend/routes/api.php`
  - User schema extended for FCM:
    - migration:
      - `lnote-backend/database/migrations/2026_05_15_000300_add_fcm_device_token_to_users_table.php`
    - model:
      - `lnote-backend/app/Models/User.php`
  - Added `.env.example` with required integration keys:
    - `lnote-backend/.env.example`
  - Added tests:
    - `lnote-backend/tests/Unit/OcrServiceTest.php`
    - `lnote-backend/tests/Feature/AuthApiTest.php` (device-token scenario)
  - Docs updated:
    - `lnote-backend/README.md` updated with new endpoints/env vars
- Latest continuation (frontend/runtime + FCM v1 hardening, 2026-05-15):
  - FCM integration migrated from Legacy to HTTP v1 (service-account OAuth):
    - removed runtime dependency on `FCM_SERVER_KEY` flow
    - added JWT assertion + OAuth token exchange + v1 send API call
    - files:
      - `lnote-backend/app/Services/NotificationService.php`
      - `lnote-backend/config/services.php`
      - `lnote-backend/app/Http/Controllers/Api/IntegrationController.php`
      - `lnote-backend/.env.example`
  - Integration test/status endpoints are active and verified:
    - `GET /api/integrations/status`
    - `POST /api/integrations/test-notification`
    - `POST /api/auth/device-token`
  - Local environment updates:
    - frontend `.env` created and wired to backend LAN URL for phone testing:
      - `lnote-frontend/.env`
    - backend served on `:8010` during mobile validation to avoid port collision on `:8000`
  - Frontend stability fixes for Expo Go Android:
    - added root `lnote-frontend/app.json`
    - replaced native-stack runtime usage with simple screen-state routing in `lnote-frontend/App.tsx` (temporary stabilization path)
    - added `SafeAreaProvider` root wrapper
    - fixed Android safe-area top clipping for Back buttons:
      - `lnote-frontend/src/screens/AddTransactionScreen.tsx`
      - `lnote-frontend/src/screens/HistoryScreen.tsx`
      - `lnote-frontend/src/screens/TransactionDetailScreen.tsx`
    - added hardware back handling and explicit Back buttons across non-dashboard screens
  - Local test data bootstrap for UX validation:
    - seeded customers + service prices for `test@example.com` (user-scoped)
    - verified at least one transaction exists (`id=10` during run)
  - Bug fix:
    - transaction detail status update now cycles through states instead of stalling on `diambil`
    - file:
      - `lnote-frontend/src/screens/TransactionDetailScreen.tsx`
  - Validation:
    - backend: `php artisan test` pass (functional, with existing PDO deprecation noise)
    - frontend: `npx tsc --noEmit` pass

Current known gap after this handover:
- UI has not yet been fully rebuilt to match `refrence ui_ux/*` visual system.
  - Reference assets reviewed:
    - `refrence ui_ux/warm_reliable_laundry_assistant/DESIGN.md`
    - `refrence ui_ux/dashboard_l_note/code.html`
    - `refrence ui_ux/riwayat_transaksi/code.html`
    - `refrence ui_ux/detail_transaksi/code.html`
    - `refrence ui_ux/pilih_metode_transaksi/code.html`
  - Next execution target: implement shared RN design tokens and refactor Dashboard/History/Detail/Add screens to reference style language.

Latest runtime state (local):
- Backend `.env` switched from SQLite to Laragon MariaDB/MySQL (`DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=lnote`, `DB_USERNAME=root`).
- `php artisan migrate` executed successfully on local MariaDB, including:
  - `2026_05_15_000200_align_schema_with_erd_v1`
- `php artisan test` passes functionally; remaining output is deprecation noise related to `PDO::MYSQL_ATTR_SSL_CA` from current Laravel vendor/framework internals.

Completed locally:
- Added additive schema-alignment migration:
  - `lnote-backend/database/migrations/2026_05_15_000200_align_schema_with_erd_v1.php`
- Updated backend ownership scoping and compatibility logic:
  - `lnote-backend/app/Http/Controllers/Api/CustomerController.php`
  - `lnote-backend/app/Http/Controllers/Api/TransactionController.php`
  - `lnote-backend/routes/api.php`
- Expanded model fillables for aligned fields:
  - `lnote-backend/app/Models/Customer.php`
  - `lnote-backend/app/Models/ServicePrice.php`
  - `lnote-backend/app/Models/Transaction.php`
- Added compatibility accessors and request-schema support for old/new field names:
  - `lnote-backend/app/Http/Requests/Customer/StoreCustomerRequest.php`
  - `lnote-backend/app/Http/Requests/Customer/UpdateCustomerRequest.php`
  - `lnote-backend/app/Models/Customer.php` (`phone` <-> `phone_number`)
  - `lnote-backend/app/Models/ServicePrice.php` (`price` <-> `price_per_kg`)
  - `lnote-backend/app/Models/Transaction.php` (`amount` <-> `total_price`)
- Updated seeders for aligned ERD fields:
  - `lnote-backend/database/seeders/CustomerSeeder.php`
  - `lnote-backend/database/seeders/ServicePriceSeeder.php`
- Updated frontend compatibility with aligned API fields:
  - `lnote-frontend/src/types/domain.ts`
  - `lnote-frontend/src/screens/AddTransactionScreen.tsx`
- Extended backend feature tests for aligned responses/payloads:
  - `lnote-backend/tests/Feature/CustomerApiTest.php`
  - `lnote-backend/tests/Feature/TransactionApiTest.php`

Behavior notes:
- Additive-only DB changes (no destructive renames/drops in `up()`).
- Legacy compatibility kept for existing null-owned customer/service data (`orWhereNull('user_id')`) while new writes are user-scoped.
- Transaction create now also hydrates aligned columns (`weight_kg`, `service_type`, `price_per_kg`, `total_price`) while preserving existing API fields.
- API compatibility now supports mixed clients during migration:
  - customer phone can be sent/read as `phone` or `phone_number`
  - service unit price can be read as `price` or `price_per_kg`
  - transaction total can be read as `amount` or `total_price`

## Branches Delivered

1. feature/mvp-core-backend
- Commit: 5e5ae53
- PR: https://github.com/Hylmi-S-P/L_noted/pull/new/feature/mvp-core-backend
- Scope:
  - Sanctum auth (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
  - Protected customer/transaction APIs
  - Status/payment mutation endpoints
  - FormRequest validation + unified API envelope
  - Backend feature tests for core flows

2. feature/mvp-core-frontend
- Commit: 91c7be0
- PR: https://github.com/Hylmi-S-P/L_noted/pull/new/feature/mvp-core-frontend
- Scope:
  - Auth-gated navigation and session handling
  - Shared API service layer + SecureStore token persistence
  - Login, dashboard, add transaction, history, detail/update status-payment screens

3. feature/ocr-v1
- Commit: f49466a
- PR: https://github.com/Hylmi-S-P/L_noted/pull/new/feature/ocr-v1
- Scope:
  - OCR API endpoint: `POST /api/ocr/scan`
  - Image compression + storage path handling in backend
  - Google Vision integration and total-price extraction heuristic
  - Frontend camera capture + OCR review + handoff into add transaction flow

4. feature/reports-v1
- Commit: 0e24f70
- PR: https://github.com/Hylmi-S-P/L_noted/pull/new/feature/reports-v1
- Scope:
  - Report endpoints:
    - `GET /api/reports/daily`
    - `GET /api/reports/summary?from=&to=`
  - Dashboard cards for daily/monthly metrics
  - Backend report feature tests

5. feature/transactions-filter-v1
- Commit: c0aad73
- PR: https://github.com/Hylmi-S-P/L_noted/pull/new/feature/transactions-filter-v1
- Scope:
  - Backend transaction list filters:
    - `date`
    - `status`
    - `payment_status`
    - `customer` (name search)
  - User-scoped transaction listing (`where user_id = auth()->id()`)
  - History screen switched to server-driven filtering
  - Backend feature tests for filters and user isolation

## Main Branch Status

- main currently includes MVP backend + frontend core merge at: a4a70dd
- OCR, reports, and transaction filtering are implemented in separate feature branches and ready for selective merge.

## Verification Snapshot

Latest validation across implemented features:
- Backend tests: `php artisan test` passed (with non-blocking PHP deprecation warnings in environment).
- Frontend compile: `npx tsc --noEmit` passed.
- Additional local validation after schema-alignment continuation:
  - Backend tests: `php artisan test` passed.
  - Frontend compile: `npx tsc --noEmit` passed.
  - SigMap: `sigmap validate` passed config check, but reports warnings:
    - unknown config key `minCoverage` (ignored)
    - `maxTokens` very high (`100000`)
    - coverage currently `0%`

## If You Want To Try Something New

Recommended safe experiment branches:

1. feature/schema-alignment-v1
- Continue from local progress above:
  - migration already applied locally on MariaDB; apply on target env(s) as needed
  - verify data backfill (`phone -> phone_number`, `amount -> total_price`, service `price -> price_per_kg` for `unit=kg`)
  - decide when to remove null-ownership compatibility path after data is fully user-scoped

2. feature/ocr-accuracy-v2
- Improve OCR parser confidence and extraction rules; keep current OCR endpoint contract stable.

3. feature/reports-export-v1
- Add simple report export endpoint (CSV first), then wire download/share from frontend.

## Handover Notes

- Local docs in `docs/` are intentionally uncommitted for flexible iteration.
- Existing unrelated `.github/context-*` local changes may appear in git status; do not include them in feature commits unless explicitly intended.

## Latest continuation (payment detail cleanup, 2026-05-15)

Scope completed:
- Removed the clipped payment badge from `lnote-frontend/src/screens/TransactionDetailScreen.tsx`.
- Detail Transaksi now keeps the payment section text-only inside the card:
  - `Tagihan belum lunas` when unpaid.
  - `Tagihan sudah lunas` when paid.
- The payment action button remains the only prominent status action:
  - `Tandai Lunas`
  - `Tandai Belum Lunas`

Validation:
- Frontend compile passed: `npx tsc --noEmit`.
- Verified no `Badge`, `paymentLabel`, `paymentTone`, or `paymentRow` references remain in `TransactionDetailScreen.tsx`.

Working agreement update:
- Every implementation turn should append an entry to this handover file before final response.

## Latest continuation (reports and CSV export, 2026-05-15)

Scope completed:
- Added a mobile `Laporan` screen at `lnote-frontend/src/screens/ReportScreen.tsx`.
- Wired reports into the manual app router and bottom navigation:
  - Dashboard now has a `Laporan Usaha` entry card.
  - Bottom navigation now has `Beranda`, `Riwayat`, `Laporan`, and `Atur`.
- Reports screen now shows:
  - today's total billings
  - paid revenue
  - unpaid total
  - transaction count
  - date-range summary
  - per-day breakdown
- Added CSV export action in the frontend using the existing protected backend endpoint.
  - In Expo Go, CSV is displayed as selectable text in-app so it can be copied/saved without adding native file/share dependencies.
  - Later production build can upgrade this to real file download/share using Expo FileSystem/Sharing.
- Improved backend report payloads in `ReportController`:
  - `paid_revenue`
  - `unpaid_total`
  - normalized numeric `by_day` rows
  - CSV columns focused on payment/business reporting, not operational laundry status.
- Expanded `ReportApiTest` coverage for paid/unpaid totals and by-day summary rows.

Validation:
- Backend focused tests passed: `php artisan test --filter=ReportApiTest`.
  - Existing PDO deprecation warnings still appear, non-blocking.
- Frontend compile passed: `npx tsc --noEmit`.
- Local demo data was reseeded after backend tests: `php artisan db:seed`.
- SigMap validation passed config check with existing warnings:
  - unknown config key `minCoverage` ignored
  - `maxTokens` high
  - coverage 0%

Next suggested implementation:
- Build dedicated customer management and service management screens so users can edit/delete master data outside the transaction form.

## Latest continuation (simple master data management, 2026-05-15)

Scope completed:
- Added simple elderly-friendly master data management from `Pengaturan`:
  - `Data Pelanggan`
  - `Data Layanan`
- Added `lnote-frontend/src/screens/CustomerManagementScreen.tsx`:
  - large `Tambah Pelanggan` button
  - large customer cards with name and phone only
  - tap a card to edit
  - edit fields: `Nama`, `Nomor HP`, `Alamat opsional`
  - delete is only available inside the edit form and requires confirmation
- Added `lnote-frontend/src/screens/ServiceManagementScreen.tsx`:
  - large `Tambah Layanan` button
  - large service cards with name and `Harga / kg`
  - tap a card to edit
  - edit fields: `Nama Layanan`, `Harga per kg`
  - delete is only available inside the edit form and requires confirmation
- Wired the new screens into the local app router in `lnote-frontend/App.tsx`.
- Added Settings cards in `lnote-frontend/src/screens/SettingsScreen.tsx` with simple Indonesian labels.
- Extended frontend customer API helpers:
  - `updateCustomer`
  - `deleteCustomer`
- Hardened backend delete protection:
  - customer with transactions returns `422` with `Pelanggan ini sudah punya transaksi, jadi tidak bisa dihapus.`
  - global/default service or service already used returns `422` with `Layanan ini sudah dipakai, jadi tidak bisa dihapus.`
- Extended backend feature tests for blocked and successful deletes.

Validation:
- Initial parallel backend test run collided on the shared local MySQL test schema, leaving migrations half-reset.
- Restored local schema/data with `php artisan migrate:fresh --seed`.
- Re-ran backend tests sequentially; both passed with existing PDO deprecation warnings only:
  - `php artisan test --filter=CustomerApiTest`
  - `php artisan test --filter=ServicePriceApiTest`
- Re-seeded demo data after tests: `php artisan db:seed`.
- Frontend compile passed: `npx tsc --noEmit`.
- SigMap validation passed config check with existing warnings:
  - unknown config key `minCoverage` ignored
  - `maxTokens` high
  - coverage 0%

Next suggested implementation:
- Manual phone validation/formatting polish and small usability QA pass on device, especially touch size and readability for elderly users.

## Latest continuation (automatic FCM device registration, 2026-05-15)

Scope completed:
- Added Expo notification dependencies to the frontend:
  - `expo-notifications`
  - `expo-device`
  - `expo-constants`
- Added `expo-notifications` config plugin in `lnote-frontend/app.json`.
- Added `lnote-frontend/src/services/notification/pushRegistration.ts`:
  - checks for a physical device
  - limits native FCM registration to Android for now because the backend sends through FCM HTTP v1
  - skips unsupported Expo Go/store-client push registration with a readable message
  - creates the Android notification channel before token fetch
  - requests notification permission
  - fetches native device push token with `Notifications.getDevicePushTokenAsync()`
  - saves the token through the existing `POST /api/auth/device-token` endpoint
- Automatic registration now runs quietly after:
  - successful login
  - restored authenticated session on app boot
- Simplified `Pengaturan` notification UI:
  - removed the raw FCM token paste field for normal users
  - changed status labels to `FCM Backend` and `Perangkat Ini`
  - added `Daftarkan Perangkat` retry button
  - kept `Tes Notifikasi`

Production push checklist:
- Use a real Android development/production build for push validation; Android Expo Go on SDK 53+ is not enough for remote push notifications.
- Firebase Android app/package must match the production Android package used by the build.
- Backend `FCM_SERVICE_ACCOUNT_JSON` must point to the valid Firebase service-account JSON path or JSON string.
- Test on a real Android phone:
  - login
  - accept notification permission
  - open `Pengaturan`
  - confirm `Perangkat Ini: Aktif`
  - tap `Tes Notifikasi`
  - confirm notification arrives

Validation:
- Frontend compile passed: `npx tsc --noEmit`.
- Backend focused tests passed sequentially with existing PDO deprecation warnings only:
  - `php artisan test --filter=AuthApiTest`
  - `php artisan test --filter=IntegrationApiTest`
- Demo data reseeded after backend tests: `php artisan db:seed`.
- SigMap validation passed config check with existing warnings:
  - unknown config key `minCoverage` ignored
  - `maxTokens` high
  - coverage 0%

Notes:
- `npx expo install` reported 4 moderate npm audit findings; no automatic audit fix was applied because that can introduce breaking dependency changes.
- Native push registration is intentionally Android-only for this FCM direct-send v1. iOS would need an APNs path or Expo Push Service decision later.

Next suggested implementation:
- Prepare the Android development/production build path: set final Android package name, add Firebase Android app credentials if needed, and create a short VPS + mobile deployment runbook.

## Latest troubleshooting (Expo notifications module resolve, 2026-05-15 19:37 +07:00)

Observed phone error:
- Metro returned `UnableToResolveError` for `expo-notifications` from `lnote-frontend/src/services/notification/pushRegistration.ts`.

Local verification:
- `lnote-frontend/package.json` already includes:
  - `expo-notifications`
  - `expo-device`
  - `expo-constants`
- `lnote-frontend/node_modules` contains those packages.
- `npm ls expo-notifications expo-device expo-constants --depth=0` passes.
- `npx tsc --noEmit` passes.

Likely cause:
- Expo/Metro is running with stale cache or was started from the wrong project folder.

Fix path:
- Stop Expo completely.
- Start it from `D:\Anyer Panarukan\lnote-frontend`.
- Run `npx expo start -c` to clear Metro cache.
- Reload the phone app from the new QR/session.

## Latest continuation (local Android development build, 2026-05-15 20:12 +07:00)

Scope completed:
- Verified Android emulator became visible/usable after cold boot.
- Added stable Android application id in `lnote-frontend/app.json`:
  - `com.lnoted.laundry`
- Generated the native Android project through Expo prebuild during `npx expo run:android`.
- Built and installed a local debug Android development build on the running emulator.
- APK output exists at:
  - `lnote-frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Important runtime notes:
- First Expo Go attempt failed because Expo could not fetch Expo Go (`TypeError: fetch failed`), so the working path is now a local development build instead of Expo Go.
- `npx expo run:android` succeeded, but the first run warned that port `8081` was already used.
- `npx expo start --dev-client --android --clear` then started Metro on `8081`.
- The emulator focused the app activity:
  - `com.lnoted.laundry/.MainActivity`

Validation:
- Frontend compile passed:
  - `npx tsc --noEmit`

Useful commands:
- Start Android app/build:
  - `cd "D:\Anyer Panarukan\lnote-frontend"`
  - `npx expo run:android`
- Start Metro for the installed development build:
  - `npx expo start --dev-client --android --clear`

Next suggested implementation:
- Once the user confirms the emulator UI is visible, continue with the agreed production-hardening queue:
  - simplify transaction input
  - improve offline/error messages
  - add stronger delete confirmations
  - prepare VPS deployment
  - add database backup workflow
  - write a simple client user guide

## Latest troubleshooting (Android SDK location, 2026-05-15)

Observed error:
- `npx expo run:android` failed with:
  - `SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in android/local.properties.`

Fix applied:
- Created local-only Gradle SDK config:
  - `lnote-frontend/android/local.properties`
  - content points to `C:\Users\hylmi\AppData\Local\Android\Sdk`
- This file is ignored by the Android gitignore and should stay local to this laptop.

Validation:
- Gradle debug build now passes:
  - `.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8082 "-PreactNativeArchitectures=x86_64,arm64-v8a"`

Recommended permanent Windows environment variables:
- `ANDROID_HOME=C:\Users\hylmi\AppData\Local\Android\Sdk`
- Add these to user `Path`:
  - `C:\Users\hylmi\AppData\Local\Android\Sdk\platform-tools`
  - `C:\Users\hylmi\AppData\Local\Android\Sdk\emulator`
  - `C:\Users\hylmi\AppData\Local\Android\Sdk\cmdline-tools\latest\bin`

Follow-up applied:
- Added Windows user environment variables:
  - `ANDROID_HOME=C:\Users\hylmi\AppData\Local\Android\Sdk`
  - `ANDROID_SDK_ROOT=C:\Users\hylmi\AppData\Local\Android\Sdk`
- Added Android SDK tool directories to the Windows user `Path`.
- Current shell/old terminals may still need to be reopened before they inherit the new environment.

## Latest continuation (production hardening guides and simpler input, 2026-05-15 20:45 +07:00)

Scope completed:
- Simplified `Tambah Transaksi` for elderly users:
  - add-customer and add-service forms are hidden behind `Tambah` buttons
  - main flow now reads as `1. Pilih Pelanggan`, `2. Pilih Layanan`, `3. Berat dan Harga`
  - decimal weight helper now says users can use comma or dot, for example `1,5` or `2.3`
  - two pricing modes remain: `Hitung Sistem` and `Harga Manual`
- Improved friendly app errors:
  - backend offline messages use `Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.`
  - save failures use `Gagal menyimpan. Coba lagi.`
  - login missing fields now uses Indonesian wording
- Strengthened delete confirmations:
  - customer delete says `Hapus pelanggan? Data ini tidak bisa dikembalikan.`
  - service delete says `Hapus layanan? Pastikan layanan ini memang salah dibuat.`
- Added operations/client docs:
  - `docs/ANDROID_EMULATOR_GUIDE.md`
  - `docs/VPS_DEPLOYMENT_CHECKLIST.md`
  - `docs/DATABASE_BACKUP_GUIDE.md`
  - `docs/CLIENT_USER_GUIDE.md`
- VPS checklist was corrected for Laravel PHP requirement:
  - backend requires PHP `^8.2`
  - Nginx example uses `php8.2-fpm`

Validation:
- Frontend compile passed:
  - `npx tsc --noEmit`
- Backend focused tests passed sequentially with existing PDO deprecation warnings only:
  - `php artisan test --filter=CustomerApiTest`
  - `php artisan test --filter=ServicePriceApiTest`
  - `php artisan test --filter=TransactionApiTest`
- Demo data reseeded after backend tests:
  - `php artisan db:seed`

Next suggested implementation:
- Manual Android emulator/phone QA using `docs/ANDROID_EMULATOR_GUIDE.md`, then fix any UI issues found before VPS deployment.

## Latest continuation (deployment prep + optional FCM/OCR flags, 2026-05-15 21:05 +07:00)

Context:
- User completed the manual feature checklist and is ready to deploy.
- Production target is a simple laundry note/transaction app, so OCR and push notifications are not production-critical.

Scope completed:
- Added explicit frontend feature flags:
  - `lnote-frontend/src/config/features.ts`
  - `EXPO_PUBLIC_ENABLE_PUSH=false`
  - `EXPO_PUBLIC_ENABLE_OCR=false`
- FCM/push registration is now disabled unless `EXPO_PUBLIC_ENABLE_PUSH` is truthy:
  - `lnote-frontend/App.tsx` no longer statically imports the push registration module.
  - automatic push registration after login/session restore is skipped when push is disabled.
  - push module is dynamically imported only when the feature flag is enabled.
- Settings screen now hides normal push actions when push is disabled:
  - no `Daftarkan Perangkat` button
  - no `Tes Notifikasi` button
  - integration card shows `Notifikasi: Dimatikan`
  - wording explains notifications are not used for this production version.
- Updated frontend env examples:
  - `lnote-frontend/.env.example`
  - current local `lnote-frontend/.env` now includes `EXPO_PUBLIC_ENABLE_PUSH=false` and `EXPO_PUBLIC_ENABLE_OCR=false`
- Added deployment assets:
  - `scripts/vps-install-lnote.sh`
  - `docs/LNOTE_DEPLOY_RUNBOOK.md`
- Updated `docs/VPS_DEPLOYMENT_CHECKLIST.md` with production flags and notes:
  - OCR UI unused
  - FCM disabled
  - backend `FCM_*` values may stay empty for this deployment.

FCM risk assessment:
- With `EXPO_PUBLIC_ENABLE_PUSH=false`, FCM should not break login, transaction creation, reports, customer management, or service management.
- Backend FCM endpoints remain parked for future use, but Settings no longer calls them in the normal disabled state.
- Backend can deploy with empty `FCM_*` values.

Validation:
- Frontend compile passed:
  - `npx tsc --noEmit`

Next deployment steps:
- Clone/upload project to VPS.
- Run `scripts/vps-install-lnote.sh` on Ubuntu 22.04 with `DB_PASSWORD` and `SERVER_NAME`.
- Verify `http://IP_VPS/api/health`.
- Update `lnote-frontend/.env` to `EXPO_PUBLIC_API_URL=http://IP_VPS/api`.
- Rebuild Android app.

## Git handover (2026-05-15 21:20 +07:00)

Repository status:
- Deployment-ready implementation was committed on `feature/transactions-filter-v1`:
  - `9fa7792 feat: prepare l-note for production deployment`
- Feature branch was pushed to GitHub:
  - `origin/feature/transactions-filter-v1`
- Feature branch was merged into `main` with merge commit:
  - `5a03f5f merge: production-ready l-note deployment`
- `main` was pushed to GitHub:
  - `origin/main`

Local-only items intentionally not committed:
- Firebase service account files under `lnote-backend/storage/keys/`
- backend serve logs
- local agent/runtime folders
- generated SigMap context changes in `.github/`
- untracked `docs/SIGMAP_QUESTION.txt`

## Latest continuation (minimum aman production stabilization, 2026-05-15 21:45 +07:00)

Context:
- User decided formal pentest is not needed for this small one-client laundry app.
- Target is pragmatic minimum security: stable deploy, protected env, firewall, backup, and smoke testing.

Scope completed:
- Backend API hardening:
  - added a named `login` rate limiter in `lnote-backend/app/Providers/AppServiceProvider.php`
  - applied `throttle:login` to `POST /api/auth/login`
  - limit is 5 login attempts per minute per email/IP key
- VPS deployment script hardened:
  - `scripts/vps-install-lnote.sh` now supports `ENABLE_FIREWALL=true` by default
  - UFW opens only OpenSSH and Nginx Full
  - optional `ENABLE_SSL=true` path installs Certbot when `SERVER_NAME` is a real domain
  - deploy now creates `~/lnote-backup.sh`
  - deploy now creates `~/lnote-smoke-test.sh`
- Added reusable VPS helper scripts:
  - `scripts/vps-backup-lnote.sh`
  - `scripts/vps-smoke-test-lnote.sh`
- Backup handling improved:
  - backup scripts use a temporary MySQL option file instead of exposing the DB password via `mysqldump -p...` process arguments
  - backup output is stored under `~/lnote-backups` with restricted file permission
- Documentation updated:
  - `docs/VPS_DEPLOYMENT_CHECKLIST.md`
  - `docs/DATABASE_BACKUP_GUIDE.md`
  - `docs/LNOTE_DEPLOY_RUNBOOK.md`

Validation:
- Backend auth tests passed with existing PDO deprecation warnings only:
  - `php artisan test --filter=AuthApiTest`
- Route cache compatibility checked and passed:
  - `php artisan route:cache`
  - then cleared again for local development with `php artisan route:clear`
- Demo data reseeded after backend tests:
  - `php artisan db:seed`
- Shell syntax checked using Git for Windows `sh.exe -n` because Windows WSL bash launcher is installed but no Linux `/bin/bash` is available:
  - `scripts/vps-install-lnote.sh`
  - `scripts/vps-backup-lnote.sh`
  - `scripts/vps-smoke-test-lnote.sh`

Production notes:
- Production should use Nginx + PHP-FPM, not `php artisan serve`.
- Keep `APP_ENV=production` and `APP_DEBUG=false` on VPS.
- Keep frontend flags disabled for this deployment:
  - `EXPO_PUBLIC_ENABLE_PUSH=false`
  - `EXPO_PUBLIC_ENABLE_OCR=false`
- If using an IP only, use HTTP for first deploy.
- If using a real domain, enable HTTPS and rebuild the Android app with the HTTPS API URL.

## Latest note (cache and production account handling, 2026-05-15)

Cache decision:
- Current frontend only persists the auth token through `expo-secure-store`.
- Customer, service, transaction, and report data are fetched from the backend and are not cached for offline use.
- Recommended future improvement: cache last successful `customers` and `service-prices` responses for read-only display when the server is unstable.
- Transaction creation should remain online-only for now to avoid duplicate nota/sync conflicts.
- Suggested offline wording if read-cache is added later: `Data ditampilkan dari cache. Nyalakan server untuk menyimpan transaksi.`

Account/data separation note:
- Transactions are user-scoped with `transactions.user_id`, so different login accounts do not see each other's transactions.
- Customers and services created inside the app are user-scoped with `user_id = auth()->id()`.
- Seeded/demo customers and service prices currently have `user_id = null`, so they are visible as shared default data for all users.
- For production client account creation, create a real user on VPS and avoid using `test@example.com` as the client login.
- If demo customers should not appear in production, remove the seeded demo customer rows or change the seed strategy before final handoff.

## Latest continuation (client account and demo cleanup command, 2026-05-15)

Scope completed:
- Added Laravel production helper command in `lnote-backend/routes/console.php`:
  - `php artisan lnote:prepare-client`
- Command behavior:
  - requires `--name`, `--email`, and `--password`
  - creates or updates a real client user account
  - optional `--delete-demo-users` removes `test@example.com` only when it has no transactions
  - optional `--delete-demo-customers` removes seeded demo customers only when they have no transactions
  - optional `--delete-default-services` removes default shared services only when they have no transactions
- Updated docs with client-account cleanup steps:
  - `docs/VPS_DEPLOYMENT_CHECKLIST.md`
  - `docs/LNOTE_DEPLOY_RUNBOOK.md`
  - `docs/CLIENT_USER_GUIDE.md`

Operational guidance:
- Recommended production cleanup command after deploy:
  - `php artisan lnote:prepare-client --name="Nama Laundry" --email="client@example.com" --password="GANTI_PASSWORD_KUAT" --delete-demo-users --delete-demo-customers`
- Keep default services unless the client wants a completely empty service list.
- The app already supports auto-login by storing the auth token in `expo-secure-store`; it does not store raw passwords.

Validation:
- `php artisan lnote:prepare-client` tested locally with a temporary smoke user.
- Local demo data was restored afterward with `php artisan db:seed`.
- `php artisan list lnote` shows `lnote:prepare-client` registered.

## Latest continuation (username-style login support, 2026-05-15)

Scope completed:
- Login now supports username-style values such as `sumiati` in addition to normal email addresses.
- No database migration was needed; the existing `users.email` column remains the login identifier column.
- Backend validation changed from strict email format to required string/max 255:
  - `lnote-backend/app/Http/Requests/Auth/LoginRequest.php`
- Frontend login copy now says `Username / Email`:
  - `lnote-frontend/src/screens/LoginScreen.tsx`
- Docs updated:
  - `docs/CLIENT_USER_GUIDE.md`
  - `docs/VPS_DEPLOYMENT_CHECKLIST.md`
  - `docs/LNOTE_DEPLOY_RUNBOOK.md`

Operational note:
- The VPS account created with `--email="sumiati"` can be used directly for login after this change is pulled/deployed.
- App auto-login behavior is unchanged: token is stored with secure storage after first successful login.
