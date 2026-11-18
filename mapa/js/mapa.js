/*
  «Descubre tu Colegio»: mapa isométrico de Costa Rica (SCORM 1.2).
  - Cada sede es un edificio en el mapa y cada beneficio una isla en el mar.
  - Al tocar uno se abre una tarjeta y la voz de María lee el texto, resaltando la frase que va diciendo.
  - Se completa al descubrir todos los grupos (las sedes regionales cuentan como uno, igual que las oficinas).
  - Funciona también fuera de un LMS (guarda el avance en el navegador).
*/
(function () {
  "use strict";
  var M = MAPA, G = GEOMETRIA, TI = window.TIEMPOS || {};
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return document.getElementById(id); };
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var svg = $("mapa");

  // ---------- Qué hay que descubrir ----------
  // Las sedes regionales y las oficinas son un solo descubrimiento cada una: sus edificios abren la misma tarjeta
  var items = [], deLugar = {};
  M.lugares.forEach(function (l) {
    var g = M.grupos[l.grupo];
    if (g) {
      if (!deLugar[l.grupo]) {
        var it = { id: l.grupo, clave: l.grupo, grupo: l.grupo, tipo: l.tipo, titulo: g.titulo, subtitulo: g.subtitulo, texto: g.texto };
        items.push(it);
        deLugar[l.grupo] = it;
      }
      deLugar[l.id] = deLugar[l.grupo];
    } else {
      deLugar[l.id] = { id: l.id, clave: l.id, grupo: l.grupo, tipo: l.tipo, titulo: l.titulo, subtitulo: l.subtitulo, texto: l.texto };
      items.push(deLugar[l.id]);
    }
  });
  M.beneficios.forEach(function (b) {
    items.push({ id: b.id, clave: b.id, grupo: b.id, tipo: "beneficio", titulo: b.titulo, subtitulo: "Beneficio en todo el país", texto: b.texto, icono: b.icono });
  });
  var grupos = [];
  items.forEach(function (it) { if (grupos.indexOf(it.grupo) < 0) grupos.push(it.grupo); });

  // ---------- Avance: SCORM o, fuera de un LMS, el navegador ----------
  var st = { vis: {}, fin: false };
  var hayLms = Scorm.iniciar();
  function cargar() {
    var d = hayLms ? Scorm.leer("cmi.suspend_data") : (function () { try { return localStorage.getItem(M.id); } catch (e) { return null; } })();
    if (!d) return;
    try { var o = JSON.parse(d); st.vis = o.vis || {}; st.fin = !!o.fin; } catch (e) {}
  }
  function guardar() {
    var d = JSON.stringify(st);
    if (hayLms) { Scorm.escribir("cmi.suspend_data", d); Scorm.guardar(); }
    else { try { localStorage.setItem(M.id, d); } catch (e) {} }
  }
  cargar();
  if (hayLms) {
    var estado = Scorm.leer("cmi.core.lesson_status");
    if (estado === "completed" || estado === "passed") st.fin = true;
    else if (estado === "" || estado === "not attempted") { Scorm.escribir("cmi.core.lesson_status", "incomplete"); Scorm.guardar(); }
  }
  var inicio = Date.now();
  function salir() {
    if (!hayLms || salir.hecho) return;
    salir.hecho = true;
    var s = Math.round((Date.now() - inicio) / 1000);
    var p = function (x, n) { x = String(x); while (x.length < n) x = "0" + x; return x; };
    Scorm.escribir("cmi.core.session_time", p(Math.floor(s / 3600), 4) + ":" + p(Math.floor((s % 3600) / 60), 2) + ":" + p(s % 60, 2));
    Scorm.escribir("cmi.core.exit", st.fin ? "" : "suspend");
    guardar();
    Scorm.terminar();
  }
  window.addEventListener("pagehide", salir);
  window.addEventListener("beforeunload", salir);

  // ---------- Utilidades SVG ----------
  function n(tag, at, padre) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function poli(pts) { return pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function anunciar(t) { var v = $("vivo"); v.textContent = ""; setTimeout(function () { v.textContent = t; }, 50); }

  // Caja isométrica: base centrada en (cx, cy), lado s, alto h
  function caja(g, cx, cy, s, h, tapa, izq, der) {
    var a = s * 0.866, b = s * 0.5;
    n("polygon", { points: poli([[cx - a, cy], [cx, cy + b], [cx, cy + b - h], [cx - a, cy - h]]), fill: izq, stroke: "#18171f", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
    n("polygon", { points: poli([[cx, cy + b], [cx + a, cy], [cx + a, cy - h], [cx, cy + b - h]]), fill: der, stroke: "#18171f", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
    n("polygon", { points: poli([[cx, cy - b - h], [cx + a, cy - h], [cx, cy + b - h], [cx - a, cy - h]]), fill: tapa, stroke: "#18171f", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
    // ventanas
    for (var f = 1; f * 9 < h - 4; f++) {
      var y = cy + b - h + f * 9;
      n("line", { x1: cx + a * 0.25, y1: y - b * 0.25 - 2, x2: cx + a * 0.75, y2: y - b * 0.75 - 2, stroke: "#f6e1b5", "stroke-width": 2.2, "stroke-linecap": "round" }, g);
    }
  }
  function edificio(g, tipo, x, y) {
    if (tipo === "central") {
      caja(g, x, y, 22, 34, "#d0952a", "#1b376c", "#24488c");
      n("line", { x1: x, y1: y - 45, x2: x, y2: y - 62, stroke: "#18171f", "stroke-width": 2 }, g);
      n("polygon", { points: poli([[x, y - 62], [x + 13, y - 57.5], [x, y - 53]]), fill: "#d0952a", stroke: "#18171f", "stroke-width": 1.4 }, g);
      return 62;
    }
    if (tipo === "recreo") {
      n("polygon", { points: poli([[x - 26, y], [x, y + 15], [x + 26, y], [x, y - 15]]), fill: "#7fc4e8", stroke: "#18171f", "stroke-width": 1.6 }, g);
      n("polygon", { points: poli([[x - 18, y], [x, y + 10], [x + 18, y], [x, y - 10]]), fill: "#a9dcf3" }, g);
      [[-22, -12], [22, -10]].forEach(function (d) {
        n("rect", { x: x + d[0] - 2, y: y + d[1] - 18, width: 4, height: 18, fill: "#7a4b1c", stroke: "#18171f", "stroke-width": 1.2 }, g);
        n("circle", { cx: x + d[0], cy: y + d[1] - 22, r: 10, fill: "#3e8e41", stroke: "#18171f", "stroke-width": 1.6 }, g);
      });
      return 40;
    }
    if (tipo === "regional") { caja(g, x, y, 18, 24, "#d0952a", "#1b376c", "#24488c"); return 38; }
    caja(g, x, y, 14, 14, "#d0952a", "#1b376c", "#24488c");
    return 26;
  }
  function etiqueta(g, x, y, texto) {
    var e = n("g", { class: "etq" }, g);
    var w = texto.length * 7 + 16;
    n("rect", { x: x - w / 2, y: y - 22, width: w, height: 20, rx: 3 }, e);
    var t = n("text", { x: x, y: y - 8, "text-anchor": "middle" }, e);
    t.textContent = texto;
    return e;
  }
  function insignia(g, x, y) {
    var c = n("g", { class: "check", "aria-hidden": "true" }, g);
    n("circle", { cx: x, cy: y, r: 9 }, c);
    n("path", { d: "M" + (x - 4) + "," + y + " l3,3 l5,-6" }, c);
  }

  // ---------- Dibujo del mapa ----------
  var nodos = {};
  function dibujar() {
    var vista = window.innerWidth >= window.innerHeight ? "h" : "v";
    if (dibujar.vista === vista) return;
    dibujar.vista = vista;
    var V = G[vista];
    svg.textContent = "";
    svg.setAttribute("viewBox", "0 0 " + V.ancho + " " + V.alto);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    var defs = n("defs", {}, svg);
    var pat = n("pattern", { id: "trama", width: 9, height: 9, patternUnits: "userSpaceOnUse" }, defs);
    n("circle", { cx: 2, cy: 2, r: 1.1, fill: "rgba(208,149,42,0.35)" }, pat);

    var P = V.puntos;
    var F = vista === "v" ? 1.5 : 1; // en celular los edificios, islas y nombres se ven más grandes
    // Mar y países vecinos
    var fondo = n("g", { "aria-hidden": "true" }, svg);
    V.vecinos.forEach(function (d) { n("path", { d: d, class: "vecino" }, fondo); });
    [["nicaragua", "Nicaragua", "vecino-txt"], ["panama", "Panamá", "vecino-txt"], ["pacifico", "Océano Pacífico", "mar-txt"], ["caribe", "Mar Caribe", "mar-txt"]].forEach(function (x) {
      if (!P[x[0]] || (vista === "v" && x[2] === "mar-txt")) return;
      var t = n("text", { x: P[x[0]][0], y: P[x[0]][1], class: x[2], "text-anchor": "middle" }, fondo);
      t.textContent = x[1];
    });
    // Costa Rica con relieve: sombra, laterales apilados y la tapa de papel
    var pais = n("g", { "aria-hidden": "true" }, svg);
    var GROSOR = 18;
    V.cr.forEach(function (d) { n("path", { d: d, class: "cr-sombra", transform: "translate(10," + (GROSOR + 10) + ")" }, pais); });
    for (var k = GROSOR; k > 0; k -= 2) V.cr.forEach(function (d) { n("path", { d: d, class: "cr-lado", transform: "translate(0," + k + ")" }, pais); });
    V.cr.forEach(function (d) { n("path", { d: d, class: "cr-tapa" }, pais); });
    V.cr.forEach(function (d) { n("path", { d: d, class: "cr-trama" }, pais); });

    // Lugares (de atrás hacia adelante para que se superpongan bien)
    var capa = n("g", {}, svg);
    var lugares = M.lugares.slice().sort(function (a, b) { return P[a.id][1] - P[b.id][1]; });
    lugares.forEach(function (l) {
      var it = deLugar[l.id];
      var g0 = n("g", { class: "punto" + (l.tipo === "central" ? " siempre" : ""), role: "button", tabindex: "0" }, capa);
      var g = n("g", { transform: "translate(" + P[l.id][0] + " " + P[l.id][1] + ") scale(" + F + ")" }, g0);
      var x = 0, y = 0;
      n("ellipse", { cx: x, cy: y, rx: 26, ry: 15, class: "anillo" }, g);
      n("circle", { cx: x, cy: y - 14, r: 32, class: "zona" }, g);
      var e = n("g", { class: "edif" }, g);
      var alto = edificio(e, l.tipo, x, y);
      n("ellipse", { cx: x, cy: y - alto / 2 + 4, rx: 30, ry: alto / 2 + 8, class: "foco" }, g);
      insignia(e, x + 16, y - alto + 2);
      var nombre = l.tipo === "regional" ? l.titulo.replace("Sede Regional ", "") : l.tipo === "oficina" ? l.titulo.replace("Oficina Administrativa de ", "") : l.titulo;
      etiqueta(g, x, y - alto - 4, nombre);
      conectar(g0, it, null);
    });
    // Islas de beneficios en el mar
    M.beneficios.forEach(function (b) {
      var it = porId[b.id];
      var g0 = n("g", { class: "isla", role: "button", tabindex: "0" }, capa);
      var g = n("g", { transform: "translate(" + P[b.id][0] + " " + P[b.id][1] + ") scale(" + F + ")" }, g0);
      var x = 0, y = 0;
      n("ellipse", { cx: x + 6, cy: y + 14, rx: 30, ry: 12, class: "isla-sombra" }, g);
      var f = n("g", { class: "flota", style: "animation-delay:" + (-Math.random() * 3).toFixed(2) + "s" }, g);
      var c = n("g", { class: "isla-cuerpo" }, f);
      n("ellipse", { cx: x, cy: y + 6, rx: 28, ry: 13, class: "isla-lado" }, c);
      n("ellipse", { cx: x, cy: y, rx: 28, ry: 13, class: "isla-base" }, c);
      var ic = n("svg", { x: x - 17, y: y - 36, width: 34, height: 34, viewBox: "0 0 200 200", "aria-hidden": "true" }, c);
      ic.innerHTML = ICONOS[b.icono] || "";
      insignia(c, x + 20, y - 26);
      n("ellipse", { cx: x, cy: y - 8, rx: 34, ry: 28, class: "foco" }, g);
      var corto = b.corto || b.titulo;
      etiqueta(f, x, y + 36, corto);
      conectar(g0, it);
    });
    pintar();
  }
  var porId = {};
  items.forEach(function (it) { porId[it.id] = it; });
  function conectar(g, it, nombre) {
    (nodos[it.id] = nodos[it.id] || []).push({ g: g, nombre: nombre });
    g.addEventListener("click", function () { abrir(it, g); });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(it, g); }
    });
  }

  // ---------- Estado visual ----------
  function vistos() { return grupos.filter(function (g) { return st.vis[g]; }).length; }
  // Si el mapa está dentro de otra página (por ejemplo el sitio del curso), le avisa el avance
  function avisar() {
    if (window.parent === window) return;
    try { window.parent.postMessage({ tipo: "mapa-beneficios", vistos: vistos(), total: grupos.length, fin: st.fin }, "*"); } catch (e) {}
  }
  function pintar() {
    items.forEach(function (it) {
      var visto = !!st.vis[it.grupo];
      (nodos[it.id] || []).forEach(function (x) {
        x.g.classList.toggle("visto", visto);
        var base = x.nombre ? x.nombre + " (" + it.titulo + ")" : it.titulo + (it.tipo === "beneficio" ? "" : ", " + it.subtitulo);
        x.g.setAttribute("aria-label", base + (visto ? ". Descubierto" : ". Sin descubrir"));
      });
    });
    $("cuenta").textContent = vistos();
    $("total").textContent = grupos.length;
    $("barra").style.width = (100 * vistos()) / grupos.length + "%";
    avisar();
  }

  // ---------- Tarjeta narrada ----------
  var tarjeta = $("tarjeta"), voz = $("voz");
  var actual = null, origen = null, frases = [];
  var ETQ = { central: "Sede", recreo: "Centro de recreo", regional: "Sede regional", oficina: "Oficina administrativa", beneficio: "Beneficio" };
  function abrir(it, desde) {
    if ($("lista").open) $("lista").close();
    actual = it;
    origen = desde || null;
    $("t-etiqueta").textContent = ETQ[it.tipo];
    $("t-titulo").textContent = it.titulo;
    $("t-subtitulo").textContent = it.subtitulo;
    var ico = $("t-icono");
    if (it.icono) { ico.innerHTML = ICONOS[it.icono] || ""; ico.hidden = false; } else ico.hidden = true;
    var T = TI[it.clave] || { frases: [it.texto], t: [] };
    var cont = $("t-texto");
    cont.textContent = "";
    frases = T.frases.map(function (f, k) {
      var s = document.createElement("span");
      s.className = "frase";
      s.textContent = f + (k < T.frases.length - 1 ? " " : "");
      cont.appendChild(s);
      return { el: s, t: T.t[k] };
    });
    tarjeta.showModal();
    tarjeta.querySelector(".t-cuerpo").scrollTop = 0;
    voz.src = "audio/" + it.clave + ".mp3";
    voz.currentTime = 0;
    reproducir();
    // Se descubre al abrirlo
    if (!st.vis[it.grupo]) {
      st.vis[it.grupo] = true;
      guardar();
      pintar();
      anunciar("Descubriste " + vistos() + " de " + grupos.length + ".");
    }
  }
  function reproducir() {
    var p = voz.play();
    if (p && p.catch) p.catch(function () { pintarPlay(); });
  }
  function pintarPlay() {
    var sonando = !voz.paused && !voz.ended;
    $("t-play-ico").setAttribute("d", sonando ? "M6 5h4v14H6zm8 0h4v14h-4z" : "M8 5v14l11-7z");
    $("t-play").setAttribute("aria-label", sonando ? "Pausar la lectura" : "Escuchar la lectura");
  }
  voz.addEventListener("play", pintarPlay);
  voz.addEventListener("pause", pintarPlay);
  voz.addEventListener("ended", function () {
    pintarPlay();
    frases.forEach(function (f) { f.el.classList.remove("leyendo"); });
  });
  voz.addEventListener("timeupdate", function () {
    var t = voz.currentTime;
    $("t-avance").style.width = (100 * t) / (voz.duration || 1) + "%";
    var activa = -1;
    frases.forEach(function (f, k) { if (f.t && t >= f.t[0] - 0.05) activa = k; });
    frases.forEach(function (f, k) {
      var on = k === activa && !voz.ended;
      if (on && !f.el.classList.contains("leyendo")) {
        var c = tarjeta.querySelector(".t-cuerpo");
        var r = f.el.getBoundingClientRect(), rc = c.getBoundingClientRect();
        if (r.bottom > rc.bottom - 10 || r.top < rc.top) c.scrollTop += r.top - rc.top - 40;
      }
      f.el.classList.toggle("leyendo", on);
    });
  });
  $("t-play").addEventListener("click", function () { if (voz.paused) reproducir(); else voz.pause(); });
  $("t-repetir").addEventListener("click", function () { voz.currentTime = 0; reproducir(); });
  $("t-cerrar").addEventListener("click", function () { tarjeta.close(); });
  tarjeta.addEventListener("click", function (e) { if (e.target === tarjeta) tarjeta.close(); });
  tarjeta.addEventListener("close", function () {
    voz.pause();
    if (origen && origen.focus) origen.focus();
    if (vistos() === grupos.length && !st.fin) setTimeout(final, 250);
  });

  // Cuando se descubre todo
  function final() {
    st.fin = true;
    guardar();
    avisar();
    if (hayLms) { Scorm.escribir("cmi.core.lesson_status", "completed"); Scorm.guardar(); }
    actual = null;
    $("t-etiqueta").textContent = "¡Listo!";
    $("t-titulo").textContent = M.fin.titulo;
    $("t-subtitulo").textContent = vistos() + " de " + grupos.length + " descubiertos";
    $("t-icono").hidden = true;
    var T = TI.fin || { frases: [M.fin.texto], t: [] };
    $("t-texto").textContent = "";
    frases = T.frases.map(function (f, k) {
      var s = document.createElement("span");
      s.className = "frase";
      s.textContent = f + " ";
      $("t-texto").appendChild(s);
      return { el: s, t: T.t[k] };
    });
    origen = null;
    tarjeta.showModal();
    voz.src = "audio/fin.mp3";
    reproducir();
  }

  // ---------- Lista accesible ----------
  var lista = $("lista");
  function llenarLista() {
    [["l-lugares", items.filter(function (i) { return i.tipo !== "beneficio"; })], ["l-beneficios", items.filter(function (i) { return i.tipo === "beneficio"; })]].forEach(function (x) {
      var ul = $(x[0]);
      ul.textContent = "";
      x[1].forEach(function (it) {
        var li = document.createElement("li");
        var b = document.createElement("button");
        b.type = "button";
        var visto = !!st.vis[it.grupo];
        if (visto) b.className = "hecho";
        var t = document.createElement("span");
        t.textContent = it.titulo;
        var e = document.createElement("span");
        e.className = "estado";
        e.textContent = visto ? "✓ Descubierto" : "Sin descubrir";
        b.appendChild(t);
        b.appendChild(e);
        b.addEventListener("click", function () { abrir(it, $("btn-lista")); });
        li.appendChild(b);
        ul.appendChild(li);
      });
    });
  }
  $("btn-lista").addEventListener("click", function () { llenarLista(); lista.showModal(); });
  $("l-cerrar").addEventListener("click", function () { lista.close(); });
  lista.addEventListener("click", function (e) { if (e.target === lista) lista.close(); });

  // La página que contiene el mapa puede pedir que se pause la lectura (por ejemplo, al cambiar de paso)
  window.addEventListener("message", function (e) {
    if (e.data && e.data.tipo === "mapa-pausar") voz.pause();
  });

  // ---------- Arranque ----------
  $("instruccion").textContent = M.instruccion;
  dibujar();
  window.addEventListener("resize", dibujar);
  if (reducido) document.documentElement.classList.add("reducido");
})();
