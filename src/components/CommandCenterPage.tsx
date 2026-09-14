import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Key, Users, CheckCircle, Clock, Printer, 
  Send, ExternalLink, Copy, Plus, Search, Check, RefreshCw,
  Mail, MessageSquare, Settings, FileText, Sparkles,
  AlertCircle, ChevronRight, Eye, Code, Upload, ArrowLeft,
  Share2, ShieldCheck, Download, Trash2, Globe, Compass
} from 'lucide-react';
import { 
  fetchMembers, 
  addMemberApi, 
  markPrintedApi, 
  reviewApplicantApi, 
  sendAcceptanceEmailApi, 
  getEmailConfigApi, 
  saveEmailConfigApi, 
  testEmailConfigApi, 
  syncGoogleSheetApi,
  syncGoogleSheetFromUrlApi,
  LocalDecision,
  getLocalDecisions,
  saveLocalDecision,
  syncDecisionsApi,
  MemberRecord, 
  MembersResponse, 
  EmailConfig 
} from '../utils/api';
import { sounds } from '../utils/audio';

interface CommandCenterPageProps {
  onNavigateHome: () => void;
  onViewLetter: (member: MemberRecord) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  onNavigateHome,
  onViewLetter
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const h = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hp = new URLSearchParams(h);
      if (p.get('admin') === 'c3core' || hp.get('admin') === 'c3core' || sessionStorage.getItem('c3_organizer_auth') === 'true') {
        return true;
      }
    }
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'roster' | 'forms' | 'gmail' | 'galaxy' | 'settings'>('roster');
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'accepted' | 'claimed' | 'printed'>('all');
  
  // Drawer & Modals
  const [selectedApplicant, setSelectedApplicant] = useState<MemberRecord | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Drawer Builder Role Selection (Two Options: Dropdown vs Type Custom)
  const [drawerRoleMode, setDrawerRoleMode] = useState<'dropdown' | 'custom'>('dropdown');
  const [drawerPresetRole, setDrawerPresetRole] = useState<string>('Technical & AI Architect');
  const [drawerCustomRole, setDrawerCustomRole] = useState<string>('');

  useEffect(() => {
    if (selectedApplicant) {
      if (selectedApplicant.customRole && selectedApplicant.customRole.trim()) {
        setDrawerRoleMode('custom');
        setDrawerCustomRole(selectedApplicant.customRole);
        setDrawerPresetRole(selectedApplicant.role || 'Founding Builder');
      } else {
        setDrawerRoleMode('dropdown');
        setDrawerCustomRole('');
        setDrawerPresetRole(selectedApplicant.role || 'Technical & AI Architect');
      }
    }
  }, [selectedApplicant?.id]);

  // Email sending state
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  // Email config state
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    enabled: false,
    service: 'gmail',
    user: 'c3.collective.in@gmail.com',
    fromName: 'C3 Admissions Council · ISLEC',
    fromEmail: 'c3.collective.in@gmail.com',
    host: 'smtp.gmail.com',
    port: 465
  });
  const [emailPassword, setEmailPassword] = useState('');
  const [emailTestStatus, setEmailTestStatus] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  // Sheets import state
  const [sheetPasteContent, setSheetPasteContent] = useState('');
  const [sheetImportStatus, setSheetImportStatus] = useState<string | null>(null);

  // 24/7 Live Google Sheet Auto-Sync State
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('c3_google_sheet_url') || '';
    }
    return '';
  });
  const [sheetUrlInput, setSheetUrlInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('c3_google_sheet_url') || '';
    }
    return '';
  });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('c3_auto_sync_enabled') !== 'false';
    }
    return true;
  });
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  const performSheetSync = async (targetUrl?: string, isManual = false) => {
    const urlToUse = (targetUrl || sheetUrl).trim();
    if (!urlToUse) return;

    setIsSyncingSheet(true);
    const res = await syncGoogleSheetFromUrlApi(urlToUse);
    setIsSyncingSheet(false);

    if (res.success) {
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (res.addedCount > 0) {
        sounds.playSuccess();
        setSyncStatusMsg({
          text: `⚡ Ingested ${res.addedCount} new applicant(s) from Google Sheets!`,
          success: true
        });
        loadData();
        setTimeout(() => setSyncStatusMsg(null), 6000);
      } else if (isManual) {
        sounds.playClick();
        setSyncStatusMsg({
          text: `All ${res.total} applicant(s) up to date. Zero new rows in Google Sheet.`,
          success: true
        });
        setTimeout(() => setSyncStatusMsg(null), 4000);
      }
    } else {
      if (isManual) {
        sounds.playKey();
        setSyncStatusMsg({
          text: res.message || 'Failed to sync with Google Sheet',
          success: false
        });
        setTimeout(() => setSyncStatusMsg(null), 6000);
      }
    }
  };

  const handleSaveSheetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sheetUrlInput.trim();
    setSheetUrl(clean);
    try {
      localStorage.setItem('c3_google_sheet_url', clean);
    } catch {}
    if (clean) {
      sounds.playSuccess();
      performSheetSync(clean, true);
    }
  };

  const handleToggleAutoSync = () => {
    sounds.playClick();
    const next = !isAutoSyncEnabled;
    setIsAutoSyncEnabled(next);
    try {
      localStorage.setItem('c3_auto_sync_enabled', next ? 'true' : 'false');
    } catch {}
  };

  useEffect(() => {
    if (!isAuthenticated || !sheetUrl.trim() || !isAutoSyncEnabled) return;
    performSheetSync(sheetUrl);

    const interval = setInterval(() => {
      performSheetSync(sheetUrl);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sheetUrl, isAutoSyncEnabled]);

  // Add new applicant inputs
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBranch, setNewBranch] = useState('CSE');

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchMembers();
    if (res) {
      const localDecisions = getLocalDecisions();

      // Overlay local decisions so serverless cold-starts never wipe acceptances
      const mergedMembers = res.members.map(m => {
        const phoneKey = m.phone ? m.phone.replace(/\D/g, '').slice(-10) : '';
        const dec = (phoneKey && localDecisions[phoneKey]) || (m.email && localDecisions[m.email.toLowerCase()]) || localDecisions[m.id];
        if (dec) {
          return {
            ...m,
            status: dec.status || m.status,
            founderKey: dec.founderKey || m.founderKey,
            role: dec.role || m.role,
            customRole: dec.customRole !== undefined ? dec.customRole : m.customRole,
            printedAt: dec.printedAt !== undefined ? dec.printedAt : m.printedAt,
            emailSentAt: dec.emailSentAt !== undefined ? dec.emailSentAt : m.emailSentAt
          };
        }
        return m;
      });

      const stats = {
        total: mergedMembers.length,
        pending: mergedMembers.filter(m => m.status === 'pending_review').length,
        accepted: mergedMembers.filter(m => m.status === 'accepted').length,
        claimed: mergedMembers.filter(m => m.status === 'claimed').length,
        printed: mergedMembers.filter(m => m.printedAt).length,
        emailed: mergedMembers.filter(m => m.emailSentAt).length
      };

      setData({ success: true, members: mergedMembers, stats });
      if (selectedApplicant) {
        const updated = mergedMembers.find(m => m.id === selectedApplicant.id || (m.phone && selectedApplicant.phone && m.phone === selectedApplicant.phone));
        if (updated) setSelectedApplicant(updated);
      }

      // Proactively heal serverless containers with local decisions
      if (Object.keys(localDecisions).length > 0) {
        syncDecisionsApi(localDecisions);
      }
    }
    setLoading(false);
  };

  const loadEmailConfig = async () => {
    const cfg = await getEmailConfigApi();
    if (cfg) {
      setEmailConfig(cfg);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadEmailConfig();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === 'c3core' || passcode.toLowerCase() === 'c3admin') {
      sounds.playSuccess();
      setIsAuthenticated(true);
      setPasscodeError(false);
      try { sessionStorage.setItem('c3_organizer_auth', 'true'); } catch {}
      loadData();
      loadEmailConfig();
    } else {
      sounds.playKey();
      setPasscodeError(true);
    }
  };

  const handleLock = () => {
    sounds.playClick();
    setIsAuthenticated(false);
    try { sessionStorage.removeItem('c3_organizer_auth'); } catch {}
  };

  const handleSendAcceptanceEmail = async (member: MemberRecord) => {
    sounds.playClick();
    setSendingEmailId(member.id);
    setEmailStatusMsg(null);

    const res = await sendAcceptanceEmailApi({ id: member.id, key: member.founderKey });
    setSendingEmailId(null);

    if (res.success || (res.isFallback && (res.gmailUrl || res.mailto))) {
      sounds.playSuccess();
      const phoneKey = member.phone ? member.phone.replace(/\D/g, '').slice(-10) : member.id;
      saveLocalDecision(phoneKey, {
        emailSentAt: new Date().toISOString()
      });
      if (member.id) {
        saveLocalDecision(member.id, { emailSentAt: new Date().toISOString() });
      }

      if (res.isFallback && (res.gmailUrl || res.mailto)) {
        const targetUrl = res.gmailUrl || res.mailto!;
        window.open(targetUrl, '_blank');
        setEmailStatusMsg({ id: member.id, text: 'Opened pre-filled draft in C3 Gmail! (1-click send)', success: true });
      } else {
        setEmailStatusMsg({ id: member.id, text: 'Official acceptance email dispatched!', success: true });
      }
      loadData();
    } else {
      setEmailStatusMsg({ id: member.id, text: res.message || 'Failed to send email', success: false });
    }

    setTimeout(() => setEmailStatusMsg(null), 6000);
  };

  const handleWhatsAppInvite = (member: MemberRecord) => {
    sounds.playSuccess();
    const cleanKey = member.founderKey || 'PENDING';
    const unlockUrl = `${window.location.origin}/?code=${cleanKey}`;
    const letterUrl = `${window.location.origin}/?letter=${cleanKey}`;
    
    const text = `🎉 Congratulations ${member.name}!

You have been officially accepted into C3 Batch 01 (Founding Member) at ISL Engineering College.

🔑 Your Exclusive Founder Key: ${cleanKey}
📄 View Your Official Acceptance Letter: ${letterUrl}
🛡️ Claim Your 3D Founding Pass & Badge: ${unlockUrl}

Kickoff Routine: Monday to Thursday, 10:00 AM – 1:00 PM at C3 Campus Office / Lab 3.
See you on Monday!
— Mohammed Suhail & Mohammad Bilal (Founding Co-Leads, C3 Collective)`;

    let cleanPhone = (member.phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = `91${cleanPhone.slice(1)}`;
    }
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleReviewDecision = async (
    id: string,
    action: 'accept' | 'reject',
    role?: string,
    customRole?: string
  ) => {
    sounds.playSuccess();
    const updated = await reviewApplicantApi(id, action, role, customRole);
    const target = updated || selectedApplicant;
    if (target) {
      const phoneKey = target.phone ? target.phone.replace(/\D/g, '').slice(-10) : target.id;
      const decPatch = {
        status: action === 'accept' ? 'accepted' as const : 'rejected' as const,
        founderKey: updated?.founderKey || target.founderKey,
        role: role || target.role,
        customRole: customRole !== undefined ? customRole : target.customRole
      };
      saveLocalDecision(phoneKey, decPatch);
      saveLocalDecision(target.id, decPatch);
      if (target.email) saveLocalDecision(target.email.toLowerCase(), decPatch);

      if (selectedApplicant?.id === id || (target.phone && selectedApplicant?.phone === target.phone)) {
        setSelectedApplicant(updated || { ...selectedApplicant, status: action === 'accept' ? 'accepted' : 'rejected' });
      }
      loadData();
    }
  };

  const handleTogglePrinted = async (member: MemberRecord) => {
    sounds.playClick();
    const nextState = !member.printedAt;
    const ok = await markPrintedApi(member.founderKey || member.id, nextState);
    const phoneKey = member.phone ? member.phone.replace(/\D/g, '').slice(-10) : member.id;
    const patch = { printedAt: nextState ? new Date().toISOString() : null };
    saveLocalDecision(phoneKey, patch);
    saveLocalDecision(member.id, patch);
    loadData();
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    const ok = await saveEmailConfigApi({
      ...emailConfig,
      pass: emailPassword || undefined
    });
    if (ok) {
      setEmailTestStatus('Configuration saved successfully!');
      loadEmailConfig();
    } else {
      setEmailTestStatus('Failed to save configuration');
    }
    setTimeout(() => setEmailTestStatus(null), 4000);
  };

  const handleTestEmailConfig = async () => {
    setTestingEmail(true);
    setEmailTestStatus(null);
    const res = await testEmailConfigApi({
      ...emailConfig,
      pass: emailPassword || undefined
    });
    setTestingEmail(false);
    setEmailTestStatus(res.message);
    setTimeout(() => setEmailTestStatus(null), 6000);
  };

  const handleImportSheet = async () => {
    if (!sheetPasteContent.trim()) return;
    sounds.playSuccess();
    
    const lines = sheetPasteContent.trim().split(/\r?\n/);
    if (lines.length < 1) return;

    const firstLine = lines[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';

    const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(separator).map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = parts[idx] || '';
        });
        rows.push(row);
      }
    }

    const res = await syncGoogleSheetApi(rows);
    setSheetImportStatus(`Imported ${res.addedCount} new applicant(s)! Total: ${res.total}`);
    setSheetPasteContent('');
    loadData();
    setTimeout(() => setSheetImportStatus(null), 5000);
  };

  const handleAddApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    sounds.playSuccess();

    const res = await addMemberApi({
      name: newName,
      phone: newPhone,
      email: newEmail,
      branch: newBranch,
      year: '3rd Year'
    });

    if (res) {
      setIsAdding(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      loadData();
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    sounds.playClick();
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const publicWebhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhook/form` 
    : 'https://your-domain.com/api/webhook/form';

  const googleAppsScriptCode = `// C3 Live 24/7 Webhook (Works for both Google Forms & Google Sheets)
// Runs 100% on Google's cloud servers 24/7/365, even while your laptop is asleep!

function onFormSubmit(e) {
  var webhookUrl = "${publicWebhookUrl}";
  var payload = { 
    source: "google_form",
    submittedAt: new Date().toISOString()
  };

  try {
    if (e && e.namedValues) {
      // 1. Triggered from linked Google Sheet
      for (var key in e.namedValues) {
        var val = (e.namedValues[key] && e.namedValues[key][0]) ? String(e.namedValues[key][0]).trim() : "";
        var k = key.toLowerCase();
        if (k.indexOf("name") !== -1) payload.name = val;
        else if (k.indexOf("phone") !== -1 || k.indexOf("whatsapp") !== -1 || k.indexOf("mobile") !== -1 || k.indexOf("contact") !== -1 || k.indexOf("number") !== -1) payload.phone = val;
        else if (k.indexOf("email") !== -1) payload.email = val;
        else if (k.indexOf("branch") !== -1 || k.indexOf("dept") !== -1 || k.indexOf("department") !== -1) payload.branch = val;
        else if (k.indexOf("year") !== -1) payload.year = val;
        else if (k.indexOf("build") !== -1 || k.indexOf("project") !== -1 || k.indexOf("idea") !== -1) payload.projectIdea = val;
        else if (k.indexOf("why") !== -1 || k.indexOf("motivation") !== -1) payload.motivation = val;
        else payload[key] = val;
      }
    } else if (e && e.response) {
      // 2. Triggered from Google Form directly
      var formResponse = e.response;
      payload.email = formResponse.getRespondentEmail() || "";
      var itemResponses = formResponse.getItemResponses();
      for (var i = 0; i < itemResponses.length; i++) {
        var title = itemResponses[i].getItem().getTitle();
        var answer = itemResponses[i].getResponse();
        var t = title.toLowerCase();
        if (t.indexOf("name") !== -1) payload.name = answer;
        else if (t.indexOf("phone") !== -1 || t.indexOf("whatsapp") !== -1 || t.indexOf("mobile") !== -1 || t.indexOf("contact") !== -1 || t.indexOf("number") !== -1) payload.phone = answer;
        else if (t.indexOf("email") !== -1) payload.email = answer;
        else if (t.indexOf("branch") !== -1 || t.indexOf("dept") !== -1) payload.branch = answer;
        else if (t.indexOf("year") !== -1) payload.year = answer;
        else if (t.indexOf("build") !== -1 || t.indexOf("project") !== -1 || t.indexOf("idea") !== -1) payload.projectIdea = answer;
        else if (t.indexOf("why") !== -1 || t.indexOf("motivation") !== -1) payload.motivation = answer;
        else payload[title] = answer;
      }
    }

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    UrlFetchApp.fetch(webhookUrl, options);
  } catch (err) {
    Logger.log("C3 Webhook dispatch error: " + err);
  }
}`;

  const filteredMembers = (data?.members || []).filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.founderKey && m.founderKey.toLowerCase().includes(q)) ||
      m.branch.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending_review') return m.status === 'pending_review';
    if (statusFilter === 'accepted') return m.status === 'accepted';
    if (statusFilter === 'claimed') return m.status === 'claimed';
    if (statusFilter === 'printed') return !!m.printedAt;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#14120E] text-[#EDE8DF] flex flex-col font-sans selection:bg-[#CC5A36] selection:text-white">
      
      {/* TOP EXECUTIVE BAR */}
      <header className="w-full border-b border-[#2A2620] bg-[#1B1813]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#CC5A36]/15 border border-[#CC5A36]/30 flex items-center justify-center text-[#CC5A36] font-mono font-bold text-sm shadow-inner">
            C3
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                C3 Organizer Command Center
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#CC5A36]/20 border border-[#CC5A36]/40 text-[#E87A56]">
                BATCH 01 · FOUNDERS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM LIVE
              </span>
            </div>
            <p className="text-xs font-mono text-[#9E9587]">
              Founding Co-Leads: <strong className="text-white font-semibold">Mohammed Suhail</strong> & <strong className="text-white font-semibold">Mohammad Bilal</strong> · ISL Engineering College
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 rounded-xl border border-[#3A352C] bg-[#221E18] hover:bg-[#2C2720] text-xs font-mono text-[#D4CDC3] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#CC5A36]" />
            <span className="hidden sm:inline">Visit Student Site</span>
            <ExternalLink className="w-3 h-3 text-[#8C8275]" />
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLock}
              className="px-3 py-1.5 rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-mono text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Lock Session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Lock</span>
            </button>
          )}
        </div>
      </header>

      {/* BODY CONTENT */}
      {!isAuthenticated ? (
        /* ORGANIZER LOGIN GATE */
        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#1B1813] border border-[#2D2821] rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#CC5A36]/15 border border-[#CC5A36]/30 text-[#CC5A36] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                Organizer Access Protected
              </h2>
              <p className="text-xs font-sans text-[#A8A093] mt-2 leading-relaxed">
                Welcome, Mohammed Suhail & Mohammad Bilal. Enter your organizer passcode to access the live applicant pipeline, dispatch acceptance letters, and manage founding passes.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  placeholder="Enter Passcode (c3core)"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#12100C] border border-[#3A352C] text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-[#CC5A36] focus:ring-1 focus:ring-[#CC5A36] placeholder-[#666055]"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs font-mono text-rose-400 mt-2">
                    Incorrect passcode. Hint: c3core
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-medium text-xs font-mono shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Unlock Command Center
              </button>
            </form>

            <div className="pt-4 border-t border-[#2A2620] flex items-center justify-between text-[11px] font-mono text-[#7D7467]">
              <span>C3 Collective · ISLEC</span>
              <button 
                type="button"
                onClick={onNavigateHome}
                className="text-[#CC5A36] hover:underline"
              >
                ← Return to Public Site
              </button>
            </div>
          </motion.div>
        </main>
      ) : (
        /* FULL STANDALONE DASHBOARD */
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
          
          {/* TAB NAVIGATION */}
          <div className="flex items-center justify-between border-b border-[#2A2620] pb-3 overflow-x-auto gap-4">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('roster'); }}
                className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'roster' 
                    ? 'bg-[#CC5A36] text-white font-bold shadow-md' 
                    : 'bg-[#1E1B15] text-[#A8A093] hover:text-white border border-[#2E2922]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Applicants & Roster</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                  {data?.stats?.total || 0}
                </span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('forms'); }}
                className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'forms' 
                    ? 'bg-[#CC5A36] text-white font-bold shadow-md' 
                    : 'bg-[#1E1B15] text-[#A8A093] hover:text-white border border-[#2E2922]'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Forms & Ingestion</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('gmail'); }}
                className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'gmail' 
                    ? 'bg-[#CC5A36] text-white font-bold shadow-md' 
                    : 'bg-[#1E1B15] text-[#A8A093] hover:text-white border border-[#2E2922]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Gmail Dispatch Hub</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  1-CLICK
                </span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('galaxy'); }}
                className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'galaxy' 
                    ? 'bg-[#CC5A36] text-white font-bold shadow-md' 
                    : 'bg-[#1E1B15] text-[#A8A093] hover:text-white border border-[#2E2922]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>3D Galaxy</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('settings'); }}
                className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-[#CC5A36] text-white font-bold shadow-md' 
                    : 'bg-[#1E1B15] text-[#A8A093] hover:text-white border border-[#2E2922]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>System</span>
              </button>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadData}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-[#1E1B15] border border-[#2E2922] hover:border-[#3E382E] text-xs font-mono text-[#A8A093] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CC5A36]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-xs font-mono font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Applicant</span>
              </button>
            </div>
          </div>

          {/* TAB 1: APPLICANTS & ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              
              {/* TOP METRIC CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                <div 
                  onClick={() => setStatusFilter('all')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'bg-[#CC5A36]/15 border-[#CC5A36]' 
                      : 'bg-[#1A1713] border-[#2A251E] hover:border-[#3E382E]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-[#9E9587] block">Total Applicants</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 block">
                    {data?.stats?.total || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('pending_review')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'pending_review' 
                      ? 'bg-amber-500/15 border-amber-500' 
                      : 'bg-[#1A1713] border-[#2A251E] hover:border-[#3E382E]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-amber-400 block">Pending Review</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mt-1 block">
                    {data?.stats?.pending || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('accepted')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'accepted' 
                      ? 'bg-emerald-500/15 border-emerald-500' 
                      : 'bg-[#1A1713] border-[#2A251E] hover:border-[#3E382E]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block">Accepted Founders</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-1 block">
                    {data?.stats?.accepted || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('claimed')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'claimed' 
                      ? 'bg-blue-500/15 border-blue-500' 
                      : 'bg-[#1A1713] border-[#2A251E] hover:border-[#3E382E]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-blue-400 block">3D Passes Claimed</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-blue-400 mt-1 block">
                    {data?.stats?.claimed || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('printed')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    statusFilter === 'printed' 
                      ? 'bg-purple-500/15 border-purple-500' 
                      : 'bg-[#1A1713] border-[#2A251E] hover:border-[#3E382E]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-purple-400 block">NFC Badges Printed</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-purple-400 mt-1 block">
                    {data?.stats?.printed || 0}
                  </span>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1A1713] p-3 rounded-2xl border border-[#2A251E]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#7D7467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, phone, email, branch, or founder key..."
                    className="w-full pl-10 pr-4 py-2 bg-[#12100C] border border-[#2E2922] rounded-xl text-xs font-mono text-white placeholder-[#666055] focus:outline-none focus:border-[#CC5A36]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#7D7467] hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'pending_review', 'accepted', 'claimed', 'printed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all capitalize whitespace-nowrap cursor-pointer ${
                        statusFilter === filter
                          ? 'bg-[#CC5A36] text-white font-bold'
                          : 'text-[#A8A093] hover:text-white hover:bg-[#25211A]'
                      }`}
                    >
                      {filter.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROSTER TABLE */}
              <div className="bg-[#1A1713] border border-[#2A251E] rounded-2xl overflow-hidden shadow-xl">
                {filteredMembers.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#25211A] border border-[#352F26] text-[#7D7467] flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">
                        {searchQuery ? 'No matching applicants found' : 'Roster is Clean & Ready'}
                      </h3>
                      <p className="text-xs font-mono text-[#9E9587] mt-1 max-w-md mx-auto">
                        {searchQuery 
                          ? 'Try adjusting your search keywords or active status filter.'
                          : 'Applicants from your Google Form or direct website application will appear here automatically.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab('forms')}
                        className="px-4 py-2 rounded-xl bg-[#CC5A36] text-white text-xs font-mono font-medium hover:bg-[#B34826] transition-all cursor-pointer"
                      >
                        Import from Google Sheets
                      </button>
                      <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 rounded-xl bg-[#25211A] border border-[#352F26] text-[#D4CDC3] text-xs font-mono hover:text-white transition-all cursor-pointer"
                      >
                        Add Manual Candidate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#15120E] border-b border-[#2A251E] text-[11px] font-mono text-[#8C8275] uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-semibold">Candidate</th>
                          <th className="px-4 py-3.5 font-semibold">Contact & Branch</th>
                          <th className="px-4 py-3.5 font-semibold">Source</th>
                          <th className="px-4 py-3.5 font-semibold">Founder Key</th>
                          <th className="px-4 py-3.5 font-semibold">Status</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#24201A]">
                        {filteredMembers.map((member) => {
                          const isPending = member.status === 'pending_review';
                          const isAccepted = member.status === 'accepted';
                          const isClaimed = member.status === 'claimed';
                          const isPrinted = !!member.printedAt;

                          return (
                            <tr 
                              key={member.id}
                              className="hover:bg-[#201C16] transition-colors group cursor-pointer"
                              onClick={() => setSelectedApplicant(member)}
                            >
                              {/* Candidate Info */}
                              <td className="px-5 py-4">
                                <div className="font-semibold text-sm text-white group-hover:text-[#CC5A36] transition-colors flex items-center gap-2">
                                  <span>{member.name}</span>
                                  {isPending && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Needs Review" />
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-[#8C8275] mt-0.5">
                                  {member.role || 'Founding Builder'}
                                </div>
                              </td>

                              {/* Contact & Branch */}
                              <td className="px-4 py-4 font-mono text-xs">
                                <div className="text-[#D4CDC3]">{member.phone}</div>
                                <div className="text-[11px] text-[#7D7467] truncate max-w-[180px]">{member.email}</div>
                                <div className="text-[10px] text-[#CC5A36] mt-0.5">{member.branch} · {member.year}</div>
                              </td>

                              {/* Source */}
                              <td className="px-4 py-4">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                                  member.source === 'google_form'
                                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                                    : member.source === 'google_sheet_sync'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                    : 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                                }`}>
                                  {member.source === 'google_form' ? 'Google Form' : 
                                   member.source === 'google_sheet_sync' ? 'Google Sheet' : 'Website'}
                                </span>
                              </td>

                              {/* Founder Key */}
                              <td className="px-4 py-4 font-mono">
                                {member.founderKey ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-emerald-400 tracking-wider">
                                      {member.founderKey}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyKey(member.founderKey);
                                      }}
                                      className="p-1 hover:bg-[#2A251E] rounded text-[#8C8275] hover:text-white"
                                      title="Copy Key"
                                    >
                                      {copiedKey === member.founderKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-mono text-amber-500/80 italic">
                                    Pending Decision
                                  </span>
                                )}
                              </td>

                              {/* Status Badges */}
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-1 items-start">
                                  {isPending && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40 font-bold flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Pending Review
                                    </span>
                                  )}
                                  {isAccepted && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 font-bold flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Accepted
                                    </span>
                                  )}
                                  {isClaimed && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/40 font-bold">
                                      Pass Claimed
                                    </span>
                                  )}
                                  {isPrinted && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800/40 font-bold flex items-center gap-1">
                                      <Printer className="w-3 h-3" />
                                      Badge Printed
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {/* Review Button */}
                                  <button
                                    onClick={() => setSelectedApplicant(member)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                                    title="Inspect Dossier"
                                  >
                                    <Eye className="w-3 h-3 text-[#CC5A36]" />
                                    <span>Review</span>
                                  </button>

                                  {/* Gmail Dispatch Button */}
                                  {member.founderKey && (
                                    <button
                                      onClick={() => handleSendAcceptanceEmail(member)}
                                      disabled={sendingEmailId === member.id}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-emerald-400 text-xs font-mono flex items-center gap-1 cursor-pointer"
                                      title="1-Click Official C3 Gmail Dispatch"
                                    >
                                      <Mail className="w-3 h-3 text-emerald-400" />
                                      <span className="hidden md:inline">Mail</span>
                                    </button>
                                  )}

                                  {/* View Acceptance Letter */}
                                  {member.founderKey && (
                                    <button
                                      onClick={() => onViewLetter(member)}
                                      className="p-1.5 rounded-lg bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-[#A8A093] hover:text-white cursor-pointer"
                                      title="View Official Acceptance Letter"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Toggle Print */}
                                  <button
                                    onClick={() => handleTogglePrinted(member)}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isPrinted 
                                        ? 'bg-purple-950/40 border-purple-700/50 text-purple-300' 
                                        : 'bg-[#25211A] border-[#352F26] text-[#7D7467] hover:text-white'
                                    }`}
                                    title={isPrinted ? 'Mark as Not Printed' : 'Mark Physical Badge as Printed'}
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMS & INGESTION */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              
              {/* 24/7 CLOUD SYNC ARCHITECTURE BANNER */}
              <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-[#1B1813] via-[#211C15] to-[#1B1813] border border-[#3A3328] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-white">
                        24/7 Background Sync Architecture (While You Sleep)
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-semibold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs font-sans text-[#A8A093] mt-1 leading-relaxed max-w-3xl">
                      Both Google Forms and Google Apps Script run <strong>100% on Google's cloud infrastructure</strong>. Submissions made at 2:00 AM or 4:00 AM trigger instant cloud actions even when your laptop is turned off. Combine the <strong>Live Webhook (Push)</strong> with <strong>Google Sheet Auto-Sync (Pull)</strong> for zero data loss.
                    </p>
                  </div>
                </div>

                {sheetUrl && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => performSheetSync(sheetUrl, true)}
                      disabled={isSyncingSheet}
                      className="px-3.5 py-2 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] text-xs font-mono text-white flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                      <span>{isSyncingSheet ? 'Syncing...' : 'Sync Now ⚡'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* FLOATING SYNC NOTIFICATION TOAST */}
              {syncStatusMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 shadow-lg ${
                    syncStatusMsg.success 
                      ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300' 
                      : 'bg-rose-950/60 border-rose-800/50 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {syncStatusMsg.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{syncStatusMsg.text}</span>
                  </div>
                  {lastSyncTime && (
                    <span className="text-[10px] text-[#8C8275]">Last checked: {lastSyncTime}</span>
                  )}
                </motion.div>
              )}

              {/* THREE INGESTION ENGINES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ENGINE 1: 24/7 LIVE GOOGLE SHEET AUTO-SYNC */}
                <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#CC5A36]/15 border border-[#CC5A36]/30 text-[#CC5A36] flex items-center justify-center font-bold font-mono">
                          01
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-white">
                              Live Google Sheet Auto-Sync
                            </h3>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-700/40">
                              24/7 CLOUD POLLER
                            </span>
                          </div>
                          <p className="text-xs font-mono text-[#8C8275]">
                            Polls Google's response spreadsheet every 30s + reconciles on wake-up
                          </p>
                        </div>
                      </div>

                      {/* Auto-Sync Toggle */}
                      {sheetUrl && (
                        <button
                          onClick={handleToggleAutoSync}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono border cursor-pointer transition-all ${
                            isAutoSyncEnabled 
                              ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300' 
                              : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'
                          }`}
                          title="Toggle automatic 30s background sync"
                        >
                          Auto-Sync: {isAutoSyncEnabled ? 'ON (30s)' : 'OFF'}
                        </button>
                      )}
                    </div>

                    <div className="text-xs font-sans text-[#A8A093] space-y-2 bg-[#12100C] p-4 rounded-xl border border-[#24201A]">
                      <p className="font-semibold text-white">Setup in Google Sheet (2 clicks):</p>
                      <ol className="list-decimal list-inside space-y-1 text-[#9E9587]">
                        <li>Open the Google Sheet linked to your Google Form.</li>
                        <li>Click <strong className="text-white">Share</strong> (top right) &rarr; Set General Access to <strong className="text-emerald-400">"Anyone with the link can view"</strong> (or File &gt; Share &gt; Publish to web).</li>
                        <li>Copy the URL from your browser address bar and paste below.</li>
                      </ol>
                    </div>

                    <form onSubmit={handleSaveSheetUrl} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8C8275] mb-1">
                          Google Sheet URL or ID:
                        </label>
                        <input
                          type="text"
                          value={sheetUrlInput}
                          onChange={(e) => setSheetUrlInput(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv.../edit"
                          className="w-full px-3.5 py-2.5 bg-[#12100C] border border-[#2E2922] rounded-xl text-xs font-mono text-[#EDE8DF] focus:outline-none focus:border-[#CC5A36] placeholder-[#554F44]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={!sheetUrlInput.trim() || isSyncingSheet}
                          className="flex-1 py-2.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] disabled:opacity-50 text-white font-medium text-xs font-mono shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                          <span>{sheetUrl ? 'Update & Sync Now' : 'Connect & Start Auto-Sync'}</span>
                        </button>

                        {sheetUrl && (
                          <button
                            type="button"
                            onClick={() => performSheetSync(sheetUrl, true)}
                            disabled={isSyncingSheet}
                            className="px-4 py-2.5 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer transition-all"
                            title="Pull new responses immediately"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Pull</span>
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {sheetUrl && (
                    <div className="pt-4 border-t border-[#24201A] flex items-center justify-between text-[11px] font-mono text-[#8C8275]">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Connected to Google Cloud Sheet
                      </span>
                      {lastSyncTime && <span>Last checked: {lastSyncTime}</span>}
                    </div>
                  )}
                </div>

                {/* ENGINE 2: LIVE GOOGLE FORM WEBHOOK (0s Push) */}
                <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold font-mono">
                        02
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-white">
                            Real-Time Webhook Trigger
                          </h3>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-700/40">
                            INSTANT 0s PUSH
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#8C8275]">
                          Google's cloud pushes applicants to C3 the millisecond they submit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <span className="text-[#8C8275] block text-[11px]">C3 Webhook Ingestion Endpoint:</span>
                      <div className="p-2.5 bg-[#12100C] rounded-xl border border-[#2E2922] text-[#CC5A36] break-all select-all text-[11px]">
                        {publicWebhookUrl}
                      </div>
                    </div>

                    <div className="text-xs font-sans text-[#A8A093] space-y-2 bg-[#12100C] p-4 rounded-xl border border-[#24201A]">
                      <p className="font-semibold text-white">Setup in Google Forms (30 seconds):</p>
                      <ol className="list-decimal list-inside space-y-1 text-[#9E9587]">
                        <li>In Google Forms or Sheet, click <strong className="text-white">Extensions &gt; Apps Script</strong>.</li>
                        <li>Delete any placeholder code &amp; paste the script below.</li>
                        <li>Click <strong className="text-white">Triggers (⏰ clock icon) &gt; Add Trigger</strong> &rarr; Select <code className="text-[#CC5A36] font-mono">onFormSubmit</code> &rarr; Event type: <strong className="text-white">On form submit</strong> &rarr; Save.</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <pre className="p-4 bg-[#12100C] border border-[#2E2922] rounded-xl text-[10px] font-mono text-[#A8A093] overflow-x-auto max-h-40">
                        {googleAppsScriptCode}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(googleAppsScriptCode);
                          sounds.playSuccess();
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#24201A] text-[11px] font-mono text-[#8C8275] flex items-center justify-between">
                    <span className="text-purple-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      Universal Form &amp; Sheet Trigger Ready
                    </span>
                    <span>HTTPS JSON Payload</span>
                  </div>
                </div>

              </div>

              {/* ENGINE 3: 1-CLICK COPY-PASTE (MANUAL FALLBACK) */}
              <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold font-mono text-xs">
                      03
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white">
                        Manual Spreadsheet / Excel Paste (Fallback)
                      </h4>
                      <p className="text-[11px] font-mono text-[#8C8275]">
                        Need to import offline batches? Copy any rows from Google Sheets or Excel and paste here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    value={sheetPasteContent}
                    onChange={(e) => setSheetPasteContent(e.target.value)}
                    placeholder="Paste tab-separated or comma-separated rows from Google Sheets here..."
                    rows={2}
                    className="flex-1 p-3 bg-[#12100C] border border-[#2E2922] rounded-xl text-xs font-mono text-[#D4CDC3] focus:outline-none focus:border-[#CC5A36] placeholder-[#554F44]"
                  />
                  <button
                    onClick={handleImportSheet}
                    disabled={!sheetPasteContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] disabled:opacity-50 text-white font-medium text-xs font-mono shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 self-end sm:self-stretch"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Text</span>
                  </button>
                </div>

                {sheetImportStatus && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{sheetImportStatus}</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: GMAIL DISPATCH HUB */}
          {activeTab === 'gmail' && (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">
                      Official C3 Google Dispatcher
                    </h3>
                    <p className="text-xs font-mono text-[#8C8275]">
                      Sending official collegiate admission notices via <strong className="text-white">c3.collective.in@gmail.com</strong>
                    </p>
                  </div>
                </div>

                {/* Status Card */}
                <div className="p-4 rounded-2xl bg-[#12100C] border border-emerald-800/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs font-sans space-y-1">
                    <p className="font-semibold text-white">1-Click C3 Gmail Composer is Active</p>
                    <p className="text-[#9E9587] leading-relaxed">
                      Because you are logged into <code className="text-[#CC5A36] font-mono">c3.collective.in@gmail.com</code> in your browser, clicking dispatch automatically opens your Google Mail composer with candidate email, pure 4-character founder key, links, schedule, and signatures pre-filled.
                    </p>
                  </div>
                </div>

                {/* Quick Test Draft */}
                <div className="pt-4 border-t border-[#2A251E] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-white">Test 1-Click C3 Draft</h4>
                    <p className="text-xs font-mono text-[#8C8275]">
                      Opens a sample admission draft directly in your Gmail tab
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      const testUrl = `https://mail.google.com/mail/?authuser=c3.collective.in@gmail.com&view=cm&fs=1&to=c3.collective.in@gmail.com&su=${encodeURIComponent('🎉 Official Notice of Admission: C3 Batch 01')}&body=${encodeURIComponent('Test notice from C3 Organizer Command Center.\n— Mohammed Suhail & Mohammad Bilal')}`;
                      window.open(testUrl, '_blank');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Launch Test C3 Gmail Draft
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3D GALAXY VISUALIZER */}
          {activeTab === 'galaxy' && (
            <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl text-center">
              <div className="max-w-xl mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Graphify 3D WebGL Galaxy
                </h3>
                <p className="text-xs font-mono text-[#9E9587]">
                  Interactive 3D force-directed galaxy graph visualizing all C3 modules, skills, and founding members with rotating orbit camera and glowing nodes.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-4">
                <a
                  href="/graphify-out/graphify-3d.html"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-mono text-xs font-medium flex items-center gap-2 shadow-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Fullscreen 3D Galaxy (New Tab)
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM CONTROLS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <div className="bg-[#1A1713] border border-[#2A251E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <h3 className="font-serif text-xl font-bold text-white">
                  System Architecture & Credentials
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 bg-[#12100C] rounded-2xl border border-[#2A251E] space-y-2">
                    <span className="text-[#8C8275] block">FOUNDING CO-LEADS (NON-HIERARCHICAL)</span>
                    <p className="text-white font-semibold text-sm">
                      Mohammed Suhail & Mohammad Bilal
                    </p>
                    <p className="text-[#7D7467] text-[11px]">
                      Department of Computer Science & Engineering · ISL Engineering College
                    </p>
                  </div>

                  <div className="p-4 bg-[#12100C] rounded-2xl border border-[#2A251E] space-y-2">
                    <span className="text-[#8C8275] block">ORGANIZER PASSCODE</span>
                    <p className="text-white font-semibold text-sm">
                      <code>c3core</code> (or <code>c3admin</code>)
                    </p>
                    <p className="text-[#7D7467] text-[11px]">
                      Direct unlock query: <code className="text-[#CC5A36]">/?admin=c3core</code>
                    </p>
                  </div>

                  <div className="p-4 bg-[#12100C] rounded-2xl border border-[#2A251E] space-y-2">
                    <span className="text-[#8C8275] block">KEY GENERATION RULES</span>
                    <p className="text-emerald-400 font-semibold text-xs">
                      ✓ Pure 4-character uppercase alphanumeric only (e.g. KD4U, ZZRF).
                    </p>
                    <p className="text-rose-400 font-semibold text-xs">
                      ✕ Zero C3-FND- or monetary symbols permitted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* SLIDE-OVER APPLICANT DOSSIER DRAWER */}
      <AnimatePresence>
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApplicant(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Slide-Over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-[#1B1813] text-[#EDE8DF] border-l border-[#2D2821] h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#2A2620] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-white">
                        {selectedApplicant.name}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                        selectedApplicant.source === 'google_form'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                          : selectedApplicant.source === 'google_sheet_sync'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                      }`}>
                        {selectedApplicant.source === 'google_form' ? 'Google Form' : 
                         selectedApplicant.source === 'google_sheet_sync' ? 'Google Sheet' : 'Website'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#9E9587] mt-0.5">
                      {selectedApplicant.branch} · {selectedApplicant.year} · ID: {selectedApplicant.id}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="p-1.5 rounded-xl hover:bg-[#2A251E] text-[#7D7467] hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Key Status Bar */}
                <div className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#8C8275] uppercase block">Founder Key</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {selectedApplicant.founderKey || 'NOT ISSUED YET'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8C8275] uppercase block">Status</span>
                    <span className="text-xs font-mono font-bold capitalize text-[#CC5A36]">
                      {selectedApplicant.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Candidate Screening Responses */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#CC5A36] font-bold">
                      Google Form Screening Answers
                    </h4>
                    <span className="text-[10px] font-mono text-[#8C8275]">
                      {selectedApplicant.source === 'google_sheet_sync' ? 'Synced from Google Sheet' : 
                       selectedApplicant.source === 'google_form' ? 'Ingested via Webhook' : 'Direct Submission'}
                    </span>
                  </div>

                  {/* 1. What is one thing you have built, designed, or broken? */}
                  {(() => {
                    const builtAnswer = selectedApplicant.answers?.built || 
                      selectedApplicant.answers?.projectIdea || 
                      selectedApplicant.answers?.['What is one thing you have built, designed, or broken?'] || '';
                    return (
                      <div className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          What is one thing you have built, designed, or broken?
                        </span>
                        <p className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap">
                          {builtAnswer || 'No response recorded.'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* 2. Experience with AI tools & coding workflows */}
                  {(() => {
                    const expAnswer = selectedApplicant.answers?.experience || 
                      selectedApplicant.answers?.['What is your current experience with AI tools & coding workflows?'] || '';
                    return expAnswer ? (
                      <div className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          Experience with AI tools &amp; coding workflows
                        </span>
                        <p className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap">
                          {expAnswer}
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* 3. 48-Hour Weekend Shipping Scenario */}
                  {(() => {
                    const weekendAnswer = selectedApplicant.answers?.weekendScenario || 
                      selectedApplicant.answers?.['Weekend Shipping Scenario: If you had 48 hours to ship an AI prototype with a team of 3, what would you build?'] || '';
                    return weekendAnswer ? (
                      <div className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          Weekend Shipping Scenario (48 Hours Prototype with 3 Builders)
                        </span>
                        <p className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap">
                          {weekendAnswer}
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* 4. Why build CCC instead of joining a conventional club */}
                  {(() => {
                    const whyAnswer = selectedApplicant.answers?.motivation || 
                      selectedApplicant.answers?.['Why do you want to build CCC instead of joining a conventional college club?'] || '';
                    return (
                      <div className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          Why build CCC instead of joining a conventional club?
                        </span>
                        <p className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap">
                          {whyAnswer || 'No response recorded.'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* 5. Estimated Weekly Commitment */}
                  {(() => {
                    const commitAnswer = selectedApplicant.answers?.commitment || 
                      selectedApplicant.answers?.['Estimated weekly commitment'] || '';
                    return commitAnswer ? (
                      <div className="p-3.5 rounded-2xl bg-[#12100C] border border-[#2E2922] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#8C8275] font-semibold">
                          Estimated Weekly Commitment:
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {commitAnswer}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* 6. Links & Portfolio */}
                  {(() => {
                    const linksAnswer = selectedApplicant.answers?.links || 
                      selectedApplicant.answers?.['Links (GitHub, Portfolio, LinkedIn, X, or Projects)'] || '';
                    if (!linksAnswer) return null;
                    const parsedLinks = linksAnswer.split(/[\s,]+/).filter(Boolean);
                    return (
                      <div className="p-3.5 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          Links &amp; Portfolio:
                        </span>
                        <div className="space-y-1">
                          {parsedLinks.map((link, idx) => (
                            <div key={idx} className="text-xs font-mono text-[#CC5A36] break-all">
                              {link.startsWith('http') ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline inline-flex items-center gap-1 text-[#E06D48] hover:text-[#FFA07A]"
                                >
                                  <span>{link}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-[#D4CDC3]">{link}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 7. Any additional raw form questions */}
                  {selectedApplicant.answers && Object.entries(selectedApplicant.answers).map(([key, val]) => {
                    if (!val) return null;
                    const standardKeys = [
                      'built', 'projectIdea', 'experience', 'weekendScenario', 
                      'motivation', 'commitment', 'links',
                      'What is one thing you have built, designed, or broken?',
                      'What is your current experience with AI tools & coding workflows?',
                      'Weekend Shipping Scenario: If you had 48 hours to ship an AI prototype with a team of 3, what would you build?',
                      'Why do you want to build CCC instead of joining a conventional college club?',
                      'Estimated weekly commitment',
                      'Links (GitHub, Portfolio, LinkedIn, X, or Projects)',
                      'Which founding role(s) resonate most with you?'
                    ];
                    if (standardKeys.includes(key)) return null;
                    return (
                      <div key={key} className="p-4 rounded-2xl bg-[#12100C] border border-[#2E2922] space-y-1.5">
                        <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                          {key}
                        </span>
                        <p className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap">
                          {val}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Builder Role Assignment (Two Options: Dropdown vs Type Custom) */}
                <div className="p-4 rounded-2xl bg-[#16130E] border border-[#2E2922] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-white uppercase block font-bold">
                        Builder Track &amp; Role
                      </span>
                      <span className="text-[10px] font-mono text-[#8C8275]">
                        Choose from standard tracks or type bespoke role
                      </span>
                    </div>

                    {/* Mode Toggle Pill */}
                    <div className="flex items-center bg-[#0D0B09] p-1 rounded-xl border border-[#2E2922] text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setDrawerRoleMode('dropdown')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                          drawerRoleMode === 'dropdown'
                            ? 'bg-[#CC5A36] text-white font-bold shadow-sm'
                            : 'text-[#8C8275] hover:text-white'
                        }`}
                      >
                        <span>Dropdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerRoleMode('custom')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                          drawerRoleMode === 'custom'
                            ? 'bg-[#CC5A36] text-white font-bold shadow-sm'
                            : 'text-[#8C8275] hover:text-white'
                        }`}
                      >
                        <span>Type Custom</span>
                      </button>
                    </div>
                  </div>

                  {/* Option 1: Dropdown */}
                  {drawerRoleMode === 'dropdown' ? (
                    <div className="space-y-1.5">
                      <select
                        value={drawerPresetRole}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            setDrawerRoleMode('custom');
                          } else {
                            setDrawerPresetRole(val);
                            if (selectedApplicant.status === 'accepted') {
                              handleReviewDecision(selectedApplicant.id, 'accept', val, '');
                            }
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#0D0B09] border border-[#2E2922] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#CC5A36] cursor-pointer"
                      >
                        <option value="Technical & AI Architect">Technical &amp; AI Architect</option>
                        <option value="Project Founder">Project Founder</option>
                        <option value="Design & Creative Lead">Design &amp; Creative Lead</option>
                        <option value="Growth & Community Lead">Growth &amp; Community Lead</option>
                        <option value="Vibe Coder / Shipper">Vibe Coder / Shipper</option>
                        <option value="Founding Builder">Founding Builder</option>
                        <option value="__custom__">✎ Type Custom Role...</option>
                      </select>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8275]">
                        <span>Standard track: <strong className="text-white">{drawerPresetRole}</strong></span>
                        <button
                          type="button"
                          onClick={() => setDrawerRoleMode('custom')}
                          className="text-[#CC5A36] hover:underline cursor-pointer"
                        >
                          Switch to Type Mode &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Option 2: Direct Text Input */
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          value={drawerCustomRole}
                          onChange={(e) => setDrawerCustomRole(e.target.value)}
                          placeholder="e.g. Systems Hacker, Hardware Lead, AI Agent Architect..."
                          className="w-full px-3.5 py-2.5 bg-[#0D0B09] border border-[#CC5A36] rounded-xl text-xs font-mono text-white focus:outline-none placeholder-[#5A5245]"
                          autoFocus
                        />
                        {drawerCustomRole && (
                          <button
                            type="button"
                            onClick={() => setDrawerCustomRole('')}
                            className="absolute right-2.5 top-2.5 text-[#8C8275] hover:text-white text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8275]">
                        <span>Role on badge &amp; pass: <strong className="text-emerald-400">{drawerCustomRole.trim() || 'Founding Builder'}</strong></span>
                        {selectedApplicant.status === 'accepted' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const roleVal = drawerCustomRole.trim() || drawerPresetRole;
                              handleReviewDecision(selectedApplicant.id, 'accept', roleVal, drawerCustomRole.trim());
                            }}
                            className="text-emerald-400 hover:underline font-bold cursor-pointer"
                          >
                            Save Role Now ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDrawerRoleMode('dropdown')}
                            className="text-[#8C8275] hover:text-white hover:underline cursor-pointer"
                          >
                            &larr; Switch to Dropdown
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Dispatch Actions */}
                <div className="pt-2 space-y-2.5">
                  <span className="text-xs font-mono text-[#8C8275] uppercase block font-semibold">
                    Organizer Dispatch Actions
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleSendAcceptanceEmail(selectedApplicant)}
                      disabled={!selectedApplicant.founderKey || sendingEmailId === selectedApplicant.id}
                      className="py-2.5 px-3 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-xs font-mono text-emerald-400 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>1-Click C3 Gmail</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppInvite(selectedApplicant)}
                      className="py-2.5 px-3 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-xs font-mono text-emerald-300 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Invite</span>
                    </button>

                    {selectedApplicant.founderKey && (
                      <button
                        onClick={() => onViewLetter(selectedApplicant)}
                        className="py-2.5 px-3 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-xs font-mono text-[#D4CDC3] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#CC5A36]" />
                        <span>Acceptance Letter</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleTogglePrinted(selectedApplicant)}
                      className="py-2.5 px-3 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#352F26] text-xs font-mono text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-400" />
                      <span>{selectedApplicant.printedAt ? 'Badge Printed ✓' : 'Mark Printed'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Admissions Decision Bottom Bar */}
              <div className="pt-6 border-t border-[#2A2620] flex items-center gap-3">
                {selectedApplicant.status !== 'accepted' ? (
                  <button
                    onClick={() => {
                      const isCustom = drawerRoleMode === 'custom' && drawerCustomRole.trim().length > 0;
                      const assignedRole = isCustom ? drawerCustomRole.trim() : drawerPresetRole;
                      const customRoleVal = isCustom ? drawerCustomRole.trim() : '';
                      handleReviewDecision(selectedApplicant.id, 'accept', assignedRole, customRoleVal);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-mono text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept Candidate &amp; Issue Key
                  </button>
                ) : (
                  <button
                    onClick={() => handleReviewDecision(selectedApplicant.id, 'reject')}
                    className="flex-1 py-3 rounded-xl bg-[#25211A] hover:bg-rose-950/40 border border-rose-900/30 text-rose-300 font-mono text-xs transition-all cursor-pointer"
                  >
                    Revoke Acceptance
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD APPLICANT MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setIsAdding(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#1B1813] text-white border border-[#2D2821] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-[#2A2620] pb-3">
                <h3 className="font-serif text-lg font-bold">Add Manual Candidate</h3>
                <button onClick={() => setIsAdding(false)} className="text-[#8C8275] hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddApplicant} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-[#8C8275] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full px-3.5 py-2.5 bg-[#12100C] border border-[#2E2922] rounded-xl text-white focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div>
                  <label className="text-[#8C8275] block mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-[#12100C] border border-[#2E2922] rounded-xl text-white focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div>
                  <label className="text-[#8C8275] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="candidate@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#12100C] border border-[#2E2922] rounded-xl text-white focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div>
                  <label className="text-[#8C8275] block mb-1">Branch</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#12100C] border border-[#2E2922] rounded-xl text-white focus:outline-none focus:border-[#CC5A36]"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI & DS">AI & DS</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2.5 bg-[#25211A] text-[#A8A093] rounded-xl hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#CC5A36] text-white rounded-xl font-bold hover:bg-[#B34826] cursor-pointer"
                  >
                    Save Candidate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
