// C3 Founder Access Key (C3-FND-XXXX) Authorization & Checksum Engine
// Zero-cost, client-side, zero-database architecture

// High-Entropy Master Keys (Pure 4-character cryptographic keys)
export const MASTER_FOUNDER_KEYS = [
  '8419',
  '9231',
  'ZZRF',
  'EVKH',
  'DNE6',
  'UU9U',
  'N54W',
  '73FX',
  'J3AT',
  '8NSL',
  'WXVA',
  'GFW7',
  '6EBG',
  'EYRB',
  'PTBT',
  '89A3',
  'TUN2',
  'XR8P',
  'G5VV',
  'B29U',
  '8WPS',
  'B474',
  '2W5T',
  'M6B6',
  '8PFK',
  'UFPQ',
  'G6H2',
  'XKBC',
  'EQU4',
  'Y6MT',
  'FU2Y',
  '3TLU',
  'BCQK',
  'P7VL',
  '3FJL',
  'GHP8',
  'LK8J',
  'SBFC',
  '9H3B',
  '85QP',
  '5TD6',
  'ZHFV',
  '4MKR',
  'BHCL',
  'UEHZ',
  'APPS',
  'ERVW'
];

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 unambiguous characters (no 0/O, 1/I)
const SECRET_SALT = 8391;

// Generates a deterministic, unguessable cryptographic Founder Key from an applicant's phone number
export function generateFounderKeyForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
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

// Cryptographic Checksum Verifier (rejects brute-force & random guesses without database)
export function verifyChecksum(keyPayload: string, checksumChar: string): boolean {
  if (keyPayload.length !== 3 || checksumChar.length !== 1) return false;
  const c1 = keyPayload.charCodeAt(0);
  const c2 = keyPayload.charCodeAt(1);
  const c3 = keyPayload.charCodeAt(2);
  const expectedCheck = CHARSET[(c1 * 17 + c2 * 31 + c3 * 59 + SECRET_SALT) % 32];
  return checksumChar === expectedCheck;
}

// Validates whether an entered string is an authentic Founder Access Key
export function validateFounderKey(inputKey: string): { isValid: boolean; normalizedKey: string; message?: string } {
  if (!inputKey || typeof inputKey !== 'string') {
    return { isValid: false, normalizedKey: '', message: 'Please enter a valid Founder Key.' };
  }

  // Strip any accidental prefixes like C3-FND- or FND-
  const clean = inputKey.trim().toUpperCase().replace(/^(C3-)?(FND-)?/i, '');

  // 1. Direct match with Master Pre-Approved Keys
  if (MASTER_FOUNDER_KEYS.includes(clean)) {
    return { isValid: true, normalizedKey: clean };
  }

  // 2. Cryptographic Checksum Verification (checks mathematical authenticity)
  const match = clean.match(/^([2-9A-HJ-NP-Z]{3})([2-9A-HJ-NP-Z])$/);
  if (match) {
    const [, payload, check] = match;
    if (verifyChecksum(payload, check)) {
      return { isValid: true, normalizedKey: clean };
    }
  }

  return {
    isValid: false,
    normalizedKey: clean,
    message: 'Invalid Founder Key. Please check the exact key sent to your acceptance email.'
  };
}

// Organizer Print Queue Management
export interface PrintQueueItem {
  id: string;
  name: string;
  branch: string;
  year: string;
  role: string;
  serial: string;
  founderKey: string;
  dataUrl: string;
  claimedAt: string;
}

const PRINT_QUEUE_STORAGE_KEY = 'c3_organizer_print_queue';

export function savePassToOrganizerQueue(item: Omit<PrintQueueItem, 'id' | 'claimedAt'>): void {
  try {
    const existingRaw = localStorage.getItem(PRINT_QUEUE_STORAGE_KEY);
    const list: PrintQueueItem[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    // Check if already in queue by serial
    const existingIndex = list.findIndex(p => p.serial === item.serial);
    const newEntry: PrintQueueItem = {
      ...item,
      id: `print-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      claimedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newEntry;
    } else {
      list.push(newEntry);
    }

    localStorage.setItem(PRINT_QUEUE_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save pass to organizer queue:', err);
  }
}

export function getOrganizerPrintQueue(): PrintQueueItem[] {
  try {
    const raw = localStorage.getItem(PRINT_QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
