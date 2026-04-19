document.addEventListener('DOMContentLoaded', () => {
  cargarEventosPolitica();
  configurarFiltrosPolitica();
});

const contenedorEventosCreados = document.getElementById('contenedorEventosCreados');
const filtroNombre = document.getElementById('buscar-evento');
const formularioFiltros = document.querySelector('form[role="search"][aria-label="Filtros de búsqueda de eventos"]');
const filtrosFecha = {
  desdeAnio: document.getElementById('desde-anio'),
  desdeMes: document.getElementById('desde-mes'),
  desdeDia: document.getElementById('desde-dia'),
  hastaAnio: document.getElementById('hasta-anio'),
  hastaMes: document.getElementById('hasta-mes'),
  hastaDia: document.getElementById('hasta-dia'),
};

async function cargarEventosPolitica() {
  if (!contenedorEventosCreados) return;

  mostrarFiltrosPolitica();
  desactivarModoDetallePantallaCompleta();

  contenedorEventosCreados.innerHTML = '<p class="text-muted">Cargando eventos...</p>';

  try {
    const eventos = await obtenerEventosBackend();
    const eventosFiltrados = filtrarEventos(eventos);
    renderizarEventosPolitica(eventosFiltrados);
  } catch (error) {
    console.error('Error al cargar los eventos:', error);
    contenedorEventosCreados.innerHTML = '<div class="eventoPoliticaError">No se pudieron cargar los eventos. Intente nuevamente más tarde.</div>';
  }
}

async function obtenerEventosBackend() {
  const response = await fetch('/api/form-evento?estado=aprobado&estadoVigencia=activo');
  if (!response.ok) {
    throw new Error('Respuesta no válida del servidor');
  }

  const data = await response.json();
  return Array.isArray(data.eventos) ? data.eventos : [];
}

function configurarFiltrosPolitica() {
  if (!filtroNombre) return;

  let debounceTimeout;
  filtroNombre.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(cargarEventosPolitica, 350);
  });

  Object.values(filtrosFecha).forEach((elemento) => {
    elemento?.addEventListener('change', cargarEventosPolitica);
  });
}

function filtrarEventos(eventos) {
  const nombreBuscado = filtroNombre?.value.trim().toLowerCase();
  const desde = buildFechaDesde();
  const hasta = buildFechaHasta();

  return eventos.filter((evento) => {
    const nombreEvento = String(evento.nombreEvento || '')?.toLowerCase();
    if (nombreBuscado && !nombreEvento.includes(nombreBuscado)) {
      return false;
    }

    const fechaEvento = obtenerFechaPrincipal(evento);
    if (!fechaEvento) {
      return true;
    }

    if (desde && fechaEvento < desde) {
      return false;
    }
    if (hasta && fechaEvento > hasta) {
      return false;
    }

    return true;
  });
}

function buildFechaDesde() {
  const year = filtrosFecha.desdeAnio?.value;
  const month = filtrosFecha.desdeMes?.value;
  const day = filtrosFecha.desdeDia?.value;

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function buildFechaHasta() {
  const year = filtrosFecha.hastaAnio?.value;
  const month = filtrosFecha.hastaMes?.value;
  const day = filtrosFecha.hastaDia?.value;

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
}

function obtenerFechaPrincipal(evento) {
  const fechasEvento = Array.isArray(evento.fechasEvento) ? evento.fechasEvento : [];
  const fechasParseadas = fechasEvento
    .map(parsearFecha)
    .filter((fecha) => fecha instanceof Date && !Number.isNaN(fecha.getTime()));

  if (fechasParseadas.length > 0) {
    fechasParseadas.sort((a, b) => a - b);
    return fechasParseadas[0];
  }

  return parsearFecha(evento.fechaPublicacion) || null;
}

function obtenerUrlImagenEvento(imagenes) {
  if (!Array.isArray(imagenes) || imagenes.length === 0) {
    return '';
  }

  const primeraImagen = imagenes[0];
  let rutaOriginal = '';

  if (typeof primeraImagen === 'string') {
    rutaOriginal = primeraImagen;
  } else if (primeraImagen && typeof primeraImagen === 'object') {
    rutaOriginal = String(
      primeraImagen.ruta
      || primeraImagen.url
      || primeraImagen.path
      || (primeraImagen.nombreArchivo ? `/uploads/${primeraImagen.nombreArchivo}` : ''),
    ).trim();
  }

  if (!rutaOriginal) {
    return '';
  }

  const ruta = rutaOriginal.replaceAll('\\', '/');
  if (/^https?:\/\//i.test(ruta)) {
    return encodeURI(ruta);
  }

  if (ruta.startsWith('/uploads/')) {
    return encodeURI(ruta);
  }

  const uploadsIndex = ruta.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    return encodeURI(`/${ruta.slice(uploadsIndex)}`);
  }

  const nombreArchivo = ruta.split('/').pop();
  return nombreArchivo ? encodeURI(`/uploads/${nombreArchivo}`) : '';
}

function parsearFecha(fecha) {
  if (!fecha) {
    return null;
  }

  if (typeof fecha === 'string' || typeof fecha === 'number') {
    const fechaISO = new Date(fecha);
    return Number.isNaN(fechaISO.getTime()) ? null : fechaISO;
  }

  if (fecha.iso) {
    const fechaISO = new Date(fecha.iso);
    return Number.isNaN(fechaISO.getTime()) ? null : fechaISO;
  }

  const anio = Number.parseInt(fecha.anio, 10);
  const mes = Number.parseInt(fecha.mes, 10);
  const dia = Number.parseInt(fecha.dia, 10);

  if ([anio, mes, dia].some((valor) => Number.isNaN(valor))) {
    return null;
  }

  return new Date(anio, mes - 1, dia);
}

const breadcrumbLista = document.querySelector('.breadcrumbEventos ol.breadcrumb');

function renderizarEventosPolitica(eventos) {
  if (!contenedorEventosCreados) return;

  if (!eventos.length) {
    contenedorEventosCreados.innerHTML = '<div class="eventoPoliticaCardPlaceholder">No se encontraron eventos que coincidan con la búsqueda.</div>';
    restaurarBreadcrumb();
    return;
  }

  contenedorEventosCreados.innerHTML = eventos
    .map((evento) => crearCardEvento(evento))
    .join('');

  contenedorEventosCreados.querySelectorAll('.eventoPoliticaLink').forEach((boton) => {
    boton.addEventListener('click', manejarSeleccionEvento);
  });

  const eventoIdEnUrl = new URLSearchParams(window.location.search).get('eventoId');
  if (eventoIdEnUrl) {
    cargarDetalleEvento(eventoIdEnUrl);
  }
}

function crearCardEvento(evento) {
  const fecha = obtenerFechaPrincipal(evento) || new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha
    .toLocaleString('es-CR', { month: 'short' })
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase();
  const mesLargo = fecha.toLocaleString('es-CR', { month: 'long' });
  const fechaFormateada = `${dia} ${mesLargo.charAt(0).toUpperCase()}${mesLargo.slice(1)} ${fecha.getFullYear()}`;

  const horaInicio = evento.horario?.horaInicio || 'Pendiente';
  const horaFin = evento.horario?.horaFin || 'Pendiente';
  const lugar = evento.lugarEvento || 'Lugar por confirmar';
  const nombreEvento = evento.nombreEvento || 'Evento sin título';
  const imagen = obtenerUrlImagenEvento(evento.imagenes) || './assets/img/eventos-discapacidad.webp';

  return `
    <article class="eventoPoliticaCard">
      <div class="eventoPoliticaImg">
        <img src="${escapeHtml(imagen)}" alt="${escapeHtml(nombreEvento)}">
      </div>
      <div class="eventoPoliticaBody">
        <div class="eventoPoliticaTop">
          <div class="eventoCardFecha" aria-hidden="true">
            <span class="fechaDia">${dia}</span>
            <span class="fechaMes">${mes}</span>
          </div>
          <div class="eventoPoliticaInfo">
            <p class="tituloCardEventos">${escapeHtml(nombreEvento)}</p>
            <p><i class="fa-regular fa-calendar" aria-hidden="true"></i>${fechaFormateada}</p>
            <p><i class="fa-regular fa-clock" aria-hidden="true"></i>${horaInicio} - ${horaFin}</p>
            <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${escapeHtml(lugar)}</p>
          </div>
        </div>
        <button type="button" class="eventoPoliticaLink" data-evento-id="${evento._id}" data-evento-nombre="${escapeHtml(nombreEvento)}" aria-label="Ver detalle del evento ${escapeHtml(nombreEvento)}">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  `;
}

function manejarSeleccionEvento(evento) {
  const boton = evento.currentTarget;
  const eventoId = boton.dataset.eventoId;
  const nombreEvento = boton.dataset.eventoNombre || '';

  if (!eventoId) return;

  window.history.pushState({ eventoId }, '', `?eventoId=${eventoId}`);
  cargarDetalleEvento(eventoId, nombreEvento);
}

window.addEventListener('popstate', (evento) => {
  const eventoId = evento.state?.eventoId || new URLSearchParams(window.location.search).get('eventoId');
  if (eventoId) {
    cargarDetalleEvento(eventoId);
  } else {
    volverAlListado();
  }
});

function volverAlListado() {
  window.history.pushState({}, '', './eventos-politica.html');
  restaurarBreadcrumb();
  mostrarFiltrosPolitica();
  cargarEventosPolitica();
}

async function cargarDetalleEvento(eventoId, nombreEvento = '') {
  if (!contenedorEventosCreados) return;

  ocultarFiltrosPolitica();
  activarModoDetallePantallaCompleta();

  contenedorEventosCreados.innerHTML = '<div class="eventoPoliticaCardPlaceholder">Cargando detalle del evento...</div>';

  try {
    const evento = await obtenerEventoDetalle(eventoId);
    if (!evento) {
      cargarEventosPolitica();
      return;
    }

    contenedorEventosCreados.innerHTML = crearDetalleEvento(evento);
    configurarLecturaFacilEventoDetalle();
    actualizarBreadcrumb(evento.nombreEvento || nombreEvento);
  } catch (error) {
    console.error('Error al cargar el detalle del evento:', error);
    contenedorEventosCreados.innerHTML = '<div class="eventoPoliticaError">No se pudo cargar el detalle del evento.</div>';
  }
}

async function obtenerEventoDetalle(eventoId) {
  const response = await fetch(`/api/form-evento/${eventoId}`);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.evento || null;
}

function actualizarBreadcrumb(tituloEvento) {
  if (!breadcrumbLista) return;

  const breadcrumbActivo = breadcrumbLista.querySelector('.breadcrumb-item.active');
  if (breadcrumbActivo) {
    const textoActual = breadcrumbActivo.textContent;
    breadcrumbActivo.classList.remove('active');
    breadcrumbActivo.removeAttribute('aria-current');
    breadcrumbActivo.innerHTML = `<a class="text-decoration-none" href="./eventos-politica.html">${escapeHtml(textoActual)}</a>`;
  }

  const item = document.createElement('li');
  item.className = 'breadcrumb-item active';
  item.setAttribute('aria-current', 'page');
  item.textContent = tituloEvento;
  breadcrumbLista.appendChild(item);
}

function restaurarBreadcrumb() {
  if (!breadcrumbLista) return;

  breadcrumbLista.innerHTML = `
    <li class="breadcrumb-item"><a class="text-decoration-none" href="./index.html">Inicio</a></li>
    <li class="breadcrumb-item"><a class="text-decoration-none" href="./eventos.html">Eventos</a></li>
    <li class="breadcrumb-item active" aria-current="page">Política Nacional de Discapacidad</li>
  `;
}

function crearDetalleEvento(evento) {
  const fecha = obtenerFechaPrincipal(evento) || new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleString('es-CR', { month: 'short' }).toUpperCase();
  const mesLargo = fecha.toLocaleString('es-CR', { month: 'long' });
  const fechaFormateada = fecha.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const nombreEvento = evento.nombreEvento || 'Evento sin título';
  const lugar = evento.lugarEvento || 'Lugar por confirmar';
  const horaInicio = evento.horario?.horaInicio || 'Pendiente';
  const horaFin = evento.horario?.horaFin || 'Pendiente';
  const imagen = obtenerUrlImagenEvento(evento.imagenes) || './assets/img/eventos-discapacidad.webp';
  const contactoNombre = evento.contacto?.nombreCompleto || 'Contacto disponible';
  const contactoEmail = evento.contacto?.correoElectronico || 'No disponible';
  const descripcion = evento.descripcionEvento || '';
  const publicoMeta = evento.publicoMeta || 'No disponible';
  const contactoTelefono = evento.contacto?.telefono || 'No disponible';
  const contactoInstitucion = evento.contacto?.institucion || '';
  const cupoEvento = evento.cupoEvento ? `${evento.cupoEvento} cupos disponibles` : 'Cupos no especificados';
  const objetivos = evento.objetivosEvento || '';
  const agenda = evento.agendaEvento || '';
  const infoAdicional = evento.infoAdicional || '';
  const linkCalendar = evento.linkCalendar || '#';

  const objetivosHtml = construirListaDesdeTexto(objetivos, 2);
  const agendaHtml = construirFilasAgendaDesdeTexto(agenda);
  const infoAdicionalHtml = construirParrafosDesdeTexto(infoAdicional);
  const imagenesCarrusel = obtenerImagenesCarrusel(evento.imagenes, imagen);
  const carouselId = `eventoPoliticaCarousel-${String(evento._id || 'detalle').replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return `
    <div class="eventoPoliticaDetalleContainer">
      <div id="estructuraEventosPolitica" class="eventoPoliticaDetalleWrapper">
      <section class="eventoPoliticaDetalleVista" aria-labelledby="titulo-evento-politica">
        <div class="eventoPoliticaHeroPortada">
          <img src="${escapeHtml(imagen)}" alt="Imagen del evento ${escapeHtml(nombreEvento)}">
        </div>

        <div class="eventoPoliticaContenidoInterior px-lg-5">
          <div class="eventoPoliticaTituloFranja d-flex align-items-center gap-3">
            <div class="eventoPoliticaFechaBadge" aria-hidden="true">
              <span class="eventoPoliticaFechaDia">${dia}</span>
              <span class="eventoPoliticaFechaMes">${mes}</span>
            </div>
            <h1 id="titulo-evento-politica" class="eventoPoliticaTituloPrincipal mb-0">${escapeHtml(nombreEvento)}</h1>
          </div>

          <div class="row g-4 eventoPoliticaContenido pt-4">
            <div class="col-12 col-lg-7">
              <section class="eventoPoliticaBloqueContenido" aria-labelledby="titulo-descripcion-evento">
                <h2 id="titulo-descripcion-evento" class="eventoPoliticaSeccionTitulo">Descripción</h2>
                <div class="eventoPoliticaInfoAdicionalTexto">${construirParrafosDesdeTexto(descripcion)}</div>

                <h2 class="eventoPoliticaSeccionTitulo mt-4">Objetivos</h2>
                <ol class="eventoPoliticaListaObjetivos">${objetivosHtml}</ol>
              </section>
            </div>

            <div class="col-12 col-lg-5">
              <aside class="eventoPoliticaSidebar d-flex flex-column gap-3" aria-label="Información complementaria del evento">
                <section class="eventoPoliticaCaja eventoPoliticaCajaClara" aria-labelledby="titulo-info-evento">
                  <h2 id="titulo-info-evento" class="eventoPoliticaSeccionTitulo">Información del evento</h2>
                  <ul class="eventoPoliticaListaInfo">
                    <li><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${fechaFormateada}</li>
                    <li><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(horaInicio)} - ${escapeHtml(horaFin)}</li>
                    <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(lugar)}</li>
                  </ul>
                  <div class="eventoPoliticaContacto">
                    <p class="mb-1 fw-semibold">${escapeHtml(contactoNombre)}${contactoInstitucion ? `<br>${escapeHtml(contactoInstitucion)}` : ''}</p>
                    <p class="mb-1">Teléfono: ${escapeHtml(contactoTelefono)}</p>
                    <p class="mb-0">Correo electrónico: ${escapeHtml(contactoEmail)}</p>
                  </div>
                </section>

                <section class="eventoPoliticaCaja eventoPoliticaCajaAzul" aria-labelledby="titulo-publico-meta">
                  <h2 id="titulo-publico-meta" class="eventoPoliticaSeccionTitulo text-white">Público Meta</h2>
                  <p class="eventoPoliticaTextoBlanco">${escapeHtml(publicoMeta)}</p>
                  <div class="eventoPoliticaAccionMeta d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                    <strong class="eventoPoliticaCupos">${escapeHtml(cupoEvento)}</strong>
                    <a class="eventoPoliticaBotonInscripcion text-decoration-none" href="${escapeHtml(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
                  </div>
                </section>

                <section class="eventoPoliticaEnlaceEvento" aria-labelledby="titulo-enlace-evento">
                  <h2 id="titulo-enlace-evento" class="eventoPoliticaSeccionTitulo">Enlace del evento</h2>
                  <a href="${escapeHtml(linkCalendar)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkCalendar)}</a>
                </section>
              </aside>
            </div>
          </div>
        </div>

        <div class="eventoPoliticaInfoAdicionalCard mt-5">
          <div class="eventoPoliticaInfoAdicionalContenido">
            <section class="eventoPoliticaAgendaSection" aria-labelledby="titulo-agenda-evento">
              <h2 id="titulo-agenda-evento" class="eventoPoliticaAgendaTitulo">Programa / Agenda del evento</h2>

              <div class="eventoPoliticaAgendaTabla mt-3">
                <div class="eventoPoliticaAgendaCabecera">Día ${dia} de ${escapeHtml(mesLargo)} ${fecha.getFullYear()}</div>
                ${agendaHtml}
              </div>
            </section>

            <h2 id="titulo-info-adicional" class="eventoPoliticaInfoAdicionalTitulo">Información Adicional</h2>
            <div class="eventoPoliticaInfoAdicionalTexto">${infoAdicionalHtml}</div>

            <div class="eventoPoliticaInfoAdicionalAcciones d-flex flex-wrap gap-3 mt-4">
              <button id="btnLecturaFacilEvento" type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--primary" aria-controls="lecturaFacilVentana" aria-expanded="false">Lectura Fácil del Evento</button>
              <button type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--secondary">Realizar consulta</button>
            </div>

            <div id="lecturaFacilVentana" class="eventoPoliticaLecturaFacilVentana d-none" role="region" aria-live="polite" aria-labelledby="lecturaFacilTitulo">
              <h3 id="lecturaFacilTitulo" class="eventoPoliticaLecturaFacilTitulo"></h3>
              <div id="lecturaFacilContenido" class="eventoPoliticaLecturaFacilContenido"></div>
            </div>

            <div id="${carouselId}" class="carousel slide eventoPoliticaCarruselWrap mt-5" data-bs-ride="false" aria-label="Galería del evento">
              <div class="carousel-indicators eventoPoliticaCarruselIndicadores">
                ${imagenesCarrusel
                  .map((_, indice) => `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${indice}" class="eventoPoliticaCarruselDot ${indice === 0 ? 'active' : ''}" ${indice === 0 ? 'aria-current="true"' : ''} aria-label="Diapositiva ${indice + 1}"></button>`)
                  .join('')}
              </div>

              <div class="carousel-inner eventoPoliticaCarruselVista">
                ${imagenesCarrusel
                  .map((src, indice) => `<div class="carousel-item ${indice === 0 ? 'active' : ''}"><img src="${escapeHtml(src)}" class="d-block w-100 eventoPoliticaCarruselImagen" alt="Imagen ${indice + 1} del evento ${escapeHtml(nombreEvento)}"></div>`)
                  .join('')}
              </div>

              <button class="carousel-control-prev eventoPoliticaCarruselControl" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev" aria-label="Ver imagen anterior">
                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
              </button>
              <button class="carousel-control-next eventoPoliticaCarruselControl" type="button" data-bs-target="#${carouselId}" data-bs-slide="next" aria-label="Ver imagen siguiente">
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </button>
            </div>

            <div class="text-center mt-4">
              <a class="eventoPoliticaInscripcionEventoBtn text-decoration-none" href="${escapeHtml(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
            </div>

            <div class="eventoPoliticaPieAcciones row g-4 mt-5">
              <div class="col-12 col-lg-6">
                <div class="eventoPoliticaPieCard eventoPoliticaPieCard--calendar">
                  <div class="eventoPoliticaPieIcono">
                    <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  </div>
                  <div>
                    <p class="eventoPoliticaPieTitulo">Ver en evento en calendario:</p>
                    <a href="${escapeHtml(linkCalendar)}" class="eventoPoliticaPieEnlace" target="_blank" rel="noopener noreferrer">${escapeHtml(linkCalendar)}</a>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="eventoPoliticaPieCard eventoPoliticaPieCard--share justify-content-lg-between">
                  <p class="eventoPoliticaPieTitulo mb-0">PUBLICAR EVENTO:</p>
                  <div class="eventoPoliticaRedesSociales" aria-label="Compartir evento">
                    <a href="#" aria-label="Compartir en Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
                    <a href="#" aria-label="Compartir en Twitter"><i class="fa-brands fa-twitter" aria-hidden="true"></i></a>
                    <a href="#" aria-label="Compartir en LinkedIn"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  `;
}

function ocultarFiltrosPolitica() {
  if (!formularioFiltros) return;
  formularioFiltros.classList.add('d-none');
}

function mostrarFiltrosPolitica() {
  if (!formularioFiltros) return;
  formularioFiltros.classList.remove('d-none');
}

function activarModoDetallePantallaCompleta() {
  if (!contenedorEventosCreados) return;
  contenedorEventosCreados.classList.add('eventoPoliticaDetallePantallaCompleta');
}

function desactivarModoDetallePantallaCompleta() {
  if (!contenedorEventosCreados) return;
  contenedorEventosCreados.classList.remove('eventoPoliticaDetallePantallaCompleta');
}

function construirListaDesdeTexto(texto, maxItems = 4) {
  const items = String(texto || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n+/)
    .map((item) => item.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
    .slice(0, maxItems);

  if (!items.length) {
    return '<li>No hay objetivos registrados para este evento.</li>';
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function construirFilasAgendaDesdeTexto(texto) {
  const lineas = String(texto || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n+/)
    .map((linea) => linea.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  if (!lineas.length) {
    return `
      <div class="eventoPoliticaAgendaFila">
        <div class="eventoPoliticaAgendaHora">Pendiente</div>
        <div class="eventoPoliticaAgendaDetalle">No hay agenda registrada para este evento.</div>
      </div>
    `;
  }

  return lineas
    .slice(0, 8)
    .map((linea) => {
      const partes = linea.split(/\s*-\s*|\s*:\s*/);
      const tieneHora = /\d{1,2}(:\d{2})?/i.test(linea);
      const hora = tieneHora ? partes.slice(0, 2).join(' - ') : 'Actividad';
      const detalle = tieneHora ? linea.replace(hora, '').replace(/^\s*[-:]/, '').trim() : linea;

      return `
        <div class="eventoPoliticaAgendaFila">
          <div class="eventoPoliticaAgendaHora">${escapeHtml(hora || 'Actividad')}</div>
          <div class="eventoPoliticaAgendaDetalle">${escapeHtml(detalle || linea)}</div>
        </div>
      `;
    })
    .join('');
}

function construirParrafosDesdeTexto(texto) {
  const parrafos = String(texto || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n+/)
    .map((parrafo) => parrafo.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  if (!parrafos.length) {
    return '<p>No hay información disponible.</p>';
  }

  return parrafos.map((parrafo) => `<p>${escapeHtml(parrafo)}</p>`).join('');
}

function obtenerImagenesCarrusel(imagenesEvento, fallback) {
  const imagenes = Array.isArray(imagenesEvento)
    ? imagenesEvento
      .map((imagenItem) => obtenerUrlImagenEvento([imagenItem]))
      .filter(Boolean)
    : [];

  if (!imagenes.length) {
    return [fallback, fallback, fallback, fallback];
  }

  const resultado = imagenes.slice(0, 4);
  while (resultado.length < 4) {
    resultado.push(resultado[resultado.length - 1]);
  }
  return resultado;
}

function configurarLecturaFacilEventoDetalle() {
  const botonLecturaFacil = document.getElementById('btnLecturaFacilEvento');
  const ventanaLectura = document.getElementById('lecturaFacilVentana');
  const tituloLectura = document.getElementById('lecturaFacilTitulo');
  const contenidoLectura = document.getElementById('lecturaFacilContenido');

  if (!botonLecturaFacil || !ventanaLectura || !tituloLectura || !contenidoLectura) {
    return;
  }

  botonLecturaFacil.addEventListener('click', () => {
    const estaVisible = !ventanaLectura.classList.contains('d-none');
    if (estaVisible) {
      ventanaLectura.classList.add('d-none');
      botonLecturaFacil.classList.remove('is-active');
      botonLecturaFacil.setAttribute('aria-expanded', 'false');
      return;
    }

    const resumen = generarResumenLecturaFacilDetalle();
    tituloLectura.textContent = resumen.titulo;
    contenidoLectura.innerHTML = resumen.parrafos
      .map((parrafo) => `<p>${escapeHtml(parrafo)}</p>`)
      .join('');

    ventanaLectura.classList.remove('d-none');
    botonLecturaFacil.classList.add('is-active');
    botonLecturaFacil.setAttribute('aria-expanded', 'true');
    ventanaLectura.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function generarResumenLecturaFacilDetalle() {
  const tituloEvento = obtenerTextoDetalle('#titulo-evento-politica', 'Evento sin título');

  const descripcion = Array.from(document.querySelectorAll('.eventoPoliticaBloqueContenido p'))
    .map((elemento) => elemento.textContent.trim())
    .filter(Boolean);

  const objetivos = Array.from(document.querySelectorAll('.eventoPoliticaListaObjetivos li'))
    .map((elemento) => elemento.textContent.trim())
    .filter(Boolean);

  const agenda = Array.from(document.querySelectorAll('.eventoPoliticaAgendaFila'))
    .map((fila) => {
      const hora = fila.querySelector('.eventoPoliticaAgendaHora')?.textContent.trim();
      const detalle = fila.querySelector('.eventoPoliticaAgendaDetalle')?.textContent.trim();
      return hora && detalle ? `${hora}: ${detalle}` : null;
    })
    .filter(Boolean);

  const datosEvento = Array.from(document.querySelectorAll('.eventoPoliticaListaInfo li'))
    .map((elemento) => elemento.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const cupos = obtenerTextoDetalle('.eventoPoliticaCupos', 'Cupos no especificados');

  const parrafos = [`Este evento se llama ${tituloEvento}.`];
  if (datosEvento.length > 0) {
    parrafos.push(`Datos clave: ${datosEvento.join('. ')}.`);
  }
  if (descripcion.length > 0) {
    parrafos.push(`Resumen rápido: ${descripcion.slice(0, 2).join(' ')}`);
  }
  if (objetivos.length > 0) {
    parrafos.push(`Objetivos principales: ${objetivos.slice(0, 2).join(' ')}`);
  }
  if (agenda.length > 0) {
    parrafos.push(`Agenda del evento: ${agenda.slice(0, 3).join(' / ')}.`);
  }
  parrafos.push(`Disponibilidad: ${cupos}.`);

  return {
    titulo: tituloEvento,
    parrafos,
  };
}

function obtenerTextoDetalle(selector, respaldo) {
  const elemento = document.querySelector(selector);
  const texto = elemento?.textContent.trim();
  return texto || respaldo;
}

function convertirLineas(texto) {
  return escapeHtml(texto).replace(/\r?\n/g, '<br>');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
