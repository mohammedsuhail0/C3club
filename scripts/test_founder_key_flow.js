import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  console.log("Testing Founder Key flow...");
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9236',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9236/json');
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
    await send('Page.navigate', { url: 'http://localhost:4173/' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll through preloader
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: 300 });
    await new Promise(r => setTimeout(r, 400));
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: 300 });
    await new Promise(r => setTimeout(r, 800));

    // Scroll to Founding Pass
    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Locked State
    const lockedShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_pass_1_locked.png'), Buffer.from(lockedShot.data, 'base64'));
    console.log("Saved test_pass_1_locked.png");

    // 2. Test Invalid Key
    await send('Runtime.evaluate', {
      expression: `
        const input = document.querySelector('input[placeholder="C3-FND-8419"]');
        if (input) {
          input.value = 'INVALID-999';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 200));
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[type="submit"]')?.click();`
    });
    await new Promise(r => setTimeout(r, 400));

    const invalidError = await send('Runtime.evaluate', {
      expression: `document.querySelector('.text-rose-600')?.textContent`,
      returnByValue: true
    });
    console.log("Invalid key error message shown:", invalidError.result.value);

    // 3. Test Valid Key Unlock via URL auto-unlock or direct interaction
    await send('Page.navigate', { url: 'http://localhost:4173/?code=C3-FND-8419' });
    await new Promise(r => setTimeout(r, 1200));
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: 300 });
    await new Promise(r => setTimeout(r, 400));
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: 300 });
    await new Promise(r => setTimeout(r, 800));
    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Unlocked State
    const unlockedShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_pass_2_unlocked.png'), Buffer.from(unlockedShot.data, 'base64'));
    console.log("Saved test_pass_2_unlocked.png");

    // 4. Test Custom Builder Role
    await send('Runtime.evaluate', {
      expression: `
        const selects = document.querySelectorAll('select');
        const roleSelect = Array.from(selects).find(s => Array.from(s.options).some(o => o.value === 'custom'));
        if (roleSelect) {
          const nativeSelectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          nativeSelectSetter.call(roleSelect, 'custom');
          roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', {
      expression: `
        const customInput = document.querySelector('input[placeholder*="custom role"]');
        if (customInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(customInput, 'Autonomous AI Agent Architect');
          customInput.dispatchEvent(new Event('input', { bubbles: true }));
          customInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const customRoleShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_pass_3_custom_role.png'), Buffer.from(customRoleShot.data, 'base64'));
    console.log("Saved test_pass_3_custom_role.png");
    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const urlAutoUnlockShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'test_pass_4_url_auto_unlock.png'), Buffer.from(urlAutoUnlockShot.data, 'base64'));
    console.log("Saved test_pass_4_url_auto_unlock.png");

    ws.close();
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    chrome.kill();
    console.log("Test finished.");
  }
}

run();
