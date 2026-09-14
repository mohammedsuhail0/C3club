import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Lock, Key, Users, CheckCircle, Clock, Printer, 
  Send, ExternalLink, Copy, Plus, Search, Check, RefreshCw,
  Mail, MessageSquare, Settings, FileText, Sparkles, CheckSquare,
  AlertCircle, ChevronRight, Eye, Code, Upload
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
  MemberRecord, 
  MembersResponse, 
  EmailConfig 
} from '../utils/api';
import { sounds } from '../utils/audio';

interface OrganizerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLetter: (member: MemberRecord) => void;
}

export const OrganizerPortalModal: React.FC<OrganizerPortalModalProps> = ({
  isOpen,
  onClose,
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
  
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'accepted' | 'claimed' | 'printed'>('all');
  
  // Modals & Panels
  const [selectedApplicant, setSelectedApplicant] = useState<MemberRecord | null>(null);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
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

  // Email configuration state
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    enabled: false,
    service: 'gmail',
    user: '',
    fromName: 'C3 Admissions Council · ISLEC',
    fromEmail: '',
    host: 'smtp.gmail.com',
    port: 465
  });
  const [emailPassword, setEmailPassword] = useState('');
  const [emailTestStatus, setEmailTestStatus] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  // Sheets import state
  const [sheetPasteContent, setSheetPasteContent] = useState('');
  const [sheetImportStatus, setSheetImportStatus] = useState<string | null>(null);

  // Add new applicant inputs
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBranch, setNewBranch] = useState('CSE');

  const [copiedScript, setCopiedScript] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchMembers();
    if (res) {
      setData(res);
      // Keep selected applicant fresh if currently open
      if (selectedApplicant) {
        const updated = res.members.find(m => m.id === selectedApplicant.id);
        if (updated) setSelectedApplicant(updated);
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
    if (isOpen && isAuthenticated) {
      loadData();
      loadEmailConfig();
    }
  }, [isOpen, isAuthenticated]);

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

  const handleSendAcceptanceEmail = async (member: MemberRecord) => {
    sounds.playClick();
    setSendingEmailId(member.id);
    setEmailStatusMsg(null);

    const res = await sendAcceptanceEmailApi({ id: member.id, key: member.founderKey });
    setSendingEmailId(null);

    if (res.success) {
      sounds.playSuccess();
      setEmailStatusMsg({ id: member.id, text: 'Official acceptance email dispatched!', success: true });
      loadData();
    } else if (res.isFallback && (res.gmailUrl || res.mailto)) {
      sounds.playSuccess();
      const targetUrl = res.gmailUrl || res.mailto!;
      window.open(targetUrl, '_blank');
      setEmailStatusMsg({ id: member.id, text: 'Opened pre-filled draft in C3 Gmail! (1-click send)', success: true });
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
    if (updated) {
      if (selectedApplicant?.id === id) {
        setSelectedApplicant(updated);
      }
      loadData();
    }
  };

  const handleTogglePrinted = async (member: MemberRecord) => {
    sounds.playClick();
    const nextState = !member.printedAt;
    const ok = await markPrintedApi(member.founderKey || member.id, nextState);
    if (ok) {
      loadData();
    }
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
    const isTab = firstLine.includes('\t');
    const separator = isTab ? '\t' : ',';

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

  const googleAppsScriptCode = `function onFormSubmit(e) {
  // C3 Live Webhook: Connects Google Form to C3 Command Center
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var payload = {
    source: "google_form",
    email: formResponse.getRespondentEmail() || ""
  };
  
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
  
  UrlFetchApp.fetch("${window.location.origin}/api/webhook/form", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}`;

  if (!isOpen) return null;

  const members = data?.members || [];
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Command Center Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl bg-[#FAF8F5] text-[#1F1E1B] rounded-3xl shadow-2xl border border-[#E8E2D5] overflow-hidden my-4 z-10 flex flex-col max-h-[92vh]"
        >
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#E8E2D5] bg-[#F5F0E6] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CC5A36]/10 border border-[#CC5A36]/20 flex items-center justify-center text-[#CC5A36]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1F1E1B] flex items-center gap-2">
                  <span>C3 Organizer Command Center</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#CC5A36]/10 text-[#CC5A36]">
                    BATCH 01
                  </span>
                </h2>
                <p className="text-xs font-mono text-[#666055]">
                  Live Applicant Review, Form Integration & Official Dispatch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <>
                  <button
                    data-testid="open-connect-form"
                    onClick={() => setShowConnectForm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-[#DDD6C9] text-xs font-mono text-[#423C32] shadow-xs transition-colors cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5 text-[#CC5A36]" />
                    <span className="hidden sm:inline">Connect Form</span>
                  </button>

                  <button
                    data-testid="open-email-settings"
                    onClick={() => setShowEmailSettings(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-[#DDD6C9] text-xs font-mono text-[#423C32] shadow-xs transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#666055]" />
                    <span className="hidden sm:inline">Email Settings</span>
                  </button>

                  <button
                    onClick={loadData}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white border border-[#DDD6C9] text-[#666055] transition-colors cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#CC5A36]' : ''}`} />
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl hover:bg-black/5 flex items-center justify-center text-[#666055] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isAuthenticated ? (
            /* PASSWORD GATE */
            <div className="p-8 sm:p-14 max-w-md mx-auto text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F1E1B]">
                  Organizer Access Protected
                </h3>
                <p className="text-xs font-sans text-[#666055] mt-1">
                  Enter the C3 core passcode to inspect candidate submissions, issue pure keys, and dispatch acceptance letters.
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  placeholder="Passcode (c3core)"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD6C9] text-center font-mono text-sm tracking-widest focus:outline-none focus:border-[#CC5A36]"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs font-mono text-rose-500">
                    Incorrect passcode. Hint: c3core
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-medium text-xs font-mono shadow-md transition-all cursor-pointer"
                >
                  Access Command Center
                </button>
              </form>
            </div>
          ) : (
            /* DASHBOARD VIEW */
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div 
                  onClick={() => setStatusFilter('all')}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-[#CC5A36]/10 border-[#CC5A36]' : 'bg-white border-[#E8E2D5] hover:border-[#DDD6C9]'}`}
                >
                  <span className="text-[10px] font-mono uppercase text-[#8C8275] block">Total Applicants</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-[#1F1E1B]">
                    {data?.stats?.total || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('pending_review')}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'pending_review' ? 'bg-amber-500/10 border-amber-500' : 'bg-white border-[#E8E2D5] hover:border-[#DDD6C9]'}`}
                >
                  <span className="text-[10px] font-mono uppercase text-amber-700 block">Pending Review</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-amber-600">
                    {data?.stats?.pending || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('accepted')}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'accepted' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white border-[#E8E2D5] hover:border-[#DDD6C9]'}`}
                >
                  <span className="text-[10px] font-mono uppercase text-emerald-700 block">Accepted Members</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-600">
                    {data?.stats?.accepted || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('claimed')}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'claimed' ? 'bg-sky-500/10 border-sky-500' : 'bg-white border-[#E8E2D5] hover:border-[#DDD6C9]'}`}
                >
                  <span className="text-[10px] font-mono uppercase text-sky-700 block">Passes Claimed</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-sky-600">
                    {data?.stats?.claimed || 0}
                  </span>
                </div>

                <div 
                  onClick={() => setStatusFilter('printed')}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'printed' ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white border-[#E8E2D5] hover:border-[#DDD6C9]'}`}
                >
                  <span className="text-[10px] font-mono uppercase text-indigo-700 block">Badges Printed</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-indigo-600">
                    {data?.stats?.printed || 0}
                  </span>
                </div>
              </div>

              {/* Action & Search Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8275]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate, phone, key..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs text-[#1F1E1B] focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-mono text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Candidate</span>
                  </button>

                  <a
                    href="https://forms.gle/yHpq52h2rhREPtSa8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-black/5 border border-[#DDD6C9] font-mono text-xs text-[#666055] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Form</span>
                  </a>
                </div>
              </div>

              {/* Quick Add Candidate Form */}
              {isAdding && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddApplicant}
                  className="p-5 rounded-2xl bg-white border border-[#CC5A36]/30 shadow-sm space-y-4"
                >
                  <h4 className="font-serif font-bold text-sm text-[#1F1E1B]">
                    Direct Candidate Enrollment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Candidate Full Name *"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD6C9] text-xs font-mono"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone / WhatsApp *"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD6C9] text-xs font-mono"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD6C9] text-xs font-mono"
                    />
                    <select
                      value={newBranch}
                      onChange={e => setNewBranch(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD6C9] text-xs font-mono"
                    >
                      <option value="CSE">CSE</option>
                      <option value="AI & DS">AI & DS</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#666055] hover:bg-black/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#CC5A36] text-white text-xs font-mono font-medium shadow-xs cursor-pointer"
                    >
                      Save & Issue Key
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Status Toast Notification */}
              {emailStatusMsg && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${emailStatusMsg.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-800'}`}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{emailStatusMsg.text}</span>
                  </span>
                  <button onClick={() => setEmailStatusMsg(null)} className="text-xs underline cursor-pointer">Dismiss</button>
                </div>
              )}

              {/* Candidates Table */}
              <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF8F5] border-b border-[#E8E2D5] text-[10px] font-mono text-[#8C8275] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Candidate & Form Source</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Founder Key</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions & Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D5]">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs font-mono text-[#8C8275]">
                            {searchQuery ? (
                              `No applicants found matching "${searchQuery}"`
                            ) : (
                              <div className="max-w-md mx-auto space-y-3 py-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#CC5A36]/10 border border-[#CC5A36]/20 text-[#CC5A36] flex items-center justify-center mx-auto">
                                  <Users className="w-6 h-6" />
                                </div>
                                <div className="font-serif text-base text-[#1F1E1B] font-bold">
                                  Command Center Ready (Clean Slate)
                                </div>
                                <p className="text-xs text-[#666055] font-sans leading-relaxed">
                                  All test dummy data has been cleared. New applicants from your Google Form or the website will appear here automatically for your review.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                  <button
                                    onClick={() => setShowConnectForm(true)}
                                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#DDD6C9] text-xs font-mono text-[#423C32] cursor-pointer"
                                  >
                                    &lt;&gt; Connect Form Guide
                                  </button>
                                  <button
                                    onClick={() => setIsAdding(true)}
                                    className="px-3 py-1.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white text-xs font-mono cursor-pointer"
                                  >
                                    + Add Candidate
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((m) => {
                          const cleanKey = (m.founderKey || '').replace(/^(C3-)?(FND-)?/i, '');
                          const isPendingReview = m.status === 'pending_review';
                          const isClaimed = m.status === 'claimed';
                          const isAccepted = m.status === 'accepted';
                          const isPrinted = !!m.printedAt;
                          const isEmailed = !!m.emailSentAt;

                          return (
                            <tr key={m.id} className="hover:bg-[#FAF8F5] transition-colors">
                              {/* Candidate Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#1F1E1B]">
                                    {m.name}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${m.source === 'google_form' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {m.source === 'google_form' ? 'Google Form' : 'Website'}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-[#666055] mt-0.5">
                                  {m.branch} &bull; {m.year} &bull; <span className="text-[#CC5A36]">{m.role || 'Founding Builder'}</span>
                                </div>
                                {m.answers?.projectIdea && (
                                  <div className="text-[10px] text-[#8C8275] italic line-clamp-1 mt-0.5">
                                    "{m.answers.projectIdea}"
                                  </div>
                                )}
                              </td>

                              {/* Contact */}
                              <td className="py-3.5 px-4 font-mono text-[11px] text-[#4A443B]">
                                <div>{m.phone}</div>
                                <div className="text-[10px] text-[#8C8275] truncate max-w-[150px]">{m.email || '—'}</div>
                              </td>

                              {/* Pure Founder Key */}
                              <td className="py-3.5 px-4">
                                {cleanKey ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-bold tracking-wider bg-[#CC5A36]/10 text-[#CC5A36] border border-[#CC5A36]/20">
                                    {cleanKey}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                                    Needs Key
                                  </span>
                                )}
                              </td>

                              {/* Status Badges */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  {isPendingReview && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600">
                                      <Clock className="w-3 h-3" />
                                      <span>Pending Review</span>
                                    </span>
                                  )}
                                  {isAccepted && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Accepted</span>
                                    </span>
                                  )}
                                  {isClaimed && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-600 font-medium">
                                      <Sparkles className="w-3 h-3" />
                                      <span>Pass Claimed</span>
                                    </span>
                                  )}
                                  {isPrinted && (
                                    <span className="block text-[10px] font-mono text-indigo-600">
                                      ✓ Badge Printed
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  {/* Review Dossier Button */}
                                  <button
                                    onClick={() => setSelectedApplicant(m)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F0E6] hover:bg-[#EAE3D5] text-xs font-mono text-[#423C32] border border-[#DDD6C9] shadow-2xs transition-colors cursor-pointer"
                                    title="View full form responses"
                                  >
                                    <Eye className="w-3 h-3 text-[#CC5A36]" />
                                    <span>Dossier</span>
                                  </button>

                                  {/* WhatsApp Button */}
                                  <button
                                    onClick={() => handleWhatsAppInvite(m)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 text-xs font-mono shadow-2xs transition-colors cursor-pointer"
                                    title="Send WhatsApp Invitation"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </button>

                                  {/* Email Button */}
                                  <button
                                    onClick={() => handleSendAcceptanceEmail(m)}
                                    disabled={sendingEmailId === m.id}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono shadow-2xs transition-colors cursor-pointer ${isEmailed ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white hover:bg-black/5 border-[#DDD6C9] text-[#423C32]'}`}
                                    title={isEmailed ? `Email dispatched at ${m.emailSentAt}` : 'Compose Official Acceptance Email via c3.collective.in@gmail.com'}
                                  >
                                    <Mail className={`w-3 h-3 ${isEmailed ? 'text-sky-600' : 'text-[#CC5A36]'}`} />
                                    <span>{sendingEmailId === m.id ? 'Opening...' : isEmailed ? 'Resend C3 Mail' : '✉ C3 Mail'}</span>
                                  </button>

                                  {/* Letter Button */}
                                  {cleanKey && (
                                    <button
                                      onClick={() => {
                                        onViewLetter(m);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-black/5 border border-[#DDD6C9] text-xs font-mono text-[#554F43] shadow-2xs transition-colors cursor-pointer"
                                      title="View Official Acceptance Letter"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Letter</span>
                                    </button>
                                  )}

                                  {/* Print Badge Toggle */}
                                  <button
                                    onClick={() => handleTogglePrinted(m)}
                                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${isPrinted ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white hover:bg-black/5 border-[#DDD6C9] text-[#8C8275]'}`}
                                    title={isPrinted ? 'Badge Printed (Click to unmark)' : 'Mark Badge Printed'}
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </motion.div>

        {/* SUB-MODAL 1: APPLICANT DOSSIER & REVIEW (ROOT OVERLAY) */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8C8275] block">
                    Applicant Dossier &amp; Review
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1F1E1B]">
                    {selectedApplicant.name}
                  </h3>
                </div>
                <button
                  data-testid="close-dossier"
                  aria-label="Close Dossier"
                  onClick={() => setSelectedApplicant(null)}
                  className="p-2 rounded-xl hover:bg-black/5 text-[#8C8275] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Overview Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">DEPARTMENT &amp; YEAR</span>
                    <span className="font-semibold text-[#1F1E1B]">{selectedApplicant.branch} &bull; {selectedApplicant.year}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">PHONE / WHATSAPP</span>
                    <span className="font-semibold text-[#1F1E1B]">{selectedApplicant.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">EMAIL ADDRESS</span>
                    <span className="font-semibold text-[#1F1E1B] truncate block">{selectedApplicant.email || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">SUBMISSION SOURCE</span>
                    <span className="font-semibold uppercase text-purple-700">{selectedApplicant.source || 'Form'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">FOUNDER KEY</span>
                    <span className="font-bold text-[#CC5A36] font-mono text-sm">{selectedApplicant.founderKey || 'Pending Key'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8275] block text-[10px]">CURRENT STATUS</span>
                    <span className="font-semibold capitalize text-[#1F1E1B]">{selectedApplicant.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Responses to Form Questions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-mono text-xs uppercase font-bold text-[#CC5A36]">
                    Candidate Screening Responses
                  </h5>
                  <span className="text-[10px] font-mono text-[#8C8275]">
                    {selectedApplicant.source === 'google_sheet_sync' ? 'Synced from Google Sheet' :
                     selectedApplicant.source === 'google_form' ? 'Ingested via Webhook' : 'Direct Submission'}
                  </span>
                </div>

                {/* 1. What was built / designed / broken */}
                {(() => {
                  const builtVal = selectedApplicant.answers?.built || 
                    selectedApplicant.answers?.projectIdea || 
                    selectedApplicant.answers?.['What is one thing you have built, designed, or broken?'] || '';
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
                      <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                        What is one thing you have built, designed, or broken?
                      </span>
                      <p className="text-xs text-[#38342E] leading-relaxed whitespace-pre-wrap">
                        {builtVal || 'No response provided.'}
                      </p>
                    </div>
                  );
                })()}

                {/* 2. AI Tools & Coding Workflows Experience */}
                {(() => {
                  const expVal = selectedApplicant.answers?.experience || 
                    selectedApplicant.answers?.['What is your current experience with AI tools & coding workflows?'] || '';
                  return expVal ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
                      <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                        Experience with AI tools &amp; coding workflows:
                      </span>
                      <p className="text-xs text-[#38342E] leading-relaxed whitespace-pre-wrap">
                        {expVal}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* 3. 48-Hour Weekend Scenario */}
                {(() => {
                  const weekendVal = selectedApplicant.answers?.weekendScenario || 
                    selectedApplicant.answers?.['Weekend Shipping Scenario: If you had 48 hours to ship an AI prototype with a team of 3, what would you build?'] || '';
                  return weekendVal ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
                      <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                        Weekend Shipping Scenario (48-Hour Prototype with team of 3):
                      </span>
                      <p className="text-xs text-[#38342E] leading-relaxed whitespace-pre-wrap">
                        {weekendVal}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* 4. Why build CCC vs conventional club */}
                {(() => {
                  const whyVal = selectedApplicant.answers?.motivation || 
                    selectedApplicant.answers?.['Why do you want to build CCC instead of joining a conventional college club?'] || '';
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
                      <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                        Why build CCC instead of joining a conventional club?
                      </span>
                      <p className="text-xs text-[#38342E] leading-relaxed whitespace-pre-wrap">
                        {whyVal || 'No response recorded.'}
                      </p>
                    </div>
                  );
                })()}

                {/* 5. Weekly Commitment */}
                {(() => {
                  const commitVal = selectedApplicant.answers?.commitment || 
                    selectedApplicant.answers?.['Estimated weekly commitment'] || '';
                  return commitVal ? (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D5] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#8C8275] font-semibold">
                        Estimated Weekly Commitment:
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {commitVal}
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* 6. Links & Portfolio */}
                {(() => {
                  const linksVal = selectedApplicant.answers?.links || 
                    selectedApplicant.answers?.['Links (GitHub, Portfolio, LinkedIn, X, or Projects)'] || '';
                  if (!linksVal) return null;
                  const parsedLinks = linksVal.split(/[\s,]+/).filter(Boolean);
                  return (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
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
                                className="hover:underline inline-flex items-center gap-1 text-[#CC5A36]"
                              >
                                <span>{link}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span>{link}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 7. Extra questions from Google Form */}
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
                    <div key={key} className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-1">
                      <span className="text-[11px] font-mono text-[#8C8275] block font-semibold">
                        {key}
                      </span>
                      <p className="text-xs text-[#38342E] leading-relaxed whitespace-pre-wrap">
                        {val}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Builder Role Assignment (Two Options: Dropdown vs Type Custom) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-mono text-xs uppercase font-bold text-[#1F1E1B]">
                      Builder Track &amp; Role Assignment
                    </h5>
                    <span className="text-[10px] font-mono text-[#8C8275]">
                      Choose from standard tracks or type bespoke title
                    </span>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex items-center bg-[#F5F0E6] p-1 rounded-xl border border-[#E3DCCF] text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDrawerRoleMode('dropdown')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        drawerRoleMode === 'dropdown'
                          ? 'bg-[#CC5A36] text-white font-bold shadow-xs'
                          : 'text-[#666055] hover:text-[#1F1E1B]'
                      }`}
                    >
                      Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerRoleMode('custom')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        drawerRoleMode === 'custom'
                          ? 'bg-[#CC5A36] text-white font-bold shadow-xs'
                          : 'text-[#666055] hover:text-[#1F1E1B]'
                      }`}
                    >
                      Type Custom
                    </button>
                  </div>
                </div>

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
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6C9] rounded-xl text-xs font-mono text-[#1F1E1B] focus:outline-none focus:border-[#CC5A36] cursor-pointer"
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
                      <span>Standard track: <strong className="text-[#1F1E1B]">{drawerPresetRole}</strong></span>
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
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        value={drawerCustomRole}
                        onChange={(e) => setDrawerCustomRole(e.target.value)}
                        placeholder="Type custom role (e.g. Systems Hacker, Hardware Lead, AI Agent Architect...)"
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#CC5A36] rounded-xl text-xs font-mono text-[#1F1E1B] focus:outline-none placeholder-[#8C8275]"
                        autoFocus
                      />
                      {drawerCustomRole && (
                        <button
                          type="button"
                          onClick={() => setDrawerCustomRole('')}
                          className="absolute right-2.5 top-2.5 text-[#8C8275] hover:text-[#1F1E1B] text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8275]">
                      <span>Role on badge: <strong className="text-emerald-700">{drawerCustomRole.trim() || 'Founding Builder'}</strong></span>
                      {selectedApplicant.status === 'accepted' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const roleVal = drawerCustomRole.trim() || drawerPresetRole;
                            handleReviewDecision(selectedApplicant.id, 'accept', roleVal, drawerCustomRole.trim());
                          }}
                          className="text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          Save Role Now ✓
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDrawerRoleMode('dropdown')}
                          className="text-[#8C8275] hover:text-[#1F1E1B] hover:underline cursor-pointer"
                        >
                          &larr; Switch to Dropdown
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer Decision Actions */}
              <div className="p-4 rounded-2xl bg-[#F5F0E6] border border-[#E3DCCF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1F1E1B]">
                      Admissions Council Decision
                    </h4>
                    <p className="text-[11px] font-mono text-[#666055]">
                      Accept to generate a pure cryptographic key and enable official dispatch.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedApplicant.status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => handleReviewDecision(selectedApplicant.id, 'reject')}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 bg-white text-rose-700 text-xs font-mono hover:bg-rose-50 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            const isCustom = drawerRoleMode === 'custom' && drawerCustomRole.trim().length > 0;
                            const assignedRole = isCustom ? drawerCustomRole.trim() : drawerPresetRole;
                            const customRoleVal = isCustom ? drawerCustomRole.trim() : '';
                            handleReviewDecision(selectedApplicant.id, 'accept', assignedRole, customRoleVal);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold shadow-xs cursor-pointer"
                        >
                          ✓ Accept &amp; Issue Pure Key
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        ✓ Admitted Member ({selectedApplicant.founderKey})
                      </span>
                    )}
                  </div>
                </div>

                {/* Dispatch Bar */}
                <div className="pt-2 border-t border-[#E8E2D5] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendAcceptanceEmail(selectedApplicant)}
                      disabled={sendingEmailId === selectedApplicant.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white text-xs font-mono font-medium shadow-xs transition-colors cursor-pointer"
                      title="Compose official acceptance email via c3.collective.in@gmail.com"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sendingEmailId === selectedApplicant.id ? 'Opening C3 Mail...' : '✉ Send Official C3 Mail'}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppInvite(selectedApplicant)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-medium shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open WhatsApp</span>
                    </button>
                  </div>

                  {selectedApplicant.founderKey && (
                    <button
                      onClick={() => {
                        onViewLetter(selectedApplicant);
                        setSelectedApplicant(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD6C9] text-xs font-mono text-[#423C32] hover:bg-black/5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Acceptance Letter</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {/* SUB-MODAL 2: CONNECT FORM (ROOT OVERLAY) */}
        {showConnectForm && (
          <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#CC5A36]" />
                  <h3 className="font-serif text-lg font-bold text-[#1F1E1B]">
                    Connect Google Form &amp; Sync Submissions
                  </h3>
                </div>
                <button
                  data-testid="close-connect"
                  aria-label="Close Connect Form"
                  onClick={() => setShowConnectForm(false)}
                  className="p-2 rounded-xl hover:bg-black/5 text-[#8C8275] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Method 1: Google Apps Script Webhook */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase font-bold text-[#CC5A36]">
                  Method 1: Automatic Google Form Webhook
                </h4>
                <p className="text-xs text-[#554F43]">
                  1. Open your Google Form &rarr; Click the 3 dots &rarr; <strong>Extensions &gt; Apps Script</strong>.<br/>
                  2. Paste the snippet below and click <strong>Save</strong>.<br/>
                  3. Click <strong>Triggers (alarm clock icon)</strong> &gt; Add Trigger &gt; Event: <em>On form submit</em>.
                </p>

                <div className="relative bg-[#1F1E1B] text-[#F3EFEA] p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      navigator.clipboard.writeText(googleAppsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copied Script' : 'Copy Script'}</span>
                  </button>
                  <pre className="text-emerald-400">{googleAppsScriptCode}</pre>
                </div>
              </div>

              {/* Method 2: Quick Google Sheets / CSV Import */}
              <div className="space-y-2 pt-3 border-t border-[#E8E2D5]">
                <h4 className="font-mono text-xs uppercase font-bold text-[#CC5A36]">
                  Method 2: Paste Rows from Google Sheets / Excel
                </h4>
                <p className="text-xs text-[#554F43]">
                  Copy cells directly from your Google Sheet (including header row with Name, Phone, Email, Branch, etc.) and paste here:
                </p>
                <textarea
                  rows={4}
                  value={sheetPasteContent}
                  onChange={(e) => setSheetPasteContent(e.target.value)}
                  placeholder="Full Name	WhatsApp / Phone Number	Branch	What do you want to build?&#10;Aarav Khan	9876543210	CSE	AI Code Generator"
                  className="w-full p-3 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                />
                {sheetImportStatus && (
                  <p className="text-xs font-mono text-emerald-600 font-bold">{sheetImportStatus}</p>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={handleImportSheet}
                    className="px-4 py-2 rounded-xl bg-[#CC5A36] text-white font-mono text-xs font-medium shadow-xs cursor-pointer"
                  >
                    Import Rows into Command Center
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* SUB-MODAL 3: C3 OFFICIAL EMAIL SETTINGS (ROOT OVERLAY) */}
        {showEmailSettings && (
          <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#CC5A36]" />
                  <h3 className="font-serif text-lg font-bold text-[#1F1E1B]">
                    C3 Official Email Settings
                  </h3>
                </div>
                <button
                  data-testid="close-settings"
                  aria-label="Close Email Settings"
                  onClick={() => setShowEmailSettings(false)}
                  className="p-2 rounded-xl hover:bg-black/5 text-[#8C8275] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Official Account Connected: {emailConfig.user || 'c3.collective.in@gmail.com'}</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
                  The Command Center connects directly to Google’s official Gmail Composer. Clicking <strong>✉ C3 Mail</strong> on any candidate opens an official pre-formatted acceptance letter draft pre-addressed with pure key and links—ready to send with 1 click!
                </p>
              </div>

              <form onSubmit={handleSaveEmailConfig} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    C3 Official Email Address
                  </label>
                  <input
                    type="email"
                    value={emailConfig.user}
                    onChange={e => setEmailConfig({ ...emailConfig, user: e.target.value })}
                    placeholder="c3.collective.in@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs text-[#1F1E1B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={emailConfig.fromName}
                    onChange={e => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                    placeholder="C3 Admissions Council · ISLEC"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs text-[#1F1E1B]"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    Optional Background SMTP App Password
                  </label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={e => setEmailPassword(e.target.value)}
                    placeholder={emailConfig.hasPassword ? "•••••••••••••••• (App Password configured)" : "Optional 16-char App Password"}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs text-[#1F1E1B]"
                  />
                  <span className="text-[10px] font-mono text-[#8C8275] mt-0.5 block">
                    Not needed for 1-Click Gmail Composer. Only required if you want headless background dispatch.
                  </span>
                </div>

                {emailTestStatus && (
                  <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#DDD6C9] text-xs font-mono text-[#38342E]">
                    {emailTestStatus}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D5]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestEmailConfig}
                      disabled={testingEmail}
                      className="px-3 py-2 rounded-xl border border-[#DDD6C9] bg-white text-xs font-mono text-[#423C32] hover:bg-black/5 cursor-pointer"
                    >
                      {testingEmail ? 'Checking...' : 'Check Status'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        const sender = emailConfig.user || 'c3.collective.in@gmail.com';
                        const testUrl = `https://mail.google.com/mail/?authuser=${encodeURIComponent(sender)}&view=cm&fs=1&to=${encodeURIComponent(sender)}&su=${encodeURIComponent('🎉 C3 Official Admission Test Draft')}&body=${encodeURIComponent('Dear Candidate,\n\nThis is an official verification draft from C3 Admissions Council (ISL Engineering College).\n\nPure Founder Key: KD4U\n\nAll systems operational!')}`;
                        window.open(testUrl, '_blank');
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test C3 Gmail Draft</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white text-xs font-mono font-medium shadow-xs cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </AnimatePresence>
  );
};
