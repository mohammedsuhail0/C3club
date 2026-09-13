# C3 (Claude Code & Cowork) · Context & Handoff for New Thread
**ISL Engineering College · Department of Computer Science & Engineering**

> **How to Use This File:**
> If you are starting a new chat thread with an AI assistant or human developer, copy and paste this entire document into the first prompt. It provides 100% of the project context, architecture, credentials, decision rules, and file references.

---

## 1. Project Overview & Identity

- **Project:** C3 (Claude Code & Cowork) Club Official Platform
- **Institution:** ISL Engineering College (UGC Autonomous), Bandlaguda, Chandrayangutta, Hyderabad
- **Department:** Department of Computer Science & Engineering
- **Student Convener / Lead Organizer:** Syed Saleem
- **Official Club Email:** `c3.collective.in@gmail.com`
- **Core Mission:** A hyper-focused student builder collective learning Claude Code CLI, Agentic AI pipelines, and shipping real MVPs every week.

---

## 2. Directory Locations & Assets

- **Official Delivery Package:** `C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY`
- **Full Project Source:**
  - `src/`: React 19 + TypeScript + Tailwind CSS
  - `server/`: Backend API middleware & mailers
  - `server/data/members.json`: Clean slate applicant roster (`[]` - 0 dummy data)
  - `server/data/members_backup.json`: Safe archive of original 7 test applicants
  - `server/data/email_config.json`: Configured for `c3.collective.in@gmail.com`
  - `dist/`: Pre-compiled, production-ready distribution build
  - `screenshots/`: Verified UI screenshots of Command Center, Dossier & Letter
  - `scripts/`: Automated testing & verification scripts

---

## 3. Strict Rules & Architectural Constraints

1. **Pure 4-Character Keys ONLY**:
   - Format: Exactly 4 uppercase alphanumeric characters (e.g. `KD4U`, `ZZRF`, `EVKH`, `DNE6`, `UU9U`, `N54W`).
   - **STRICT FORBIDDEN:** Zero `C3-FND-` or `FND-` prefixes anywhere. Never reintroduce prefix.
   - Deterministically generated from phone number checksum via `generateKeyFromPhone(phone)`.

2. **No Pricing / Monetary Mentions**:
   - **STRICT FORBIDDEN:** Zero mentions of `₹0`, "Free", or monetary symbols anywhere. C3 is an exclusive, merit-based collegiate collective.

3. **Organizer Command Center Access**:
   - Passcode: `c3core` (or `c3admin`).
   - URL shortcut: `/?admin=c3core` (bypasses password gate directly).

4. **Official C3 Email Integration (`c3.collective.in@gmail.com`)**:
   - Google SMTP blocks standard passwords with `535-5.7.8 BadCredentials` and Google App Passwords often return *"The setting is not available for your account"*.
   - **Solution:** 1-Click Official C3 Gmail Composer deep-link:
     `https://mail.google.com/mail/?authuser=c3.collective.in@gmail.com&view=cm&fs=1&to=<email>&su=<subject>&body=<body>`
   - Because the organizer is already logged into `c3.collective.in@gmail.com` in their browser, clicking **`[ ✉ C3 Mail ]`** or **`[ ✉ Send Official C3 Mail ]`** immediately opens Google's official compose tab with recipient, subject, collegiate acceptance letter, pure key, letter link, pass link, and schedule pre-filled.
   - All the organizer does is click **Send** in Gmail! Zero passwords or API hurdles.

---

## 4. System URLs & Routing

| Purpose | URL Route | Action |
| :--- | :--- | :--- |
| **Main Website** | `http://localhost:4173/` | Hero, curriculum, faculty mentors, interactive FAQ |
| **On-Site Application Form** | `http://localhost:4173/?apply=true` | 2-tab modern modal with instant celebratory confetti |
| **Organizer Command Center** | `http://localhost:4173/?admin=c3core` | Roster table, live review dossier, 1-click dispatch |
| **Official Acceptance Letter** | `http://localhost:4173/?letter=XXXX` | Autonomous collegiate letter for key `XXXX` (print-ready) |
| **3D Founding Pass & Badge** | `http://localhost:4173/?code=XXXX` | Interactive 3D pass claim and customizer |

---

## 5. Backend REST API Endpoints (`server/backendHandler.js`)

- `GET /api/members` — Returns all applicants and statistics (`total`, `pending`, `accepted`, `claimed`, `printed`, `emailed`).
- `POST /api/webhook/form` or `POST /api/apply` — Ingests application submission (from Google Form or website), stores answers, sets `status: 'pending_review'`.
- `POST /api/applicants/review` — Accepts applicant (generates pure 4-char key) or Rejects applicant.
- `POST /api/send-email` — Dispatches acceptance email or returns 1-click `gmailUrl` targeting `c3.collective.in@gmail.com`.
- `POST /api/email-config` & `POST /api/email-config/test` — Gets/saves/tests email configuration.
- `POST /api/members/reset` — Clears roster to clean slate `[]` (saves current state to `members_backup.json`).
- `POST /api/members/restore` — Restores roster from `members_backup.json`.
- `POST /api/verify-key` — Validates pure key checksum.
- `POST /api/claim-pass` — Claims 3D pass.
- `POST /api/mark-printed` — Marks physical NFC campus badge as printed.

---

## 6. How to Connect Forms to Command Center

### Method A: Google Sheets Copy-Paste (Fastest - 0 Setup)
1. In Google Form &rarr; Responses &rarr; **Link to Sheets** (green icon).
2. Copy rows (`Ctrl + C`).
3. In Command Center &rarr; **`[ <> Connect Form ]`** &rarr; Method 2 &rarr; Paste &rarr; **`Import Rows`**.

### Method B: Live Webhook via Google Apps Script
1. In Google Form &rarr; `⋮` &rarr; **Extensions > Apps Script**.
2. Paste the snippet:
```javascript
function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var payload = { source: "google_form", email: formResponse.getRespondentEmail() || "" };
  for (var i = 0; i < itemResponses.length; i++) {
    var title = itemResponses[i].getItem().getTitle();
    var answer = itemResponses[i].getResponse();
    if (title.indexOf("Name") !== -1) payload.name = answer;
    else if (title.indexOf("Phone") !== -1 || title.indexOf("WhatsApp") !== -1) payload.phone = answer;
    else if (title.indexOf("Branch") !== -1) payload.branch = answer;
    else if (title.indexOf("Year") !== -1) payload.year = answer;
    else if (title.indexOf("build") !== -1) payload.projectIdea = answer;
    else if (title.indexOf("Why") !== -1 || title.indexOf("motivation") !== -1) payload.motivation = answer;
    else payload[title] = answer;
  }
  UrlFetchApp.fetch("http://localhost:4173/api/webhook/form", {
    method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true
  });
}
```
3. Set Trigger: `onFormSubmit` on form submit.

---

## 7. How to Run & Preview

```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY
npm install
npm run preview -- --host --port 4173
```

---

## 8. Prompt to Copy-Paste into a New Thread

```text
Hi! I am working on the C3 (Claude Code & Cowork) club website for ISL Engineering College located at:
C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY

Context:
- Clean slate with 0 dummy data in server/data/members.json (backup is in server/data/members_backup.json).
- Official club email is connected: c3.collective.in@gmail.com (using 1-click Google Web Composer).
- Organizer Command Center is protected by passcode 'c3core' (or query '?admin=c3core').
- Pure 4-character founder keys (e.g. KD4U, ZZRF) with zero prefixes and zero price mentions.
- Forms connect via Google Sheets paste, Google Apps Script webhook, or on-site '/?apply=true'.
- Acceptance letters are at '/?letter=XXXX' and 3D passes are at '/?code=XXXX'.

Please read C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY\NEW_CHAT.md and help me with:
[INSERT YOUR QUESTION OR TASK HERE]
```
