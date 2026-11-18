/*
  Conexión mínima con un LMS SCORM 1.2.
  Si no hay LMS (por ejemplo al abrir el archivo directamente), la actividad funciona igual en modo vista previa.
*/
var Scorm = (function () {
  var api = null;
  var activo = false;

  function buscar(ventana) {
    var intentos = 0;
    while (ventana && !ventana.API && ventana.parent && ventana.parent !== ventana && intentos < 10) {
      ventana = ventana.parent;
      intentos++;
    }
    return ventana && ventana.API ? ventana.API : null;
  }

  function encontrarApi() {
    var a = null;
    try { a = buscar(window); } catch (e) {}
    if (!a) {
      try { if (window.opener) a = buscar(window.opener); } catch (e) {}
    }
    return a;
  }

  return {
    iniciar: function () {
      api = encontrarApi();
      if (!api) return false;
      activo = String(api.LMSInitialize("")) === "true";
      return activo;
    },
    activo: function () {
      return activo;
    },
    leer: function (campo) {
      if (!activo) return "";
      return String(api.LMSGetValue(campo) || "");
    },
    escribir: function (campo, valor) {
      if (!activo) return false;
      return String(api.LMSSetValue(campo, String(valor))) === "true";
    },
    guardar: function () {
      if (!activo) return false;
      return String(api.LMSCommit("")) === "true";
    },
    terminar: function () {
      if (!activo) return;
      api.LMSCommit("");
      api.LMSFinish("");
      activo = false;
    }
  };
})();
