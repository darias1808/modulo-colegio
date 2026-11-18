// Crea subtítulos WebVTT para cada video a partir de las palabras con tiempo de su narración (js/datos.js).
// Uso: node herramientas/subtitulos.mjs
// Deja media/subtitulos/<id>.vtt. Después hay que volver a correr generar_datos.mjs para enlazarlos.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const w = {};
new Function("window", fs.readFileSync(path.join(RAIZ, "js/datos.js"), "utf8"))(w);
const SALIDA = path.join(RAIZ, "media/subtitulos");
fs.mkdirSync(SALIDA, { recursive: true });

const LINEA = 38;      // caracteres por línea
const MAX = LINEA * 2; // dos líneas por subtítulo
const reloj = (t) => {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(ms % 1000).padStart(3, "0");
};
// Parte el texto en dos líneas lo más parejas posible
function dosLineas(txt) {
  if (txt.length <= LINEA) return txt;
  const pal = txt.split(" ");
  let mejor = txt, dif = Infinity;
  for (let i = 1; i < pal.length; i++) {
    const a = pal.slice(0, i).join(" "), b = pal.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (a.length <= LINEA + 6 && b.length <= LINEA + 6 && d < dif) { dif = d; mejor = a + "\n" + b; }
  }
  return mejor;
}

for (const m of w.DATOS.modulos) for (const it of m.items) {
  if (it.tipo !== "video" || !it.palabras) continue;
  const P = it.palabras;
  const cues = [];
  let grupo = [];
  const cerrar = (fin) => {
    if (!grupo.length) return;
    cues.push({ ini: grupo[0][1], fin, txt: grupo.map((x) => x[0]).join(" ") });
    grupo = [];
  };
  P.forEach((p, i) => {
    const sig = P[i + 1];
    grupo.push(p);
    const txt = grupo.map((x) => x[0]).join(" ");
    const largoSig = sig ? txt.length + 1 + sig[0].length : 0;
    const pausa = sig ? sig[1] - p[1] : 0;
    const finFrase = /[.?!…:]$/.test(p[0]);
    const coma = /[,;]$/.test(p[0]);
    if (!sig || finFrase || largoSig > MAX || pausa > 1.2 || (coma && txt.length > LINEA)) {
      // el subtítulo dura hasta la palabra siguiente, sin pasar de 0,8 s después de la última palabra
      const fin = sig ? Math.min(sig[1], p[1] + Math.max(0.8, Math.min(pausa, 1.5))) : p[1] + 1.2;
      cerrar(fin);
    }
  });
  const vtt = "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${reloj(c.ini)} --> ${reloj(Math.max(c.fin, c.ini + 0.6))}\n${dosLineas(c.txt)}\n`).join("\n");
  fs.writeFileSync(path.join(SALIDA, it.id + ".vtt"), vtt, "utf8");
  console.log(it.id, cues.length, "subtítulos");
}
