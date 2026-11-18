// Genera js/datos.js para la plataforma a partir del sitio del curso y de las carpetas de video.
// Uso: node herramientas/generar_datos.mjs <carpeta del sitio curso-etica-web> <carpeta Videos>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [SITIO, VIDEOS] = process.argv.slice(2).map((p) => path.resolve(p));
if (!SITIO || !VIDEOS) { console.error("Uso: node herramientas/generar_datos.mjs <curso-etica-web> <Videos>"); process.exit(1); }

const w = {};
new Function("window", fs.readFileSync(path.join(SITIO, "js/curso.js"), "utf8"))(w);
new Function("window", fs.readFileSync(path.join(SITIO, "js/transcripciones.js"), "utf8"))(w);
const C = w.CURSO, T = w.TRANSCRIPCIONES;
const paso = (id) => { for (const s of C.secciones) for (const p of s.pasos) if (p.id === id) return p; throw new Error("No existe " + id); };

// Carpeta de cada video (para las palabras con tiempo de la narración)
const CARPETA = {
  intro: "intro-etica", "m1-v1": "modulo-1-video-1", "m1-v2": "modulo-1-video-2",
  "m2-v1": "modulo-2-video-1", "m2-v2": "modulo-2-video-2", "m2-v3": "modulo-2-video-3",
  "m3-v1": "modulo-3-video-1", "m3-v2": "modulo-3-video-2",
};
function palabras(id) {
  if (!CARPETA[id]) return null;
  const f = path.join(VIDEOS, CARPETA[id], "assets/audio/palabras.json");
  return JSON.parse(fs.readFileSync(f, "utf8")).map((x) => [x.text, Math.round(x.start * 100) / 100]);
}
function video(id, ejercicio, extra) {
  const p = paso(id);
  const v = { tipo: "video", id, titulo: p.titulo };
  if (p.fuentes) {
    v.fuentes = { h: p.fuentes.horizontal, v: p.fuentes.vertical };
    v.portadas = { h: p.portadas.horizontal, v: p.portadas.vertical };
  } else {
    v.fuentes = { h: p.fuente, v: p.fuente };
    v.portadas = { h: p.portada, v: p.portada };
    v.subtitulos = p.subtitulos;
  }
  v.palabras = palabras(id);
  if (!v.palabras) v.parrafos = T[id] || [];
  if (ejercicio) v.ejercicio = ejercicio;
  return Object.assign(v, extra || {});
}
// Convierte una pregunta del sitio en un ejercicio de la plataforma
function ejercicio(id) {
  const p = JSON.parse(JSON.stringify(paso(id)));
  if (p.tipo === "parejas") p.tipo = "lineas"; // unir trazando una línea
  delete p.verEnVideo;
  return p;
}
const lectura = (id) => { const p = paso(id); return { tipo: "lectura", id, titulo: p.titulo, texto: p.texto, fuente: p.fuente }; };
const gema = (id) => { const p = paso(id); return { tipo: "gema", id, etiqueta: p.etiqueta, titulo: p.titulo, texto: p.texto, url: p.url, boton: p.boton }; };
const momento = (id) => { const p = paso(id); return p.verEnVideo ? { video: p.verEnVideo.paso, t: p.verEnVideo.t } : null; };
const objetivo = (sid) => C.secciones.find((s) => s.id === sid).pasos.find((p) => p.tipo === "portada").texto;

const DATOS = {
  titulo: "Curso de Ética Profesional",
  institucion: "Colegio de Ciencias Económicas de Costa Rica",
  clave: "plataforma-etica-v1",
  modulos: [
    {
      id: "m0", numero: "0", titulo: "Bienvenida",
      objetivo: "Conoce los tres ejes del curso y cómo vas a aprender.",
      items: [
        video("intro", {
          tipo: "ordenar", id: "intro-ej",
          pregunta: "¿En qué orden se presentan los tres ejes del curso?",
          instruccion: "Arrastra los ejes a su lugar.",
          items: ["Ética social", "Ética ambiental", "Ética profesional"],
        }),
      ],
    },
    {
      id: "m1", numero: "1", titulo: "Ética Social", objetivo: objetivo("s51"),
      items: [
        video("m1-v1", ejercicio("m1-p1")),
        lectura("m1-l1"),
        video("m1-v2", ejercicio("m1-p2")),
        lectura("m1-l2"),
        video("tolerancia", {
          tipo: "oracion", id: "tolerancia-ej",
          pregunta: "Arma la frase del video",
          respuesta: "La comprensión y la tolerancia es la base de cualquier relación",
        }),
        { tipo: "practica", id: "m1-practica", titulo: "Práctica · El informe con un error", caso: "m1" },
        gema("m1-eval"),
      ],
      momentos: [momento("m1-p1"), momento("m1-p2")],
    },
    {
      id: "m2", numero: "2", titulo: "Ética Ambiental", objetivo: objetivo("s52"),
      items: [
        video("m2-v1", ejercicio("m2-p1")),
        lectura("m2-l1"),
        video("m2-v2", ejercicio("m2-p2")),
        lectura("m2-l2"),
        video("m2-v3", ejercicio("m2-p3")),
        lectura("m2-l3"),
        { tipo: "practica", id: "m2-practica", titulo: "Práctica · El anuncio verde", caso: "m2" },
        gema("m2-foro"),
        gema("m2-eval"),
      ],
      momentos: [momento("m2-p1"), momento("m2-p2"), momento("m2-p3")],
    },
    {
      id: "m3", numero: "3", titulo: "Ética en la Carrera Profesional", objetivo: objetivo("s53"),
      items: [
        video("m3-v1", ejercicio("m3-p1")),
        { tipo: "mapa", id: "m3-mapa", titulo: "Descubre tu Colegio: sedes y beneficios", src: "mapa/index.html" },
        lectura("m3-deberes"),
        video("m3-v2", ejercicio("m3-p2")),
        lectura("m3-l2"),
        video("testimonio", {
          tipo: "oracion", id: "testimonio-ej",
          pregunta: "Arma la idea del testimonio",
          respuesta: "El colegio marca una diferencia en las oportunidades laborales",
        }),
        { tipo: "practica", id: "m3-practica", titulo: "Práctica · La cifra del competidor", caso: "m3" },
        gema("m3-eval"),
      ],
      momentos: [momento("m3-p1"), momento("m3-p2")],
    },
    {
      id: "m4", numero: "✓", titulo: "Cierre",
      objetivo: "Cuéntanos cómo te fue en el curso.",
      items: [gema("encuesta")],
    },
  ],
};

fs.writeFileSync(path.join(RAIZ, "js/datos.js"),
  "// Datos del curso (generado por herramientas/generar_datos.mjs a partir del sitio del curso).\nwindow.DATOS = " + JSON.stringify(DATOS) + ";\n", "utf8");
const n = DATOS.modulos.reduce((a, m) => a + m.items.length, 0);
console.log(`datos.js: ${DATOS.modulos.length} módulos, ${n} elementos`);
