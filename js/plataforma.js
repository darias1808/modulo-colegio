/*
  Plataforma de aprendizaje · Curso de Ética Profesional
  - Izquierda: ruta del curso (se abre y se cierra).
  - Centro: el video, la lectura, el mapa o la actividad.
  - Derecha: la práctica del módulo con sus criterios y los momentos del video.
  - Abajo: Nano (practicar, consultar, apuntes y transcripción).
  Todo empieza oculto; «Solo el video» deja únicamente el contenido.
*/
(function () {
  "use strict";
  var D = window.DATOS, CASOS = window.CASOS || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ---------- Estado guardado en este navegador ---------- */
  var estado = { hechos: {}, actual: null, apuntes: {}, casos: {} };
  try { var g = JSON.parse(localStorage.getItem(D.clave) || "null"); if (g) estado = Object.assign(estado, g); } catch (e) {}
  function guardar() { try { localStorage.setItem(D.clave, JSON.stringify(estado)); } catch (e) {} }

  /* ---------- Lista plana de elementos ---------- */
  var lista = [], porId = {};
  D.modulos.forEach(function (m) {
    m.items.forEach(function (it, k) { var x = { item: it, modulo: m, k: k, n: lista.length }; lista.push(x); porId[it.id] = x; });
  });
  var actual = porId[estado.actual] || lista[0];

  /* ---------- Utilidades ---------- */
  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "texto") n.textContent = attrs[k];
      else if (k === "clase") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (hijos || []).forEach(function (h) { if (h) n.appendChild(typeof h === "string" ? document.createTextNode(h) : h); });
    return n;
  }
  function svg(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  var ICO = {
    play: "M8 5v14l11-7z", pausa: "M6 19h4V5H6zm8-14v14h4V5z",
    vol: "M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z",
    mudo: "M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.9 8.9 0 0 0 21 12c0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.2v2.1a9 9 0 0 0 3.7-1.8l2 2 1.3-1.3z",
    pantalla: "M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z",
    atras10: "M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z",
    video: "M8 5v14l11-7z", lectura: "M4 5h7v14H4zm9 0h7v14h-7z",
    practica: "M4 4h16v12H5.2L4 17.2zm2 3v2h12V7zm0 4v2h8v-2z",
    gema: "M12 2 4 9l8 13 8-13zm0 3.2L16.8 9H7.2z", mapa: "M15 5.1 9 3 3 5v16l6-2.1 6 2.1 6-2V3zM15 19l-6-2.1V5l6 2.1z",
    hecho: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
    flecha: "M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z",
    ant: "M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z", sig: "M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z",
    voz: "M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1a7 7 0 0 0 6-6.9z",
  };
  function mmss(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }
  function normal(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]/g, " "); }
  function escapar(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function parrafosDe(t) { return Array.isArray(t) ? t : String(t || "").split(/\n+/).filter(Boolean); }
  function avisar(t) { var v = $("#vivo"); v.textContent = ""; setTimeout(function () { v.textContent = t; }, 30); }
  function esCelular() { return window.matchMedia("(max-width: 899px)").matches; }
  function vertical() { return window.innerHeight > window.innerWidth; }
  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tipoDe(it) {
    if (it.tipo === "video") return "Video";
    if (it.tipo === "lectura") return "Lectura";
    if (it.tipo === "practica") return "Práctica con Nano";
    if (it.tipo === "mapa") return "Mapa interactivo";
    return it.etiqueta || "Actividad";
  }
  function icoDe(it) { return ICO[it.tipo] || ICO.gema; }
  // Momento del video donde se dice una palabra
  function tiempoDe(idVideo, palabra) {
    var v = porId[idVideo] && porId[idVideo].item;
    if (!v || !v.palabras) return null;
    var p = normal(palabra).trim();
    for (var i = 0; i < v.palabras.length; i++) if (normal(v.palabras[i][0]).trim().indexOf(p) === 0) return Math.max(0, v.palabras[i][1] - 1);
    return null;
  }

  /* ---------- Hecho y avance ---------- */
  function marcar(id) {
    if (estado.hechos[id]) return;
    estado.hechos[id] = true; guardar();
    pintarRuta(); pintarAvance();
  }
  function pintarAvance() {
    var n = lista.filter(function (x) { return estado.hechos[x.item.id]; }).length;
    var p = n / lista.length;
    $("#avance-arco").style.strokeDashoffset = String(94.25 * (1 - p));
    $("#avance-txt").textContent = Math.round(p * 100) + " %";
    $("#avance").setAttribute("aria-label", "Avance del curso: " + n + " de " + lista.length + " completados");
  }

  /* ---------- Ruta (izquierda) ---------- */
  var abiertos = {};
  function pintarRuta() {
    var nav = $("#ruta-lista");
    nav.innerHTML = "";
    D.modulos.forEach(function (m) {
      var hechos = m.items.filter(function (it) { return estado.hechos[it.id]; }).length;
      if (abiertos[m.id] == null) abiertos[m.id] = m === actual.modulo;
      var caja = el("div", { clase: "modulo" });
      var cab = el("button", { clase: "modulo-cab", type: "button", "aria-expanded": String(!!abiertos[m.id]), "aria-controls": "mod-" + m.id });
      cab.innerHTML = '<span class="modulo-num">' + escapar(m.numero) + '</span><span class="modulo-tit">' + escapar(m.titulo) +
        '</span><span class="modulo-cuenta">' + hechos + "/" + m.items.length + "</span>" + svg(ICO.flecha).replace("<svg", '<svg class="modulo-flecha"');
      cab.addEventListener("click", function () { abiertos[m.id] = !abiertos[m.id]; pintarRuta(); $('[aria-controls="mod-' + m.id + '"]').focus(); });
      var ul = el("ul", { clase: "modulo-items", id: "mod-" + m.id });
      ul.hidden = !abiertos[m.id];
      m.items.forEach(function (it) {
        var b = el("button", { type: "button", clase: "item" + (estado.hechos[it.id] ? " hecho" : "") + (it === actual.item ? " actual" : "") });
        if (it === actual.item) b.setAttribute("aria-current", "step");
        b.innerHTML = '<span class="item-ico">' + svg(estado.hechos[it.id] ? ICO.hecho : icoDe(it)) + '</span><span class="item-txt"><span class="item-tipo">' +
          escapar(tipoDe(it)) + (estado.hechos[it.id] ? " · hecho" : "") + "</span>" + escapar(it.titulo) + "</span>";
        b.addEventListener("click", function () { ir(it.id); if (esCelular()) panel("ruta", false); });
        ul.appendChild(el("li", null, [b]));
      });
      caja.appendChild(cab); caja.appendChild(ul);
      nav.appendChild(caja);
    });
  }

  /* ---------- Paneles laterales ---------- */
  function panel(cual, abrir) {
    var p = $("#" + cual), b = $(cual === "ruta" ? "#btn-ruta" : "#btn-practica");
    if (abrir == null) abrir = p.hidden;
    if (abrir && esCelular()) { var otro = cual === "ruta" ? "practica" : "ruta"; if (!$("#" + otro).hidden) panel(otro, false); }
    p.hidden = !abrir;
    b.setAttribute("aria-expanded", String(abrir));
    if (abrir) { var f = p.querySelector(".item.actual, button"); if (f && esCelular()) f.focus(); }
    if (abrir && cual === "practica") pintarPractica();
    setTimeout(redibujarLineas, 50);
  }
  function redibujarLineas() { window.dispatchEvent(new Event("resize")); }

  /* ---------- Práctica (derecha) ---------- */
  function casoDelModulo(m) { return CASOS[m.id] ? m.id : null; }
  function pintarPractica() {
    var cont = $("#practica-cuerpo"), m = actual.modulo, idc = casoDelModulo(m);
    cont.innerHTML = "";
    cont.appendChild(el("h3", { texto: "Módulo " + m.numero + " · " + m.titulo }));
    cont.appendChild(el("p", { clase: "sub", texto: m.objetivo || "" }));
    if (idc) {
      var c = CASOS[idc], marcas = (estado.casos[idc] && estado.casos[idc].marcas) || [];
      cont.appendChild(el("h3", { texto: "Caso: " + c.titulo }));
      cont.appendChild(el("p", { clase: "sub", texto: "Lo que Nano espera ver en tu decisión. Toca ▶ para repasar el momento del video." }));
      var ul = el("ul", { clase: "criterios" });
      c.criterios.forEach(function (cr) {
        var hecho = marcas.indexOf(cr.id) >= 0;
        var li = el("li", { clase: "criterio" + (hecho ? " hecho" : "") });
        li.appendChild(el("span", { clase: "criterio-check", "aria-hidden": "true", texto: hecho ? "✓" : "" }));
        li.appendChild(el("span", { clase: "criterio-txt", texto: cr.texto + (hecho ? " (logrado)" : "") }));
        var t = cr.video ? tiempoDe(cr.video, cr.palabra) : null;
        if (t != null) {
          var b = el("button", { clase: "ir", type: "button", texto: "▶ " + mmss(t), "aria-label": "Ver en el video, minuto " + mmss(t) });
          b.addEventListener("click", function () { ir(cr.video, t); });
          li.appendChild(b);
        }
        ul.appendChild(li);
      });
      cont.appendChild(ul);
      var bc = el("button", { clase: "btn principal", type: "button", texto: "Practicar con Nano" });
      bc.addEventListener("click", function () { if (esCelular()) panel("practica", false); nano("practicar", true); });
      cont.appendChild(bc);
    }
    if (m.momentos && m.momentos.length) {
      cont.appendChild(el("h3", { texto: "Momentos clave", style: "margin-top:20px" }));
      var mo = el("ul", { clase: "momentos" });
      m.momentos.forEach(function (x) {
        if (!x || !porId[x.video]) return;
        var b = el("button", { type: "button", texto: "▶ " + mmss(x.t) + " · " + porId[x.video].item.titulo });
        b.addEventListener("click", function () { ir(x.video, x.t); });
        mo.appendChild(el("li", null, [b]));
      });
      cont.appendChild(mo);
    }
    if (!idc && !(m.momentos && m.momentos.length)) cont.appendChild(el("p", { clase: "sub", texto: "Este módulo no tiene práctica. Sigue la ruta." }));
  }

  /* ---------- Navegación ---------- */
  var video = null, quitarVideo = null;
  function ir(id, t, sinHistoria) {
    var x = porId[id];
    if (!x) return;
    if (x === actual && video && t != null) { video.currentTime = t; video.play().catch(function () {}); cerrarCapa(); return; }
    actual = x;
    estado.actual = id; guardar();
    if (!sinHistoria) try { history.replaceState(null, "", "#" + id); } catch (e) {}
    abiertos[x.modulo.id] = true;
    pintar(t);
  }
  function vecino(d) { return lista[actual.n + d]; }
  function siguiente() { var s = vecino(1); if (s) ir(s.item.id); }

  function pintar(t) {
    pararVoz();
    if (quitarVideo) { quitarVideo(); quitarVideo = null; }
    video = null;
    var esc = $("#escenario"), it = actual.item, m = actual.modulo;
    esc.innerHTML = "";
    esc.classList.toggle("lleno", it.tipo === "mapa");
    $("#donde").textContent = (m.numero === "✓" ? "" : "Módulo " + m.numero + " · ") + m.titulo + " — " + (actual.k + 1) + " de " + m.items.length;
    document.title = it.titulo + " · Ética Profesional";
    if (it.tipo === "video") pintarVideo(esc, it, t);
    else if (it.tipo === "lectura") pintarLectura(esc, it);
    else if (it.tipo === "practica") pintarCasoTarjeta(esc, it);
    else if (it.tipo === "mapa") pintarMapa(esc, it);
    else pintarGema(esc, it);
    pintarRuta();
    if (!$("#practica").hidden) pintarPractica();
    if (!$("#nano-panel").hidden) pintarNano();
    avisar(tipoDe(it) + ": " + it.titulo);
  }

  /* ---------- Video ---------- */
  function pintarVideo(esc, it, t) {
    var v = vertical() && it.fuentes.v !== it.fuentes.h;
    var vista = el("div", { clase: "vista" });
    var pant = el("div", { clase: "pantalla pausado" + (v ? " vertical" : ""), tabindex: "-1" });
    var vid = el("video", { playsinline: "", preload: "metadata", poster: v ? it.portadas.v : it.portadas.h, src: v ? it.fuentes.v : it.fuentes.h });
    vid.setAttribute("aria-label", it.titulo);
    if (it.subtitulos) {
      var tr = el("track", { kind: "captions", srclang: "es", label: "Español", src: it.subtitulos });
      vid.appendChild(tr);
    }
    var gran = el("button", { clase: "gran-play", type: "button", "aria-label": "Reproducir", html: svg(ICO.play) });
    var ctl = el("div", { clase: "controles" });
    var bPlay = el("button", { clase: "ctl", type: "button", "aria-label": "Reproducir", html: svg(ICO.play) });
    var bAtras = el("button", { clase: "ctl secundario", type: "button", "aria-label": "Retroceder 10 segundos", html: svg(ICO.atras10) });
    var tiempo = el("span", { clase: "tiempo", texto: "0:00 / 0:00" });
    var lin = el("div", { clase: "linea" });
    var fondo = el("span", { clase: "linea-fondo" }), av = el("span", { clase: "linea-avance" });
    var rango = el("input", { type: "range", min: "0", max: "1000", value: "0", step: "1", "aria-label": "Posición del video" });
    lin.appendChild(fondo); lin.appendChild(av); lin.appendChild(rango);
    var bVel = el("button", { clase: "ctl texto terciario", type: "button", texto: "1×", "aria-label": "Velocidad: normal" });
    var bCC = it.subtitulos ? el("button", { clase: "ctl texto", type: "button", texto: "CC", "aria-pressed": "false", "aria-label": "Subtítulos" }) : null;
    var bTxt = el("button", { clase: "ctl texto terciario", type: "button", texto: "Texto", "aria-label": "Abrir la transcripción" });
    var bVol = el("button", { clase: "ctl secundario", type: "button", "aria-label": "Silenciar", html: svg(ICO.vol) });
    var bFull = el("button", { clase: "ctl", type: "button", "aria-label": "Pantalla completa", html: svg(ICO.pantalla) });
    [bPlay, bAtras, tiempo, lin, bVel, bCC, bTxt, bVol, bFull].forEach(function (b) { if (b) ctl.appendChild(b); });
    pant.appendChild(vid); pant.appendChild(gran); pant.appendChild(ctl);

    var pie = el("div", { clase: "pie-video" });
    var ant = vecino(-1), sig = vecino(1);
    var bAnt = el("button", { clase: "btn-chico", type: "button", "aria-label": "Anterior", html: svg(ICO.ant).replace("<svg", '<svg width="16" height="16" fill="currentColor"') + "<span>Anterior</span>" });
    bAnt.disabled = !ant; bAnt.addEventListener("click", function () { ir(ant.item.id); });
    pie.appendChild(bAnt);
    pie.appendChild(el("h1", { texto: it.titulo }));
    if (it.ejercicio) {
      var bEj = el("button", { clase: "btn-chico", type: "button", texto: "Actividad" });
      bEj.addEventListener("click", function () { vid.pause(); mostrarEjercicio(); });
      pie.appendChild(bEj);
    }
    var bSig = el("button", { clase: "btn-chico", type: "button", "aria-label": "Siguiente", html: "<span>Siguiente</span>" + svg(ICO.sig).replace("<svg", '<svg width="16" height="16" fill="currentColor"') });
    bSig.disabled = !sig; bSig.addEventListener("click", function () { ir(sig.item.id); });
    pie.appendChild(bSig);
    vista.appendChild(pant); vista.appendChild(pie);
    esc.appendChild(vista);
    video = vid;

    function alternar() { if (vid.paused || vid.ended) { cerrarCapa(); vid.play().catch(function () {}); } else vid.pause(); }
    gran.addEventListener("click", alternar);
    bPlay.addEventListener("click", alternar);
    vid.addEventListener("click", alternar);
    bAtras.addEventListener("click", function () { vid.currentTime = Math.max(0, vid.currentTime - 10); });
    vid.addEventListener("play", function () { pant.classList.remove("pausado"); gran.hidden = true; bPlay.innerHTML = svg(ICO.pausa); bPlay.setAttribute("aria-label", "Pausar"); bucle(); });
    vid.addEventListener("pause", function () { pant.classList.add("pausado"); bPlay.innerHTML = svg(ICO.play); bPlay.setAttribute("aria-label", "Reproducir"); });
    function actualizar() {
      var d = vid.duration || 0;
      tiempo.textContent = mmss(vid.currentTime) + " / " + mmss(d);
      var p = d ? vid.currentTime / d : 0;
      av.style.width = (p * 100) + "%";
      if (document.activeElement !== rango) rango.value = String(Math.round(p * 1000));
      rango.setAttribute("aria-valuetext", mmss(vid.currentTime) + " de " + mmss(d));
      resaltarPalabra(vid.currentTime);
    }
    var rafId = null;
    function bucle() { cancelAnimationFrame(rafId); actualizar(); if (!vid.paused && !vid.ended) rafId = requestAnimationFrame(bucle); }
    vid.addEventListener("timeupdate", actualizar);
    vid.addEventListener("loadedmetadata", function () { if (t != null) vid.currentTime = t; actualizar(); });
    rango.addEventListener("input", function () { if (vid.duration) vid.currentTime = vid.duration * rango.value / 1000; actualizar(); });
    var velocidades = [1, 1.25, 1.5, 0.75], vk = 0;
    bVel.addEventListener("click", function () {
      vk = (vk + 1) % velocidades.length; vid.playbackRate = velocidades[vk];
      bVel.textContent = velocidades[vk] + "×"; bVel.setAttribute("aria-label", "Velocidad: " + velocidades[vk]);
    });
    if (bCC) {
      var pista = function () { return vid.textTracks && vid.textTracks[0]; };
      // Encendidos si la persona los activó antes, o si el video no trae texto en pantalla
      var ccOn = estado.cc === true || (estado.cc !== false && !!it.ccVisible);
      var aplicarCC = function () { bCC.setAttribute("aria-pressed", String(ccOn)); if (pista()) pista().mode = ccOn ? "showing" : "hidden"; };
      aplicarCC();
      vid.addEventListener("loadedmetadata", aplicarCC);
      bCC.addEventListener("click", function () {
        ccOn = !ccOn; estado.cc = ccOn; guardar(); aplicarCC();
        avisar(ccOn ? "Subtítulos activados" : "Subtítulos desactivados");
      });
    }
    bTxt.addEventListener("click", function () { nano("texto", true); });
    bVol.addEventListener("click", function () {
      vid.muted = !vid.muted; bVol.innerHTML = svg(vid.muted ? ICO.mudo : ICO.vol); bVol.setAttribute("aria-label", vid.muted ? "Activar sonido" : "Silenciar");
    });
    bFull.addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (pant.requestFullscreen) pant.requestFullscreen().catch(function () {});
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    });
    vid.addEventListener("ended", function () {
      marcar(it.id);
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      if (it.ejercicio && !estado.hechos[it.ejercicio.id]) mostrarEjercicio(); else mostrarSiguiente();
    });

    function mostrarEjercicio() {
      if (esCelular() && !$("#nano-panel").hidden) nano(null, false);
      var capa = abrirCapa(pant);
      Ejercicios.crear(capa, it.ejercicio, function () {
        estado.hechos[it.ejercicio.id] = true; marcar(it.id); guardar();
        mostrarSiguiente();
      });
      var saltar = el("button", { clase: "btn-chico", type: "button", texto: "Saltar actividad", style: "position:absolute;top:10px;right:10px" });
      saltar.addEventListener("click", function () { mostrarSiguiente(); });
      capa.appendChild(saltar);
      var f = capa.querySelector(".ej button"); if (f) f.focus();
    }
    function mostrarSiguiente() {
      var s = vecino(1);
      var capa = abrirCapa(pant);
      if (!s) {
        capa.appendChild(el("div", { clase: "siguiente" }, [el("strong", { texto: "¡Llegaste al final del curso!" })]));
        return;
      }
      var seg = 6;
      var cuenta = el("p", { texto: "A continuación, en " + seg + " s" });
      var ver = el("button", { clase: "btn oro", type: "button", texto: "Ver ahora" });
      var quedar = el("button", { clase: "btn", type: "button", texto: "Quedarme aquí", style: "background:transparent;color:#fff;border-color:#fff" });
      var caja = el("div", { clase: "siguiente" }, [cuenta, el("strong", { texto: tipoDe(s.item) + ": " + s.item.titulo }), el("div", { clase: "acciones", style: "justify-content:center" }, [ver, quedar])]);
      capa.appendChild(caja);
      ver.focus();
      var reloj = setInterval(function () {
        seg--; cuenta.textContent = "A continuación, en " + seg + " s";
        if (seg <= 0) { clearInterval(reloj); siguiente(); }
      }, 1000);
      capa._reloj = reloj;
      ver.addEventListener("click", function () { clearInterval(reloj); siguiente(); });
      quedar.addEventListener("click", function () { clearInterval(reloj); cerrarCapa(); });
    }
    pant._ejercicio = mostrarEjercicio;

    // Si el celular gira, cambia al video horizontal o vertical sin perder el punto
    var orientacion = v;
    function alGirar() {
      var nueva = vertical() && it.fuentes.v !== it.fuentes.h;
      if (nueva === orientacion || $(".capa", pant)) return;
      var tt = vid.currentTime, sonaba = !vid.paused;
      pintar(tt);
      if (sonaba && video) video.play().catch(function () {});
    }
    window.addEventListener("resize", alGirar);
    quitarVideo = function () { cancelAnimationFrame(rafId); window.removeEventListener("resize", alGirar); vid.pause(); cerrarCapa(); };
    if (t != null) vid.play().catch(function () {});
  }
  function abrirCapa(pant) {
    cerrarCapa();
    var c = el("div", { clase: "capa" });
    pant.appendChild(c);
    pant.classList.add("pausado");
    return c;
  }
  function cerrarCapa() { document.querySelectorAll(".capa").forEach(function (c) { if (c._reloj) clearInterval(c._reloj); c.remove(); }); }

  /* ---------- Lectura ---------- */
  var voz = null;
  function pararVoz() { if (voz) { voz.pause(); voz.removeAttribute("src"); } voz = null; }
  function pintarLectura(esc, it) {
    var t = el("article", { clase: "tarjeta" });
    t.appendChild(el("span", { clase: "etiqueta", texto: "Lectura" }));
    t.appendChild(el("h1", { texto: it.titulo }));
    parrafosDe(it.texto).forEach(function (p) { t.appendChild(el("p", { texto: p })); });
    if (it.fuente) t.appendChild(el("p", { clase: "fuente", texto: "Fuente: " + it.fuente }));
    var acc = el("div", { clase: "acciones" });
    var listo = el("button", { clase: "btn principal", type: "button", texto: "Listo, seguir" });
    listo.addEventListener("click", function () { marcar(it.id); siguiente(); });
    acc.appendChild(listo);
    // Audio grabado con la misma voz de los videos (herramientas/narrar_lecturas.mjs)
    if (it.audio) {
      var esc2 = el("button", { clase: "btn", type: "button", "aria-pressed": "false", html: svg(ICO.voz) + "<span>Escuchar</span>" });
      var reiniciar = function () { esc2.lastChild.textContent = "Escuchar"; esc2.setAttribute("aria-pressed", "false"); };
      esc2.addEventListener("click", function () {
        if (voz && !voz.paused) { voz.pause(); esc2.lastChild.textContent = "Seguir escuchando"; esc2.setAttribute("aria-pressed", "false"); return; }
        if (!voz) { voz = new Audio(it.audio); voz.addEventListener("ended", function () { voz = null; reiniciar(); }); }
        voz.play().catch(function () {});
        esc2.lastChild.textContent = "Pausar";
        esc2.setAttribute("aria-pressed", "true");
      });
      acc.appendChild(esc2);
    }
    t.appendChild(acc);
    esc.appendChild(t);
  }

  /* ---------- Práctica con Nano (tarjeta en el centro) ---------- */
  function pintarCasoTarjeta(esc, it) {
    var c = CASOS[it.caso];
    var t = el("article", { clase: "tarjeta" });
    t.appendChild(el("span", { clase: "etiqueta", texto: "Práctica con Nano" }));
    t.appendChild(el("h1", { texto: c.titulo }));
    t.appendChild(el("p", { texto: "Nano te va a plantear una situación del trabajo. Elige qué harías. Si tu respuesta se queda corta, Nano te hace una pregunta para que lo pienses otra vez: aquí no hay nota, se aprende probando." }));
    t.appendChild(el("p", { texto: "A la derecha, en «Práctica», ves lo que Nano espera de tu decisión y el momento del video donde se explica cada punto." }));
    var acc = el("div", { clase: "acciones" });
    var b = el("button", { clase: "btn principal", type: "button", texto: estado.hechos[it.id] ? "Repasar el caso" : "Empezar con Nano" });
    b.addEventListener("click", function () { if (!esCelular()) panel("practica", true); nano("practicar", true); });
    var s = el("button", { clase: "btn", type: "button", texto: "Siguiente" });
    s.addEventListener("click", siguiente);
    acc.appendChild(b); acc.appendChild(s);
    t.appendChild(acc);
    esc.appendChild(t);
  }

  /* ---------- Gema (evaluación, foro, encuesta) ---------- */
  function pintarGema(esc, it) {
    var t = el("article", { clase: "tarjeta" });
    t.appendChild(el("span", { clase: "etiqueta", texto: it.etiqueta || "Actividad" }));
    t.appendChild(el("h1", { texto: it.titulo }));
    parrafosDe(it.texto).forEach(function (p) { t.appendChild(el("p", { texto: p })); });
    t.appendChild(el("p", { clase: "fuente", texto: "Se abre en Gemini, en una pestaña nueva. Necesitas iniciar sesión con una cuenta de Google. Al terminar, guarda la constancia que te da." }));
    var acc = el("div", { clase: "acciones" });
    var a = el("a", { clase: "btn oro", href: it.url, target: "_blank", rel: "noopener", texto: (it.boton || "Abrir") + " ↗" });
    a.addEventListener("click", function () { marcar(it.id); });
    acc.appendChild(a);
    if (vecino(1)) { var s = el("button", { clase: "btn", type: "button", texto: "Siguiente" }); s.addEventListener("click", siguiente); acc.appendChild(s); }
    t.appendChild(acc);
    esc.appendChild(t);
  }

  /* ---------- Mapa ---------- */
  function pintarMapa(esc, it) {
    esc.appendChild(el("iframe", { clase: "marco-mapa", src: it.src, title: it.titulo, allow: "autoplay; fullscreen" }));
  }
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (d && d.tipo === "mapa-beneficios" && d.fin) { var m = lista.filter(function (x) { return x.item.tipo === "mapa"; })[0]; if (m) marcar(m.item.id); }
  });

  /* ---------- Nano (abajo) ---------- */
  var pestana = "practicar";
  function nano(tab, abrir) {
    var p = $("#nano-panel");
    if (tab) pestana = tab;
    if (abrir == null) abrir = p.hidden;
    if (document.body.classList.contains("foco") && abrir) foco(false);
    p.hidden = !abrir;
    $("#nano-toggle").setAttribute("aria-expanded", String(abrir));
    $("#nano-toggle").setAttribute("aria-label", abrir ? "Cerrar Nano" : "Abrir Nano");
    $("#nano-ico").setAttribute("d", abrir ? ICO.flecha : "M7.4 15.4 12 10.8l4.6 4.6L18 14l-6-6-6 6z");
    document.querySelectorAll(".nano-tab").forEach(function (b) {
      var on = abrir && b.dataset.tab === pestana;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on || (!abrir && b.dataset.tab === "practicar") ? 0 : -1;
    });
    if (abrir) pintarNano();
  }
  function pintarNano() {
    var p = $("#nano-panel");
    p.innerHTML = "";
    p.removeAttribute("aria-label"); p.setAttribute("aria-labelledby", "tab-" + pestana);
    if (pestana === "practicar") pintarChat(p);
    else if (pestana === "consultar") pintarConsulta(p);
    else if (pestana === "apuntes") pintarApuntes(p);
    else pintarTranscripcion(p);
  }

  /* Practicar: conversación guiada */
  var casoElegido = null;
  function pintarChat(p) {
    var idc = casoDelModulo(actual.modulo) || casoElegido;
    if (!idc) {
      var cv = el("div", { clase: "chat" });
      cv.appendChild(el("div", { clase: "burbuja nano-dice", texto: "¡Hola! Soy Nano. En cada módulo hay un caso para practicar. ¿Cuál quieres?" }));
      var ops = el("div", { clase: "opciones-chat" });
      Object.keys(CASOS).forEach(function (k) {
        var m = D.modulos.filter(function (x) { return x.id === k; })[0];
        var b = el("button", { type: "button", texto: "Módulo " + m.numero + " · " + CASOS[k].titulo });
        b.addEventListener("click", function () { casoElegido = k; pintarNano(); });
        ops.appendChild(b);
      });
      cv.appendChild(ops); p.appendChild(cv); return;
    }
    var c = CASOS[idc];
    var e = estado.casos[idc] || (estado.casos[idc] = { nodo: "inicio", marcas: [], hist: [] });
    if (!e.hist.length) { e.hist.push({ de: "nano", t: c.nodos.inicio.nano }); guardar(); }
    var chat = el("div", { clase: "chat" });
    chat.appendChild(el("div", { clase: "res-donde", texto: "Caso · " + c.titulo }));
    e.hist.forEach(function (h) { chat.appendChild(el("div", { clase: "burbuja " + (h.de === "yo" ? "yo" : h.de === "logro" ? "logro" : "nano-dice"), texto: h.t })); });
    var nodo = c.nodos[e.nodo];
    if (nodo && !nodo.fin) {
      var ops2 = el("div", { clase: "opciones-chat" });
      nodo.opciones.forEach(function (o) {
        var b = el("button", { type: "button", texto: o.texto });
        b.addEventListener("click", function () { responder(idc, o); });
        ops2.appendChild(b);
      });
      chat.appendChild(ops2);
    } else {
      var otra = el("button", { clase: "btn-chico", type: "button", texto: "Hacer el caso otra vez", style: "align-self:center" });
      otra.addEventListener("click", function () { estado.casos[idc] = { nodo: "inicio", marcas: e.marcas, hist: [] }; guardar(); pintarNano(); });
      chat.appendChild(otra);
    }
    p.appendChild(chat);
    p.scrollTop = p.scrollHeight;
    var primero = chat.querySelector(".opciones-chat button"); if (primero && document.activeElement && document.activeElement.closest && document.activeElement.closest("#nano")) primero.focus();
  }
  function responder(idc, o) {
    var c = CASOS[idc], e = estado.casos[idc];
    var desde = e.hist.length + 1;
    e.hist.push({ de: "yo", t: o.texto });
    var nuevas = (o.marca || []).filter(function (m) { return e.marcas.indexOf(m) < 0; });
    nuevas.forEach(function (m) { e.marcas.push(m); });
    if (o.responde) e.hist.push({ de: "nano", t: o.responde });
    if (nuevas.length) {
      var txt = nuevas.map(function (m) { return c.criterios.filter(function (x) { return x.id === m; })[0].texto; }).join(" · ");
      e.hist.push({ de: "logro", t: "✓ " + txt });
    }
    if (o.ir) {
      e.nodo = o.ir;
      var n = c.nodos[o.ir];
      e.hist.push({ de: n.fin ? "logro" : "nano", t: n.nano });
      if (n.fin) { var it = lista.filter(function (x) { return x.item.caso === idc; })[0]; if (it) marcar(it.item.id); }
    }
    guardar();
    pintarNano();
    avisar("Nano: " + e.hist.slice(desde).map(function (h) { return h.t; }).join(" "));
    if (!$("#practica").hidden) pintarPractica();
    var f = $("#nano-panel .opciones-chat button") || $("#nano-panel .btn-chico"); if (f) f.focus();
  }

  /* Consultar: buscar en videos y lecturas */
  var indice = null, ultimaBusqueda = "";
  function armarIndice() {
    indice = [];
    lista.forEach(function (x) {
      var it = x.item;
      if (it.tipo === "video" && it.palabras) {
        var frase = [], ini = null;
        it.palabras.forEach(function (w) {
          if (ini == null) ini = w[1];
          frase.push(w[0]);
          if (/[.?!…]$/.test(w[0]) || frase.length > 28) { indice.push({ id: it.id, t: ini, texto: frase.join(" "), donde: it.titulo }); frase = []; ini = null; }
        });
        if (frase.length) indice.push({ id: it.id, t: ini, texto: frase.join(" "), donde: it.titulo });
      } else if (it.tipo === "video") {
        (it.parrafos || []).forEach(function (p) { indice.push({ id: it.id, t: null, texto: p, donde: it.titulo }); });
      } else if (it.tipo === "lectura") {
        parrafosDe(it.texto).forEach(function (p) {
          p.split(/(?<=[.?!])\s+/).forEach(function (f) { indice.push({ id: it.id, t: null, texto: f, donde: "Lectura · " + it.titulo }); });
        });
      }
    });
  }
  function pintarConsulta(p) {
    if (!indice) armarIndice();
    var caja = el("div", { clase: "consulta" });
    var f = el("form", { role: "search" });
    var inp = el("input", { type: "search", placeholder: "Busca un tema: honestidad, huella, secreto…", "aria-label": "Buscar en los videos y lecturas", value: ultimaBusqueda });
    var b = el("button", { clase: "btn principal", type: "submit", texto: "Buscar" });
    f.appendChild(inp); f.appendChild(b);
    var res = el("ul", { clase: "resultados" });
    var info = el("p", { clase: "sub", style: "margin:0 0 8px;font-size:.85rem;color:var(--suave)" });
    caja.appendChild(f); caja.appendChild(info); caja.appendChild(res);
    p.appendChild(caja);
    function buscar() {
      var q = normal(inp.value).trim();
      ultimaBusqueda = inp.value;
      res.innerHTML = "";
      if (q.length < 3) { info.textContent = "Escribe una palabra y Nano te muestra dónde se habla de eso en el curso. Toca un resultado para ir al momento exacto."; return; }
      var hall = indice.filter(function (x) { return normal(x.texto).indexOf(q) >= 0; }).slice(0, 40);
      info.textContent = hall.length ? hall.length + (hall.length === 40 ? "+" : "") + " resultados" : "No encontré «" + inp.value + "». Prueba con otra palabra.";
      var re = new RegExp("(" + inp.value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      hall.forEach(function (x) {
        var bt = el("button", { type: "button" });
        bt.innerHTML = '<span class="res-donde">' + escapar(x.donde) + (x.t != null ? " · ▶ " + mmss(x.t) : "") + "</span>" + escapar(x.texto).replace(re, "<mark>$1</mark>");
        bt.addEventListener("click", function () { ir(x.id, x.t != null ? x.t : undefined); });
        res.appendChild(el("li", null, [bt]));
      });
    }
    f.addEventListener("submit", function (e) { e.preventDefault(); buscar(); });
    inp.addEventListener("input", function () { clearTimeout(inp._t); inp._t = setTimeout(buscar, 250); });
    buscar();
    setTimeout(function () { inp.focus(); }, 30);
  }

  /* Apuntes por elemento */
  function pintarApuntes(p) {
    var it = actual.item;
    var caja = el("div", { clase: "apuntes" });
    caja.appendChild(el("div", { clase: "res-donde", texto: "Apuntes · " + it.titulo }));
    var ta = el("textarea", { "aria-label": "Apuntes de " + it.titulo, placeholder: "Escribe aquí lo que quieras recordar. Se guarda solo en este navegador." });
    ta.value = estado.apuntes[it.id] || "";
    var pie = el("div", { clase: "apuntes-pie" });
    var dice = el("span", { texto: ta.value ? "Guardado" : "" });
    var bots = el("div", { clase: "acciones", style: "margin:0;gap:6px" });
    if (it.tipo === "video") {
      var bm = el("button", { clase: "btn-chico", type: "button", texto: "Insertar minuto" });
      bm.addEventListener("click", function () {
        var marca = "[" + mmss(video ? video.currentTime : 0) + "] ";
        var i = ta.selectionStart || ta.value.length;
        var pre = ta.value.slice(0, i), sep = pre && !/\n$/.test(pre) ? "\n" : "";
        ta.value = pre + sep + marca + ta.value.slice(i);
        ta.focus(); ta.selectionStart = ta.selectionEnd = (pre + sep + marca).length;
        gua();
      });
      bots.appendChild(bm);
    }
    var bd = el("button", { clase: "btn-chico", type: "button", texto: "Descargar todos" });
    bd.addEventListener("click", function () {
      var txt = D.titulo + " · Mis apuntes\n\n";
      lista.forEach(function (x) { var a = estado.apuntes[x.item.id]; if (a && a.trim()) txt += "## " + x.item.titulo + "\n" + a.trim() + "\n\n"; });
      var url = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
      var a = el("a", { href: url, download: "mis-apuntes-etica.txt" }); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    bots.appendChild(bd);
    pie.appendChild(dice); pie.appendChild(bots);
    caja.appendChild(ta); caja.appendChild(pie);
    p.appendChild(caja);
    function gua() { estado.apuntes[it.id] = ta.value; guardar(); dice.textContent = "Guardado"; }
    ta.addEventListener("input", function () { dice.textContent = "Guardando…"; clearTimeout(ta._t); ta._t = setTimeout(gua, 400); });
    // Clic en [m:ss] dentro de la nota: no hay enlaces en textarea, así que se ofrece con doble clic
    ta.addEventListener("dblclick", function () {
      var i = ta.selectionStart, linea = ta.value.slice(ta.value.lastIndexOf("\n", i - 1) + 1).split("\n")[0];
      var m = linea.match(/^\[(\d+):(\d\d)\]/);
      if (m && video) { video.currentTime = +m[1] * 60 + +m[2]; video.play().catch(function () {}); }
    });
  }

  /* Transcripción palabra por palabra */
  var spans = null, ultimo = -1;
  function pintarTranscripcion(p) {
    spans = null; ultimo = -1;
    var it = actual.item;
    var caja = el("div", { clase: "transcripcion" });
    if (it.tipo !== "video") {
      caja.appendChild(el("p", { clase: "chat-vacio", texto: "La transcripción aparece cuando estás en un video." }));
      p.appendChild(caja); return;
    }
    if (it.palabras) {
      var frag = document.createDocumentFragment();
      spans = [];
      it.palabras.forEach(function (w, i) {
        var s = el("span", { clase: "p futura", texto: w[0] });
        s.dataset.i = i;
        frag.appendChild(s); frag.appendChild(document.createTextNode(" "));
        spans.push(s);
      });
      caja.appendChild(el("p", { clase: "res-donde", texto: "Toca una palabra para ir a ese momento del video" }));
      caja.appendChild(frag);
      caja.addEventListener("click", function (e) {
        var s = e.target.closest(".p"); if (!s || !video) return;
        video.currentTime = it.palabras[+s.dataset.i][1]; cerrarCapa(); video.play().catch(function () {});
      });
    } else {
      (it.parrafos || []).forEach(function (t) { caja.appendChild(el("p", { texto: t })); });
    }
    p.appendChild(caja);
    if (video) resaltarPalabra(video.currentTime, true);
  }
  function resaltarPalabra(t, forzar) {
    if (!spans || $("#nano-panel").hidden || pestana !== "texto") return;
    var w = actual.item.palabras, i = -1;
    // búsqueda binaria de la última palabra que ya empezó
    var lo = 0, hi = w.length - 1;
    while (lo <= hi) { var mid = (lo + hi) >> 1; if (w[mid][1] <= t) { i = mid; lo = mid + 1; } else hi = mid - 1; }
    if (i === ultimo && !forzar) return;
    var desde = Math.min(i, ultimo < 0 ? 0 : ultimo), hasta = Math.max(i, ultimo);
    if (forzar) { desde = 0; hasta = spans.length - 1; }
    for (var k = Math.max(0, desde); k <= hasta && k < spans.length; k++) spans[k].className = "p " + (k < i ? "dicha" : k === i ? "ahora" : "futura");
    ultimo = i;
    if (i >= 0) {
      var panelN = $("#nano-panel"), s = spans[i], r = s.getBoundingClientRect(), pr = panelN.getBoundingClientRect();
      if (r.top < pr.top + 20 || r.bottom > pr.bottom - 20) panelN.scrollTop += r.top - pr.top - pr.height / 3;
    }
  }

  /* ---------- Modo «solo el video» ---------- */
  function foco(on) {
    if (on == null) on = !document.body.classList.contains("foco");
    document.body.classList.toggle("foco", on);
    $("#btn-foco").setAttribute("aria-pressed", String(on));
    $("#btn-foco span").textContent = on ? "Salir (Esc)" : "Solo el video";
    if (on) { panel("ruta", false); panel("practica", false); $("#nano-panel").hidden = true; nano(null, false); }
    avisar(on ? "Modo solo el video. Pulsa Escape para salir." : "Saliste del modo solo el video.");
  }

  /* ---------- Modo oscuro ---------- */
  var sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
  function temaActual() { return document.documentElement.getAttribute("data-theme") || (sistemaOscuro.matches ? "dark" : "light"); }
  function pintarTema() {
    var oscuro = temaActual() === "dark";
    $("#btn-tema").setAttribute("aria-pressed", String(oscuro));
    $('meta[name="theme-color"]').setAttribute("content", oscuro ? "#15141b" : "#1b376c");
  }
  $("#btn-tema").addEventListener("click", function () {
    var nuevo = temaActual() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevo);
    try { localStorage.setItem("plataforma-etica-tema", nuevo); } catch (e) {}
    pintarTema();
    avisar(nuevo === "dark" ? "Modo oscuro activado" : "Modo claro activado");
  });
  if (sistemaOscuro.addEventListener) sistemaOscuro.addEventListener("change", pintarTema);
  pintarTema();

  /* ---------- Eventos generales ---------- */
  $("#btn-ruta").addEventListener("click", function () { panel("ruta"); });
  $("#cerrar-ruta").addEventListener("click", function () { panel("ruta", false); $("#btn-ruta").focus(); });
  $("#btn-practica").addEventListener("click", function () { panel("practica"); });
  $("#cerrar-practica").addEventListener("click", function () { panel("practica", false); $("#btn-practica").focus(); });
  $("#btn-foco").addEventListener("click", function () { foco(); });
  $("#nano-toggle").addEventListener("click", function () { nano(null); });
  $(".nano-logo").addEventListener("click", function () { if (document.body.classList.contains("foco")) { foco(false); nano(null, true); } });
  document.querySelectorAll(".nano-tab").forEach(function (b) {
    b.addEventListener("click", function () {
      var abierto = !$("#nano-panel").hidden;
      nano(b.dataset.tab, !(abierto && pestana === b.dataset.tab));
    });
    b.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var tabs = Array.prototype.slice.call(document.querySelectorAll(".nano-tab"));
      var k = (tabs.indexOf(b) + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[k].focus(); nano(tabs[k].dataset.tab, true);
    });
  });
  // En el celular, tocar fuera de un panel lo cierra
  $("#escenario").addEventListener("pointerdown", function () {
    if (!esCelular()) return;
    if (!$("#ruta").hidden) panel("ruta", false);
    if (!$("#practica").hidden) panel("practica", false);
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target, escribe = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
    if (e.key === "Escape") {
      if (document.body.classList.contains("foco")) { foco(false); return; }
      if (esCelular() && !$("#ruta").hidden) { panel("ruta", false); $("#btn-ruta").focus(); return; }
      if (esCelular() && !$("#practica").hidden) { panel("practica", false); $("#btn-practica").focus(); return; }
      return;
    }
    if (escribe || !video || e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && t.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
    if ($(".capa")) return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); if (video.paused) video.play().catch(function () {}); else video.pause(); }
    else if (e.key === "ArrowRight" && !(t && t.type === "range")) video.currentTime += 5;
    else if (e.key === "ArrowLeft" && !(t && t.type === "range")) video.currentTime -= 5;
    else if (e.key === "m") video.muted = !video.muted;
  });
  window.addEventListener("hashchange", function () { var id = location.hash.slice(1); if (porId[id] && porId[id] !== actual) ir(id, undefined, true); });

  /* ---------- Inicio ---------- */
  var h = location.hash.slice(1);
  if (porId[h]) { actual = porId[h]; estado.actual = h; }
  pintarAvance();
  pintar();
})();
