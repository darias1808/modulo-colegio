/*
  Contenido del mapa «Descubre tu Colegio».
  Fuentes: Revista Punto 3 (beneficios, centro de recreo, sedes) y video institucional (Mi Colegio).
  - lugares: puntos del mapa (lat/lon reales). Los que comparten "grupo" cuentan como un solo descubrimiento.
  - beneficios: islas flotantes en el mar; son beneficios que aplican en todo el país.
  El audio de cada texto se genera con tools/narrar.py (voz María, Costa Rica).
*/
var MAPA = {
  id: "mapa-beneficios",
  titulo: "Descubre tu Colegio",
  instruccion: "Toca cada lugar del mapa y cada beneficio para descubrirlo. Una voz te lo leerá.",
  lugares: [
    {
      id: "central", grupo: "central", tipo: "central", lat: 9.933, lon: -84.05,
      titulo: "Sede Central", subtitulo: "San Pedro de Montes de Oca, San José",
      texto: "En la Sede Central, en San Pedro de Montes de Oca, está el gimnasio del Colegio: completamente equipado y gratuito, con clases de spinning, funcionales, pilates y baile, medición de grasa corporal y planes personalizados. Hay especialistas en nutrición que le acompañan de forma presencial o virtual. Y para sus eventos, el Colegio ofrece un lobby y un auditorio para 286 personas.",
    },
    {
      id: "recreo", grupo: "recreo", tipo: "recreo", lat: 9.965, lon: -84.33,
      titulo: "Centro de Recreo", subtitulo: "Turrúcares, Alajuela",
      texto: "El Centro de Recreo, en Turrúcares de Alajuela, abre de martes a domingo, de ocho de la mañana a cinco de la tarde. Tiene 37 ranchos con parrilla, tres piscinas, una de ellas semiolímpica, y un lago de pesca de tilapia. También hay zonas infantiles, una granja recreativa, canchas de fútbol, baloncesto y tenis, y un sendero de un kilómetro con acceso inclusivo. Y para sus celebraciones, un salón multiusos para 150 personas.",
    },
    {
      id: "chorotega", grupo: "chorotega", tipo: "regional", lat: 10.45, lon: -85.4,
      titulo: "Sede Regional Chorotega", subtitulo: "Región Chorotega",
      texto: "En la Sede Regional Chorotega, por ser parte del Colegio, tiene descuentos especiales con profesionales en nutrición de la zona, gracias a las alianzas del Colegio.",
    },
    {
      id: "huetar-norte", grupo: "huetar-norte", tipo: "regional", lat: 10.55, lon: -84.45,
      titulo: "Sede Regional Huetar Norte", subtitulo: "Región Huetar Norte",
      texto: "La Sede Regional Huetar Norte le ofrece descuentos en gimnasios locales, por medio de las alianzas que tiene el Colegio.",
    },
    {
      id: "pacifico-central", grupo: "pacifico-central", tipo: "regional", lat: 9.85, lon: -84.75,
      titulo: "Sede Regional Pacífico Central", subtitulo: "Región Pacífico Central",
      texto: "Si tiene dudas legales, en la Sede Regional Pacífico Central le orientan profesionales en asesoría legal de la zona, aliados del Colegio.",
    },
    {
      id: "huetar-caribe", grupo: "huetar-caribe", tipo: "regional", lat: 10.0, lon: -83.15,
      titulo: "Sede Regional Huetar Caribe", subtitulo: "Región Huetar Caribe",
      texto: "La Sede Regional Huetar Caribe tiene aulas disponibles para sus capacitaciones y actividades.",
    },
    {
      id: "brunca", grupo: "brunca", tipo: "regional", lat: 9.37, lon: -83.7,
      titulo: "Sede Regional Brunca", subtitulo: "Región Brunca",
      texto: "En la Sede Regional Brunca puede realizar de forma presencial diversos trámites del Colegio.",
    },
    {
      id: "neily", grupo: "neily", tipo: "oficina", lat: 8.65, lon: -82.94,
      titulo: "Oficina Administrativa de Ciudad Neily", subtitulo: "Ciudad Neily",
      texto: "En la Oficina Administrativa de Ciudad Neily también encuentra la oferta académica del Colegio, adaptada a las oficinas administrativas.",
    },
    {
      id: "guapiles", grupo: "guapiles", tipo: "oficina", lat: 10.21, lon: -83.79,
      titulo: "Oficina Administrativa de Guápiles", subtitulo: "Guápiles",
      texto: "Desde la Oficina Administrativa de Guápiles, o desde cualquier lugar, puede usar la plataforma digital Mi Colegio: solicitar certificaciones, pagar la colegiatura y emitir su carnet en línea.",
    },
  ],
  grupos: {},
  beneficios: [
    {
      id: "desarrollo", corto: "Capacitación", lat: 9.15, lon: -86.0, icono: "libro", titulo: "Desarrollo profesional",
      texto: "Capacitación gratuita para impulsar su carrera: cursos y talleres presenciales, virtuales y bimodales, certificaciones, foros, congresos, programa de idiomas y cursos reconocidos por el Servicio Civil. La agenda académica se publica cada mes en boletines, redes sociales y el sitio web. Y si quiere compartir lo que sabe, puede formar parte del equipo de personas facilitadoras.",
    },
    {
      id: "cide", corto: "CIDE", lat: 8.55, lon: -85.25, icono: "cohete", titulo: "CIDE · Incubadora de negocios",
      texto: "¿Tiene una idea de negocio o quiere llevar su empresa al siguiente nivel? El CIDE es la incubadora de negocios del Colegio y forma parte de la Red Nacional de Incubadoras y Aceleradoras del MEIC. Le ayuda a convertir sus ideas en resultados: impulsa nuevos negocios y apoya el crecimiento de su empresa. También puede registrar su pyme en el directorio comercial.",
    },
    {
      id: "empleo", corto: "Bolsa de empleo", lat: 8.15, lon: -84.3, icono: "maletin", titulo: "Bolsa de empleo",
      texto: "En la Bolsa de Empleo encuentra vacantes en ciencias económicas, en el sector público y en el privado. Suba su currículum y manténgalo actualizado: así forma parte de la base de talento que consultan las empresas aliadas al Colegio. Todo el proceso es en línea.",
    },
    {
      id: "legal", corto: "Asesoría legal", lat: 7.95, lon: -83.25, icono: "balanza", titulo: "Asesoría legal",
      texto: "¿Tiene dudas legales? El Colegio le orienta sin costo, de forma presencial o virtual, en derecho de tránsito, derecho de familia, derecho laboral y recursos de amparo.",
    },
    {
      id: "polizas", corto: "Pólizas", lat: 11.15, lon: -83.0, icono: "escudo", titulo: "Pólizas y seguros",
      texto: "El Colegio ofrece una de las mejores pólizas colectivas de vida del mercado, en alianza con el Instituto Nacional de Seguros y la Correduría de Seguros de Coopenae. Allí puede recibir asesoría para proteger su vida, la de su familia y su patrimonio.",
    },
    {
      id: "solidario", corto: "Apoyo solidario", lat: 10.6, lon: -82.55, icono: "manos", titulo: "Beneficio por fallecimiento",
      texto: "Ante la pérdida de un ser querido, el Colegio da un aporte económico solidario. Cubre a la persona colegiada, a su cónyuge o conviviente, a sus hijos e hijas menores de 18 años, o hasta 25 si estudian, a hijos e hijas con discapacidad, y al padre o a la madre.",
    },
    {
      id: "comunidad", corto: "Comunidad", lat: 9.95, lon: -82.3, icono: "personas", titulo: "Actividades socioculturales",
      texto: "Durante todo el año hay actividades presenciales y virtuales para vivir el Colegio más allá de lo profesional: campeonatos deportivos, jornadas recreativas familiares, la Semana de Salud Integral, la Semana del Colegiado y jornadas ambientales. Es una oportunidad para hacer contactos y crear comunidad.",
    },
  ],
  fin: {
    titulo: "¡Descubriste todo tu Colegio!",
    texto: "Ya conoces las sedes y los beneficios que tienes por ser parte del Colegio de Ciencias Económicas de Costa Rica. Puedes volver a tocar cualquier punto para escucharlo otra vez.",
  },
};
