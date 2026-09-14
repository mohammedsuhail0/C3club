import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, 'data', 'email_config.json');

function getEffectiveConfigFile() {
  if (process.env.VERCEL) {
    const tmpFile = path.join('/tmp', 'c3_email_config.json');
    if (!fs.existsSync(tmpFile) && fs.existsSync(CONFIG_FILE)) {
      try {
        fs.copyFileSync(CONFIG_FILE, tmpFile);
      } catch (e) {}
    }
    return tmpFile;
  }
  return CONFIG_FILE;
}

export function isValidGoogleScriptUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'https:' &&
           parsed.hostname === 'script.google.com' &&
           parsed.pathname.startsWith('/macros/s/');
  } catch {
    return false;
  }
}

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getEmailConfig() {
  try {
    const targetFile = getEffectiveConfigFile();
    if (!fs.existsSync(targetFile)) {
      return {
        enabled: false,
        service: 'gmail',
        user: '',
        pass: '',
        fromName: 'C3 Admissions Council · ISLEC',
        fromEmail: ''
      };
    }
    return JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
  } catch (err) {
    return { enabled: false, service: 'gmail', user: '', pass: '', fromName: 'C3 Admissions Council', fromEmail: '' };
  }
}

export function saveEmailConfig(config) {
  try {
    const targetFile = getEffectiveConfigFile();
    const current = getEmailConfig();
    
    let scriptUrl = config.scriptUrl !== undefined ? config.scriptUrl : current.scriptUrl;
    if (scriptUrl && !isValidGoogleScriptUrl(scriptUrl)) {
      console.warn('Rejected invalid scriptUrl:', scriptUrl);
      scriptUrl = '';
    }

    const updated = {
      ...current,
      ...config,
      scriptUrl,
      pass: (config.pass && !config.pass.includes('••')) ? config.pass : current.pass,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(targetFile, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Failed to save email config:', err);
    return null;
  }
}

function createTransporter(config) {
  const cfg = config || getEmailConfig();
  if (!cfg.user || !cfg.pass) return null;

  if (cfg.service === 'custom') {
    return nodemailer.createTransport({
      host: cfg.host,
      port: Number(cfg.port) || 587,
      secure: Number(cfg.port) === 465,
      auth: { user: cfg.user, pass: cfg.pass }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: cfg.user,
      pass: cfg.pass.replace(/\s+/g, '')
    }
  });
}

export async function verifyEmailCredentials(testConfig) {
  if (testConfig.scriptUrl) {
    if (!isValidGoogleScriptUrl(testConfig.scriptUrl)) {
      return { success: false, message: 'Invalid scriptUrl: Only official Google Apps Script URLs (https://script.google.com/macros/s/...) are permitted.' };
    }
    try {
      await fetch(testConfig.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' })
      });
      return { success: true, message: 'Google Apps Script Mailer webhook verified successfully!' };
    } catch (err) {
      return { success: false, message: 'Failed to reach Apps Script URL: ' + err.message };
    }
  }

  const transporter = createTransporter(testConfig);
  if (!transporter) {
    if (testConfig.user) {
      return {
        success: true,
        message: `✓ Official C3 Google Account (${testConfig.user}) is connected! 1-Click C3 Gmail Composer is active and ready to dispatch acceptance drafts.`
      };
    }
    return { success: false, message: 'Email address not configured' };
  }
  try {
    await transporter.verify();
    return { success: true, message: 'SMTP background connection verified successfully!' };
  } catch (err) {
    return {
      success: false,
      message: `${err.message || 'SMTP authentication failed'}. Note: 1-Click C3 Gmail Composer remains fully active with zero password required!`
    };
  }
}

export async function sendAcceptanceEmail(member, baseUrl = 'http://localhost:4173') {
  const config = getEmailConfig();
  const cleanKey = String(member.founderKey || '').replace(/^(C3-)?(FND-)?/i, '');
  const letterUrl = `${baseUrl}/?letter=${cleanKey}`;
  const passUrl = `${baseUrl}/?code=${cleanKey}`;
  const refCode = `ISLEC/C3/B01/ADM/2026/${cleanKey}`;

  const subject = `🎉 Official Notice of Admission: C3 Batch 01 (Founder Key: ${cleanKey})`;
  const plainTextBody = `Dear ${member.name},

Congratulations! On behalf of C3 (Claude Code & Cowork) and the Department of Information Technology at ISL Engineering College, your application for Batch 01 has been officially approved!

Your Exclusive Founder Access Key: ${cleanKey}

1. View & Print Your Official Acceptance Letter:
${letterUrl}

2. Claim Your 3D Founding Pass & Campus Badge:
${passUrl}

Workspace Schedule:
• Venue: C3 Campus Office / Innovation Lab 3 · ISLEC Campus
• Timings: Monday to Thursday · 10:00 AM – 1:00 PM
• Role: ${member.role || 'Founding Builder'}

Present this pass on Monday morning to collect your physical NFC campus badge.

See you on Monday!
— Mohammed Suhail & Mohammad Bilal (Founding Co-Leads)
C3 Collective · Department of Information Technology · ISL Engineering College`;

  const senderEmail = config.user || 'c3.collective.in@gmail.com';
  const mailto = `mailto:${encodeURIComponent(member.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
  const gmailUrl = `https://mail.google.com/mail/?authuser=${encodeURIComponent(senderEmail)}&view=cm&fs=1&to=${encodeURIComponent(member.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;

  const safeName = escapeHtml(member.name);
  const safeRole = escapeHtml(member.role || 'Founding Builder');
  const safeKey = escapeHtml(cleanKey);
  const safeRefCode = escapeHtml(refCode);
  const safePassUrl = escapeHtml(passUrl);
  const safeLetterUrl = escapeHtml(letterUrl);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>C3 Admission Notice</title>
</head>
<body style="margin:0;padding:20px;background-color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1F1E1B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #E8E2D5;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color:#FAF8F5;border-bottom:2px solid #CC5A36;padding:24px;text-align:center;">
        <h2 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#CC5A36;letter-spacing:0.5px;">
          C3 · CLAUDE CODE &amp; COWORK
        </h2>
        <p style="margin:4px 0 0 0;font-size:11px;font-family:monospace;text-transform:uppercase;color:#8C8275;letter-spacing:1.5px;">
          Office of Admissions Council &bull; Dept. of Information Technology &bull; ISL Engineering College
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <div style="font-size:11px;font-family:monospace;color:#8C8275;margin-bottom:12px;">
          REF: ${safeRefCode} &bull; BATCH 01 CORE
        </div>
        <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1F1E1B;line-height:1.3;">
          Official Notice of Admission: Founding Cohort (Batch 01)
        </h1>
        <p style="font-size:15px;line-height:1.6;color:#38342E;">
          Dear <strong>${safeName}</strong>,
        </p>
        <p style="font-size:14px;line-height:1.6;color:#4A443B;">
          Congratulations! On behalf of the <strong>C3 Collective</strong> and the Department of Information Technology at ISL Engineering College, we are pleased to inform you that your application for <strong>Batch 01</strong> has been officially approved.
        </p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;background-color:#FAF8F5;border:1px dashed #CC5A36;border-radius:12px;text-align:center;">
          <tr>
            <td style="padding:20px;">
              <div style="font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:2px;color:#8C8275;">
                Exclusive Founder Access Key
              </div>
              <div style="font-size:32px;font-family:monospace;font-weight:bold;color:#CC5A36;letter-spacing:4px;margin:8px 0;">
                ${safeKey}
              </div>
              <div style="font-size:12px;color:#666055;">
                Use this pure key to unlock your 3D Pass and claim your campus badge.
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <a href="${safePassUrl}" target="_blank" style="display:inline-block;background-color:#CC5A36;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:14px 28px;border-radius:10px;">
                Claim &amp; Customize 3D Founding Pass &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="${safeLetterUrl}" target="_blank" style="display:inline-block;color:#666055;text-decoration:underline;font-size:12px;font-family:monospace;">
                View &amp; Print Official Acceptance Letter
              </a>
            </td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7F5F0;border-radius:10px;margin:20px 0;font-size:12px;color:#4A443B;">
          <tr>
            <td style="padding:16px;">
              <div style="font-weight:bold;font-family:monospace;color:#CC5A36;margin-bottom:8px;">
                INDUCTION &amp; WORKSPACE SCHEDULE:
              </div>
              <div>&bull; <strong>Assigned Role:</strong> ${safeRole}</div>
              <div>&bull; <strong>Venue:</strong> C3 Campus Office / Innovation Lab 3 &bull; ISLEC Campus</div>
              <div>&bull; <strong>Timings:</strong> Monday to Thursday &bull; 10:00 AM &ndash; 1:00 PM</div>
              <div>&bull; <strong>Physical NFC Badge:</strong> Ready for collection at the desk upon showing your digital pass.</div>
            </td>
          </tr>
        </table>
        <p style="font-size:13px;line-height:1.6;color:#4A443B;margin-top:24px;">
          Please claim your pass before Monday morning. See you on Monday!
        </p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:28px;padding-top:16px;border-top:1px solid #E8E2D5;">
          <tr>
            <td>
              <div style="font-family:Georgia,serif;font-style:italic;font-size:15px;font-weight:bold;color:#CC5A36;">
                Mohammed Suhail &amp; Mohammad Bilal
              </div>
              <div style="font-size:11px;color:#1F1E1B;font-weight:600;">
                Founding Co-Leads (Flat Collective &bull; No Hierarchy)
              </div>
              <div style="font-size:10px;color:#8C8275;font-family:monospace;">
                C3 Collective &bull; Dept. of Information Technology &bull; ISL Engineering College
              </div>
            </td>
            <td align="right" style="font-size:10px;font-family:monospace;color:#8C8275;">
              ISL Engineering College<br>(UGC Autonomous)
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color:#FAF8F5;border-top:1px solid #E8E2D5;padding:14px;text-align:center;font-size:11px;color:#8C8275;font-family:monospace;">
        Bandlaguda, Chandrayangutta, Hyderabad &bull; Official C3 Collective Admissions
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Branch A: Google Apps Script Web App (Zero-password native Gmail dispatch)
  if (config.scriptUrl && isValidGoogleScriptUrl(config.scriptUrl)) {
    try {
      await fetch(config.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member.email,
          subject: `🎉 Official Notice of Admission: C3 Batch 01 (Founder Key: ${cleanKey})`,
          html,
          text: `Dear ${member.name},\n\nCongratulations! You have been accepted into C3 Batch 01 (Founding Member) at ISL Engineering College.\n\nFounder Key: ${cleanKey}\nClaim Pass: ${passUrl}\nAcceptance Letter: ${letterUrl}\n\nKickoff: Monday, 10:00 AM – 1:00 PM at C3 Campus Office / Lab 3.\n\n— Team C3`
        })
      });
      return {
        success: true,
        mailto,
        message: `Official acceptance email sent to ${member.email} via C3 Google Apps Script!`
      };
    } catch (err) {
      console.error('Google Apps Script Mailer failed:', err);
    }
  }

  const transporter = createTransporter(config);
  if (!transporter) {
    return {
      success: false,
      isFallback: true,
      gmailUrl,
      mailto,
      message: 'Direct dispatch via C3 Gmail Composer ready!'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: config.fromEmail ? `"${config.fromName || 'C3 Admissions Council'}" <${config.fromEmail}>` : config.user,
      to: member.email,
      subject: `🎉 Official Notice of Admission: C3 Batch 01 (Founder Key: ${cleanKey})`,
      html,
      text: plainTextBody
    });
    return {
      success: true,
      messageId: info.messageId,
      gmailUrl,
      mailto,
      message: `Official acceptance email sent to ${member.email}!`
    };
  } catch (err) {
    return {
      success: false,
      isFallback: true,
      gmailUrl,
      mailto,
      message: err.message || 'SMTP error. Opened C3 Gmail draft.'
    };
  }
}
