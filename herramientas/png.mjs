// PNG mínimo (8 bits, RGB o RGBA, sin entrelazar): leer y escribir.
import fs from 'node:fs'; import zlib from 'node:zlib';
export function leer(ruta) {
  const b = fs.readFileSync(ruta); let p = 8, w, h, tipo, idat = [];
  while (p < b.length) { const n = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); tipo = d[9]; if (d[8] !== 8 || d[12]) throw new Error('PNG no soportado'); }
    if (t === 'IDAT') idat.push(d); p += 12 + n; }
  const c = tipo === 6 ? 4 : tipo === 2 ? 3 : (() => { throw new Error('tipo ' + tipo); })();
  const raw = zlib.inflateSync(Buffer.concat(idat)), out = Buffer.alloc(w * h * 4), fila = w * c, prev = Buffer.alloc(fila), cur = Buffer.alloc(fila);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (fila + 1)]; raw.copy(cur, 0, y * (fila + 1) + 1, (y + 1) * (fila + 1));
    for (let i = 0; i < fila; i++) { const a = i >= c ? cur[i - c] : 0, u = prev[i], ul = i >= c ? prev[i - c] : 0;
      let v = cur[i];
      if (f === 1) v += a; else if (f === 2) v += u; else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) { const q = a + u - ul, pa = Math.abs(q - a), pb = Math.abs(q - u), pc = Math.abs(q - ul); v += pa <= pb && pa <= pc ? a : pb <= pc ? u : ul; }
      cur[i] = v & 255; }
    for (let x = 0; x < w; x++) { out[(y * w + x) * 4] = cur[x * c]; out[(y * w + x) * 4 + 1] = cur[x * c + 1]; out[(y * w + x) * 4 + 2] = cur[x * c + 2]; out[(y * w + x) * 4 + 3] = c === 4 ? cur[x * c + 3] : 255; }
    cur.copy(prev);
  }
  return { w, h, px: out };
}
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (buf) => { let c = -1; for (const x of buf) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const trozo = (t, d) => { const n = Buffer.alloc(4); n.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'ascii'), d]); const k = Buffer.alloc(4); k.writeUInt32BE(crc(td)); return Buffer.concat([n, td, k]); };
export function escribir(ruta, { w, h, px }) {
  const raw = Buffer.alloc(h * (w * 4 + 1)); for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  fs.writeFileSync(ruta, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ih), trozo('IDAT', zlib.deflateSync(raw)), trozo('IEND', Buffer.alloc(0))]));
}
export function recorte(im, x0, y0, w, h, escala = 1) {
  const W = w * escala, H = h * escala, px = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) im.px.copy(px, (y * W + x) * 4, ((y0 + Math.floor(y / escala)) * im.w + x0 + Math.floor(x / escala)) * 4, ((y0 + Math.floor(y / escala)) * im.w + x0 + Math.floor(x / escala)) * 4 + 4);
  return { w: W, h: H, px };
}
