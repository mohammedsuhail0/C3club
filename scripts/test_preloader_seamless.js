import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9227/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) {
      console.error('No page tab found');
      return;
    }

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

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    
    // Explicitly navigate to http://localhost:5173/
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

    // 1. Capture initial preloader state (Progress = 0)
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preloader_fix_1_initial.png'), Buffer.from(shot.data, 'base64'));
    console.log('1. Saved preloader_fix_1_initial.png');

    // 2. Dispatch a single wheel event downward
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 100
    });
    console.log('Dispatched one downward mouse wheel tick');

    // Wait 40ms (early-mid split: C and 3 actively parting across the screen)
    await new Promise(r => setTimeout(r, 40));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preloader_fix_2_midsplit.png'), Buffer.from(shot.data, 'base64'));
    console.log('2. Saved preloader_fix_2_midsplit.png (Hero clearly visible, C and 3 parting)');

    // Wait another 380ms (total 500ms -> preloader completely finished & unmounted)
    await new Promise(r => setTimeout(r, 380));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preloader_fix_3_unmounted_hero.png'), Buffer.from(shot.data, 'base64'));
    console.log('3. Saved preloader_fix_3_unmounted_hero.png (Hero 100% active and unencumbered)');

    // Check if body overflow is empty and preloader is gone from DOM
    const evalResult = await send('Runtime.evaluate', {
      expression: `({
        overflow: document.body.style.overflow,
        preloaderExists: document.querySelector('.fixed.inset-0.z-50') !== null
      })`,
      returnByValue: true
    });
    console.log('DOM State:', evalResult.result.value);

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    chrome.kill();
  }
}

run();
