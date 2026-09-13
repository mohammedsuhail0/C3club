import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactDir = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d";

async function run() {
  console.log("Launching headless Chrome with Mobile viewport (390x844)...");
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--disable-gpu',
    '--window-size=390,844',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9230/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) {
      console.error("No page tab found");
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    await send('Page.navigate', { url: 'http://localhost:4173/' });
    await new Promise(r => setTimeout(r, 1500));

    // Capture 1: Preloader on Mobile
    const preloaderShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_1_preloader.png'), Buffer.from(preloaderShot.data, 'base64'));
    console.log("Saved mobile_1_preloader.png");

    // Perform tap to skip / swipe to unlock
    await send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));`
    });
    await new Promise(r => setTimeout(r, 900));

    // Capture 2: Hero Section on Mobile
    const heroShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_2_hero.png'), Buffer.from(heroShot.data, 'base64'));
    console.log("Saved mobile_2_hero.png");

    // Check horizontal scroll overflow
    const overflowCheck = await send('Runtime.evaluate', {
      expression: `({
        windowWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      })`,
      returnByValue: true
    });
    console.log("Overflow check:", overflowCheck.result.value);

    // Scroll down to What is C3
    await send('Runtime.evaluate', {
      expression: `document.getElementById('about')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const aboutShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_3_what_is_c3.png'), Buffer.from(aboutShot.data, 'base64'));
    console.log("Saved mobile_3_what_is_c3.png");

    // Scroll to Accreditation Strip
    await send('Runtime.evaluate', {
      expression: `document.querySelector('img[alt*="Accreditation"]')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const accredShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_3b_accreditation.png'), Buffer.from(accredShot.data, 'base64'));
    console.log("Saved mobile_3b_accreditation.png");

    // Scroll down to Events
    await send('Runtime.evaluate', {
      expression: `document.getElementById('events')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const eventsShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_4_events.png'), Buffer.from(eventsShot.data, 'base64'));
    console.log("Saved mobile_4_events.png");

    // Scroll down to Founding Pass Form
    await send('Runtime.evaluate', {
      expression: `document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 700));

    const passShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_5_pass.png'), Buffer.from(passShot.data, 'base64'));
    console.log("Saved mobile_5_pass.png");

    // Scroll down directly to the 3D Pass Ticket Card
    await send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 680);`
    });
    await new Promise(r => setTimeout(r, 700));

    const ticketShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_6_ticket_card.png'), Buffer.from(ticketShot.data, 'base64'));
    console.log("Saved mobile_6_ticket_card.png");

    ws.close();
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    chrome.kill();
    console.log("Test finished.");
  }
}

run();
