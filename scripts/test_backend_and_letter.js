import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  console.log("Testing Acceptance Letter & Backend Integration...");
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9245',
    '--disable-gpu',
    '--window-size=1440,1050',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9245/json');
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
    // 1. Direct navigation to Syed Noor Ullah's Acceptance Letter
    console.log("Navigating to http://localhost:4173/?letter=ZZRF ...");
    await send('Page.navigate', { url: 'http://localhost:4173/?letter=ZZRF' });
    await new Promise(r => setTimeout(r, 2500));

    const checkLetter = await send('Runtime.evaluate', {
      expression: `({
        bodyText: document.body.innerText.substring(0, 300),
        hasNotice: document.body.innerText.includes('OFFICIAL NOTICE OF ADMISSION'),
        hasSyed: document.body.innerText.includes('Syed Noor Ullah'),
        hasKey: document.body.innerText.includes('ZZRF')
      })`,
      returnByValue: true
    });
    console.log("Letter check:", checkLetter.result.value);

    const letterShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_letter_syed_noor_ullah.png'), Buffer.from(letterShot.data, 'base64'));
    console.log("Saved test_letter_syed_noor_ullah.png");

    // 2. Click "Claim & Customize 3D Pass"
    console.log("Clicking 'Claim & Customize 3D Pass'...");
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Claim & Customize'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 1000));

    const passPrefilledShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_pass_prefilled_syed.png'), Buffer.from(passPrefilledShot.data, 'base64'));
    console.log("Saved test_pass_prefilled_syed.png");

    // 3. Test Organizer Command Center
    console.log("Navigating to http://localhost:4173/?admin=c3core ...");
    await send('Page.navigate', { url: 'http://localhost:4173/?admin=c3core' });
    await new Promise(r => setTimeout(r, 2500));

    const checkAdmin = await send('Runtime.evaluate', {
      expression: `({
        hasCommandCenter: document.body.innerText.includes('C3 Organizer Command Center'),
        hasApplicants: document.body.innerText.includes('Total Applicants'),
        hasSyed: document.body.innerText.includes('Syed Noor Ullah'),
        hasZZRF: document.body.innerText.includes('ZZRF'),
        hasEVKH: document.body.innerText.includes('EVKH')
      })`,
      returnByValue: true
    });
    console.log("Admin check:", checkAdmin.result.value);

    const adminShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_admin_portal.png'), Buffer.from(adminShot.data, 'base64'));
    console.log("Saved test_admin_portal.png");

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    chrome.kill();
    console.log("Verification finished.");
  }
}

run();
