import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9235',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9235/json');
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
    await new Promise(r => setTimeout(r, 1500));

    // Test 1: Click anywhere on screen (should NOT dismiss!)
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 720,
      y: 450,
      button: 'left',
      clickCount: 1
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 720,
      y: 450,
      button: 'left'
    });
    await new Promise(r => setTimeout(r, 400));

    // Check if preloader is still active
    const checkAfterClick = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('img[alt*="C3 Monogram - C"]'))`,
      returnByValue: true
    });
    console.log("Preloader still present after click (should be true):", checkAfterClick.result.value);

    // Test 2: Now do genuine wheel scroll
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 300
    });
    await new Promise(r => setTimeout(r, 600));

    // Wheel scroll again to complete
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 300
    });
    await new Promise(r => setTimeout(r, 800));

    const checkAfterScroll = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('img[alt*="C3 Monogram - C"]'))`,
      returnByValue: true
    });
    console.log("Preloader unmounted after scroll (should be false):", checkAfterScroll.result.value);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'scroll_verified_hero.png'), Buffer.from(shot.data, 'base64'));
    console.log("Saved scroll_verified_hero.png");

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}

run();
