import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9229/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) return;

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
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1200));

    // Tick 1: Gentle wheel scroll
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 100
    });
    await new Promise(r => setTimeout(r, 180));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'scroll_step_1.png'), Buffer.from(shot.data, 'base64'));
    console.log('Step 1 captured (gentle scroll scrub)');

    // Tick 2: Second wheel tick (scrubbing further)
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 120
    });
    await new Promise(r => setTimeout(r, 180));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'scroll_step_2.png'), Buffer.from(shot.data, 'base64'));
    console.log('Step 2 captured (further split scrub, crisp hero)');

    // Tick 3: Finishing the scroll
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 120
    });
    await new Promise(r => setTimeout(r, 350));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'scroll_step_3_unmounted.png'), Buffer.from(shot.data, 'base64'));
    console.log('Step 3 captured (unmounted, native page unlocked)');

    const state = await send('Runtime.evaluate', {
      expression: `({
        overflow: document.body.style.overflow,
        preloaderExists: document.querySelector('.fixed.inset-0.z-50') !== null
      })`,
      returnByValue: true
    });
    console.log('Final State:', state.result.value);

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}

run();
