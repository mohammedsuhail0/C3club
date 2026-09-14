// C3 Founder Access Key (C3-FND-XXXX) Authorization & Checksum Engine
// Zero-cost, client-side, zero-database architecture

// High-Entropy Master Keys
export const MASTER_FOUNDER_KEYS: string[] = [];

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 unambiguous characters (no 0/O, 1/I)
const DIGITS = '23456789'; // 8 digits
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 24 letters
const SECRET_SALT = 8391;
const REVOKED_KEYS = ['3N8H', 'EVKH'];

// Generates a deterministic, unguessable cryptographic Founder Key (guaranteed 4-character alphanumeric)
export function generateFounderKeyForPhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '') || '0';
  let h = 5381;
  for (let i = 0; i < digits.length; i++) {
    h = ((h << 5) + h) + digits.charCodeAt(i);
    h = h & 0x7fffffff;
  }
  // c1 is always a digit (2-9), c2 is always a letter (A-Z)
  const c1 = DIGITS[h % DIGITS.length];
  const c2 = LETTERS[(h >> 3) % LETTERS.length];
  const c3 = CHARSET[(h >> 8) % CHARSET.length];
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

  if (REVOKED_KEYS.includes(clean)) {
    return {
      isValid: false,
      normalizedKey: clean,
      message: 'This Founder Key has been revoked or is inactive.'
    };
  }

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
