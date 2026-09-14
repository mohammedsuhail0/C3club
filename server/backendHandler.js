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

function generateMemberId(phone, email, name) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone) return `fnd_${cleanPhone}`;
  const cleanEmail = String(email || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanEmail) return `fnd_${cleanEmail.slice(0, 16)}`;
  const cleanName = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `fnd_${cleanName.slice(0, 16) || 'applicant'}`;
}

function findMember(members, query) {
  if (!query) return null;
  const qStr = String(query).trim();
  const qDigits = qStr.replace(/\D/g, '').slice(-10);
  const qEmail = qStr.toLowerCase();
  const qKey = normalizeKey(qStr);
  return members.find(m => 
    m.id === qStr ||
    (qKey && m.founderKey && normalizeKey(m.founderKey) === qKey) ||
    (qDigits && m.phone && m.phone.replace(/\D/g, '').slice(-10) === qDigits) ||
    (qEmail && m.email && m.email.toLowerCase() === qEmail)
  );
}

let memoryCache = null;

function getEffectiveDataFile() {
  if (process.env.VERCEL) {
    const tmpFile = path.join('/tmp', 'c3_members.json');
    if (!fs.existsSync(tmpFile)) {
      try {
        if (fs.existsSync(DATA_FILE)) {
          fs.copyFileSync(DATA_FILE, tmpFile);
        } else {
          fs.writeFileSync(tmpFile, '[]', 'utf-8');
        }
      } catch (e) {
        console.warn('Fallback to in-memory store:', e.message);
      }
    }
    return tmpFile;
  }
  return DATA_FILE;
}

function getMembers() {
  try {
    const targetFile = getEffectiveDataFile();
    if (fs.existsSync(targetFile)) {
      const data = fs.readFileSync(targetFile, 'utf-8');
      memoryCache = JSON.parse(data);
      return memoryCache;
    }
    if (memoryCache) return memoryCache;
    return [];
  } catch (err) {
    if (memoryCache) return memoryCache;
    console.error('Error reading members:', err);
    return [];
  }
}

function saveMembers(members) {
  memoryCache = members;
  try {
    const targetFile = getEffectiveDataFile();
    fs.writeFileSync(targetFile, JSON.stringify(members, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to disk, saved in-memory:', err.message);
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
    if (req.body && typeof req.body === 'object') {
      return routeApi(req.method, pathname, url, req.body, req, res);
    }
    if (req.body && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        return routeApi(req.method, pathname, url, parsed, req, res);
      } catch (e) {}
    }
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

function processSheetCSV(members, csvText) {
  const rows = parseCSV(csvText);
  let addedCount = 0;
  let updatedCount = 0;

  for (const r of rows) {
    let name = '';
    let phone = '';
    let email = '';
    let branchRaw = '';
    let yearRaw = '';
    let roleRaw = '';
    let links = '';
    let built = '';
    let experience = '';
    let weekendScenario = '';
    let motivation = '';
    let commitment = '';

    for (const [colName, val] of Object.entries(r)) {
      const col = colName.toLowerCase();
      if (!name && col.includes('name')) name = val;
      else if (!phone && (col.includes('phone') || col.includes('whatsapp') || col.includes('mobile') || col.includes('contact') || col.includes('number'))) phone = val;
      else if (!email && col.includes('email')) email = val;
      else if (col.includes('branch') || col.includes('department') || col.includes('study')) branchRaw = val;
      else if (col.includes('year') && !branchRaw) yearRaw = val;
      else if (col.includes('role')) roleRaw = val;
      else if (col.includes('link') || col.includes('github') || col.includes('portfolio') || col.includes('linkedin')) links = val;
      else if (col.includes('built') || col.includes('broken')) built = val;
      else if (col.includes('experience') || col.includes('workflows')) experience = val;
      else if (col.includes('weekend') || col.includes('48 hours') || col.includes('scenario')) weekendScenario = val;
      else if (col.includes('why') || col.includes('motivation') || col.includes('instead of')) motivation = val;
      else if (col.includes('commitment') || col.includes('weekly') || col.includes('hours')) commitment = val;
    }

    if (name && phone) {
      const cleanPhone = String(phone).trim();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const { branch, year } = parseBranchAndYear(branchRaw || yearRaw);
      const role = parseRole(roleRaw);

      const existingIndex = members.findIndex(m => {
        const mDigits = m.phone ? String(m.phone).replace(/\D/g, '').slice(-10) : '';
        const curDigits = cleanPhone.replace(/\D/g, '').slice(-10);
        return (mDigits && curDigits && mDigits === curDigits) ||
               (cleanEmail && m.email && m.email.toLowerCase() === cleanEmail);
      });

      const answersObj = {
        projectIdea: built || weekendScenario || '',
        motivation: motivation || '',
        built: built || '',
        experience: experience || '',
        weekendScenario: weekendScenario || '',
        links: links || '',
        commitment: commitment || ''
      };

      if (existingIndex !== -1) {
        const existing = members[existingIndex];
        existing.branch = branch;
        existing.year = year;
        if (!existing.role || existing.role === 'Vibe Coder / Shipper') {
          existing.role = role;
        }
        existing.source = 'google_sheet_sync';
        existing.answers = {
          ...(existing.answers || {}),
          ...answersObj
        };
        // NEVER reset accepted status or erase founderKey!
        if (existing.status === 'accepted' && !existing.founderKey) {
          existing.founderKey = generateKeyFromPhone(existing.phone);
        }
        updatedCount++;
      } else {
        members.push({
          id: generateMemberId(cleanPhone, cleanEmail, name),
          name: String(name).trim(),
          email: cleanEmail,
          phone: cleanPhone,
          branch,
          year,
          founderKey: '',
          status: 'pending_review',
          role,
          customRole: '',
          claimedAt: null,
          printedAt: null,
          emailSentAt: null,
          source: 'google_sheet_sync',
          answers: answersObj,
          createdAt: new Date().toISOString()
        });
        addedCount++;
      }
    }
  }

  if (addedCount > 0 || updatedCount > 0) {
    saveMembers(members);
  }
  return { addedCount, updatedCount };
}

let lastBackgroundSheetSync = 0;
async function backgroundSyncSheet(members) {
  const now = Date.now();
  if (now - lastBackgroundSheetSync < 15000) return;
  lastBackgroundSheetSync = now;
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1_S36e4hXKWyIAoIMBAnKdlj4C67MkWj5rcf7CZBEqTo/export?format=csv';
    const res = await fetch(sheetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const csvText = await res.text();
      processSheetCSV(members, csvText);
    }
  } catch (e) {
    console.warn('Background sheet sync warning:', e.message);
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
    await backgroundSyncSheet(members);
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
    let name = body.name || '';
    let email = body.email || '';
    let phone = body.phone || body.whatsapp || '';
    let branchRaw = body.branch || body.department || '';
    let yearRaw = body.year || '';
    let roleRaw = body.role || '';
    let customRole = body.customRole || '';
    let projectIdea = body.projectIdea || body.built || '';
    let motivation = body.motivation || '';
    let built = body.built || '';
    let experience = body.experience || '';
    let weekendScenario = body.weekendScenario || '';
    let links = body.links || body.portfolio || '';
    let commitment = body.commitment || '';
    const source = body.source || 'website';

    // Scan any extra keys in body (e.g. from Google Form webhook or sheet)
    for (const [colName, val] of Object.entries(body)) {
      const col = colName.toLowerCase();
      if (!name && col.includes('name')) name = val;
      else if (!phone && (col.includes('phone') || col.includes('whatsapp') || col.includes('mobile') || col.includes('contact') || col.includes('number'))) phone = val;
      else if (!email && col.includes('email')) email = val;
      else if (col.includes('branch') || col.includes('department') || col.includes('study')) branchRaw = val;
      else if (col.includes('year') && !branchRaw) yearRaw = val;
      else if (col.includes('role')) roleRaw = val;
      else if (col.includes('link') || col.includes('github') || col.includes('portfolio') || col.includes('linkedin')) links = val;
      else if (col.includes('built') || col.includes('broken')) built = val;
      else if (col.includes('experience') || col.includes('workflows')) experience = val;
      else if (col.includes('weekend') || col.includes('48 hours') || col.includes('scenario')) weekendScenario = val;
      else if (col.includes('why') || col.includes('motivation') || col.includes('instead of')) motivation = val;
      else if (col.includes('commitment') || col.includes('weekly') || col.includes('hours')) commitment = val;
    }

    if (!name || !phone) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, message: 'Name and Phone Number are required' }));
    }

    const { branch, year } = parseBranchAndYear(branchRaw || yearRaw);
    const role = parseRole(roleRaw);

    const answersObj = {
      projectIdea: built || weekendScenario || projectIdea || '',
      motivation: motivation || '',
      built: built || projectIdea || '',
      experience: experience || '',
      weekendScenario: weekendScenario || '',
      links: links || '',
      commitment: commitment || ''
    };

    const existingIndex = members.findIndex(m =>
      m.phone === String(phone).trim() || (email && m.email && m.email.toLowerCase() === String(email).trim().toLowerCase())
    );

    if (existingIndex !== -1) {
      const existing = members[existingIndex];
      existing.branch = branch;
      existing.year = year;
      if (!existing.role || existing.role === 'Vibe Coder / Shipper') {
        existing.role = role;
      }
      if (customRole) {
        existing.customRole = customRole;
      }
      existing.answers = {
        ...(existing.answers || {}),
        ...answersObj
      };
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
      customRole: customRole || '',
      claimedAt: null,
      printedAt: null,
      emailSentAt: null,
      source,
      answers: answersObj,
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

  // 13. POST /api/sync-sheet-url (Fetch live Google Sheet CSV & auto-sync 24/7)
  if (method === 'POST' && pathname === '/api/sync-sheet-url') {
    const { url } = body;
    if (!url) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, message: 'Google Sheet URL or ID is required' }));
    }

    try {
      const exportUrls = getGoogleSheetExportUrls(url);
      let fetchRes = null;
      let lastStatus = 400;

      for (const targetUrl of exportUrls) {
        try {
          const res = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (res.ok) {
            fetchRes = res;
            break;
          } else {
            lastStatus = res.status;
          }
        } catch (e) {}
      }

      if (!fetchRes) {
        res.statusCode = 400;
        return res.end(JSON.stringify({
          success: false,
          message: `Failed to fetch Google Sheet CSV (HTTP ${lastStatus}). Verify Sheet General Access is 'Anyone with link can view' or 'Publish to web'.`
        }));
      }

      const csvText = await fetchRes.text();
      const { addedCount, updatedCount } = processSheetCSV(members, csvText);

      return res.end(JSON.stringify({
        success: true,
        addedCount,
        updatedCount,
        total: members.length,
        members
      }));
    } catch (err) {
      console.error('Error syncing sheet from URL:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        success: false,
        message: `Sync failed: ${err.message}`
      }));
    }
  }

  // 14. POST /api/sync-decisions (Client sends organizer decisions map to keep backend in sync across serverless containers)
  if (method === 'POST' && pathname === '/api/sync-decisions') {
    const { decisions = {} } = body;
    let updatedCount = 0;
    for (const [key, dec] of Object.entries(decisions)) {
      const member = findMember(members, dec.phone || dec.email || dec.id || key);
      if (member) {
        if (dec.status) member.status = dec.status;
        if (dec.founderKey) member.founderKey = dec.founderKey;
        if (dec.role) member.role = dec.role;
        if (dec.customRole !== undefined) member.customRole = dec.customRole;
        if (dec.printedAt !== undefined) member.printedAt = dec.printedAt;
        if (dec.emailSentAt !== undefined) member.emailSentAt = dec.emailSentAt;
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      saveMembers(members);
    }
    return res.end(JSON.stringify({ success: true, updatedCount, total: members.length }));
  }

  // 404 for unknown /api routes
  res.statusCode = 404;
  return res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

function getGoogleSheetExportUrls(url) {
  let exportUrl = String(url || '').trim();
  if (exportUrl.includes('/pub?output=csv') || exportUrl.includes('/export?format=csv')) {
    return [exportUrl];
  }
  const idMatch = exportUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    const sheetId = idMatch[1];
    const gidMatch = exportUrl.match(/[?&#]gid=([0-9]+)/);
    const urls = [];
    if (gidMatch && gidMatch[1]) {
      urls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gidMatch[1]}`);
    }
    // Try without gid: Google automatically serves the active first sheet (returns HTTP 200)
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`);
    // Also try known form response gid and default gid=0
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=409707496`);
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`);
    return urls;
  }
  if (!exportUrl.startsWith('http')) {
    return [
      `https://docs.google.com/spreadsheets/d/${exportUrl}/export?format=csv`,
      `https://docs.google.com/spreadsheets/d/${exportUrl}/export?format=csv&gid=409707496`,
      `https://docs.google.com/spreadsheets/d/${exportUrl}/export?format=csv&gid=0`
    ];
  }
  return [exportUrl];
}

function parseCSV(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = [];
  let row = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentToken.trim());
      currentToken = '';
      if (row.length > 0 && row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentToken += char;
    }
  }
  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length < 2) return [];
  const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

function parseBranchAndYear(raw) {
  if (!raw) return { branch: 'CSE', year: '3rd Year' };
  const str = String(raw).trim();

  let year = '';
  if (/(\bIV\b|\b4th\b|\bfourth\b|\bfinal\b|2021[-–]25|2022[-–]26)/i.test(str)) {
    year = '4th Year';
  } else if (/(\bIII\b|\b3rd\b|\bthird\b|2023[-–]27)/i.test(str)) {
    year = '3rd Year';
  } else if (/(\bII\b|\b2nd\b|\bsecond\b|2024[-–]28)/i.test(str)) {
    year = '2nd Year';
  } else if (/(\b1st\b|\bfirst\b|2025[-–]29)/i.test(str)) {
    year = '1st Year';
  }

  let branch = '';
  const upper = str.toUpperCase();
  if (upper.includes('AI') && upper.includes('DS')) branch = 'AI&DS';
  else if (upper.includes('AI') && upper.includes('ML')) branch = 'AI&ML';
  else if (upper.includes('CSE') || upper.includes('COMPUTER')) branch = 'CSE';
  else if (/\bIT\b/.test(upper) || upper.includes('INFORMATION')) branch = 'IT';
  else if (/\bECE\b/.test(upper) || upper.includes('ELECTRONIC')) branch = 'ECE';
  else if (/\bEEE\b/.test(upper) || upper.includes('ELECTRICAL')) branch = 'EEE';
  else if (/\bMECH\b/.test(upper) || upper.includes('MECHANICAL')) branch = 'MECH';
  else if (/\bCIVIL\b/.test(upper)) branch = 'CIVIL';
  else {
    branch = str.split(/[,&]/)[0].trim();
  }

  return {
    branch: branch || 'CSE',
    year: year || '3rd Year'
  };
}

function parseRole(raw) {
  if (!raw) return 'Technical & AI Architect';
  const str = String(raw);
  if (str.includes('Technical & AI Architect') || str.includes('Prompt Engineering')) return 'Technical & AI Architect';
  if (str.includes('Project Founder') || str.includes('Lead your own startup')) return 'Project Founder';
  if (str.includes('Design & Creative Lead') || str.includes('UI/UX')) return 'Design & Creative Lead';
  if (str.includes('Growth') || str.includes('Community')) return 'Growth & Community Lead';
  return str.split(/[,(]/)[0].trim() || 'Technical & AI Architect';
}
