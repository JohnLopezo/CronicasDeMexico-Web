// Sirve el juego en la red local para abrirlo en el celular.
// Uso:  node servir-en-red.mjs            (puerto 8080)   ·   node servir-en-red.mjs 9000
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2]) || 8080;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

createServer(async (req, res) => {
  let ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = normalize(join(dir, ruta));
  const tipo = TIPOS[extname(archivo)];
  // Solo index.html, js/, datos/ y arte/ de esta carpeta (nada de los .mjs ni fuera de ella).
  const rel = archivo.startsWith(dir + sep) ? archivo.slice(dir.length + 1).split(sep).join('/') : '';
  if (!tipo || !/^(index\.html|(js|datos|arte)\/)/.test(rel)) { res.writeHead(404).end('No encontrado'); return; }
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' }).end(datos);
  } catch { res.writeHead(404).end('No encontrado'); }
}).listen(port, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log(`Crónicas de México (HTML) en el puerto ${port}. Abre en el celular:`);
  for (const ip of ips) console.log(`  http://${ip}:${port}/`);
  console.log('Ctrl + C para cerrar.');
});
