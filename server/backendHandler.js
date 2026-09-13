import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendAcceptanceEmail,
  getEmailConfig,
  saveEmailConfig,
  verifyEmailCredentials
} from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'members.json');

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SECRET_SALT = 8391;

function normalizeKey(key) {
  return String(key || '').trim().toUpperCase().replace(/^(C3-)?(FND-)?/i, '');
}

function generateKeyFromPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  let h = 5381;
  for (let i = 0; i < digits.length; i++) {
    h = ((h << 5) + h) + digits.charCodeAt(i);
    h = h & 0x7fffffff;
  }
  const c1 = CHARSET[h % 32];
  const c2 = CHARSET[(h >> 5) % 32];
  const c3 = CHARSET[(h >> 10) % 32];
  const check = CHARSET[(c1.charCodeAt(0) * 17 + c2.charCodeAt(0) * 31 + c3.charCodeAt(0) * 59 + SECRET_SALT) % 32];
  return `${c1}${c2}${c3}${check}`;
}

function verifyKeyChecksum(key) {
  const clean = normalizeKey(key);
  const m = clean.match(/^([2-9A-HJ-NP-Z]{3})([2-9A-HJ-NP-Z])$/);
  if (!m) return false;
  const [, payload, check] = m;
  const c1 = payload.charCodeAt(0);
  const c2 = payload.charCodeAt(1);
  const c3 = payload.charCodeAt(2);
  const expectedCheck = CHARSET[(c1 * 17 + c2 * 31 + c3 * 59 + SECRET_SALT) % 32];
  return check === expectedCheck;
}

function getMembers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading members.json:', err);
    return [];
  }
}

function saveMembers(members) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing members.json:', err);
  }
}

export function handleApiRequest(req, res, next) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/')) {
    return next();
  }

  // Parse JSON body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let parsed = {};
      try {
        parsed = body ? JSON.parse(body) : {};
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
      routeApi(req.method, pathname, url, parsed, req, res);
    });
  } else {
    routeApi(req.method, pathname, url, {}, req, res);
  }
}

async function routeApi(method, pathname, url, body, req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const members = getMembers();
  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host || 'localhost:4173'}`;

  // 1. GET /api/members
  if (method === 'GET' && pathname === '/api/members') {
    const stats = {
      total: members.length,
      pending: members.filter(m => m.status === 'pending_review').length,
      accepted: members.filter(m => m.status === 'accepted').length,
      claimed: members.filter(m => m.status === 'claimed').length,
      printed: members.filter(m => m.printedAt).length,
      emailed: members.filter(m => m.emailSentAt).length
    };
    return res.end(JSON.stringify({ success: true, members, stats }));
  }

  // 2. GET /api/email-config
  if (method === 'GET' && pathname === '/api/email-config') {
    const cfg = getEmailConfig();
    return res.end(JSON.stringify({
      success: true,
      config: {
        enabled: !!(cfg.user && cfg.pass),
        service: cfg.service || 'gmail',
        user: cfg.user || '',
        fromName: cfg.fromName || 'C3 Admissions Council · ISLEC',
        fromEmail: cfg.fromEmail || cfg.user || '',
        host: cfg.host || 'smtp.gmail.com',
        port: cfg.port || 465,
        hasPassword: !!cfg.pass
      }
    }));
  }

  // 3. POST /api/email-config
  if (method === 'POST' && pathname === '/api/email-config') {
    const updated = saveEmailConfig(body);
    if (!updated) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, message: 'Failed to save email configuration' }));
    }
    return res.end(JSON.stringify({ success: true, message: 'Email configuration saved!' }));
  }

  // 4. POST /api/email-config/test
  if (method === 'POST' && pathname === '/api/email-config/test') {
    const result = await verifyEmailCredentials(body);
    return res.end(JSON.stringify(result));
  }

  // 5. POST /api/send-email
  if (method === 'POST' && pathname === '/api/send-email') {
    const { id, key } = body;
    const clean = normalizeKey(key);
    const member = members.find(m => m.id === id || (clean && normalizeKey(m.founderKey) === clean));

    if (!member) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, message: 'Member not found' }));
    }

    if (!member.email) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, message: 'Member has no registered email' }));
    }

    // Auto-generate key if not present
    if (!member.founderKey) {
      member.founderKey = generateKeyFromPhone(member.phone);
      if (member.status === 'pending_review') member.status = 'accepted';
    }

    const emailResult = await sendAcceptanceEmail(member, origin);
    if (emailResult.success || emailResult.isFallback) {
      member.emailSentAt = new Date().toISOString();
      saveMembers(members);
    }

    return res.end(JSON.stringify({
      success: emailResult.success,
      isFallback: emailResult.isFallback,
      gmailUrl: emailResult.gmailUrl,
      mailto: emailResult.mailto,
      message: emailResult.message,
      emailSentAt: member.emailSentAt
    }));
  }

  // 6. POST /api/webhook/form (Also handles direct on-site applications)
  if (method === 'POST' && (pathname === '/api/webhook/form' || pathname === '/api/apply')) {
    const {
      name,
      email,
      phone,
      branch = 'CSE',
      year = '3rd Year',
      role = 'Vibe Coder / Shipper',
      projectIdea = '',
      motivation = '',
      source = 'website'
    } = body;

    if (!name || !phone) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, message: 'Name and Phone Number are required' }));
    }

    const existingIndex = members.findIndex(m =>
      m.phone === String(phone).trim() || (email && m.email && m.email.toLowerCase() === String(email).trim().toLowerCase())
    );

    if (existingIndex !== -1) {
      const existing = members[existingIndex];
      existing.answers = {
        projectIdea: projectIdea || existing.answers?.projectIdea || '',
        motivation: motivation || existing.answers?.motivation || ''
      };
      if (branch) existing.branch = branch;
      if (year) existing.year = year;
      saveMembers(members);
      return res.end(JSON.stringify({ success: true, member: existing, isExisting: true }));
    }

    const newApplicant = {
      id: `fnd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: (email || '').trim().toLowerCase(),
      phone: String(phone).trim(),
      branch,
      year,
      founderKey: '', // Key assigned upon review/acceptance
      status: 'pending_review',
      role,
      customRole: '',
      claimedAt: null,
      printedAt: null,
      emailSentAt: null,
      source,
      answers: {
        projectIdea,
        motivation
      },
      createdAt: new Date().toISOString()
    };

    members.push(newApplicant);
    saveMembers(members);
    return res.end(JSON.stringify({ success: true, member: newApplicant, isExisting: false }));
  }

  // 7. POST /api/applicants/review (Accept or Reject)
  if (method === 'POST' && pathname === '/api/applicants/review') {
    const { id, action, role, customRole } = body;
    const member = members.find(m => m.id === id);

    if (!member) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, message: 'Applicant not found' }));
    }

    if (action === 'accept') {
      member.status = 'accepted';
      if (!member.founderKey) {
        member.founderKey = generateKeyFromPhone(member.phone);
      }
      if (role) member.role = role;
      if (customRole !== undefined) member.customRole = customRole;
    } else if (action === 'reject') {
      member.status = 'rejected';
    }

    saveMembers(members);
    return res.end(JSON.stringify({ success: true, member }));
  }

  // 7b. POST /api/members/reset
  if (method === 'POST' && pathname === '/api/members/reset') {
    const { passcode } = body;
    if (String(passcode).toLowerCase() !== 'c3core' && String(passcode).toLowerCase() !== 'c3admin') {
      res.statusCode = 403;
      return res.end(JSON.stringify({ success: false, message: 'Invalid organizer passcode' }));
    }
    if (members.length > 0) {
      const backupPath = path.join(__dirname, 'data', 'members_backup.json');
      try {
        fs.writeFileSync(backupPath, JSON.stringify(members, null, 2), 'utf-8');
      } catch (e) {
        console.error('Backup write failed:', e);
      }
    }
    saveMembers([]);
    return res.end(JSON.stringify({ success: true, message: 'Command Center roster reset to clean slate!' }));
  }

  // 7c. POST /api/members/restore
  if (method === 'POST' && pathname === '/api/members/restore') {
    const { passcode } = body;
    if (String(passcode).toLowerCase() !== 'c3core' && String(passcode).toLowerCase() !== 'c3admin') {
      res.statusCode = 403;
      return res.end(JSON.stringify({ success: false, message: 'Invalid organizer passcode' }));
    }
    const backupPath = path.join(__dirname, 'data', 'members_backup.json');
    if (fs.existsSync(backupPath)) {
      try {
        const restored = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
        saveMembers(restored);
        return res.end(JSON.stringify({ success: true, message: `Restored ${restored.length} applicants from backup!` }));
      } catch (e) {
        return res.end(JSON.stringify({ success: false, message: 'Failed to read backup file' }));
      }
    }
    return res.end(JSON.stringify({ success: false, message: 'No backup file found' }));
  }

  // 8. GET /api/members/:key
  if (method === 'GET' && pathname.startsWith('/api/members/')) {
    const key = normalizeKey(decodeURIComponent(pathname.replace('/api/members/', '')));
    const member = members.find(m => normalizeKey(m.founderKey) === key || m.id === key);
    if (member) {
      return res.end(JSON.stringify({ success: true, member }));
    }
    return res.end(JSON.stringify({ success: false, message: 'Member not found' }));
  }

  // 9. POST /api/verify-key
  if (method === 'POST' && pathname === '/api/verify-key') {
    const rawKey = body.key || '';
    const clean = normalizeKey(rawKey);

    const member = members.find(m => normalizeKey(m.founderKey) === clean);
    const isChecksumValid = verifyKeyChecksum(clean);

    if (member || isChecksumValid) {
      return res.end(JSON.stringify({
        success: true,
        isValid: true,
        key: clean,
        member: member || null
      }));
    }

    return res.end(JSON.stringify({
      success: false,
      isValid: false,
      key: clean,
      message: 'Invalid Founder Key'
    }));
  }

  // 10. POST /api/claim-pass
  if (method === 'POST' && pathname === '/api/claim-pass') {
    const { key, name, branch, year, role, customRole } = body;
    const clean = normalizeKey(key);

    let memberIndex = members.findIndex(m => normalizeKey(m.founderKey) === clean);
    if (memberIndex === -1) {
      if (verifyKeyChecksum(clean)) {
        const newEntry = {
          id: `fnd_${Date.now().toString(36)}`,
          name: name || 'Founding Builder',
          email: '',
          phone: '',
          branch: branch || 'CSE',
          year: year || '3rd Year',
          founderKey: clean,
          status: 'claimed',
          role: role || 'Vibe Coder / Shipper',
          customRole: customRole || '',
          claimedAt: new Date().toISOString(),
          printedAt: null,
          emailSentAt: null,
          source: 'direct_claim',
          answers: {},
          createdAt: new Date().toISOString()
        };
        members.push(newEntry);
        saveMembers(members);
        return res.end(JSON.stringify({ success: true, member: newEntry }));
      }
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, message: 'Founder key not recognized' }));
    }

    const m = members[memberIndex];
    m.status = 'claimed';
    m.claimedAt = new Date().toISOString();
    if (name) m.name = name;
    if (branch) m.branch = branch;
    if (year) m.year = year;
    if (role) m.role = role;
    if (customRole !== undefined) m.customRole = customRole;

    saveMembers(members);
    return res.end(JSON.stringify({ success: true, member: m }));
  }

  // 11. POST /api/mark-printed
  if (method === 'POST' && pathname === '/api/mark-printed') {
    const { key, printed = true } = body;
    const clean = normalizeKey(key);
    const member = members.find(m => normalizeKey(m.founderKey) === clean || m.id === clean);
    if (member) {
      member.printedAt = printed ? new Date().toISOString() : null;
      saveMembers(members);
      return res.end(JSON.stringify({ success: true, member }));
    }
    res.statusCode = 404;
    return res.end(JSON.stringify({ success: false, message: 'Member not found' }));
  }

  // 12. POST /api/sync-sheet
  if (method === 'POST' && pathname === '/api/sync-sheet') {
    const { rows = [] } = body;
    let addedCount = 0;

    for (const r of rows) {
      const name = r.name || r['Full Name'] || r['Name'];
      const phone = r.phone || r['WhatsApp / Phone Number'] || r['Phone'];
      const email = r.email || r['Email Address'] || r['Email'];
      const branch = r.branch || r['Branch'] || 'CSE';
      const year = r.year || r['Year'] || '3rd Year';
      const idea = r.projectIdea || r['What do you want to build?'] || '';

      if (name && phone) {
        const cleanPhone = String(phone).trim();
        const exists = members.find(m => m.phone === cleanPhone || (email && m.email === email));
        if (!exists) {
          members.push({
            id: `fnd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
            name: String(name).trim(),
            email: String(email || '').trim().toLowerCase(),
            phone: cleanPhone,
            branch: String(branch).trim(),
            year: String(year).trim(),
            founderKey: '',
            status: 'pending_review',
            role: 'Vibe Coder / Shipper',
            customRole: '',
            claimedAt: null,
            printedAt: null,
            emailSentAt: null,
            source: 'google_sheet_sync',
            answers: { projectIdea: idea },
            createdAt: new Date().toISOString()
          });
          addedCount++;
        }
      }
    }

    if (addedCount > 0) {
      saveMembers(members);
    }

    return res.end(JSON.stringify({
      success: true,
      addedCount,
      total: members.length
    }));
  }

  // 404 for unknown /api routes
  res.statusCode = 404;
  return res.end(JSON.stringify({ error: 'Endpoint not found' }));
}
