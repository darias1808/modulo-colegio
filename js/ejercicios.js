/*
  Ejercicios interactivos de la plataforma. Son formativos: no hay nota, se puede intentar
  cuantas veces haga falta y al final se muestra «Continuar».

  Uso: Ejercicios.crear(contenedor, definicion, alTerminar)
  Tipos: lineas, ordenar, clasificar, vf, opcion, completar, oracion.
  Todo lo que se arrastra también se puede hacer tocando o con el teclado.
*/
(function () {
  "use strict";

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "texto") n.textContent = attrs[k];
      else if (k === "clase") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }
  function boton(texto, clase) { var b = el("button", { type: "button", clase: clase || "" }); b.textContent = texto; return b; }
  function barajar(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  }
  // Baraja asegurando que no quede igual al orden correcto
  function desordenar(a, igual) {
    if (a.length < 2) return a.slice();
    var b; var n = 0;
    do { b = barajar(a); n++; } while (igual(b) && n < 20);
    return b;
  }
  function sacudir(n) {
    n.classList.remove("fallo"); void n.offsetWidth; n.classList.add("fallo");
    setTimeout(function () { n.classList.remove("fallo"); }, 450);
  }

  /* Arrastre con el puntero (mouse o dedo). Si el puntero casi no se mueve, cuenta como toque
     y deja pasar el clic normal. opts: { destinos: selector, alSoltar(destino), alMover(x, y) } */
  function arrastrable(n, opts) {
    var ini = null, fantasma = null, arrastro = false;
    n.style.touchAction = "none";
    n.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || n.disabled) return;
      ini = { x: e.clientX, y: e.clientY, id: e.pointerId };
      arrastro = false;
      // se captura desde el inicio para no perder el puntero si sale rápido del elemento
      try { n.setPointerCapture(e.pointerId); } catch (er) {}
    });
    n.addEventListener("pointermove", function (e) {
      if (!ini || e.pointerId !== ini.id) return;
      var dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!arrastro && Math.abs(dx) + Math.abs(dy) > 8) {
        arrastro = true;
        if (!opts.sinFantasma) {
          var r = n.getBoundingClientRect();
          fantasma = n.cloneNode(true);
          fantasma.className += " fantasma";
          fantasma.style.width = r.width + "px";
          fantasma.style.left = r.left + "px";
          fantasma.style.top = r.top + "px";
          document.body.appendChild(fantasma);
          n.classList.add("levantado");
        }
        if (opts.alEmpezar) opts.alEmpezar();
      }
      if (!arrastro) return;
      e.preventDefault();
      if (fantasma) fantasma.style.transform = "translate(" + dx + "px," + dy + "px) rotate(-2deg)";
      if (opts.alMover) opts.alMover(e.clientX, e.clientY);
      if (opts.destinos) {
        var d = destinoEn(e.clientX, e.clientY);
        document.querySelectorAll(".sobre").forEach(function (x) { if (x !== d) x.classList.remove("sobre"); });
        if (d) d.classList.add("sobre");
      }
    });
    function destinoEn(x, y) {
      if (fantasma) fantasma.style.display = "none";
      var d = document.elementFromPoint(x, y);
      if (fantasma) fantasma.style.display = "";
      return d && d.closest(opts.destinos);
    }
    function fin(e, cancelado) {
      if (!ini) return;
      var fueArrastre = arrastro;
      if (fueArrastre) {
        var d = (!cancelado && opts.destinos) ? destinoEn(e.clientX, e.clientY) : null;
        document.querySelectorAll(".sobre").forEach(function (x) { x.classList.remove("sobre"); });
        if (fantasma) { fantasma.remove(); fantasma = null; }
        n.classList.remove("levantado");
        if (opts.alSoltar) opts.alSoltar(d, e.clientX, e.clientY);
        // evita que el clic que sigue al arrastre cuente como toque
        n.dataset.recienArrastrado = "1";
        setTimeout(function () { delete n.dataset.recienArrastrado; }, 50);
      }
      ini = null; arrastro = false;
    }
    n.addEventListener("pointerup", function (e) { fin(e, false); });
    n.addEventListener("pointercancel", function (e) { fin(e, true); });
  }
  function alTocar(n, fn) {
    n.addEventListener("click", function (e) { if (n.dataset.recienArrastrado) return; fn(e); });
  }

  /* ---------------- Armazón común ---------------- */
  function crear(cont, def, alTerminar) {
    cont.innerHTML = "";
    var caja = el("div", { clase: "ej ej-" + def.tipo, role: "group", "aria-labelledby": "ej-tit" });
    caja.appendChild(el("span", { clase: "etiqueta", texto: def.etiqueta || "Actividad" }));
    caja.appendChild(el("h2", { id: "ej-tit", texto: def.pregunta || "" }));
    if (def.caso) caja.appendChild(el("p", { clase: "ej-caso", texto: def.caso }));
    var inst = def.instruccion || INSTRUCCION[def.tipo];
    if (inst) caja.appendChild(el("p", { clase: "ej-inst", texto: inst }));
    var cuerpo = el("div", { clase: "ej-cuerpo" });
    var msg = el("p", { clase: "ej-msg", "aria-live": "polite" });
    var acciones = el("div", { clase: "acciones" });
    var seguir = boton("Continuar", "btn principal");
    seguir.hidden = true;
    seguir.addEventListener("click", function () { if (alTerminar) alTerminar(); });
    acciones.appendChild(seguir);
    caja.appendChild(cuerpo); caja.appendChild(msg); caja.appendChild(acciones);
    cont.appendChild(caja);

    var api = {
      cuerpo: cuerpo, acciones: acciones,
      decir: function (t, tipo) { msg.textContent = t; msg.className = "ej-msg " + (tipo || ""); },
      terminar: function (t) {
        api.decir(t || "¡Muy bien! Lo lograste.", "bien");
        caja.classList.add("terminado");
        acciones.querySelectorAll(".comprobar").forEach(function (b) { b.hidden = true; });
        seguir.hidden = false;
        setTimeout(function () { seguir.focus(); }, 30);
      },
      comprobar: function (fn) {
        var b = boton("Comprobar", "btn oro comprobar");
        b.addEventListener("click", fn);
        acciones.insertBefore(b, seguir);
        return b;
      },
    };
    var tipo = TIPOS[def.tipo];
    if (!tipo) { api.decir("Actividad no disponible."); seguir.hidden = false; return; }
    tipo(def, api);
  }

  var INSTRUCCION = {
    vf: "Toca Verdadero o Falso en cada frase.",
    opcion: "Elige la mejor respuesta.",
    oracion: "Toca las palabras en orden para armar la frase. Toca una palabra de la frase para quitarla.",
    ordenar: "Arrastra para cambiar el orden, o usa las flechas.",
  };

  var TIPOS = {};

  /* ---------- Unir con líneas ---------- */
  TIPOS.lineas = function (def, api) {
    var zona = el("div", { clase: "lineas" });
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "lineas-svg"); svg.setAttribute("aria-hidden", "true");
    var izq = el("div", { clase: "lineas-col izq" });
    var der = el("div", { clase: "lineas-col der" });
    zona.appendChild(svg); zona.appendChild(izq); zona.appendChild(der);
    api.cuerpo.appendChild(zona);

    var hechos = {}; // índice izquierdo -> id derecho
    var elegido = null;
    var temporal = null;
    var botonesIzq = [], botonesDer = {};

    def.izquierda.forEach(function (it, i) {
      var b = boton("", "nodo");
      b.appendChild(el("span", { clase: "nodo-txt", texto: it.texto }));
      b.appendChild(el("span", { clase: "punto", "aria-hidden": "true" }));
      b.dataset.i = i;
      b.setAttribute("aria-pressed", "false");
      izq.appendChild(b);
      botonesIzq.push(b);
      alTocar(b, function () { if (hechos[i] == null) elegir(i); });
      arrastrable(b, {
        sinFantasma: true,
        destinos: ".lineas-col.der .nodo",
        alEmpezar: function () { if (hechos[i] != null) return; elegir(i, true); temporal = linea("temporal"); },
        alMover: function (x, y) {
          if (!temporal) return;
          var a = puntoDe(b), z = zona.getBoundingClientRect();
          fijar(temporal, a.x, a.y, x - z.left, y - z.top);
        },
        alSoltar: function (d) {
          if (temporal) { temporal.remove(); temporal = null; }
          if (d && hechos[i] == null) unir(i, d.dataset.id);
        },
      });
    });
    barajar(def.derecha).forEach(function (it) {
      var b = boton("", "nodo");
      b.appendChild(el("span", { clase: "punto", "aria-hidden": "true" }));
      b.appendChild(el("span", { clase: "nodo-txt", texto: it.texto }));
      b.dataset.id = it.id;
      der.appendChild(b);
      botonesDer[it.id] = b;
      alTocar(b, function () {
        if (elegido == null) { api.decir("Primero toca una situación de la izquierda.", ""); return; }
        unir(elegido, it.id);
      });
    });

    function elegir(i, silencio) {
      elegido = i;
      botonesIzq.forEach(function (b, k) { b.classList.toggle("sel", k === i); b.setAttribute("aria-pressed", String(k === i)); });
      if (!silencio) api.decir("Ahora toca el valor que le corresponde.", "");
    }
    function unir(i, id) {
      var ok = def.izquierda[i].correcta === id;
      if (!ok) { sacudir(botonesDer[id]); sacudir(botonesIzq[i]); api.decir("Esa no es. Inténtalo con otra.", "mal"); return; }
      hechos[i] = id;
      botonesIzq[i].classList.remove("sel"); botonesIzq[i].classList.add("unido"); botonesIzq[i].setAttribute("aria-pressed", "false");
      botonesIzq[i].setAttribute("aria-label", def.izquierda[i].texto + ": unido con " + botonesDer[id].textContent);
      botonesDer[id].classList.add("unido");
      elegido = null;
      dibujar();
      var n = Object.keys(hechos).length;
      if (n === def.izquierda.length) api.terminar("¡Muy bien! Uniste todas las parejas.");
      else api.decir("¡Correcto! Van " + n + " de " + def.izquierda.length + ".", "bien");
    }
    function linea(clase) {
      var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("class", clase); svg.appendChild(l); return l;
    }
    function fijar(l, x1, y1, x2, y2) { l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2); }
    function puntoDe(b) {
      var p = b.querySelector(".punto").getBoundingClientRect(), z = zona.getBoundingClientRect();
      return { x: p.left + p.width / 2 - z.left, y: p.top + p.height / 2 - z.top };
    }
    function dibujar() {
      svg.querySelectorAll("line.unida").forEach(function (l) { l.remove(); });
      Object.keys(hechos).forEach(function (i) {
        var a = puntoDe(botonesIzq[i]), z = puntoDe(botonesDer[hechos[i]]);
        fijar(linea("unida"), a.x, a.y, z.x, z.y);
      });
    }
    if (window.ResizeObserver) new ResizeObserver(dibujar).observe(zona);
  };

  /* ---------- Ordenar ---------- */
  TIPOS.ordenar = function (def, api) {
    var lista = el("ol", { clase: "ordenar" });
    api.cuerpo.appendChild(lista);
    var orden = desordenar(def.items, function (b) { return b.join("|") === def.items.join("|"); });
    orden.forEach(function (t) {
      var li = el("li", { clase: "ord-item" });
      li.dataset.t = t;
      var asa = el("span", { clase: "asa", "aria-hidden": "true", texto: "⋮⋮" });
      var txt = el("span", { clase: "ord-txt", texto: t });
      var sube = boton("↑", "ord-mover"); sube.setAttribute("aria-label", "Subir " + t);
      var baja = boton("↓", "ord-mover"); baja.setAttribute("aria-label", "Bajar " + t);
      sube.addEventListener("click", function () { if (li.previousElementSibling) lista.insertBefore(li, li.previousElementSibling); limpiar(); sube.focus(); });
      baja.addEventListener("click", function () { if (li.nextElementSibling) lista.insertBefore(li.nextElementSibling, li); limpiar(); baja.focus(); });
      li.appendChild(asa); li.appendChild(txt); li.appendChild(sube); li.appendChild(baja);
      lista.appendChild(li);
      arrastrable(asa, {
        sinFantasma: true,
        alEmpezar: function () { li.classList.add("levantado"); },
        alMover: function (x, y) {
          var hermanos = Array.prototype.filter.call(lista.children, function (c) { return c !== li; });
          var antes = null;
          for (var k = 0; k < hermanos.length; k++) {
            var r = hermanos[k].getBoundingClientRect();
            if (y < r.top + r.height / 2) { antes = hermanos[k]; break; }
          }
          if (antes) { if (li.nextElementSibling !== antes) lista.insertBefore(li, antes); }
          else if (lista.lastElementChild !== li) lista.appendChild(li);
        },
        alSoltar: function () { li.classList.remove("levantado"); limpiar(); },
      });
    });
    function limpiar() { lista.querySelectorAll(".ord-item").forEach(function (x) { x.classList.remove("bien", "mal"); }); api.decir(""); }
    api.comprobar(function () {
      var items = lista.querySelectorAll(".ord-item"), bien = 0;
      items.forEach(function (li, k) { var ok = li.dataset.t === def.items[k]; li.classList.toggle("bien", ok); li.classList.toggle("mal", !ok); if (ok) bien++; });
      if (bien === def.items.length) { lista.querySelectorAll("button").forEach(function (b) { b.disabled = true; }); api.terminar("¡Muy bien! Ese es el orden."); }
      else api.decir("Hay " + bien + " de " + def.items.length + " en su lugar. Mueve los marcados en rojo.", "mal");
    });
  };

  /* ---------- Clasificar en dos grupos ---------- */
  TIPOS.clasificar = function (def, api) {
    var pendientes = barajar(def.items);
    var total = pendientes.length;
    var actual = el("div", { clase: "clasif-actual" });
    var cuenta = el("span", { clase: "clasif-cuenta" });
    var texto = el("p", { clase: "clasif-texto" });
    actual.appendChild(cuenta); actual.appendChild(texto);
    var cols = el("div", { clase: "clasif-cols" });
    var listas = {};
    def.grupos.forEach(function (g, k) {
      var col = el("div", { clase: "clasif-col g" + k });
      col.dataset.g = g.id;
      var cab = boton((g.icono ? g.icono + " " : "") + g.texto, "clasif-btn g" + k);
      cab.setAttribute("aria-label", "Mandar a «" + g.texto + "»");
      cab.addEventListener("click", function () { mandar(g.id, col); });
      var ul = el("ul");
      listas[g.id] = ul;
      col.appendChild(cab); col.appendChild(ul);
      cols.appendChild(col);
    });
    api.cuerpo.appendChild(actual);
    api.cuerpo.appendChild(cols);
    arrastrable(actual, { destinos: ".clasif-col", alSoltar: function (d) { if (d) mandar(d.dataset.g, d); } });
    mostrar();

    function mostrar() {
      if (!pendientes.length) {
        actual.hidden = true;
        cols.querySelectorAll(".clasif-btn").forEach(function (b) { b.disabled = true; });
        api.terminar("¡Muy bien! Clasificaste todo.");
        return;
      }
      cuenta.textContent = (total - pendientes.length + 1) + " de " + total + " · arrástrala o toca un lado";
      texto.textContent = pendientes[0].texto;
    }
    function mandar(g, col) {
      var it = pendientes[0];
      if (!it) return;
      if (it.correcta !== g) { sacudir(actual); sacudir(col); api.decir("Mmm, piénsalo otra vez.", "mal"); return; }
      pendientes.shift();
      listas[g].appendChild(el("li", { texto: it.texto }));
      api.decir("¡Correcto!", "bien");
      mostrar();
    }
  };

  /* ---------- Verdadero o falso ---------- */
  TIPOS.vf = function (def, api) {
    var lista = el("div", { clase: "vf" });
    api.cuerpo.appendChild(lista);
    var resueltas = 0;
    def.afirmaciones.forEach(function (a) {
      var fila = el("div", { clase: "vf-fila" });
      fila.appendChild(el("p", { texto: a.texto }));
      var bs = el("div", { clase: "vf-botones" });
      var falla = false;
      [true, false].forEach(function (v) {
        var b = boton(v ? "Verdadero" : "Falso");
        b.addEventListener("click", function () {
          if (v === a.correcta) {
            fila.classList.remove("mal"); fila.classList.add("bien");
            bs.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            b.classList.add("elegido");
            resueltas++;
            if (resueltas === def.afirmaciones.length) api.terminar("¡Muy bien! Las respondiste todas.");
            else api.decir(falla ? "Ahora sí. ¡Bien!" : "¡Correcto!", "bien");
          } else {
            falla = true; fila.classList.add("mal"); sacudir(fila); api.decir("No es así. Vuelve a leer la frase.", "mal");
          }
        });
        bs.appendChild(b);
      });
      fila.appendChild(bs);
      lista.appendChild(fila);
    });
  };

  /* ---------- Opción única ---------- */
  TIPOS.opcion = function (def, api) {
    var lista = el("div", { clase: "opciones" });
    api.cuerpo.appendChild(lista);
    def.opciones.forEach(function (o, k) {
      var b = boton("", "opcion");
      b.appendChild(el("span", { clase: "letra", texto: String.fromCharCode(65 + k) }));
      b.appendChild(el("span", { texto: o.texto }));
      b.addEventListener("click", function () {
        if (o.correcta) {
          b.classList.add("bien");
          lista.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          api.terminar("¡Exacto! " + (def.explicacion || "Esa es la decisión ética."));
        } else {
          b.classList.add("mal"); b.disabled = true; sacudir(b);
          api.decir("Esa opción tiene un problema. ¿Cuál sería más honesta?", "mal");
        }
      });
      lista.appendChild(b);
    });
  };

  /* ---------- Completar frases arrastrando la opción al espacio ---------- */
  TIPOS.completar = function (def, api) {
    var lista = el("div", { clase: "completar" });
    api.cuerpo.appendChild(lista);
    var resueltas = 0;
    var instruccion = api.cuerpo.parentNode.querySelector(".ej-inst");
    if (instruccion) instruccion.textContent = "Arrastra la opción al espacio, o tócala.";
    def.frases.forEach(function (f) {
      var fila = el("div", { clase: "comp-fila" });
      var frase = el("p", { clase: "comp-frase" });
      frase.appendChild(document.createTextNode(f.antes + " "));
      var hueco = el("span", { clase: "hueco", "aria-label": "espacio en blanco" });
      hueco.textContent = " ";
      frase.appendChild(hueco);
      frase.appendChild(document.createTextNode(f.despues || ""));
      var ops = el("div", { clase: "comp-ops" });
      fila.appendChild(frase); fila.appendChild(ops);
      lista.appendChild(fila);
      barajar(f.opciones.map(function (t, k) { return { t: t, k: k }; })).forEach(function (o) {
        var chip = boton(o.t, "chip");
        function probar() {
          if (fila.classList.contains("bien")) return;
          if (o.k === f.correcta) {
            hueco.textContent = o.t; hueco.classList.add("lleno");
            fila.classList.remove("mal"); fila.classList.add("bien");
            ops.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            chip.classList.add("elegido");
            resueltas++;
            if (resueltas === def.frases.length) api.terminar("¡Muy bien! Completaste todas las frases.");
            else api.decir("¡Correcto!", "bien");
          } else {
            sacudir(chip); sacudir(hueco); fila.classList.add("mal");
            api.decir("Esa no encaja. Prueba la otra.", "mal");
          }
        }
        alTocar(chip, probar);
        arrastrable(chip, { destinos: ".hueco", alSoltar: function (d) { if (d === hueco) probar(); else if (d) { sacudir(d); api.decir("Ese espacio es de otra frase.", "mal"); } } });
        ops.appendChild(chip);
      });
    });
  };

  /* ---------- Armar la oración con fichas de palabras ---------- */
  TIPOS.oracion = function (def, api) {
    var palabras = def.respuesta.split(/\s+/);
    var linea = el("div", { clase: "oracion-linea", "aria-label": "Tu frase" });
    var banco = el("div", { clase: "oracion-banco", "aria-label": "Palabras disponibles" });
    api.cuerpo.appendChild(linea); api.cuerpo.appendChild(banco);
    var fichas = desordenar(palabras.map(function (p, k) { return { p: p, k: k }; }), function (b) {
      return b.map(function (x) { return x.p; }).join(" ") === def.respuesta;
    });
    fichas.forEach(function (f) {
      var b = boton(f.p, "ficha");
      b.addEventListener("click", function () {
        if (b.parentNode === banco) linea.appendChild(b); else banco.appendChild(b);
        linea.classList.remove("mal"); api.decir("");
        b.focus();
      });
      banco.appendChild(b);
    });
    api.comprobar(function () {
      var hecha = Array.prototype.map.call(linea.children, function (b) { return b.textContent; }).join(" ");
      if (hecha === def.respuesta) {
        linea.classList.add("bien");
        linea.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
        api.terminar("¡Muy bien! «" + def.respuesta + "».");
      } else if (banco.children.length) {
        api.decir("Faltan " + banco.children.length + " palabras por colocar.", "mal");
      } else {
        // marca cuántas palabras del inicio están bien
        var ok = 0, l = linea.children;
        while (ok < l.length && l[ok].textContent === palabras[ok]) ok++;
        linea.classList.add("mal"); sacudir(linea);
        api.decir(ok ? "Las primeras " + ok + " palabras están bien. Revisa el resto." : "Revisa el orden desde el principio.", "mal");
      }
    });
  };

  window.Ejercicios = { crear: crear };
})();
