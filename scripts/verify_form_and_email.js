import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  console.log("Starting Chrome for Form & Email Verification...");
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9249',
    '--disable-gpu',
    '--window-size=1440,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9249/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data.result);
        callbacks.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);
    const send = (method, params = {}) => new Promise(res => {
      const msgId = id++;
      callbacks.set(msgId, resolve => res(resolve));
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    // 1. Navigate to Command Center ?admin=c3core
    console.log("1. Navigating to Command Center ?admin=c3core ...");
    await send('Page.navigate', { url: 'http://localhost:4173/?admin=c3core' });
    await new Promise(r => setTimeout(r, 3000));

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_command_center_with_review.png'), Buffer.from(shot1.data, 'base64'));
    console.log("Saved test_command_center_with_review.png");

    // 2. Open Dossier for Ayesha Fatima
    console.log("2. Opening Dossier for Ayesha Fatima...");
    const dossierRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const ayeshaRow = rows.find(r => r.innerText.includes('Ayesha Fatima'));
        if (ayeshaRow) {
          const btn = Array.from(ayeshaRow.querySelectorAll('button')).find(b => b.innerText.includes('Dossier'));
          if (btn) {
            btn.click();
            return "Clicked dossier";
          }
          return "Dossier button not found in row";
        }
        return "Ayesha row not found";
      })()`,
      returnByValue: true
    });
    console.log("Dossier open result:", dossierRes.result?.value);
    await new Promise(r => setTimeout(r, 1500));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_applicant_dossier.png'), Buffer.from(shot2.data, 'base64'));
    console.log("Saved test_applicant_dossier.png");

    // 3. Click "Accept & Issue Pure Key"
    console.log("3. Clicking Accept & Issue Pure Key...");
    const acceptRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept & Issue Pure Key'));
        if (acceptBtn) {
          acceptBtn.click();
          return "Clicked accept";
        }
        return "Accept button not found: " + Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).join(' | ');
      })()`,
      returnByValue: true
    });
    console.log("Accept click result:", acceptRes.result?.value);
    await new Promise(r => setTimeout(r, 2000));

    // Capture accepted applicant state in the dossier!
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_applicant_accepted.png'), Buffer.from(shot3.data, 'base64'));
    console.log("Saved test_applicant_accepted.png");

    // Close dossier
    const closeDossierRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('button[data-testid="close-dossier"]');
        if (closeBtn) {
          closeBtn.click();
          return "Closed dossier";
        }
        return "Close dossier btn not found";
      })()`,
      returnByValue: true
    });
    console.log("Close dossier result:", closeDossierRes.result?.value);
    await new Promise(r => setTimeout(r, 1000));

    // 4. Open "Connect Form" modal
    console.log("4. Opening Connect Form modal...");
    const connectRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[data-testid="open-connect-form"]');
        if (btn) {
          btn.click();
          return "Clicked open-connect-form";
        }
        return "open-connect-form not found: " + Array.from(document.querySelectorAll('button')).map(b => b.getAttribute('data-testid') || b.textContent.trim()).join(' | ');
      })()`,
      returnByValue: true
    });
    console.log("Open connect form result:", connectRes.result?.value);
    await new Promise(r => setTimeout(r, 2000));

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_connect_form_modal.png'), Buffer.from(shot4.data, 'base64'));
    console.log("Saved test_connect_form_modal.png");

    // Close connect form modal
    const closeConnectRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('button[data-testid="close-connect"]');
        if (closeBtn) {
          closeBtn.click();
          return "Closed connect form";
        }
        return "Close connect btn not found";
      })()`,
      returnByValue: true
    });
    console.log("Close connect result:", closeConnectRes.result?.value);
    await new Promise(r => setTimeout(r, 1000));

    // 5. Open "Email Settings" modal
    console.log("5. Opening Email Settings modal...");
    const emailRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[data-testid="open-email-settings"]');
        if (btn) {
          btn.click();
          return "Clicked open-email-settings";
        }
        return "open-email-settings not found";
      })()`,
      returnByValue: true
    });
    console.log("Open email settings result:", emailRes.result?.value);
    await new Promise(r => setTimeout(r, 2000));

    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_email_settings_modal.png'), Buffer.from(shot5.data, 'base64'));
    console.log("Saved test_email_settings_modal.png");

    // Close email settings modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('button[data-testid="close-settings"]');
        if (closeBtn) closeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // 6. Direct Application modal test on homepage (?apply=true)
    console.log("6. Testing on-site application form (?apply=true)...");
    await send('Page.navigate', { url: 'http://localhost:4173/?apply=true' });
    await new Promise(r => setTimeout(r, 2500));

    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_apply_modal_direct.png'), Buffer.from(shot6.data, 'base64'));
    console.log("Saved test_apply_modal_direct.png");

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    chrome.kill();
    console.log("Verification finished.");
  }
}

run();
