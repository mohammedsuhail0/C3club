# C3 Organizer Command Center Manual
**Reviewing Answers, Issuing Pure Keys & Admissions Decision Flow**

---

## 🛡️ Logging In
- Navigate to: `http://localhost:4173/?admin=c3core`
- Or scroll to the footer on the main site, click **`[ ⚡ Organizer Portal ]`**, and enter passcode: **`c3core`** (or `c3admin`).

---

## 📋 The Review Process

When an applicant applies through Google Forms, Google Sheets paste, or the on-site form, they enter the Command Center with status **`Pending Review`**.

### Step 1: Open the Review Dossier
1. Locate the candidate in the table.
2. Click **`[ 👁 Dossier ]`** on their row.
3. The high-contrast applicant dossier modal opens, displaying:
   - **Candidate Profile:** Name, Department, Year, WhatsApp number, and Email address.
   - **Submission Source Tag:** `GOOGLE_FORM` or `WEBSITE`.
   - **"WHAT DO YOU WANT TO BUILD AT C3?"** — The candidate's project concept in full.
   - **"WHY DO YOU WANT TO JOIN THE FOUNDING TEAM?"** — Their motivation statement.

### Step 2: Make Your Decision
At the bottom of the dossier:
- **To Accept**:
  - Optional: Pick their specialized role (e.g. *Vibe Coder / Shipper*, *Agentic AI Engineer*, *Full Stack Systems Hacker*, *Technical Founder / Lead*, *Prompt Engineer / Researcher*).
  - Click **`[ ✓ Accept Candidate & Generate Key ]`**.
  - The system automatically:
    1. Sets status to `Accepted`.
    2. Computes their pure 4-character cryptographic key (e.g. `KD4U`).
    3. Generates their official Acceptance Letter (`/?letter=XXXX`).
    4. Generates their 3D Founding Pass & Badge (`/?code=XXXX`).
    5. Activates 1-click C3 Mail & WhatsApp buttons.
- **To Reject**:
  - Click **`[ ✕ Decline / Reject ]`**.
  - Sets status to `Rejected`.

---

## 🚀 Step 3: 1-Click Dispatch

Once an applicant is accepted, you have three instant dispatch tools:

1. **`[ ✉ Send Official C3 Mail ]`**:
   - Opens an official draft in **`c3.collective.in@gmail.com`** via Google's authenticated Web Composer.
   - Candidate email, subject line, pure founder key, letter link, pass link, and kickoff routine are pre-filled.
   - All you do is click **Send** in Gmail!
2. **`[ 💬 Open WhatsApp ]`**:
   - Opens `api.whatsapp.com` with a personalized congratulations message, pure key, letter link, and pass link pre-typed for their WhatsApp number.
3. **`[ 📄 View Acceptance Letter ]`**:
   - Previews the collegiate UGC-Autonomous acceptance letter ready to print or export as PDF.
