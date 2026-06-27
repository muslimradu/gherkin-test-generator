# 🥒 Gherkin → Playwright Generator

Alat bantu QA Automation untuk mengubah script Gherkin (`.feature`) menjadi boilerplate test Playwright secara otomatis, langsung di browser tanpa backend.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![Playwright](https://img.shields.io/badge/Playwright-supported-2ead33?logo=playwright)

---

## ✨ Fitur

- **Parse Gherkin** — mengenali `Feature`, `Background`, `Scenario`, `Given`, `When`, `Then`, `And`, `But`
- **Smart mapping** — otomatis deteksi aksi: navigate, click, fill, assert (support bahasa Indonesia & Inggris)
- **Dual output** — generate Playwright TypeScript atau JavaScript
- **Multi-scenario** — satu Feature dengan banyak Scenario menghasilkan file terpisah
- **Upload `.feature`** — drag & drop atau pilih file langsung
- **Copy & Download** — salin ke clipboard atau unduh sebagai `.spec.ts` / `.spec.js`
- **Tanpa backend** — semua proses berjalan di browser

---

## 🚀 Cara Pakai (Tanpa Install)

---

## 🛠️ Development Setup

### Prasyarat

- Node.js >= 18
- npm >= 9

### Instalasi

```bash
git clone https://github.com/your-username/gherkin-playwright-generator.git
cd gherkin-playwright-generator
npm install
npm run dev
```

Buka `http://localhost:5173`

### Build Production

```bash
npm run build
```

Output tersedia di folder `dist/`.

---

## 📁 Struktur Project

```
src/
├── components/
│   ├── GherkinInput.tsx      # Panel input kiri: textarea, upload, tombol aksi
│   ├── CodeOutput.tsx        # Panel output kanan: syntax highlight, code display
│   ├── LanguageSelector.tsx  # Dropdown pilih target language
│   └── Toolbar.tsx           # Tombol Copy Code & Download
│
├── parser/
│   └── gherkinParser.ts      # Parser Gherkin (framework-agnostic)
│
├── generator/
│   ├── index.ts              # Registry generator (extensible)
│   ├── playwrightTs.ts       # Generator Playwright TypeScript
│   └── playwrightJs.ts       # Generator Playwright JavaScript
│
├── utils/
│   ├── download.ts           # Helper download file
│   └── clipboard.ts          # Helper copy to clipboard
│
├── types/
│   └── gherkin.ts            # Type definitions
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🗺️ Smart Action Mapping

Parser mendeteksi aksi dari teks step secara otomatis:

| Aksi | Keyword yang Dikenali | Output |
|------|----------------------|--------|
| Navigate | `buka halaman`, `open`, `visit`, `navigate`, `menuju` | `await page.goto('');` |
| Click | `klik`, `click`, `tekan`, `pilih`, `press` | `await page.locator('').click();` |
| Fill | `isi`, `input`, `ketik`, `enter`, `fill`, `masukkan` | `await page.locator('').fill('');` |
| Assert | `lihat`, `tampil`, `muncul`, `verify`, `should`, `berhasil` | `await expect(page.locator('')).toBeVisible();` |

---

## 📄 Contoh Input & Output

**Input Gherkin:**
```gherkin
Feature: Login

  Scenario: Login successfully
    Given User membuka halaman login
    When User mengisi username "admin"
    And User mengisi password "123456"
    And User klik tombol Login
    Then User berhasil masuk ke dashboard
```

**Output Playwright TypeScript:**
```typescript
import { test, expect } from '@playwright/test';

// Feature: Login

test('Login successfully', async ({ page }) => {
    // Given User membuka halaman login
    await page.goto('');

    // When User mengisi username
    await page.locator('').fill('admin');

    // And User mengisi password
    await page.locator('').fill('123456');

    // And User klik tombol Login
    await page.locator('').click();

    // Then User berhasil masuk ke dashboard
    await expect(page.locator('')).toBeVisible();
});
```

---

## 🔌 Menambahkan Framework Baru

Arsitektur generator dirancang extensible. Parser menghasilkan `GherkinFeature` yang framework-agnostic, sehingga generator baru cukup mengonsumsi output yang sama.

**Langkah menambahkan framework baru (misal Cypress):**

1. Buat file `src/generator/cypressTs.ts`
2. Implementasikan fungsi dengan signature `(feature: GherkinFeature) => GeneratedFile[]`
3. Daftarkan di `src/generator/index.ts`:

```typescript
import { generateCypressTs } from './cypressTs';

const GENERATOR_REGISTRY: Record<TargetLanguage, FrameworkGenerator> = {
  'playwright-ts': ...,
  'playwright-js': ...,
  'cypress-ts': generateCypressTs,   // ← tambahkan di sini
};
```

4. Tambahkan option di `src/types/gherkin.ts` dan `LanguageSelector.tsx`

Parser **tidak perlu diubah sama sekali**.

**Roadmap framework yang bisa ditambahkan:**
- [ ] Cypress TypeScript
- [ ] Selenium Java
- [ ] WebdriverIO TypeScript
- [ ] Robot Framework

---

## 📝 Lisensi

MIT License — bebas digunakan untuk keperluan pribadi maupun komersial.
