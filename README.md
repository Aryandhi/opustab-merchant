# Opustab Merchant Automation Test Suite

Repository ini berisi automation test berbasis Playwright untuk aplikasi Opustab Merchant. Struktur proyek disusun dengan pendekatan Page Object Model agar test lebih mudah dipelihara, lebih jelas dibaca oleh tim, dan lebih aman untuk dikembangkan saat jumlah skenario bertambah.

## Tujuan Proyek

Tujuan utama repository ini adalah menyediakan automated UI test untuk memvalidasi alur penting pada aplikasi merchant, terutama modul autentikasi dan area dashboard. Test dijalankan pada beberapa environment aplikasi sehingga tim dapat memverifikasi perilaku di `dev`, `production`, `new`, dan `demo` dengan satu basis kode yang sama.

## Teknologi Utama

- Node.js
- TypeScript
- Playwright Test
- Page Object Model

## Fitur Utama

- Eksekusi test per environment atau semua environment sekaligus.
- Laporan test tersedia dalam format HTML dan JSON.
- Screenshot dan video otomatis saat test gagal.
- Struktur test dipisahkan antara pages, locators, data, dan utilities.
- Mendukung run lokal maupun CI GitHub Actions.

## Struktur Folder

```text
.
├── config/
│   └── environments.ts
├── data/
│   └── users.json
├── locators/
├── pages/
├── scripts/
│   └── run-tests.mjs
├── tests/
│   └── auth/
├── utils/
├── playwright.config.ts
├── package.json
└── README.md
```

Ringkasan per folder:

- `config/`: konfigurasi environment dan base URL.
- `data/`: data uji yang dipakai oleh test, misalnya kredensial.
- `locators/`: selector dan locator element halaman.
- `pages/`: page object yang membungkus interaksi UI.
- `scripts/`: helper runner untuk memilih environment sebelum menjalankan Playwright.
- `tests/`: file test aktual.
- `utils/`: utilitas umum jika diperlukan di masa depan.

## Prasyarat

Pastikan tools berikut sudah tersedia di mesin developer:

- Node.js 20 atau versi yang kompatibel.
- npm.
- Browser dependencies Playwright.

Rekomendasi tambahan:

- Git untuk version control.
- Akses ke environment target aplikasi merchant.

## Instalasi

1. Clone repository ini.
2. Install dependency:

```bash
npm ci
```

3. Install browser Playwright bila belum tersedia:

```bash
npx playwright install
```

## Konfigurasi Environment

Base URL environment didefinisikan di [config/environments.ts](config/environments.ts). Saat ini tersedia:

- `production` -> `https://merchant.opustab.com`
- `dev` -> `https://merchant.dev.opustab.com`
- `new` -> `https://merchant.new.opustab.com`
- `demo` -> `https://merchant.demo.opustab.com`

Playwright config membaca environment dari variabel berikut:

- `TEST_ENV_MODE`
- `TEST_ENV_NAME`

Secara default, test akan berjalan ke environment `dev` dalam mode single environment.

## Cara Menjalankan Test

### Menjalankan test default

```bash
npm test
```

Perintah ini menjalankan runner custom di [scripts/run-tests.mjs](scripts/run-tests.mjs) dan akan memilih environment sesuai default proyek.

### Menjalankan environment tertentu

```bash
npm run test:dev
npm run test:production
npm run test:new
npm run test:demo
```

Setiap script di atas mengarahkan test ke environment yang sesuai.

### Menjalankan environment manual

Gunakan perintah berikut jika ingin memilih environment secara eksplisit:

```bash
npm run test:env -- <environment>
```

Contoh:

```bash
npm run test:env -- production
```

### Menjalankan semua environment

```bash
npm run test:all
```

Perintah ini menjalankan suite pada semua environment yang terdaftar di konfigurasi.

### Menjalankan Playwright dengan flag tambahan

Semua script di atas dapat menerima argumen Playwright tambahan setelah `--`.

Contoh:

```bash
npm run test:production -- --headed
npm run test:dev -- --grep "@smoke"
npm run test:all -- --project=dev
```

## Laporan Test

Setiap eksekusi test menghasilkan artefak berikut:

- HTML report di `playwright-report/`
- JSON report di `test-results.json`
- file hasil eksekusi dan artefak tambahan di `test-results/`

Untuk membuka report HTML setelah run lokal:

```bash
npx playwright show-report
```

## Arsitektur Test

Repository ini mengikuti pola Page Object Model.

- Test case berada di folder `tests/`.
- Interaksi halaman dibungkus di `pages/`.
- Selector dipusatkan di `locators/`.
- Data uji diambil dari `data/users.json`.

Pendekatan ini dipilih agar perubahan UI tidak memaksa tim mengubah banyak test sekaligus. Jika selector berubah, biasanya cukup memperbarui locator di satu tempat.

## Menambahkan Test Baru

Untuk menambahkan test baru, ikuti pola berikut:

1. Tambahkan locator baru jika dibutuhkan di folder `locators/`.
2. Tambahkan method interaksi atau validasi di `pages/`.
3. Buat skenario baru di `tests/`.
4. Gunakan data uji yang jelas dan konsisten dari `data/`.

Rekomendasi praktik:

- Gunakan penamaan test yang deskriptif dan stabil.
- Hindari selector yang rapuh bila ada alternatif yang lebih solid.
- Pisahkan aksi halaman dari assertion test.
- Jangan menaruh logika environment di dalam test case.

## CI / GitHub Actions

Repository ini memiliki workflow GitHub Actions di [.github/workflows/playwright.yml](.github/workflows/playwright.yml) untuk menjalankan test otomatis pada push, pull request, dan jadwal terjadwal.

Workflow tersebut:

- menggunakan image Playwright resmi di container Ubuntu,
- menjalankan `npm ci`,
- mengeksekusi `npx playwright test`,
- mengunggah HTML report, JSON report, dan artefak test,
- mempublikasikan Playwright report ke GitHub Pages.

## Panduan Tim Developer

- Gunakan satu environment yang jelas saat debugging agar hasil test konsisten.
- Jika test gagal, cek screenshot, video, dan trace yang dihasilkan Playwright.
- Simpan selector dan interaksi di page object, bukan langsung di test case.
- Hindari hardcode data sensitif baru di dalam repository.
- Jika credential atau data uji berubah, update sumber data secara terpusat.

## Troubleshooting

### Test gagal karena environment tidak dikenali

Pastikan nama environment ada di [config/environments.ts](config/environments.ts) dan cocok dengan nilai yang dikirim lewat runner.

### Browser belum terpasang

Jalankan:

```bash
npx playwright install
```

### Report tidak muncul

Pastikan test selesai dieksekusi dan cek folder `playwright-report/` serta `test-results.json`.

### Login gagal saat validasi

Periksa data pada `data/users.json` dan pastikan akun test masih valid di environment target.

## Catatan Keamanan

Jangan menyimpan kredensial produksi atau rahasia operasional lain secara sembarangan di repository. Jika tim perlu memakai data sensitif, gunakan mekanisme secret manager atau environment variable yang aman.

## Referensi File Penting

- [package.json](package.json)
- [playwright.config.ts](playwright.config.ts)
- [scripts/run-tests.mjs](scripts/run-tests.mjs)
- [config/environments.ts](config/environments.ts)
- [tests/auth/login.spec.ts](tests/auth/login.spec.ts)
- [pages/login.page.ts](pages/login.page.ts)
- [pages/dashboard.page.ts](pages/dashboard.page.ts)
