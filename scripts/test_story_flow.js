import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9225/json');
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

    // Scrub past preloader
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

    // Shot 1: Monumental Hero
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
    await new Promise(r => setTimeout(r, 500));
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'story_1_hero.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved story_1_hero.png');

    // Shot 2: What is C3
    await send('Runtime.evaluate', {
      expression: `document.getElementById('about')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 700));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'story_2_what_is_c3.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved story_2_what_is_c3.png');

    // Shot 2b: Single Official College Logo Strip
    await send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 550, behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));
    const shot2b = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'story_2b_college_logo.png'), Buffer.from(shot2b.data, 'base64'));
    console.log('Saved story_2b_college_logo.png');

    // Shot 3: Events Week 1
    await send('Runtime.evaluate', {
      expression: `document.getElementById('events')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 700));
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'story_3_events.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved story_3_events.png');

    // Shot 4: Founding Pass Climax
    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 700));
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'story_4_founding_pass.png'), Buffer.from(shot4.data, 'base64'));
    console.log('Saved story_4_founding_pass.png');

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}

run();
