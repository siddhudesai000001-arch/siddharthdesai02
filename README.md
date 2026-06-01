# 🔒 SidLocker — Personal Digital Document Vault

A secure, private, single-user digital locker for storing and managing personal documents and photos. Built with Next.js 14, TypeScript, Prisma, SQLite, and NextAuth.

---

## ⚠️ SECURITY FIRST — READ THIS BEFORE ANYTHING ELSE

**Your credentials are stored in `.env` ONLY — never in source code.**

The `.gitignore` is configured to exclude:
- `.env` (your secrets)
- `prisma/*.db` (your database with file metadata)
- `public/uploads/` (your actual documents)

**NEVER push these to GitHub or any public repository.**

---

## 🚀 Quick Setup (Local Development)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Your `.env` File

```bash
cp .env.example .env
```

Now edit `.env`:

```env
DATABASE_URL="file:./prisma/sidlocker.db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

AUTH_EMAIL="siddharthdesai560@gmail.com"
AUTH_USERNAME="_.01siddharth"
AUTH_PASSWORD_HASH="<generate below>"
```

### Step 3: Generate Your Password Hash

```bash
node scripts/hash-password.js desaisiddharth01
```

Copy the output hash into `.env` as `AUTH_PASSWORD_HASH`.

### Step 4: Generate NEXTAUTH_SECRET

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Step 5: Setup Database

```bash
npx prisma migrate dev --name init
node scripts/seed.js
```

### Step 6: Add Your Documents

Place your files in the appropriate folders:

```
public/uploads/
├── documents/
│   ├── ssc/          ← SSC marksheets, certificates
│   ├── hsc/          ← HSC marksheets, certificates
│   ├── bsc_cs/       ← BSc CS semester documents
│   ├── mca/          ← MCA documents
│   └── others/       ← Aadhaar, PAN, passport, resume etc.
└── photos/
    ├── passport_size/ ← Passport photos
    └── others/        ← Other photos
```

### Step 7: Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Recommended File Names

```
# SSC
ssc_marksheet_2020.pdf
ssc_certificate.pdf
ssc_lc.pdf

# HSC
hsc_marksheet_2022.pdf
hsc_certificate.pdf
hsc_lc.pdf

# BSc CS
bsc_sem1_marksheet.pdf
bsc_sem2_marksheet.pdf
bsc_sem3_marksheet.pdf
bsc_sem4_marksheet.pdf
bsc_sem5_marksheet.pdf
bsc_sem6_marksheet.pdf
bsc_degree_certificate.pdf

# MCA
mca_admission_letter.pdf
mca_fee_receipt_sem1.pdf

# Others
aadhaar_card.pdf
pan_card.pdf
passport.pdf
driving_licence.pdf
resume.pdf

# Photos
passport_photo_01.jpg
passport_photo_02.jpg
photo_01.jpg
```

After adding files, go to Dashboard → click **"Scan Files"** to auto-detect them.

---

## 🌐 Deploying to Render

### Step 1: Push to a PRIVATE GitHub repo

```bash
git init
git add .
git commit -m "Initial SidLocker setup"
git remote add origin https://github.com/YOUR_USERNAME/sidlocker-private.git
git push -u origin main
```

⚠️ Make sure the repo is **PRIVATE**.

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your private GitHub repo
3. Configure:
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && node scripts/seed.js && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** 18+

### Step 3: Add Environment Variables in Render Dashboard

Add these in Render → Environment → Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:./prisma/sidlocker.db` |
| `NEXTAUTH_URL` | `https://your-app.onrender.com` |
| `NEXTAUTH_SECRET` | (generate: `openssl rand -base64 32`) |
| `AUTH_EMAIL` | your email |
| `AUTH_USERNAME` | your username |
| `AUTH_PASSWORD_HASH` | bcrypt hash from step 3 above |

### Step 4: Add Persistent Disk

In Render → your service → Disks:
- Name: `sidlocker-data`
- Mount Path: `/opt/render/project/src`
- Size: 10 GB (or as needed)

This ensures your database and uploads survive deployments.

---

## 🔐 Features

| Feature | Status |
|---------|--------|
| Glassmorphism Login | ✅ |
| Protected Routes | ✅ |
| Dashboard with Stats | ✅ |
| Document Management | ✅ |
| Photo Gallery | ✅ |
| Drag & Drop Upload | ✅ |
| Multi-file Upload | ✅ |
| Download Files | ✅ |
| ZIP Export | ✅ |
| Bulk Select & Actions | ✅ |
| Rename Files | ✅ |
| Delete Files | ✅ |
| Global Search | ✅ |
| Advanced Search Filters | ✅ |
| Activity Logs | ✅ |
| Dark / Light Mode | ✅ |
| Privacy Mode (settings) | ✅ |
| Watermark in Preview | ✅ |
| Auto File Detection (Scan) | ✅ |
| Profile Page | ✅ |
| Settings Page | ✅ |
| Responsive Design | ✅ |
| Collapsible Sidebar | ✅ |

---

## 🗂 Project Structure

```
sidlocker/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # Your files go here (gitignored)
├── scripts/
│   ├── hash-password.js       # Generate bcrypt hash
│   └── seed.js                # Auto-detect and seed files
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # All dashboard pages
│   │   └── api/               # All API routes
│   ├── components/
│   │   └── layout/            # Sidebar, TopBar
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # DB client
│   │   ├── utils.ts           # Helpers
│   │   └── activity.ts        # Activity logger
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example               # Template (copy to .env)
├── .gitignore                 # Protects secrets & files
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🔑 Login Credentials

**These are set in your `.env` file.**

- Email: value of `AUTH_EMAIL`
- Username: value of `AUTH_USERNAME`
- Password: whatever you hashed with `hash-password.js`

No credentials exist anywhere in source code.

---

## 🛡 Privacy & Security Notes

1. **Search never indexes** Aadhaar numbers, PAN numbers, phone numbers, or addresses
2. **File paths are virtual** — never expose `/public/uploads/` in the UI
3. **Downloads are always original** — no masking or watermarking applied to downloaded files
4. **Privacy Mode** (Settings) masks sensitive fields in preview only
5. **Watermark** shows during preview only — originals untouched
6. **bcrypt** password hashing with 12 salt rounds
7. **NextAuth JWT sessions** with 30-day expiry

---

## 🔧 Troubleshooting

**Files not appearing?**
→ Dashboard → click "Scan Files" button

**Login not working?**
→ Check `.env` has correct `AUTH_EMAIL`, `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`
→ Re-run: `node scripts/hash-password.js yourpassword` and update hash

**Database errors?**
→ Run: `npx prisma migrate dev --name init`
→ Then: `node scripts/seed.js`

**Build fails on Render?**
→ Check all env vars are set in Render dashboard
→ Ensure `NEXTAUTH_URL` matches your actual Render URL

---

*SidLocker — Your documents, your server, your control.*
