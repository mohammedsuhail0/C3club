# C3 · Claude Code & Cowork (Official Website & Organizer Command Center)
**ISL Engineering College · Department of Computer Science & Engineering**

Welcome to the official, production-ready release of the **C3 (Claude Code & Cowork)** platform.

---

## 📁 Package Directory Structure

```text
C3-OFFICIAL-DELIVERY/
├── src/                          # Full React 19 + TypeScript + Tailwind source code
│   ├── components/
│   │   ├── OrganizerPortalModal.tsx # Command Center with live review & dispatch
│   │   ├── ApplyModal.tsx           # Direct 2-tab on-site application form
│   │   ├── AcceptanceLetterModal.tsx# Collegiate autonomous acceptance letter
│   │   ├── PassModal.tsx            # 3D interactive Founding Member pass & badge
│   │   ├── PassCustomizer.tsx       # Customization & print layout
│   │   └── ...
│   ├── utils/
│   │   ├── api.ts                # Client API methods & typed interfaces
│   │   └── audio.ts              # Collegiate tactile sound design
│   └── ...
├── server/                       # Express / Vite backend API middleware
│   ├── backendHandler.js         # REST endpoints for review, webhooks, keys & reset
│   ├── mailer.js                 # 1-Click C3 Gmail Composer & SMTP service
│   └── data/
│       ├── members.json          # Clean slate applicant roster (0 dummy data)
│       ├── members_backup.json   # Safe archive of original 7 test applicants
│       └── email_config.json     # Official mailbox: c3.collective.in@gmail.com
├── dist/                         # Production compiled build (ready to host anywhere)
├── screenshots/                  # Verified UI screenshots
├── FORM_CONNECTION_GUIDE.md      # How to connect Google Forms & Google Sheets
├── ORGANIZER_COMMAND_CENTER_MANUAL.md # Applicant review, decision & pass generation
├── OFFICIAL_EMAIL_GUIDE.md       # Official C3 Gmail 1-click dispatch manual
├── package.json                  # Dependencies & npm scripts
└── vite.config.ts                # Vite configuration with built-in API handler
```

---

## 🚀 Quickstart (How to Run)

### 1. Development / Local Preview Server
Open PowerShell or Terminal in this folder:
```powershell
# Install dependencies (if running in a new location)
npm install

# Start development server
npm run dev

# Or start the production preview server on port 4173
npm run preview -- --host --port 4173
```

### 2. Access Links:
- **Main Website:** `http://localhost:4173/`
- **On-Site Application Form:** `http://localhost:4173/?apply=true`
- **Organizer Command Center:** `http://localhost:4173/?admin=c3core`
  - Passcode: `c3core` (or `c3admin`)
- **Direct Acceptance Letter Preview (Sample):** `http://localhost:4173/?letter=ZZRF`
- **Direct 3D Pass Claim (Sample):** `http://localhost:4173/?code=ZZRF`

---

## 🔑 Key Features

1. **Clean Slate (Zero Dummy Data)**:
   - `server/data/members.json` is set to `[]`.
   - Your previous test records are safely preserved in `server/data/members_backup.json`.
   - The Command Center displays a welcoming empty state ready for real applicants.

2. **3 Ways to Connect Forms**:
   - **Method A (Zero Setup):** Copy-paste rows directly from your linked Google Sheet / Excel into the Command Center.
   - **Method B (Automated Webhook):** Paste a 15-line Google Apps Script into your Google Form for instant real-time sync on submission.
   - **Method C (Direct On-Site):** Students can apply directly at `/?apply=true` on the website.

3. **In-Center Applicant Answer Review**:
   - Inspect candidate profile, department, year, phone, and email.
   - Review their exact answers to:
     - *"What do you want to build at C3?"*
     - *"Why do you want to join the Founding Team?"*
   - Assign their cohort track (`Vibe Coder / Shipper`, `Agentic AI Engineer`, `Full Stack Hacker`, etc.).
   - Click **`✓ Accept Candidate & Generate Key`** or **`✕ Decline / Reject`**.

4. **Pure 4-Character Cryptographic Keys**:
   - Deterministic 4-character keys derived from phone numbers (e.g. `KD4U`, `ZZRF`).
   - Zero `C3-FND-` prefixes and zero mentions of `₹0` anywhere.

5. **Official C3 Email Integration (`c3.collective.in@gmail.com`)**:
   - Connects directly to Google's authenticated Gmail Composer.
   - 1-Click **`[ ✉ C3 Mail ]`** drafts the official collegiate admission notice in `c3.collective.in@gmail.com` with recipient, subject, pure key, letter link, pass link, and schedule pre-filled.
   - Zero SMTP passwords or Google robot errors.

---

## 📖 Detailed Guides Included
- Refer to `FORM_CONNECTION_GUIDE.md` for Google Forms and Sheets setup.
- Refer to `ORGANIZER_COMMAND_CENTER_MANUAL.md` for daily organizer workflows.
- Refer to `OFFICIAL_EMAIL_GUIDE.md` for official email dispatch.
