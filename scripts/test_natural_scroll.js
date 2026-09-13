import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function testNaturalScroll() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1440,1000',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9222/json');
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
    await new Promise(r => setTimeout(r, 1000));

    console.log('Phase 1: Scrubbing preloader with mouse wheel...');
    for (let i = 0; i < 15; i++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 720,
        y: 500,
        deltaX: 0,
        deltaY: 200
      });
      await new Promise(r => setTimeout(r, 50));
    }

    await new Promise(r => setTimeout(r, 600));

    console.log('Phase 2: Sending natural scroll wheel events to scroll past the Hero...');
    for (let i = 0; i < 6; i++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 720,
        y: 500,
        deltaX: 0,
        deltaY: 250
      });
      await new Promise(r => setTimeout(r, 60));
    }

    await new Promise(r => setTimeout(r, 800));

    // Check window.scrollY
    const scrollYResult = await send('Runtime.evaluate', {
      expression: 'window.scrollY'
    });
    console.log('window.scrollY after wheel scrolling:', scrollYResult.result?.value);

    // Capture screenshot of scrolled position
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'scrolled_past_hero.png'), Buffer.from(shot.data, 'base64'));
    console.log('Screenshot saved to scrolled_past_hero.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

testNaturalScroll();
