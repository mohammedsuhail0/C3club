import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9223/json');
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
    await new Promise(r => setTimeout(r, 1000));

    // Scrub preloader
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

    // Reset scroll to top to capture PassHero
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 0);`
    });
    await new Promise(r => setTimeout(r, 500));

    // Shot 1: PassHero Centerpiece
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'lean_1_pass_hero.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved lean_1_pass_hero.png');

    // Scroll to Pass Studio
    await send('Runtime.evaluate', {
      expression: `document.getElementById('pass-studio')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));
    const shot1b = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'lean_1b_pass_studio.png'), Buffer.from(shot1b.data, 'base64'));
    console.log('Saved lean_1b_pass_studio.png');

    // Scroll to Events Week 1
    await send('Runtime.evaluate', {
      expression: `document.getElementById('events')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 700));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'lean_2_events.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved lean_2_events.png');

    // Scroll down slightly to show drawer and footer
    await send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 400, behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'lean_3_footer.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved lean_3_footer.png');

    ws.close();
  } catch (err) {
    console.error('Error during CDP run:', err);
  } finally {
    chrome.kill();
  }
}

run();
