import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit3, User, Building, Calendar, Shield, Sparkles, Check, AlertCircle } from 'lucide-react';
import { MemberRecord, editMemberApi, saveLocalDecision } from '../utils/api';
import { sounds } from '../utils/audio';

interface EditMemberModalProps {
  isOpen: boolean;
  member: MemberRecord | null;
  onClose: () => void;
  onSaved: (updatedMember: MemberRecord) => void;
}

const DEPT_PRESETS = ['IT', 'CSE', 'AI/DS', 'AIML', 'ECE', 'MECH', 'CIVIL', 'EEE'];
const YEAR_PRESETS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ROLE_PRESETS = [
  'Technical & AI Architect',
  'Frontend Engineer',
  'UI/UX & Creative Designer',
  'Full-Stack Systems Engineer',
  'Product & Community Lead',
  'Founding Builder'
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('IT');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');

  const [year, setYear] = useState('3rd Year');
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [customYear, setCustomYear] = useState('');

  const [role, setRole] = useState('Technical & AI Architect');
  const [customRole, setCustomRole] = useState('');
  const [status, setStatus] = useState<'pending_review' | 'accepted' | 'rejected' | 'claimed'>('pending_review');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name || '');

      // Check if branch matches presets
      const branchVal = member.branch || 'IT';
      if (DEPT_PRESETS.includes(branchVal)) {
        setBranch(branchVal);
        setIsCustomDept(false);
        setCustomDept('');
      } else {
        setBranch('Other');
        setIsCustomDept(true);
        setCustomDept(branchVal);
      }

      // Check if year matches presets
      const yearVal = member.year || '3rd Year';
      if (YEAR_PRESETS.includes(yearVal)) {
        setYear(yearVal);
        setIsCustomYear(false);
        setCustomYear('');
      } else {
        setYear('Other');
        setIsCustomYear(true);
        setCustomYear(yearVal);
      }

      // Role
      if (member.customRole) {
        setCustomRole(member.customRole);
        setRole(member.role || 'Founding Builder');
      } else {
        setRole(member.role || 'Technical & AI Architect');
        setCustomRole('');
      }

      setStatus(member.status || 'pending_review');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSelectDept = (d: string) => {
    sounds.playKey();
    setBranch(d);
    setIsCustomDept(false);
  };

  const handleCustomDeptSelect = () => {
    sounds.playKey();
    setIsCustomDept(true);
    setBranch('Other');
  };

  const handleSelectYear = (y: string) => {
    sounds.playKey();
    setYear(y);
    setIsCustomYear(false);
  };

  const handleCustomYearSelect = () => {
    sounds.playKey();
    setIsCustomYear(true);
    setYear('Other');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Full Name cannot be empty');
      sounds.playKey();
      return;
    }

    const effectiveDept = (isCustomDept ? customDept.trim() : branch.trim()) || 'IT';
    const effectiveYear = (isCustomYear ? customYear.trim() : year.trim()) || '3rd Year';
    const effectiveRole = role.trim() || 'Founding Builder';
    const effectiveCustomRole = customRole.trim();

    setSaving(true);
    sounds.playClick();

    try {
      // 1. Send update to backend
      const res = await editMemberApi({
        id: member.id,
        name: cleanName,
        branch: effectiveDept,
        year: effectiveYear,
        role: effectiveRole,
        customRole: effectiveCustomRole,
        status
      });

      // 2. Persist decision locally to survive serverless restarts
      const phoneKey = member.phone ? member.phone.replace(/\D/g, '').slice(-10) : '';
      const decisionPatch = {
        name: cleanName,
        branch: effectiveDept,
        year: effectiveYear,
        role: effectiveRole,
        customRole: effectiveCustomRole,
        status
      };

      if (phoneKey) saveLocalDecision(phoneKey, decisionPatch);
      if (member.email) saveLocalDecision(member.email.toLowerCase(), decisionPatch);
      saveLocalDecision(member.id, decisionPatch);

      // 3. Form updated record
      const updatedRecord: MemberRecord = {
        ...(res.member || member),
        name: cleanName,
        branch: effectiveDept,
        year: effectiveYear,
        role: effectiveRole,
        customRole: effectiveCustomRole,
        status: (res.member?.status || status)
      };

      setSaving(false);
      sounds.playSuccess();
      setSuccessMsg('Member updated successfully!');

      setTimeout(() => {
        onSaved(updatedRecord);
        onClose();
      }, 700);
    } catch (err: any) {
      setSaving(false);
      setErrorMsg(err?.message || 'Failed to update member');
      sounds.playKey();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#181511] text-[#EDE8DF] border border-[#3A3328] rounded-3xl shadow-2xl p-6 sm:p-8 my-8 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#CC5A36]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#2A251E] pb-4 mb-6 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#CC5A36]/15 border border-[#CC5A36]/30 text-[#CC5A36] flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  Edit Candidate Profile
                </h3>
                <p className="text-xs font-mono text-[#8C8275]">
                  ID: {member.id} · Founder Key: {member.founderKey || 'Pending'}
                </p>
              </div>
            </div>

            <button
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-2 rounded-xl hover:bg-[#25211A] text-[#8C8275] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Message Toasts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A8A093] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#CC5A36]" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mohammed Suhail"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#201C16] border border-[#3A3328] focus:border-[#CC5A36] focus:outline-hidden text-sm text-white font-sans transition-colors"
              />
            </div>

            {/* 2. Department / DEPT */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A8A093] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#CC5A36]" />
                  DEPT (Department)
                </span>
                <span className="text-[10px] text-[#8C8275]">
                  Active: <strong className="text-white">{isCustomDept ? (customDept || 'Custom') : branch}</strong>
                </span>
              </label>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DEPT_PRESETS.map((d) => {
                  const isSelected = !isCustomDept && branch === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSelectDept(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#CC5A36] text-white border-[#CC5A36] font-bold shadow-xs'
                          : 'bg-[#201C16] text-[#A8A093] border-[#302B22] hover:bg-[#28231C] hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleCustomDeptSelect}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                    isCustomDept
                      ? 'bg-[#CC5A36] text-white border-[#CC5A36] font-bold shadow-xs'
                      : 'bg-[#201C16] text-[#A8A093] border-[#302B22] hover:bg-[#28231C] hover:text-white'
                  }`}
                >
                  ✏️ Custom
                </button>
              </div>

              {/* Custom Dept Input */}
              {isCustomDept && (
                <input
                  type="text"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  placeholder="Type department name (e.g. IT, Cyber Security, AI & Data Science)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#201C16] border border-[#CC5A36]/60 text-xs font-mono text-white focus:outline-hidden"
                  autoFocus
                />
              )}
            </div>

            {/* 3. Year of Study */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A8A093] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#CC5A36]" />
                  Year of Study
                </span>
                <span className="text-[10px] text-[#8C8275]">
                  Active: <strong className="text-white">{isCustomYear ? (customYear || 'Custom') : year}</strong>
                </span>
              </label>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {YEAR_PRESETS.map((y) => {
                  const isSelected = !isCustomYear && year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYear(y)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#CC5A36] text-white border-[#CC5A36] font-bold shadow-xs'
                          : 'bg-[#201C16] text-[#A8A093] border-[#302B22] hover:bg-[#28231C] hover:text-white'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleCustomYearSelect}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                    isCustomYear
                      ? 'bg-[#CC5A36] text-white border-[#CC5A36] font-bold shadow-xs'
                      : 'bg-[#201C16] text-[#A8A093] border-[#302B22] hover:bg-[#28231C] hover:text-white'
                  }`}
                >
                  ✏️ Custom
                </button>
              </div>

              {/* Custom Year Input */}
              {isCustomYear && (
                <input
                  type="text"
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                  placeholder="Type year (e.g. 3rd Year, Final Year, Class of 2026)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#201C16] border border-[#CC5A36]/60 text-xs font-mono text-white focus:outline-hidden"
                  autoFocus
                />
              )}
            </div>

            {/* 4. Builder Role */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A8A093] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#CC5A36]" />
                  Builder Track Role
                </span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#201C16] border border-[#3A3328] focus:border-[#CC5A36] focus:outline-hidden text-xs text-white font-mono mb-2"
              >
                {ROLE_PRESETS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Custom honorary title / specialization (optional)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#201C16] border border-[#302B22] text-xs font-mono text-[#D4CDC3] focus:border-[#CC5A36] focus:outline-hidden"
              />
            </div>

            {/* 5. Admission Status */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A8A093] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#CC5A36]" />
                Admission Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'pending_review', label: 'Pending', color: 'border-amber-700/50 text-amber-300' },
                  { key: 'accepted', label: 'Accepted', color: 'border-emerald-700/50 text-emerald-300' },
                  { key: 'claimed', label: 'Claimed', color: 'border-blue-700/50 text-blue-300' },
                  { key: 'rejected', label: 'Rejected', color: 'border-red-700/50 text-red-300' }
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => { sounds.playKey(); setStatus(s.key as any); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer border transition-all ${
                      status === s.key
                        ? `bg-[#2A231A] font-bold ${s.color} ring-1 ring-[#CC5A36]`
                        : 'bg-[#201C16] border-[#302B22] text-[#8C8275] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A251E] mt-6">
              <button
                type="button"
                onClick={() => { sounds.playClick(); onClose(); }}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-[#201C16] hover:bg-[#28231C] text-xs font-mono text-[#A8A093] hover:text-white border border-[#302B22] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34D2D] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-[#CC5A36]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
