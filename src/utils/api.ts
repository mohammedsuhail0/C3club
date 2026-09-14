// C3 Client API Service

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  founderKey: string;
  status: 'pending_review' | 'accepted' | 'rejected' | 'claimed';
  role: string;
  customRole: string;
  claimedAt: string | null;
  printedAt: string | null;
  emailSentAt: string | null;
  source?: 'google_form' | 'website' | 'google_sheet_sync' | 'direct_claim';
  answers?: {
    projectIdea?: string;
    motivation?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
}

export interface MembersResponse {
  success: boolean;
  members: MemberRecord[];
  stats: {
    total: number;
    pending: number;
    accepted: number;
    claimed: number;
    printed: number;
    emailed: number;
  };
}

export interface EmailConfig {
  enabled: boolean;
  service: string;
  user: string;
  fromName: string;
  fromEmail: string;
  host: string;
  port: number;
  hasPassword?: boolean;
}

export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  const stored = sessionStorage.getItem('c3_admin_token');
  if (stored) return stored;
  if (sessionStorage.getItem('c3_organizer_auth') === 'true') {
    return 'c3core';
  }
  const params = new URLSearchParams(window.location.search);
  const adminParam = params.get('admin');
  if (adminParam) {
    sessionStorage.setItem('c3_admin_token', adminParam);
    return adminParam;
  }
  return '';
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('c3_admin_token', token);
  sessionStorage.setItem('c3_organizer_auth', 'true');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchMembers(): Promise<MembersResponse | null> {
  try {
    const res = await fetch('/api/members', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch members:', e);
    return null;
  }
}

export async function fetchMemberByKey(key: string): Promise<MemberRecord | null> {
  try {
    const res = await fetch(`/api/members/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.member : null;
  } catch (e) {
    console.error('Failed to fetch member by key:', e);
    return null;
  }
}

export async function verifyKeyApi(key: string): Promise<{ isValid: boolean; key: string; member?: MemberRecord }> {
  try {
    const res = await fetch('/api/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    if (!res.ok) return { isValid: false, key };
    return await res.json();
  } catch (e) {
    console.error('Failed to verify key via API:', e);
    return { isValid: false, key };
  }
}

export async function claimPassApi(data: {
  key: string;
  name: string;
  branch: string;
  year: string;
  role: string;
  customRole?: string;
}): Promise<MemberRecord | null> {
  try {
    const res = await fetch('/api/claim-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.member : null;
  } catch (e) {
    console.error('Failed to claim pass via API:', e);
    return null;
  }
}

export async function submitApplicationApi(data: {
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  role?: string;
  projectIdea?: string;
  motivation?: string;
}): Promise<{ success: boolean; member?: MemberRecord; message?: string }> {
  try {
    const res = await fetch('/api/webhook/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'website' })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.error('Failed to submit application:', e);
    return { success: false, message: 'Network error submitting application' };
  }
}

export async function addMemberApi(data: {
  name: string;
  email?: string;
  phone: string;
  branch?: string;
  year?: string;
  role?: string;
}): Promise<MemberRecord | null> {
  const res = await submitApplicationApi({
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    branch: data.branch || 'IT',
    year: data.year || '3rd Year',
    role: data.role || 'Vibe Coder / Shipper'
  });
  return res.member || null;
}

export async function reviewApplicantApi(
  id: string,
  action: 'accept' | 'reject' | 'revoke',
  role?: string,
  customRole?: string
): Promise<MemberRecord | null> {
  try {
    const res = await fetch('/api/applicants/review', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, action, role, customRole })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.member : null;
  } catch (e) {
    console.error('Failed to review applicant:', e);
    return null;
  }
}

export interface LocalDecision {
  status?: 'accepted' | 'rejected' | 'pending_review';
  founderKey?: string;
  role?: string;
  customRole?: string;
  printedAt?: string | null;
  emailSentAt?: string | null;
  updatedAt?: string;
}

export function purgeRevokedDecisionsExceptSuhail() {
  try {
    const suhailPhone = '6301633463';
    const suhailEmail = 'mdsuhailtab.1@gmail.com';
    const all = getLocalDecisions();
    let changed = false;
    for (const [k, dec] of Object.entries(all)) {
      const isSuhail = k === suhailPhone || k === suhailEmail || k.includes('6301633463') || k.includes('suhail');
      if (!isSuhail && (dec.status === 'accepted' || dec.founderKey)) {
        all[k] = { ...dec, status: 'pending_review', founderKey: '', customRole: '' };
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem('c3_organizer_decisions', JSON.stringify(all));
    }
  } catch {}
}

export function getLocalDecisions(): Record<string, LocalDecision> {
  try {
    const raw = localStorage.getItem('c3_organizer_decisions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function removeLocalDecision(identifier: string) {
  try {
    const all = getLocalDecisions();
    delete all[identifier];
    localStorage.setItem('c3_organizer_decisions', JSON.stringify(all));
  } catch {}
}

export function saveLocalDecision(identifier: string, patch: LocalDecision) {
  try {
    const all = getLocalDecisions();
    all[identifier] = { ...(all[identifier] || {}), ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem('c3_organizer_decisions', JSON.stringify(all));
  } catch {}
}

export async function syncDecisionsApi(decisions: Record<string, LocalDecision>): Promise<boolean> {
  try {
    const res = await fetch('/api/sync-decisions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ decisions })
    });
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

export async function sendAcceptanceEmailApi(idOrKey: { id?: string; key?: string }): Promise<{
  success: boolean;
  isFallback?: boolean;
  gmailUrl?: string;
  mailto?: string;
  letterHtml?: string;
  letterText?: string;
  message: string;
  emailSentAt?: string;
}> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(idOrKey)
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { 
        success: false, 
        message: res.ok ? 'Unexpected response from mailer' : `Mailer error (${res.status}): ${text.slice(0, 80)}` 
      };
    }
  } catch (e: any) {
    console.error('Failed to send email:', e);
    return { success: false, message: e?.message || 'Network error communicating with mailer' };
  }
}

export async function getEmailConfigApi(): Promise<EmailConfig | null> {
  try {
    const res = await fetch('/api/email-config', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.config : null;
  } catch (e) {
    console.error('Failed to get email config:', e);
    return null;
  }
}

export async function saveEmailConfigApi(config: Partial<EmailConfig & { pass?: string }>): Promise<boolean> {
  try {
    const res = await fetch('/api/email-config', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    const json = await res.json();
    return !!json.success;
  } catch (e) {
    console.error('Failed to save email config:', e);
    return false;
  }
}

export async function testEmailConfigApi(config: Partial<EmailConfig & { pass?: string }>): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const res = await fetch('/api/email-config/test', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Failed to test connection' };
  }
}

export async function markPrintedApi(key: string, printed: boolean = true): Promise<boolean> {
  try {
    const res = await fetch('/api/mark-printed', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ key, printed })
    });
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.success;
  } catch (e) {
    console.error('Failed to mark badge printed:', e);
    return false;
  }
}

export async function syncGoogleSheetApi(rows: Record<string, string>[]): Promise<{ success: boolean; addedCount: number; total: number }> {
  try {
    const res = await fetch('/api/sync-sheet', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rows })
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to sync sheet:', e);
    return { success: false, addedCount: 0, total: 0 };
  }
}

export async function syncGoogleSheetFromUrlApi(url: string): Promise<{ 
  success: boolean; 
  addedCount: number; 
  total: number; 
  message?: string;
  members?: MemberRecord[];
}> {
  try {
    const res = await fetch('/api/sync-sheet-url', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url })
    });
    return await res.json();
  } catch (e: any) {
    console.error('Failed to sync sheet from URL:', e);
    return { success: false, addedCount: 0, total: 0, message: e.message || 'Network error syncing sheet' };
  }
}

export async function resetMembersApi(passcode: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/members/reset', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ passcode })
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error resetting roster' };
  }
}

export async function restoreMembersApi(passcode: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/members/restore', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ passcode })
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error restoring roster' };
  }
}
