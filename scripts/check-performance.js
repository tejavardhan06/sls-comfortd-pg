const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('assert');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless', '--no-first-run', '--disable-extensions', '--remote-debugging-port=9227',
  `--user-data-dir=${path.resolve('.browser-check')}`, 'about:blank'
], { windowsHide:true, stdio:'ignore' });
(async () => {
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9227/json')).json(); break; } catch { await sleep(200); }
  }
  assert(targets, 'Browser started');
  const ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once:true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  const requests = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const job = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) job.reject(message.error); else job.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue:true, awaitPromise:true, userGesture:true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width:390, height:844, deviceScaleFactor:1, mobile:true });
  await send('Emulation.setTouchEmulationEnabled', { enabled:true });
  await send('Page.navigate', { url:pathToFileURL(path.resolve('index.html')).href });
  await sleep(2000);
  assert.equal(await evaluate("document.querySelectorAll('.room-card-container').length"), 3);
  assert.equal(await evaluate("document.querySelectorAll('.video-poster').length"), 0);
  assert(await evaluate("[...document.querySelectorAll('.interactive-hover-video')].every(video => video.controls && !video.hasAttribute('poster') && video.querySelector('source').getAttribute('src').startsWith('media/'))"), 'Native controls and direct sources, no posters');
  assert.equal(requests.filter(url => /\.mp4$/.test(url)).length, 0, 'No mobile video downloads before interaction');
  assert(await evaluate("document.getElementById('heroPoster').naturalWidth > 0"), 'Hero thumbnail loads');
  await evaluate("document.querySelector('[data-tab=double]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.room-card-container').length"), 4);
  assert(await evaluate("[...document.querySelectorAll('.room-photo-img')].every(img => img.src.includes('/media/'))"), 'Available images optimized');
  await evaluate("document.querySelector('.hover-video-card').scrollIntoView({behavior:'instant'})");
  await sleep(300);
  await evaluate("document.querySelector('.interactive-hover-video').play()");
  await sleep(1000);
  assert(await evaluate("document.querySelector('.interactive-hover-video').currentTime > 0"), 'Original tour plays on mobile');
  await evaluate("document.querySelector('.interactive-hover-video').dispatchEvent(new Event('waiting'))");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.interactive-hover-video')).opacity"), '1', 'Player remains visible while buffering');
  await evaluate("document.querySelector('.interactive-hover-video').pause()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.interactive-hover-video')).opacity"), '1', 'Player controls remain visible when paused');
  for (let i = 1; i < 6; i++) {
    await evaluate(`document.querySelectorAll('.interactive-hover-video')[${i}].play()`);
    await sleep(250);
    assert(await evaluate(`document.querySelectorAll('.interactive-hover-video')[${i}].videoWidth > 0`), 'Tour decodes on mobile');
  }
  const screenshot = await send('Page.captureScreenshot', { format:'png' });
  fs.writeFileSync('.browser-check/mobile.png', Buffer.from(screenshot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width:1440, height:1000, deviceScaleFactor:1, mobile:false });
  await send('Emulation.setTouchEmulationEnabled', { enabled:false });
  await send('Emulation.setEmulatedMedia', { features:[{ name:'prefers-reduced-motion', value:'reduce' }] });
  await send('Page.reload');
  await sleep(1200);
  assert(await evaluate("document.getElementById('heroVideo').paused"), 'Reduced motion pauses hero');
  assert.equal(await evaluate("document.querySelectorAll('.room-hover-video').length"), 0, 'Missing room videos omitted');
  await send('Emulation.setEmulatedMedia', { features:[{ name:'prefers-reduced-motion', value:'no-preference' }] });
  await evaluate("document.getElementById('home').scrollIntoView({behavior:'instant'})");
  await sleep(300);
  await evaluate("playVideo(document.getElementById('heroVideo'))");
  for (let i = 0; i < 30; i++) {
    if (await evaluate("document.getElementById('heroVideo').classList.contains('has-frame')")) break;
    await sleep(200);
  }
  assert(await evaluate("document.getElementById('heroVideo').classList.contains('has-frame')"), 'Hero plays original video');
  assert(await evaluate("document.getElementById('heroPoster').hidden"), 'Hero thumbnail hidden during playback');
  assert.equal(await evaluate("getComputedStyle(document.getElementById('heroVideo')).opacity"), '1', 'Hero fully opaque');
  assert.equal(errors.length, 0, 'No runtime exceptions');
  console.log('PASS: six mobile tour videos decode, native controls visible during pause/buffering, no tour thumbnails, no initial video downloads, room tabs, hero playback, reduced motion, no runtime exceptions.');
  ws.close();
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser.kill());
