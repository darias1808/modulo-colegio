# Plataforma de aprendizaje · Curso de Ética Profesional

Sitio estático (HTML, CSS y JavaScript, sin servidor) para el Curso de Ética Profesional del Colegio de Ciencias Económicas de Costa Rica.

## Cómo se usa

- **Centro:** el video (horizontal en PC, vertical en el celular), la lectura, el mapa o la tarjeta de la actividad.
- **Ruta del curso (izquierda):** los módulos y sus pasos; se abre con el botón de arriba.
- **Práctica (derecha):** el objetivo del módulo, lo que Nano espera ver en el caso y botones ▶ que llevan al momento exacto del video.
- **Nano (abajo):**
  - **Practicar:** un caso guiado por módulo. Si la respuesta se queda corta, Nano repregunta.
  - **Consultar:** busca una palabra en todos los videos y lecturas y lleva al minuto exacto.
  - **Apuntes:** notas por paso, con el minuto del video; se pueden descargar.
  - **Transcripción:** el texto del video palabra por palabra; tocar una palabra lleva a ese momento.
- **Solo el video:** esconde todo lo demás; se sale con Esc.
- **Al terminar cada video** aparece una actividad encima (unir con líneas, ordenar, clasificar, verdadero o falso, opción, completar o armar la frase) y luego pasa sola al siguiente paso. Las actividades no tienen nota.
- **Evaluaciones, foro y encuesta:** se abren en las gemas de Gemini.

El avance y los apuntes se guardan solo en el navegador de cada persona (localStorage).

## Archivos

- `index.html`: la estructura de la página.
- `css/plataforma.css`: los estilos.
- `js/datos.js`: el contenido del curso. Se genera con `node herramientas/generar_datos.mjs <carpeta curso-etica-web> <carpeta Videos>`.
- `js/casos.js`: los casos de práctica de Nano.
- `js/ejercicios.js`: las actividades.
- `js/plataforma.js`: la lógica de la plataforma.
- `media/`: videos, portadas y subtítulos.
- `mapa/`: el mapa interactivo de sedes y beneficios.

## Probar en local

Hay que abrirla desde un servidor (no con doble clic), por ejemplo:

```
npx serve .
```

## Accesibilidad y modo oscuro

- Todos los videos tienen subtítulos (botón CC). Se crean con `node herramientas/subtitulos.mjs` y después `generar_datos.mjs`.
- Las lecturas tienen audio con la voz de los videos (`node herramientas/narrar_lecturas.mjs es-CR-MariaNeural`).
- Se puede usar con teclado; los botones tienen nombres para lectores de pantalla y se respeta «reducir movimiento».
- El modo oscuro sigue la configuración del equipo; el botón «Modo oscuro» de la barra permite elegirlo a mano.

Al cambiar CSS o JS, sube el número `?v=` de sus enlaces en `index.html` para que los navegadores no usen la copia vieja.
