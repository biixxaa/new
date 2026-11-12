# ORDO ILLUMINATORUM — Sovereign Membership Platform

A complete, responsive, production-ready full-stack membership registration website for a fictional, Illuminati-inspired private society.

Engineered with a **mysterious, exclusive, elegant black-and-gold visual direction**, sacred geometry, three-language localization (English, Amharic, Afaan Oromoo), real SMS-based OTP verification with Ethiopian carrier detection, JWT authentication, PostgreSQL relational database schema, and an administrative tribunal dashboard.

---

## 🏛️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Multilingual** | `react-i18next`, `i18next`, `i18next-browser-languagedetector` |
| **Backend API** | Node.js, Express.js |
| **Security** | SHA-256 salted OTP hashing, Bcrypt password hashing, JWT, Express Rate Limiter, Helmet |
| **Database** | PostgreSQL (`pg`), with resilient embedded SQL fallback adapter |
| **SMS Gateway** | Official SMSEthiopia provider architecture (`smsethiopia.com`) with multilingual SMS templates |

---

## 🌐 Three-Language Support

The entire application provides complete localization across all pages, forms, errors, and SMS messages:

1. **English (Default)**
2. **Amharic (አማርኛ)** — Unicode font rendering (`Noto Sans Ethiopic`) with natural cultural phrasing
3. **Afaan Oromoo** — Unicode Latin script (`Qubee`) with high-register phrasing

Language preference is persisted in `localStorage` (`i18nextLng`) and preserved across page refreshes and browser sessions.

---

## 📱 Ethiopian Phone Validation & SMS OTP Workflow

- Validates Ethiopian mobile prefixes for:
  - **Ethio Telecom**: `09...` and `070...`, `071...`, `072...`
  - **Safaricom Ethiopia**: `077...`, `078...`
- Normalizes all numbers into international **E.164** format (`+2519...` / `+2517...`).
- **Real-Time Carrier Badge**: Visual indicator informs the aspirant when an Ethio Telecom or Safaricom Ethiopia line is detected.
- **Cryptographic OTP Security**:
  - Generated via `crypto.randomInt(100000, 1000000)`
  - Stored strictly as salted SHA-256 one-way hashes (never plain text)
  - 5-minute expiration window
  - Maximum 5 attempts with lockout protection
  - 60-second cooldown on resends
  - Rate limiting on API endpoints

### Multilingual SMS Templates

- **English**: `"Your verification code is 123456. It expires in 5 minutes. Do not share this code."`
- **Amharic**: `"የማረጋገጫ ኮድዎ 123456 ነው። በ5 ደቂቃ ውስጥ ጊዜው ያበቃል። ኮዱን ለማንም አያጋሩ።"`
- **Afaan Oromoo**: `"Koodiin mirkaneessaa keessan 123456 dha. Daqiiqaa 5 keessatti ni dhuma. Koodicha nama biraatiif hin qoodinaa."`

---

## 💳 Registration Fee Covenant (3,499 ETB)

New members must settle the **3,499 ETB** initiation fee through one of the two official channels:

1. **Bank of Abyssinia (BOA)**:
   - **Account Number**: `242982037`
   - **Account Holder**: `Biniam Miheret`
2. **Telebirr**:
   - **Mobile Number**: `0955912092`
   - **Receiver**: `Biniam Miheret`

Members can navigate to **Registration Fee** (`/payment`) directly from their Member Dashboard or navigation bar, copy the account details in 1 click, and submit their transaction reference number for High Council tribunal verification.

---

## 🏛️ Website Pages

| Path | Page Name | Description |
|---|---|---|
| `/` | **Sanctum (Home)** | Heroic landing page, Sacred Geometry Eye of Providence, Four Pillars, Degree tiers |
| `/about` | **About the Order** | Sacred legacy, three pillars of light, Ethiopian & global conclaves |
| `/register` | **Initiation (Register)** | Ethiopian mobile selector, carrier detection, password creation, terms acceptance |
| `/verify-otp` | **Verification (OTP)** | 6-digit keypad inputs, auto-advance, 5-min timer, 60s resend cooldown, golden confetti |
| `/login` | **Enter Sanctum (Login)** | Member authentication via phone number and secret seal passcode |
| `/dashboard` | **Member Vault** | Member ID inscription, degree badge, status review, council decrees |
| `/payment` | **Registration Fee** | Dedicated payment page: BOA (242982037 Biniam Miheret) or Telebirr (0955912092), submit transaction ref for 3,499 ETB fee |
| `/application-status` | **Petition Status** | 3-stage tribunal progression tracker (Hashed, Review, Consecration) |
| `/admin` | **Council Archive** | Protected admin dashboard: metrics, user search, approve/reject decrees, suspension |
| `/terms` | **Charter & Oath** | Fictional society constitution, non-disclosure covenant |
| `/privacy` | **Veil of Secrecy** | Cryptographic data protection, OTP retention policy |
| `/contact` | **Communion** | Encrypted public dispatch directly to the Grand Scribe |

---

## 🗄️ PostgreSQL Database Design

The PostgreSQL relational database includes 7 dedicated tables with foreign key constraints, indexes, and audit logging:

1. `users` — Primary initiate and council registry with password hash, role, status, verification flag
2. `otp_verifications` — Cryptographically hashed OTPs with unique salts, attempt counters, and timestamps
3. `membership_applications` — Aspirant petitions, tribunal review stages, reviewer notes
4. `membership_types` — Illumination degrees (Novitiate, Minor, Major, Rex Summus)
5. `admin_users` — Granular administrative permissions
6. `sessions` — Active user tokens and vessel identifiers
7. `audit_logs` — Tamper-evident ledger of council decrees, status modifications, and actions

---

## 🔑 Default Grand Council Admin Credentials

For development and inspection:
- **Phone Number**: `+251900000000` (or `0900000000`)
- **Secret Passcode**: `SanctumSecret2026!`
- **Role**: `ADMIN` (Grand Master Scribe)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
# Root
npm install

# Client
cd client && npm install && cd ..

# Server
cd server && npm install && cd ..
```

### 2. Environment Variables

Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=ordo-illuminatorum-sanctum-secret-2026-lux-sapientia
JWT_EXPIRES_IN=7d

# PostgreSQL Connection (Optional: auto-uses embedded engine if unset)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/illuminati_db

# Official SMSEthiopia Gateway (smsethiopia.com)
SMS_PROVIDER=smsethiopia
SMSETHIOPIA_API_KEY=your_smsethiopia_api_key_here
SMSETHIOPIA_SENDER_ID=
SMSETHIOPIA_TEST_NUMBER=251908426432
SMSETHIOPIA_ENDPOINT=https://smsethiopia.com/api/sms/send
```

### 3. Run Development Servers

Run both the Vite frontend and Express backend concurrently:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

### 4. Run Automated Full-Stack Tests

```bash
npm run test
```

Executes 20 automated tests validating phone normalization, SMS templates across all 3 languages, cryptographic OTP security, authentication, and council decrees.

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)

1. **Vercel**: Deploy the `client/` folder with Root Directory set to `client` and framework preset `Vite`. `client/vercel.json` contains SPA routing rewrites.
2. **Netlify**: Deploy the `client/` folder. Build command: `npm run build`, Publish directory: `dist`. `client/public/_redirects` ensures SPA routing.

### Backend (Render / Railway / Supabase)

1. **Render**: Use `server/render.yaml` for one-click blueprint deployment.
2. **Railway**: Deploy using `server/Dockerfile` or standard Node.js runtime.
3. **Database**: Connect any PostgreSQL provider (Supabase, Neon, AWS RDS, Railway PG) by supplying `DATABASE_URL`.
4. Run migrations: `npm --prefix server run migrate` followed by `npm --prefix server run seed`.

