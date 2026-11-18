/*
  Casos de práctica con Nano (uno por módulo). Son conversaciones guiadas con botones:
  Nano no da la respuesta. Si la persona elige un camino débil, Nano le responde con una pregunta
  o un giro del caso y la deja intentar otra vez. El caso termina cuando se cumplen todos los criterios.

  Cada opción: { texto, ir: "nodo siguiente", marca: ["criterio"...], responde: "lo que dice Nano antes de seguir" }
  Si una opción no tiene "ir", Nano responde y vuelve a mostrar las opciones del mismo nodo.
  Cada criterio puede llevar al momento del video donde se explica: { video, palabra } (se busca en la narración).
*/
window.CASOS = {
  m1: {
    titulo: "El informe con un error",
    criterios: [
      { id: "c1", texto: "Reconoce la honestidad como el valor en juego", video: "m1-v1", palabra: "honestidad" },
      { id: "c2", texto: "Decide comunicar el error y pedir ayuda", video: "m1-v1", palabra: "ayuda" },
      { id: "c3", texto: "Mantiene el respeto y la tolerancia bajo presión", video: "m1-v1", palabra: "tolerancia" },
      { id: "c4", texto: "Propone una solución concreta" },
    ],
    nodos: {
      inicio: {
        nano: "Es viernes en la tarde. Revisando el informe financiero que usted envió ayer a un cliente, descubre que una cifra está mal. Nadie lo ha notado todavía. ¿Qué hace?",
        opciones: [
          { texto: "Lo corrijo en silencio en la próxima versión", ir: "silencio" },
          { texto: "Aviso a mi jefatura del error y pido ayuda para corregirlo", ir: "jefe", marca: ["c1", "c2"] },
          { texto: "No digo nada: nadie se va a dar cuenta", ir: "callar" },
        ],
      },
      silencio: {
        nano: "Entiendo la idea de arreglarlo sin hacer ruido. Pero el cliente ya está usando esa cifra para tomar decisiones. ¿Qué pasa con su confianza si después se entera de que usted lo sabía?",
        opciones: [
          { texto: "Tiene razón: aviso del error y pido ayuda", ir: "jefe", marca: ["c1", "c2"] },
          { texto: "Igual prefiero corregirlo sin decir nada", ir: "valor" },
        ],
      },
      callar: {
        nano: "Supongamos que hoy nadie lo nota. ¿Y si dentro de un mes el cliente toma una mala decisión por esa cifra? ¿Quién respondería por eso?",
        opciones: [
          { texto: "Yo, porque sabía del error. Mejor aviso y pido ayuda", ir: "jefe", marca: ["c1", "c2"] },
          { texto: "Nadie, porque nadie sabría que fue un error", ir: "valor" },
        ],
      },
      valor: {
        nano: "Valeria vivió este mismo dilema en el video. ¿Recuerda qué valor era actuar con rectitud, no engañar y también reconocer cuando necesitamos ayuda?",
        opciones: [
          { texto: "La honestidad. Aviso del error y pido ayuda", ir: "jefe", marca: ["c1", "c2"] },
          { texto: "La libertad", responde: "La libertad es elegir con responsabilidad, pero aquí el centro es no engañar al cliente. Piénselo de nuevo." },
          { texto: "La tolerancia", responde: "La tolerancia es entender que otros ven las cosas distinto. Aquí el dilema es otro: decir o no la verdad." },
        ],
      },
      jefe: {
        nano: "Le cuenta a su jefatura. Pero está de mal humor y le responde fuerte: «¿Cómo es posible? ¡Eso nos deja mal con el cliente!». ¿Cómo reacciona usted?",
        opciones: [
          { texto: "Le respondo igual de fuerte: tampoco es tan grave", responde: "Es normal sentirse atacado. Pero ¿responder agresión con más agresión ayuda a resolver el problema?" },
          { texto: "Respiro, reconozco el error y le propongo cómo arreglarlo", ir: "solucion", marca: ["c3"] },
          { texto: "Me quedo callado y espero a que se le pase", responde: "Calmarse está bien, pero el informe sigue con el error. ¿Qué haría además de esperar?" },
        ],
      },
      solucion: {
        nano: "Su jefatura respira y le dice: «Está bien. ¿Qué propone?». ¿Cuál es su propuesta?",
        opciones: [
          { texto: "Enviar hoy la cifra corregida al cliente, explicar el error y revisar el resto del informe", ir: "fin", marca: ["c4"] },
          { texto: "Corregirlo en el informe del próximo mes", responde: "El cliente seguiría usando una cifra equivocada todo un mes. ¿Se puede hacer antes?" },
          { texto: "Que lo arregle otra persona del equipo", responde: "Pedir ayuda está muy bien. Pero ¿quién debería dar la cara ante el cliente por el error?" },
        ],
      },
      fin: {
        nano: "¡Muy bien! Reconoció el error con honestidad, lo comunicó aunque fuera incómodo, mantuvo el respeto bajo presión y propuso una solución concreta. Eso es ética social en el trabajo.",
        fin: true,
      },
    },
  },

  m2: {
    titulo: "El anuncio verde",
    criterios: [
      { id: "c1", texto: "Detecta que no se puede anunciar sin pruebas", video: "m2-v2", palabra: "pruebas" },
      { id: "c2", texto: "Propone medir la huella de carbono", video: "m2-v1", palabra: "huella" },
      { id: "c3", texto: "Conoce el camino de Bandera Azul hasta el certificado", video: "m2-v2", palabra: "estrellas" },
      { id: "c4", texto: "Comunica con honestidad lo que sí se está haciendo" },
    ],
    nodos: {
      inicio: {
        nano: "La gerencia quiere publicar mañana en redes: «¡Somos una empresa carbono neutral!». Nunca han medido sus emisiones. Le piden su opinión. ¿Qué responde?",
        opciones: [
          { texto: "Que lo publiquen: muchas empresas lo dicen", responde: "Muchas lo dicen, sí. Pero ¿qué pasaría si un cliente grande les pide la prueba?" },
          { texto: "Primero hay que medir cuánto contaminamos", ir: "medir", marca: ["c1"] },
          { texto: "Que planten árboles esta semana y después lo publiquen", responde: "Plantar árboles ayuda a compensar. Pero ¿cómo saben cuánto compensar si nunca han medido?" },
        ],
      },
      medir: {
        nano: "La gerencia pregunta: «Bueno, ¿y qué medimos exactamente?». ¿Qué le explica?",
        opciones: [
          { texto: "La huella de carbono: todos los gases de efecto invernadero que emitimos, por la luz, los viajes, el papel…", ir: "bandera", marca: ["c2"] },
          { texto: "Solo el consumo de agua", responde: "Cuidar el agua es importante, pero la huella de carbono mide otra cosa. ¿Qué incluye?" },
        ],
      },
      bandera: {
        nano: "«De acuerdo, medimos. ¿Y cuándo podremos decir que somos carbono neutrales?». ¿Qué camino propone?",
        opciones: [
          { texto: "Subir por las estrellas de Bandera Azul: hacer el inventario de gases y luego obtener el certificado de carbono neutralidad", ir: "comunicar", marca: ["c3"] },
          { texto: "Apenas tengamos la medición, ya lo podemos decir", responde: "Medir es el primer paso. Pero carbono neutral es equilibrar la balanza hasta llegar a cero. ¿Qué falta después de medir?" },
        ],
      },
      comunicar: {
        nano: "La gerencia insiste: «Pero queremos publicar algo ya». ¿Qué propone publicar?",
        opciones: [
          { texto: "Que empezamos a medir nuestra huella y vamos por el certificado, sin decir que ya somos carbono neutrales", ir: "fin", marca: ["c4"] },
          { texto: "Mejor no decir nada hasta tener el certificado", responde: "Es prudente. Pero ¿podrían contar con honestidad lo que sí están haciendo?" },
          { texto: "Publicar «carbono neutral» con un asterisco y letra pequeña", responde: "¿Eso sería honesto con los clientes que lo lean?" },
        ],
      },
      fin: {
        nano: "¡Excelente! No cayó en el anuncio sin pruebas, propuso medir la huella, conoce el camino hasta el certificado y comunicó con honestidad. Eso es ética ambiental en la empresa.",
        fin: true,
      },
    },
  },

  m3: {
    titulo: "La cifra del competidor",
    criterios: [
      { id: "c1", texto: "Reconoce el deber de guardar el secreto profesional", video: "m3-v2", palabra: "secreto" },
      { id: "c2", texto: "Conoce las excepciones: autorización del cliente o autoridad competente", video: "m3-v2", palabra: "excepciones" },
      { id: "c3", texto: "Cuida la relación con el cliente sin revelar datos" },
      { id: "c4", texto: "Busca apoyo sin identificar a nadie", video: "m3-v2", palabra: "cooperación" },
    ],
    nodos: {
      inicio: {
        nano: "En un almuerzo de negocios, un cliente le dice: «Usted que lleva la contabilidad de la competencia, ¿cuánto vendieron este año? Le pago un extra por el dato». ¿Qué hace?",
        opciones: [
          { texto: "Le doy una cifra aproximada, no la exacta", responde: "Aproximada o exacta, ¿de dónde sale ese dato?" },
          { texto: "Le digo que no puedo: es información que conozco por mi trabajo", ir: "excepciones", marca: ["c1"] },
          { texto: "Le digo que lo busque en internet", responde: "Así esquiva el tema, pero ¿le queda claro al cliente por qué usted no puede responder?" },
        ],
      },
      excepciones: {
        nano: "El cliente insiste: «¿Y si la otra empresa lo autorizara, o si se lo pidiera un juez?». ¿Qué le responde?",
        opciones: [
          { texto: "En esos dos casos sí podría compartirla: con autorización del cliente o si la pide una autoridad competente", ir: "relacion", marca: ["c2"] },
          { texto: "Nunca, en ningún caso", responde: "El Reglamento sí tiene excepciones. ¿Recuerda cuáles son?" },
          { texto: "Si me paga lo suficiente, sí", responde: "¿Un pago cambia el deber de guardar el secreto?" },
        ],
      },
      relacion: {
        nano: "El cliente se molesta: «Pensé que usted era de confianza». ¿Cómo lo maneja?",
        opciones: [
          { texto: "Le explico que por eso mismo soy de confianza: con los datos de su empresa hago lo mismo", ir: "apoyo", marca: ["c3"] },
          { texto: "Le digo que si no le gusta, busque otro contador", responde: "Puede ser tentador, pero ¿eso cuida la relación con su cliente?" },
        ],
      },
      apoyo: {
        nano: "Al día siguiente no sabe bien cómo actuar si el cliente vuelve a insistir. ¿Qué hace?",
        opciones: [
          { texto: "Lo consulto con mi equipo o con un colega, sin decir nombres ni empresas", ir: "fin", marca: ["c4"] },
          { texto: "Le cuento todo a un colega, con nombres, para que me aconseje mejor", responde: "Pedir consejo está muy bien. Pero ¿hace falta dar nombres para recibirlo?" },
          { texto: "No le cuento a nadie y lo resuelvo solo", responde: "Se vale, pero el video dice: «si quieres llegar lejos, ve acompañado». ¿Cómo podría apoyarse sin romper el secreto?" },
        ],
      },
      fin: {
        nano: "¡Muy bien! Guardó el secreto profesional, conoce sus excepciones, cuidó la relación con el cliente y buscó apoyo sin identificar a nadie. Eso es ética profesional, incluso cuando nadie está mirando.",
        fin: true,
      },
    },
  },
};
