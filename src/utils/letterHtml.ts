import { MemberRecord } from './api';

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateAcceptanceLetterHtml(member: MemberRecord, baseUrl: string = ''): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://c3club.vercel.app');
  const cleanKey = String(member.founderKey || '').replace(/^(C3-)?(FND-)?/i, '');
  const letterUrl = `${base}/?letter=${cleanKey}`;
  const passUrl = `${base}/?code=${cleanKey}`;
  const refCode = `ISLEC/C3/B01/ADM/2026/${cleanKey}`;

  const safeName = escapeHtml(member.name);
  const safeRole = escapeHtml(member.role || 'Founding Builder');
  const safeKey = escapeHtml(cleanKey);
  const safeRefCode = escapeHtml(refCode);
  const safePassUrl = escapeHtml(passUrl);
  const safeLetterUrl = escapeHtml(letterUrl);

  return `<!DOCTYPE html>
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
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:26px 0 20px 0;">
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <a href="${safeLetterUrl}" target="_blank" style="display:inline-block;background-color:#1F1E1B;color:#FAF8F5;border:1px solid #1F1E1B;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.3px;box-shadow:0 3px 12px rgba(0,0,0,0.12);min-width:240px;text-align:center;">
                📄 View Official Acceptance Letter &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="${safePassUrl}" target="_blank" style="display:inline-block;background-color:#CC5A36;color:#ffffff;border:1px solid #CC5A36;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.3px;box-shadow:0 3px 12px rgba(204,90,54,0.22);min-width:240px;text-align:center;">
                🎟️ Claim &amp; Customize 3D Founding Pass &rarr;
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
}
