import fs from 'node:fs';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800);
  for (let i = 0; i < 30 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(40); }
  const codigo = fs.readFileSync(new URL('./modelo_niveles.js', import.meta.url), 'utf8');
  const res = [];
  for (const s of [11, 222, 3333, 44444, 555555]) { await ev(`window.SEMILLA=${s}`); res.push(await ev(codigo)); }
  // Media de las 5 semillas por nivel
  const ids = res[0].map((f) => f.id);
  log('nivel | enemigos | vida enem. | daño esperado | vida jug. (nv) | % de su vida | vida al salir | caídas (de 5 partidas)');
  for (const id of ids) {
    const fs_ = res.map((r) => r.find((f) => f.id === id)), m = (k) => (fs_.reduce((a, f) => a + f[k], 0) / fs_.length).toFixed(0), mn = (k) => Math.min(...fs_.map((f) => f[k])), mx = (k) => Math.max(...fs_.map((f) => f[k]));
    log(`${fs_[0].nivel} | ${m('enemigos')} (${mn('enemigos')}-${mx('enemigos')}) | ${m('vidaEnemigos')} | ${m('dano')} (${mn('dano')}-${mx('dano')}) | ${m('vidaJugador')} (nv ${m('nivelJ')}) | ${m('pct')} % (máx ${mx('pct')}) | ${m('resto')} | ${fs_.reduce((a, f) => a + f.cae, 0)}`);
  }
  log('tipos (semilla 11): ' + res[0].map((f) => f.nivel + ' ' + JSON.stringify(f.tipos)).join(' · '));
};
