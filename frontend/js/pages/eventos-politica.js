document.addEventListener('DOMContentLoaded', () => {
  cargarEventosPolitica();
  configurarFiltrosPolitica();
});

const contenedorEventosCreados = document.getElementById('contenedorEventosCreados');
const filtroNombre = document.getElementById('buscar-evento');
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
  const mes = fecha.toLocaleString('es-CR', { month: 'short' }).toUpperCase();
  const fechaFormateada = fecha.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
            <h3>${escapeHtml(nombreEvento)}</h3>
            <p><i class="fa-regular fa-calendar" aria-hidden="true"></i>${fechaFormateada}</p>
            <p><i class="fa-regular fa-clock" aria-hidden="true"></i>${horaInicio} - ${horaFin}</p>
            <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${escapeHtml(lugar)}</p>
          </div>
        </div>
        <div class="eventoPoliticaFooter">
          <span class="text-muted small">Publicado</span>
          <button type="button" class="eventoPoliticaLink" data-evento-id="${evento._id}" data-evento-nombre="${escapeHtml(nombreEvento)}" aria-label="Ver detalle del evento ${escapeHtml(nombreEvento)}">›</button>
        </div>
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
  cargarEventosPolitica();
}

async function cargarDetalleEvento(eventoId, nombreEvento = '') {
  if (!contenedorEventosCreados) return;

  contenedorEventosCreados.innerHTML = '<div class="eventoPoliticaCardPlaceholder">Cargando detalle del evento...</div>';

  try {
    const evento = await obtenerEventoDetalle(eventoId);
    if (!evento) {
      cargarEventosPolitica();
      return;
    }

    contenedorEventosCreados.innerHTML = crearDetalleEvento(evento);
    document.querySelector('.eventoDetalleVolverBtn')?.addEventListener('click', volverAlListado);
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
  const publicoMeta = evento.publicoMeta || 'No disponible';
  const cupoEvento = evento.cupoEvento || 'No especificado';
  const descripcion = evento.descripcionEvento || '';
  const objetivos = evento.objetivosEvento || '';
  const agenda = evento.agendaEvento || '';
  const infoAdicional = evento.infoAdicional || '';
  const linkCalendar = evento.linkCalendar || '#';

  return `
    <section class="eventoPoliticaDetalle" aria-labelledby="tituloDetalleEvento">
      <div class="eventoDetalleHero">
        <img src="${escapeHtml(imagen)}" alt="Imagen del evento ${escapeHtml(nombreEvento)}">
        <div class="eventoDetalleHeroTexto">
          <span class="eventoDetalleHeroFecha">${dia} ${mes}</span>
          <h2 id="tituloDetalleEvento">${escapeHtml(nombreEvento)}</h2>
        </div>
      </div>

      <div class="mt-4">
        <button type="button" class="eventoDetalleVolverBtn">Volver a Eventos</button>
      </div>

      <div class="row g-4 mt-4">
        <div class="col-12 col-xl-8">
          <div class="eventoDetalleSection">
            <h3>Descripción</h3>
            <div class="eventoDetalleTexto">${convertirLineas(descripcion)}</div>
          </div>

          <div class="eventoDetalleSection d-flex flex-column flex-lg-row gap-4">
            <div class="eventoDetalleCard eventoDetalleCard--primary">
              <h4>Público Meta</h4>
              <p>${escapeHtml(publicoMeta)}</p>
              <strong>${escapeHtml(cupoEvento)}</strong>
              <a class="eventoDetalleBoton" href="${escapeHtml(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
            </div>

            <div class="eventoDetalleCard eventoDetalleCard--secondary">
              <h4>Objetivos</h4>
              <div class="eventoDetalleTexto">${convertirLineas(objetivos)}</div>
            </div>
          </div>

          <div class="eventoDetalleSection">
            <h3>Programa / Agenda del evento</h3>
            <div class="eventoDetalleTexto">${convertirLineas(agenda)}</div>
          </div>

          <div class="eventoDetalleSection">
            <h3>Información Adicional</h3>
            <div class="eventoDetalleTexto">${convertirLineas(infoAdicional)}</div>
          </div>
        </div>

        <aside class="col-12 col-xl-4">
          <div class="eventoDetalleInfoBox">
            <h4>Información del evento</h4>
            <p><i class="fa-regular fa-calendar"></i> ${fechaFormateada}</p>
            <p><i class="fa-regular fa-clock"></i> ${escapeHtml(horaInicio)} - ${escapeHtml(horaFin)}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${escapeHtml(lugar)}</p>
            <p><i class="fa-solid fa-user"></i> ${escapeHtml(contactoNombre)}</p>
            <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(contactoEmail)}</p>
          </div>
        </aside>
      </div>
    </section>
  `;
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
