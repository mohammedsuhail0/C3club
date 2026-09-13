import React, { useState } from 'react';
import { 
  X, ExternalLink, Copy, Check, QrCode, Sparkles, ShieldCheck, 
  Send, ArrowRight, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { submitApplicationApi } from '../utils/api';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'google_form'>('direct');
  const [copied, setCopied] = useState(false);
  const formUrl = 'https://forms.gle/yHpq52h2rhREPtSa8';

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('3rd Year');
  const [roleMode, setRoleMode] = useState<'dropdown' | 'custom'>('dropdown');
  const [rolePreset, setRolePreset] = useState('Technical & AI Architect');
  const [customRole, setCustomRole] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [motivation, setMotivation] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    sounds.playSuccess();
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormClick = () => {
    sounds.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#CC5A36', '#D97757', '#FAF8F5']
      });
    } catch {}
  };

  const handleSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Full Name and Phone Number are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const finalRole = roleMode === 'custom' && customRole.trim() ? customRole.trim() : rolePreset;

    const res = await submitApplicationApi({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      branch,
      year,
      role: finalRole,
      projectIdea: projectIdea.trim(),
      motivation: motivation.trim()
    });

    setSubmitting(false);

    if (res.success) {
      sounds.playSuccess();
      setSubmitted(true);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#CC5A36', '#D97757', '#FAF8F5']
        });
      } catch {}
    } else {
      setErrorMsg(res.message || 'Failed to submit application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] text-[#1F1E1B] border border-[#E8E2D5] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[#666055] hover:text-[#1F1E1B] bg-white border border-[#DDD6C9] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CC5A36]/10 text-xs font-mono text-[#CC5A36] mb-2 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BATCH 01 FOUNDING COHORT</span>
          </div>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1F1E1B]">
            Apply for Core Founding Team
          </h3>
          <p className="text-xs sm:text-sm text-[#666055] mt-1">
            Department of Computer Science &amp; Engineering · ISL Engineering College (Autonomous)
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-center gap-2 mb-6 border-b border-[#E8E2D5] pb-3">
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded-xl font-mono text-xs transition-all cursor-pointer ${activeTab === 'direct' ? 'bg-[#CC5A36] text-white font-bold shadow-xs' : 'bg-white text-[#666055] border border-[#DDD6C9] hover:bg-black/5'}`}
          >
            ⚡ Fast Web Application
          </button>
          <button
            onClick={() => setActiveTab('google_form')}
            className={`px-4 py-2 rounded-xl font-mono text-xs transition-all cursor-pointer ${activeTab === 'google_form' ? 'bg-[#CC5A36] text-white font-bold shadow-xs' : 'bg-white text-[#666055] border border-[#DDD6C9] hover:bg-black/5'}`}
          >
            📱 Google Form &amp; QR Code
          </button>
        </div>

        {activeTab === 'direct' ? (
          /* DIRECT ON-SITE APPLICATION */
          submitted ? (
            <div className="text-center p-8 space-y-4 bg-white rounded-2xl border border-emerald-500/30">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1B]">
                Application Submitted Successfully!
              </h4>
              <p className="text-xs sm:text-sm text-[#554F43] max-w-md mx-auto leading-relaxed">
                Your submission has landed directly in the <strong>C3 Admissions Council Command Center</strong>.
                If accepted, you will receive an official notification email and WhatsApp invitation with your unique <strong>Founder Key</strong> to claim your 3D Pass and campus badge.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white text-xs font-mono font-medium shadow-xs"
                >
                  Return to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitDirect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Syed Noor Ullah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD6C9] font-sans text-xs focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 7569865390"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    College / Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="noor@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    Department / Branch
                  </label>
                  <select
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI & DS">AI &amp; DS</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Preferred Builder Role (Dropdown or Type Custom) */}
              <div className="p-3.5 rounded-2xl bg-[#F5F0E6] border border-[#E3DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono uppercase text-[#666055] font-bold">
                    Preferred Builder Role *
                  </label>
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#DDD6C9] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setRoleMode('dropdown')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        roleMode === 'dropdown'
                          ? 'bg-[#CC5A36] text-white font-bold'
                          : 'text-[#666055] hover:text-[#1F1E1B]'
                      }`}
                    >
                      Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleMode('custom')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        roleMode === 'custom'
                          ? 'bg-[#CC5A36] text-white font-bold'
                          : 'text-[#666055] hover:text-[#1F1E1B]'
                      }`}
                    >
                      Type Custom
                    </button>
                  </div>
                </div>

                {roleMode === 'dropdown' ? (
                  <select
                    value={rolePreset}
                    onChange={e => setRolePreset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD6C9] font-mono text-xs focus:outline-none focus:border-[#CC5A36]"
                  >
                    <option value="Technical & AI Architect">Technical &amp; AI Architect</option>
                    <option value="Project Founder">Project Founder</option>
                    <option value="Design & Creative Lead">Design &amp; Creative Lead</option>
                    <option value="Growth & Community Lead">Growth &amp; Community Lead</option>
                    <option value="Vibe Coder / Shipper">Vibe Coder / Shipper</option>
                    <option value="Founding Builder">Founding Builder</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="e.g. Systems Hacker, Hardware Lead, AI Agent Architect..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CC5A36] font-mono text-xs focus:outline-none placeholder-[#8C8275]"
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                  What do you want to build or ship at C3?
                </label>
                <textarea
                  rows={2}
                  value={projectIdea}
                  onChange={e => setProjectIdea(e.target.value)}
                  placeholder="e.g. AI campus bot, automated WhatsApp lead assistant, full stack SaaS..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD6C9] font-sans text-xs focus:outline-none focus:border-[#CC5A36]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#8C8275] mb-1">
                  Why do you want to join the Founding Team?
                </label>
                <textarea
                  rows={2}
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  placeholder="e.g. I want to build real products every week, master Claude Code CLI, and collaborate with passionate builders."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD6C9] font-sans text-xs focus:outline-none focus:border-[#CC5A36]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-mono text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-semibold text-xs font-mono shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{submitting ? 'Submitting Application...' : 'Submit Founding Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )
        ) : (
          /* GOOGLE FORM TAB */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-white border border-[#E8E2D5] mb-5">
              <div className="sm:col-span-5 flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-xl border border-[#DDD6C9] shadow-sm">
                  <img
                    src="/assets/qr_code.png"
                    alt="Application QR Code"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <span className="text-[11px] font-mono text-[#8C8275] mt-2 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-[#CC5A36]" />
                  <span>Scan with phone camera</span>
                </span>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleFormClick}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-xs font-mono bg-[#CC5A36] hover:bg-[#B34826] shadow-sm transition-all"
                >
                  <span>Open Official Google Form</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[#38342E] font-mono text-xs bg-[#FAF8F5] hover:bg-black/5 border border-[#DDD6C9] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#CC5A36]" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Form Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
