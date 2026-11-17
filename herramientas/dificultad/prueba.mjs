// Arnés de las pruebas de dificultad (DIFICULTAD.md): abre el juego en Chrome sin ventana por el protocolo de DevTools y
// ejecuta un guion. Uso: node herramientas/dificultad/prueba.mjs <url del index.html> <carpeta de salida> <guion.mjs>
// El guion exporta por defecto async ({ cmd, ev, foto, tecla, espera, log }) => {…}.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , url, salida, pasosArchivo] = process.argv;
mkdirSync(salida, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=9333',
  '--window-size=844,390', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${join(salida, 'perfil')}`, 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = {}; const logs = []; const _push = logs.push.bind(logs); logs.push = (s) => { console.error(s); return _push(s); };
for (let i = 0; i < 40 && !ws; i++) {
  await espera(250);
  try { const t = await (await fetch('http://127.0.0.1:9333/json')).json(); const p = t.find((x) => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
}
console.error("ws", !!ws); await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; }
  if (d.method === 'Runtime.consoleAPICalled') logs.push(`[${d.params.type}] ` + d.params.args.map((a) => a.value ?? a.description).join(' '));
  if (d.method === 'Runtime.exceptionThrown') logs.push('[EXCEPCIÓN] ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  if (d.method === 'Log.entryAdded') logs.push(`[log ${d.params.entry.level}] ${d.params.entry.text} ${d.params.entry.url || ''}`);
});
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result?.result?.value ?? r.result?.exceptionDetails?.exception?.description; };
console.error("abierto"); await cmd("Runtime.enable"); await cmd('Log.enable'); await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: false });
await cmd('Page.navigate', { url }); await espera(1500);
const foto = async (n) => { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(salida, n + '.png'), Buffer.from(r.result.data, 'base64')); };
const tecla = (k, ms = 0) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)}})); new Promise(r=>setTimeout(()=>{dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(k)}}));r()},${ms}))`);
console.error("navegado"); const pasos = (await import(pathToFileURL(resolve(pasosArchivo)).href)).default;
console.error('pasos'); await pasos({ cmd, ev, foto, tecla, espera, log: (s) => logs.push('[prueba] ' + s) });
writeFileSync(join(salida, 'consola.txt'), logs.join('\n'));
console.log(logs.join('\n'));
ws.close(); chrome.kill();
