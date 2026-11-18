// Genera el audio de cada lectura con una voz neuronal de Microsoft Edge (gratis, en línea).
// Uso: node herramientas/narrar_lecturas.mjs <voz> [velocidad]
//   voz: por ejemplo es-CR-MariaNeural · velocidad: "+0%", "-5%"…
// Requiere HYPERFRAMES_PYTHON apuntando al Python con edge-tts.
// Deja media/audio/<id>.mp3 y agrega "audio" a cada lectura en js/datos.js.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [voz, velocidad = "+0%"] = process.argv.slice(2);
if (!voz) { console.error("Falta la voz (ej. es-CR-MariaNeural)"); process.exit(1); }
const PY = process.env.HYPERFRAMES_PYTHON || "python";
const SALIDA = path.join(RAIZ, "media/audio");
const TMP = path.join(RAIZ, "tmp");
fs.mkdirSync(SALIDA, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const archivoDatos = path.join(RAIZ, "js/datos.js");
const fuente = fs.readFileSync(archivoDatos, "utf8");
const w = {};
new Function("window", fuente)(w);

for (const m of w.DATOS.modulos) for (const it of m.items) {
  if (it.tipo !== "lectura") continue;
  const texto = it.titulo + ".\n\n" + String(it.texto);
  const txt = path.join(TMP, it.id + ".txt");
  const mp3 = path.join(SALIDA, it.id + ".mp3");
  fs.writeFileSync(txt, texto, "utf8");
  execFileSync(PY, ["-m", "edge_tts", "--voice", voz, `--rate=${velocidad}`, "--file", txt, "--write-media", mp3], { stdio: "ignore" });
  it.audio = "media/audio/" + it.id + ".mp3";
  console.log(it.id, (fs.statSync(mp3).size / 1024).toFixed(0) + " KB");
}
fs.rmSync(TMP, { recursive: true, force: true });
fs.writeFileSync(archivoDatos, fuente.replace(/window\.DATOS = [\s\S]*;\s*$/, "window.DATOS = " + JSON.stringify(w.DATOS) + ";\n"), "utf8");
console.log("datos.js actualizado");
