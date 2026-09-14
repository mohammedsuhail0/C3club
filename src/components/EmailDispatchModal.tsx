import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, ExternalLink, X, Send, Sparkles, Shield, AlertCircle, Code } from 'lucide-react';
import { MemberRecord, sendAcceptanceEmailApi, saveEmailConfigApi } from '../utils/api';
import { generateAcceptanceLetterHtml } from '../utils/letterHtml';
import { sounds } from '../utils/audio';

interface EmailDispatchModalProps {
  member: MemberRecord | null;
  onClose: () => void;
  onSuccess: (memberId: string) => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  member,
  onClose,
  onSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'gmail' | 'direct'>('gmail');
  const [directMode, setDirectMode] = useState<'script' | 'password'>('script');
  const [scriptUrl, setScriptUrl] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!member) return null;

  const cleanKey = String(member.founderKey || '').replace(/^(C3-)?(FND-)?/i, '');
  const subject = `🎉 Official Notice of Admission: C3 Batch 01 (Founder Key: ${cleanKey})`;
  const letterHtml = generateAcceptanceLetterHtml(member);

  const googleAppsScriptMailerCode = `// C3 1-Click Native Gmail Mailer (Zero Password Needed)
// Deploy at script.google.com under c3.collective.in@gmail.com
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    GmailApp.sendEmail(data.to, data.subject, data.text, {
      htmlBody: data.html,
      name: 'C3 Admissions Council · ISLEC'
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyGraphicLetter = async () => {
    try {
      sounds.playSuccess();
      const blobHtml = new Blob([letterHtml], { type: 'text/html' });
      const blobText = new Blob([
        `OFFICE OF THE C3 ADMISSIONS COUNCIL\nDept. of Information Technology · ISL Engineering College\nFounder Key: ${cleanKey}\nAdmitted: ${member.name}\n\nClaim Pass: ${window.location.origin}/?code=${cleanKey}`
      ], { type: 'text/plain' });

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
          })
        ]);
      } else {
        await navigator.clipboard.writeText(letterHtml);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      navigator.clipboard.writeText(letterHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  };

  const handleOpenGmailCompose = () => {
    sounds.playClick();
    const senderEmail = 'c3.collective.in@gmail.com';
    const gmailUrl = `https://mail.google.com/mail/?authuser=${encodeURIComponent(senderEmail)}&view=cm&fs=1&to=${encodeURIComponent(member.email)}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleDirectSend = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsSendingDirect(true);
    setStatusMessage(null);

    try {
      if (directMode === 'script') {
        if (!scriptUrl.trim()) {
          setIsSendingDirect(false);
          setStatusMessage({ text: 'Please enter your Google Apps Script Web App URL', success: false });
          return;
        }

        await saveEmailConfigApi({
          enabled: true,
          service: 'script',
          scriptUrl: scriptUrl.trim()
        });
      } else {
        if (!appPassword.trim()) {
          setIsSendingDirect(false);
          setStatusMessage({ text: 'Please enter your 16-character Gmail App Password', success: false });
          return;
        }

        await saveEmailConfigApi({
          enabled: true,
          service: 'gmail',
          user: 'c3.collective.in@gmail.com',
          fromName: 'C3 Admissions Council · ISLEC',
          fromEmail: 'c3.collective.in@gmail.com',
          host: 'smtp.gmail.com',
          port: 465,
          pass: appPassword.trim()
        });
      }

      // Dispatch email
      const res = await sendAcceptanceEmailApi({ id: member.id, key: member.founderKey });
      setIsSendingDirect(false);

      if (res.success) {
        sounds.playSuccess();
        setStatusMessage({ 
          text: `✓ Official graphic HTML letter sent directly to ${member.email}!`, 
          success: true 
        });
        onSuccess(member.id);
        setTimeout(() => onClose(), 2500);
      } else {
        setStatusMessage({ 
          text: res.message || 'Direct dispatch failed. Please check your configuration.', 
          success: false 
        });
      }
    } catch (err: any) {
      setIsSendingDirect(false);
      setStatusMessage({ text: err.message || 'Network error communicating with mailer', success: false });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#171410] border border-[#2E2820] rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#29241C] flex items-center justify-between bg-[#1B1813]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CC5A36]/15 border border-[#CC5A36]/30 flex items-center justify-center text-[#CC5A36]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  Official Acceptance Letter Dispatch
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                    GRAPHIC CARD
                  </span>
                </h3>
                <p className="text-xs font-mono text-[#8C8275]">
                  Candidate: <strong className="text-white">{member.name}</strong> ({member.email}) &bull; Key: <strong className="text-[#CC5A36]">{cleanKey}</strong>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C8275] hover:text-white hover:bg-[#25211A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#29241C] bg-[#14120E] px-6 pt-2">
            <button
              onClick={() => setActiveTab('gmail')}
              className={`pb-2.5 px-4 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'gmail'
                  ? 'border-[#CC5A36] text-[#CC5A36] font-bold'
                  : 'border-transparent text-[#8C8275] hover:text-[#D4CDC3]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Gmail Card (No Password Needed)</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`pb-2.5 px-4 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'direct'
                  ? 'border-[#CC5A36] text-[#CC5A36] font-bold'
                  : 'border-transparent text-[#8C8275] hover:text-[#D4CDC3]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Direct Background Send</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === 'gmail' ? (
              <div className="space-y-4">
                {/* Visual Step Guide */}
                <div className="bg-[#1F1B15] border border-[#352F26] rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>How to paste the full Graphic Letter into Gmail (3 Seconds):</span>
                  </div>
                  <ol className="text-xs font-mono text-[#A8A093] space-y-1.5 list-decimal list-inside pl-1">
                    <li>Click <strong className="text-white">"Copy Graphic Letter Card"</strong> below.</li>
                    <li>Switch to your open Gmail tab (or click <strong className="text-white">"Open Gmail Compose"</strong>).</li>
                    <li>Click inside the Gmail message box and press <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-white font-bold">Ctrl + V</kbd>!</li>
                  </ol>
                  <p className="text-[11px] font-sans text-amber-300/90 pt-1 border-t border-[#2E2820]">
                    ⚡ <strong>Zero Setup:</strong> Works on all Google accounts without requiring any App Passwords or 2-Step Verification.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyGraphicLetter}
                    className={`py-3 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      copied
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-[#CC5A36] hover:bg-[#B34826] border-[#CC5A36] text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '✓ Graphic Letter Copied!' : '1. Copy Graphic Letter Card'}</span>
                  </button>

                  <button
                    onClick={handleOpenGmailCompose}
                    className="py-3 px-4 rounded-xl bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] text-white font-mono text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>2. Open Gmail Compose &rarr;</span>
                  </button>
                </div>

                {/* Live Card Preview Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8275]">
                    <span>Exact Letter Design Preview (Pasted into Gmail):</span>
                    <span className="text-emerald-400 font-bold">100% Rich HTML</span>
                  </div>
                  <div className="rounded-2xl border border-[#2E2820] bg-[#0E0C09] p-3 max-h-64 overflow-y-auto">
                    <iframe
                      srcDoc={letterHtml}
                      title="Letter Preview"
                      className="w-full h-80 rounded-xl bg-white border-0"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: DIRECT SEND (Zero manual paste) */
              <form onSubmit={handleDirectSend} className="space-y-4">
                <div className="bg-[#1F1B15] border border-[#352F26] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Automated Server Dispatch (Direct to Candidate's Inbox)</span>
                  </div>
                  <p className="text-xs text-[#9E9587] leading-relaxed">
                    Choose your direct dispatch method below. If Google App Passwords is unavailable for your account, use the <strong className="text-white">Google Apps Script Web App</strong> (takes 30 seconds and requires zero passwords!).
                  </p>

                  {/* Mode Selector */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDirectMode('script')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                        directMode === 'script'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#14120E] border-[#2A241C] text-[#8C8275]'
                      }`}
                    >
                      ✓ Google Apps Script (Zero Password)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectMode('password')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                        directMode === 'password'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#14120E] border-[#2A241C] text-[#8C8275]'
                      }`}
                    >
                      Google App Password
                    </button>
                  </div>
                </div>

                {directMode === 'script' ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5 text-xs text-[#A8A093] bg-[#12100C] p-3 rounded-xl border border-[#24201A]">
                      <p className="font-semibold text-white">Quick 30-Second Setup in Google Apps Script:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[#9E9587] text-[11px] font-mono">
                        <li>Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-[#CC5A36] underline">script.google.com</a> in your C3 Google account.</li>
                        <li>Click <strong className="text-white">New Project</strong>, paste the script below, and click <strong className="text-white">Deploy &gt; New deployment</strong>.</li>
                        <li>Select <strong className="text-white">Web app</strong> &rarr; Execute as: <strong className="text-white">Me</strong> &rarr; Who has access: <strong className="text-white">Anyone</strong> &rarr; Deploy.</li>
                        <li>Copy the generated Web App URL and paste it below!</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <pre className="p-3 bg-[#12100C] border border-[#2E2820] rounded-xl text-[10px] font-mono text-[#A8A093] overflow-x-auto max-h-32">
                        {googleAppsScriptMailerCode}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(googleAppsScriptMailerCode);
                          sounds.playSuccess();
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#25211A] hover:bg-[#302B22] border border-[#3A352C] text-[10px] font-mono text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#8C8275] block">
                        Google Apps Script Web App URL:
                      </label>
                      <input
                        type="url"
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full px-3.5 py-2 bg-[#12100C] border border-[#2E2820] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#CC5A36] placeholder-[#554F44]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#8C8275] block">
                      Google App Password (16 Letters):
                    </label>
                    <input
                      type="password"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-2.5 bg-[#12100C] border border-[#2E2820] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#CC5A36] placeholder-[#554F44]"
                    />
                    <span className="text-[10px] font-mono text-[#7D7467] block">
                      Requires 2-Step Verification to be enabled on your Google Account first.
                    </span>
                  </div>
                )}

                {statusMessage && (
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    statusMessage.success 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}>
                    {statusMessage.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingDirect || (directMode === 'script' ? !scriptUrl.trim() : !appPassword.trim())}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingDirect ? 'Dispatching Official Letter...' : 'Dispatch Directly to Inbox ⚡'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-[#29241C] bg-[#14120E] text-[11px] font-mono text-[#7D7467] flex items-center justify-between">
            <span>C3 Admissions Council &bull; Dept. of Information Technology</span>
            <span className="text-[#CC5A36]">REF: ISLEC/C3/B01/ADM/2026/{cleanKey}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
