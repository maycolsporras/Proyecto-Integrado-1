const maxFileSizeBytes = 10 * 1024 * 1024;

const validationErrorClasses = [
    'ceInput-error',
    'ceSelect-error',
    'ceTextarea-error',
    'ceRichEditor-error',
    'ceLinkInput-error',
    'ceFileInput-error',
]

function getValidationTarget(field) {
    if (!field) {
        return null;
    }

    if (field.classList.contains('ceLinkField')) {
        return field.closest('.ceLinkInput') || field;
    }

    if (field.type === 'file') {
        return field.closest('.ceFileInput') || field;
    }

    return field;
}

function limpiarValidacionCampo(field) {
    const validationTarget = getValidationTarget(field);

    validationTarget?.classList.remove(...validationErrorClasses);
    validationTarget?.removeAttribute('aria-invalid');

    if (validationTarget !== field) {
        field.classList.remove(...validationErrorClasses);
        field.removeAttribute('aria-invalid');
    }
}

function marcarValidacionCampo(field) {
    const validationTarget = getValidationTarget(field);

    if (field.classList.contains('ceInput')) {
        validationTarget?.classList.add('ceInput-error');
    } else if (field.classList.contains('ceSelect') || field.classList.contains('ceSelectFull')) {
        validationTarget?.classList.add('ceSelect-error');
    } else if (field.classList.contains('ceTextarea')) {
        validationTarget?.classList.add('ceTextarea-error');
    } else if (field.classList.contains('ceRichEditor')) {
        validationTarget?.classList.add('ceRichEditor-error');
    } else if (field.classList.contains('ceLinkField')) {
        validationTarget?.classList.add('ceLinkInput-error');
    } else if (field.type === 'file') {
        validationTarget?.classList.add('ceFileInput-error');
    } else {
        validationTarget?.classList.add('ceInput-error');
    }

    validationTarget?.setAttribute('aria-invalid', 'true');
}

function enfocarPrimerError(field) {
    const validationTarget = getValidationTarget(field);

    validationTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof field.focus === 'function') {
        field.focus({ preventScroll: true });
    }
}

function esCorreoValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function esUrlValida(valor) {
    try {
        const url = new URL(valor);
        return Boolean(url.protocol && url.host);
    } catch {
        return false;
    }
}

function construirUrlImagenEvento(ruta) {
    if (!ruta || typeof ruta !== 'string') {
        return '';
    }

    const pathNormalizado = ruta.replace(/\\/g, '/').trim();
    if (!pathNormalizado) {
        return '';
    }

    if (/^https?:\/\//i.test(pathNormalizado)) {
        return pathNormalizado;
    }

    if (/^\/uploads\//.test(pathNormalizado)) {
        return pathNormalizado;
    }

    const uploadsIndex = pathNormalizado.indexOf('uploads/');
    if (uploadsIndex !== -1) {
        return `/${pathNormalizado.slice(uploadsIndex)}`;
    }

    const nombreArchivo = pathNormalizado.split('/').pop();
    return nombreArchivo ? `/uploads/${nombreArchivo}` : '';
}

function validarCampo(field, { requerido = true, archivoObligatorio = false } = {}) {
    limpiarValidacionCampo(field);

    const valor = typeof field.value === 'string' ? field.value.trim() : '';
    let esInvalido = false;

    if (field.getAttribute('contenteditable') === 'true') {
        esInvalido = field.textContent.trim() === '';
    } else if (field.type === 'file') {
        const archivo = field.files?.[0];

        if (!archivo) {
            esInvalido = archivoObligatorio;
        } else if (archivo.size > maxFileSizeBytes) {
            esInvalido = true;
        }
    } else if (field.tagName === 'SELECT') {
        esInvalido = valor === '' || valor === '0000';
    } else if (field.type === 'email') {
        esInvalido = valor === '' || !esCorreoValido(valor);
    } else if (field.type === 'url') {
        esInvalido = valor === '' || !esUrlValida(valor);
    } else {
        esInvalido = requerido ? valor === '' : false;
    }

    if (esInvalido) {
        marcarValidacionCampo(field);
    }

    return !esInvalido;
}

function actualizarBotonesArchivo(wrapper) {
    const filas = wrapper.querySelectorAll('.ceFileRow');

    filas.forEach((fila) => {
        fila.querySelector('.ceCircleBtnRemove').disabled = filas.length === 1;
    });
}

function marcarSelectsRequeridos(root, selector) {
    root?.querySelectorAll(selector).forEach((select) => {
        select.setAttribute('aria-required', 'true');
    });
}

function mostrarModalEventoIncompleto() {
    const modalElement = document.getElementById('modalEventoIncompleto');

    if (!modalElement) {
        return false;
    }

    if (!globalThis.bootstrap?.Modal) {
        return false;
    }

    globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    return true;
}

function mostrarModalEventoEnviado() {
    const modalElement = document.getElementById('modalEventoEnviado');

    if (!modalElement) {
        return false;
    }

    if (!globalThis.bootstrap?.Modal) {
        return false;
    }

    globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    return true;
}

function mostrarModalEventoEditado() {
    const modalElement = document.getElementById('modalEventoEditado');

    if (!modalElement) {
        return false;
    }

    if (!globalThis.bootstrap?.Modal) {
        return false;
    }

    globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    return true;
}

function confirmarEdicionEvento() {
    const modalElement = document.getElementById('modalConfirmarEdicionEvento');
    const acceptButton = modalElement?.querySelector('.modalEliminarEventoBtnEliminar');

    if (!modalElement || !acceptButton || !globalThis.bootstrap?.Modal) {
        return Promise.resolve(globalThis.confirm('¿Desea guardar los cambios del evento?'));
    }

    const modalInstance = globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);

    return new Promise((resolve) => {
        let confirmed = false;

        const onAccept = () => {
            confirmed = true;
            modalInstance.hide();
        };

        const onHidden = () => {
            acceptButton.removeEventListener('click', onAccept);
            modalElement.removeEventListener('hidden.bs.modal', onHidden);
            resolve(confirmed);
        };

        acceptButton.addEventListener('click', onAccept);
        modalElement.addEventListener('hidden.bs.modal', onHidden);
        modalInstance.show();
    });
}

function normalizarHtmlEditor(editorElement) {
    if (!editorElement) {
        return '';
    }

    return editorElement.innerHTML.trim();
}

function crearIsoFecha({ anio, mes, dia }) {
    if (!anio || !mes || !dia) {
        return '';
    }

    return `${anio}-${mes}-${dia}`;
}

function isPendingEditionContext(context) {
    return context?.source === 'evento'
        && Boolean(context?.eventoId)
        && context?.estado === 'pendiente_aprobacion';
}

function initCrearEvento() {
    const formRoot = document.querySelector('.ceCard');
    if (!formRoot) {
        return;
    }

    if (formRoot.dataset.ceInitialized === 'true') {
        const botonesNavegacionPresentes =
            formRoot.querySelector('#btnSiguiente') &&
            formRoot.querySelector('#btnAnterior') &&
            formRoot.querySelector('#btnEnviarAprobacion');

        if (botonesNavegacionPresentes) {
            return;
        }
    }

    formRoot.dataset.ceInitialized = 'true';
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaActual = String(hoy.getDate()).padStart(2, '0');
    const mesActualNumero = Number.parseInt(mesActual, 10);
    const diaActualNumero = Number.parseInt(diaActual, 10);

    // ── Helpers para generar opciones de selects ──────────────────

    function generarAnios(selectEl, desde = anioActual, hasta = anioActual + 5, anioSeleccionado = anioActual) {
        for (let y = desde; y <= hasta; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === anioSeleccionado) opt.selected = true;
            selectEl.appendChild(opt);
        }
    }

    function obtenerMesesDisponibles(anioSeleccionado) {
        const inicio = anioSeleccionado === anioActual ? mesActualNumero : 1;
        const meses = [];

        for (let mes = inicio; mes <= 12; mes++) {
            meses.push(String(mes).padStart(2, '0'));
        }

        return meses;
    }

    function generarMeses(selectEl, anioSeleccionado, mesSeleccionado = '') {
        const mesesDisponibles = obtenerMesesDisponibles(anioSeleccionado);
        const valorMes = mesesDisponibles.includes(String(mesSeleccionado))
            ? String(mesSeleccionado)
            : (mesesDisponibles[0] || '');

        selectEl.innerHTML = '';

        mesesDisponibles.forEach((mes) => {
            const opt = document.createElement('option');
            opt.value = mes;
            opt.textContent = mes;
            if (mes === valorMes) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });
    }

    function generarDias(selectEl, anioSeleccionado, mesSeleccionado, diaSeleccionado = '') {
        const anio = Number.parseInt(anioSeleccionado, 10);
        const mes = Number.parseInt(mesSeleccionado, 10);

        if (Number.isNaN(anio) || Number.isNaN(mes)) {
            selectEl.innerHTML = '';
            return;
        }

        const ultimoDia = new Date(anio, mes, 0).getDate();
        const inicioDia = anio === anioActual && mes === mesActualNumero ? diaActualNumero : 1;
        const diasDisponibles = [];

        for (let dia = inicioDia; dia <= ultimoDia; dia++) {
            diasDisponibles.push(String(dia).padStart(2, '0'));
        }

        const valorDia = diasDisponibles.includes(String(diaSeleccionado))
            ? String(diaSeleccionado)
            : (diasDisponibles[0] || '');

        selectEl.innerHTML = '';

        diasDisponibles.forEach((dia) => {
            const opt = document.createElement('option');
            opt.value = dia;
            opt.textContent = dia;
            if (dia === valorDia) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });
    }

    function sincronizarSelectsFecha(selectAnio, selectMes, selectDia) {
        const anioSeleccionado = Number.parseInt(selectAnio.value, 10);
        const mesPrevio = selectMes.value;
        const diaPrevio = selectDia.value;

        generarMeses(selectMes, anioSeleccionado, mesPrevio);
        generarDias(selectDia, selectAnio.value, selectMes.value, diaPrevio);
    }

    function generarHoras(selectEl, defaultHour = '14') {
        for (let h = 0; h < 24; h++) {
            const hStr = String(h).padStart(2, '0') + ':00';
            const opt = document.createElement('option');
            opt.value = hStr;
            opt.textContent = hStr;
            if (String(h).padStart(2, '0') === defaultHour) opt.selected = true;
            selectEl.appendChild(opt);
        }
    }

    // ── Inicializar selects del paso 1 ────────────────────────────

    const selectFechaPubAnio = document.getElementById('fechaPubAnio');
    const selectFechaPubMes = document.getElementById('fechaPubMes');
    const selectFechaPubDia = document.getElementById('fechaPubDia');

    generarAnios(selectFechaPubAnio);
    sincronizarSelectsFecha(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);
    generarHoras(document.getElementById('horaInicio'), '14');
    generarHoras(document.getElementById('horaFin'), '17');

    selectFechaPubAnio.addEventListener('change', () => {
        sincronizarSelectsFecha(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);
    });

    selectFechaPubMes.addEventListener('change', () => {
        sincronizarSelectsFecha(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);
    });

    marcarSelectsRequeridos(formRoot, '#fechaPubAnio, #fechaPubMes, #fechaPubDia, #horaInicio, #horaFin, #fechaFinAnio, #fechaFinMes, #fechaFinDia');

    // Fecha de visualización final (paso 2)
    const selectFechaFinAnio = document.getElementById('fechaFinAnio');
    const selectFechaFinMes = document.getElementById('fechaFinMes');
    const selectFechaFinDia = document.getElementById('fechaFinDia');

    generarAnios(selectFechaFinAnio);
    sincronizarSelectsFecha(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);

    selectFechaFinAnio.addEventListener('change', () => {
        sincronizarSelectsFecha(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);
    });

    selectFechaFinMes.addEventListener('change', () => {
        sincronizarSelectsFecha(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);
    });

    // ── Fechas del evento dinámicas (+ / -) ───────────────────────

    const fechasWrapper = document.getElementById('fechasEventoWrapper');
    const primeraFechaRow = fechasWrapper.querySelector('.ceFechaRow');

    function inicializarFechaRow(fechaRow) {
        const fechaSelects = fechaRow.querySelectorAll('select');
        fechaSelects.forEach(select => {
            select.innerHTML = '';
            select.setAttribute('aria-required', 'true');
        });
        generarAnios(fechaSelects[0]);
        sincronizarSelectsFecha(fechaSelects[0], fechaSelects[1], fechaSelects[2]);

        fechaSelects[0].addEventListener('change', () => {
            sincronizarSelectsFecha(fechaSelects[0], fechaSelects[1], fechaSelects[2]);
        });

        fechaSelects[1].addEventListener('change', () => {
            sincronizarSelectsFecha(fechaSelects[0], fechaSelects[1], fechaSelects[2]);
        });
    }

    function crearFechaRow(idx) {
        const div = document.createElement('div');
        div.className = 'ceFieldGroup ceFechaRow mt-2';
        div.dataset.fechaIdx = idx;
        div.innerHTML = `
      <span class="ceFieldPrefix">Año</span>
      <select class="ceSelect" aria-label="Año del evento"></select>
      <span class="ceFieldPrefix">Mes</span>
      <select class="ceSelect ceSelectSm" aria-label="Mes del evento"></select>
      <span class="ceFieldPrefix">Dia</span>
      <select class="ceSelect ceSelectSm" aria-label="Día del evento"></select>
      <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar fecha">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
      </button>
      <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar fecha">
        <i class="fa-solid fa-minus" aria-hidden="true"></i>
      </button>
    `;
        inicializarFechaRow(div);
        return div;
    }

    function actualizarBotonesFechas() {
        const filas = fechasWrapper.querySelectorAll('.ceFechaRow');
        filas.forEach(fila => {
            fila.querySelector('.ceCircleBtnRemove').disabled = filas.length === 1;
        });
    }

    inicializarFechaRow(primeraFechaRow);
    actualizarBotonesFechas();

    fechasWrapper.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.ceCircleBtnAdd');
        const btnRemove = e.target.closest('.ceCircleBtnRemove');

        if (btnAdd?.closest('.ceFechaRow')) {
            const filas = fechasWrapper.querySelectorAll('.ceFechaRow');
            fechasWrapper.appendChild(crearFechaRow(filas.length));
            actualizarBotonesFechas();
        }

        if (btnRemove?.closest('.ceFechaRow')) {
            const filas = fechasWrapper.querySelectorAll('.ceFechaRow');
            if (filas.length > 1) {
                btnRemove.closest('.ceFechaRow').remove();
                actualizarBotonesFechas();
            }
        }
    });

    // ── Imágenes dinámicas (+ / -) ────────────────────────────────

    const imagenesWrapper = document.getElementById('imagenesWrapper');

    function crearImagenRow(idx) {
        const div = document.createElement('div');
        div.className = 'ceFileRow';
        div.dataset.fileIdx = idx;
        div.innerHTML = `
      <div class="ceFileInput">
        <i class="fa-solid fa-paperclip ceFileIcon" aria-hidden="true"></i>
        <span class="ceFileName">Adjuntar Documento</span>
        <input type="file" class="ceFileReal" accept="image/*" aria-label="Adjuntar imagen ilustrativa">
      </div>
      <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar imagen">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
      </button>
      <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar imagen">
        <i class="fa-solid fa-minus" aria-hidden="true"></i>
      </button>
    `;
        return div;
    }

    actualizarBotonesArchivo(imagenesWrapper);

    imagenesWrapper.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.ceCircleBtnAdd');
        const btnRemove = e.target.closest('.ceCircleBtnRemove');
        if (btnAdd) {
            const filas = imagenesWrapper.querySelectorAll('.ceFileRow');
            imagenesWrapper.appendChild(crearImagenRow(filas.length));
            actualizarBotonesArchivo(imagenesWrapper);
        }
        if (btnRemove) {
            const filas = imagenesWrapper.querySelectorAll('.ceFileRow');
            if (filas.length > 1) {
                btnRemove.closest('.ceFileRow').remove();
                actualizarBotonesArchivo(imagenesWrapper);
            }
        }
    });

    // ── Videos dinámicos (+ / -) ──────────────────────────────────

    const videosWrapper = document.getElementById('videosWrapper');

    function crearVideoRow(idx) {
        const div = document.createElement('div');
        div.className = 'ceFileRow';
        div.dataset.fileIdx = idx;
        div.innerHTML = `
      <div class="ceFileInput">
        <i class="fa-solid fa-paperclip ceFileIcon" aria-hidden="true"></i>
        <span class="ceFileName">Adjuntar Documento</span>
        <input type="file" class="ceFileReal" accept="video/*" aria-label="Adjuntar video">
      </div>
      <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar video">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
      </button>
      <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar video">
        <i class="fa-solid fa-minus" aria-hidden="true"></i>
      </button>
    `;
        return div;
    }

    actualizarBotonesArchivo(videosWrapper);

    videosWrapper.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.ceCircleBtnAdd');
        const btnRemove = e.target.closest('.ceCircleBtnRemove');
        if (btnAdd) {
            const filas = videosWrapper.querySelectorAll('.ceFileRow');
            videosWrapper.appendChild(crearVideoRow(filas.length));
            actualizarBotonesArchivo(videosWrapper);
        }
        if (btnRemove) {
            const filas = videosWrapper.querySelectorAll('.ceFileRow');
            if (filas.length > 1) {
                btnRemove.closest('.ceFileRow').remove();
                actualizarBotonesArchivo(videosWrapper);
            }
        }
    });

    // ── Referencias dinámicas (+ / -) ────────────────────────────

    const referenciasWrapper = document.getElementById('referenciasWrapper');

    referenciasWrapper.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.ceCircleBtnAdd');
        const btnRemove = e.target.closest('.ceCircleBtnRemove');

        if (btnAdd?.closest('.ceRefRow')) {
            const nuevaFila = document.createElement('div');
            nuevaFila.className = 'ceRefRow mt-2';
            nuevaFila.innerHTML = `
        <input type="text" class="ceInput" placeholder="introduzca el dato solicitado"
          aria-label="Referencia de información">
        <button type="button" class="ceCircleBtn ceCircleBtnAdd" aria-label="Agregar referencia">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
        <button type="button" class="ceCircleBtn ceCircleBtnRemove" aria-label="Quitar referencia">
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>
      `;
            const linkRef = referenciasWrapper.querySelector('.ceLinkInput');
            linkRef.before(nuevaFila);
            actualizarBotonesReferencias();
        }

        if (btnRemove?.closest('.ceRefRow')) {
            const filas = referenciasWrapper.querySelectorAll('.ceRefRow');
            if (filas.length > 1) {
                btnRemove.closest('.ceRefRow').remove();
                actualizarBotonesReferencias();
            }
        }
    });

    function actualizarBotonesReferencias() {
        const filas = referenciasWrapper.querySelectorAll('.ceRefRow');
        filas.forEach(fila => {
            fila.querySelector('.ceCircleBtnRemove').disabled = filas.length === 1;
        });
    }

    actualizarBotonesReferencias();

    // ── Formulario dinámico según tipo ───────────────────────────

    const tipoFormulario = document.getElementById('tipoFormulario');
    const subFormInscripcion = document.getElementById('subFormInscripcion');
    const subFormConfirmacion = document.getElementById('subFormConfirmacion');

    tipoFormulario.addEventListener('change', () => {
        const val = tipoFormulario.value;
        subFormInscripcion.classList.add('d-none');
        subFormConfirmacion.classList.add('d-none');
        if (val === 'inscripcion') {
            subFormInscripcion.classList.remove('d-none');
        } else if (val === 'confirmacion') {
            subFormConfirmacion.classList.remove('d-none');
        }
    });

    // ── Navegación entre pasos ────────────────────────────────────

    const paso1 = document.getElementById('paso1');
    const paso2 = document.getElementById('paso2');
    const stepIndicator1 = document.getElementById('stepIndicator1');
    const stepIndicator2 = document.getElementById('stepIndicator2');
    const stepDot1 = document.getElementById('stepDot1');
    const stepDot2 = document.getElementById('stepDot2');
    const stepLabel = document.getElementById('stepLabel');
    function validarArchivos(wrapperSelector, { requerido = false } = {}) {
        const inputs = Array.from(formRoot.querySelectorAll(wrapperSelector));

        if (!inputs.length) {
            return true;
        }

        let esValido = true;
        let hayArchivo = false;
        let primerError = null;

        inputs.forEach((input) => {
            limpiarValidacionCampo(input);

            const archivo = input.files?.[0];
            if (archivo) {
                hayArchivo = true;

                if (archivo.size > maxFileSizeBytes) {
                    marcarValidacionCampo(input);
                    primerError = primerError || input;
                    esValido = false;
                }
            }
        });

        if (requerido && !hayArchivo) {
            marcarValidacionCampo(inputs[0]);
            primerError = primerError || inputs[0];
            esValido = false;
        }

        if (!esValido && primerError) {
            enfocarPrimerError(primerError);
        }

        return esValido;
    }

    function validarCampos(selectores, opciones = {}) {
        let esValido = true;
        let primerError = null;

        selectores.forEach((selector) => {
            const campos = formRoot.querySelectorAll(selector);

            campos.forEach((campo) => {
                if (!validarCampo(campo, opciones)) {
                    primerError = primerError || campo;
                    esValido = false;
                }
            });
        });

        if (!esValido && primerError) {
            enfocarPrimerError(primerError);
        }

        return esValido;
    }

    function compararFechas(anio, mes, dia) {
        const fechaIngresada = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        return fechaIngresada < hoySinHora;
    }

    function validarFechasNoMenoresActual() {
        const fechaPub = obtenerFechaDesdeSelects('fechaPubAnio', 'fechaPubMes', 'fechaPubDia');
        if (compararFechas(fechaPub.anio, fechaPub.mes, fechaPub.dia)) {
            alert('La fecha de publicación no puede ser anterior a la fecha actual.');
            return false;
        }

        const fechasEvento = obtenerFechasEvento();
        for (const fecha of fechasEvento) {
            if (fecha.anio && fecha.mes && fecha.dia && compararFechas(fecha.anio, fecha.mes, fecha.dia)) {
                alert('Las fechas del evento no pueden ser anteriores a la fecha actual.');
                return false;
            }
        }

        return true;
    }

    function validarPaso1() {
        const camposValidos = validarCampos([
            '#fechaPubAnio',
            '#fechaPubMes',
            '#fechaPubDia',
            '#nombreEvento',
            '#fechasEventoWrapper select',
            '#horaInicio',
            '#horaFin',
            '#lugarEvento',
            '#linkCalendar',
            '#descripcionEvento',
            '#objetivosEditor',
            '#agendaEditor',
            '#agendaFacilEditor',
        ]);

        if (!camposValidos) {
            return false;
        }

        return validarFechasNoMenoresActual();
    }

    function validarPaso2() {
        const esValido = validarCampos([
            '#contactoNombre',
            '#contactoCorreo',
            '#descImagen',
            '#publicoMeta',
            '#tipoFormulario',
            '#cupoEvento',
            '#fechaFinAnio',
            '#fechaFinMes',
            '#fechaFinDia',
            '#infoAdicionalEditor',
        ]);

        if (!esValido) {
            return false;
        }

        const imagenesValidas = validarArchivos('#imagenesWrapper input[type="file"]', { requerido: true });
        const videosValidos = validarArchivos('#videosWrapper input[type="file"]');

        if (!imagenesValidas || !videosValidos) {
            return false;
        }

        const fechaFin = obtenerFechaDesdeSelects('fechaFinAnio', 'fechaFinMes', 'fechaFinDia');
        if (compararFechas(fechaFin.anio, fechaFin.mes, fechaFin.dia)) {
            alert('La fecha de visualización final no puede ser anterior a la fecha actual.');
            return false;
        }

        return true;
    }

    function limpiarErroresCrearEvento() {
        formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"], .ceLinkInput, .ceFileInput').forEach((field) => {
            field.classList.remove(...validationErrorClasses);
            field.removeAttribute('aria-invalid');
        });
    }

    function obtenerFechaDesdeSelects(anioId, mesId, diaId) {
        const anio = formRoot.querySelector(`#${anioId}`)?.value || '';
        const mes = formRoot.querySelector(`#${mesId}`)?.value || '';
        const dia = formRoot.querySelector(`#${diaId}`)?.value || '';

        return {
            anio,
            mes,
            dia,
            iso: crearIsoFecha({ anio, mes, dia }),
        };
    }

    function obtenerFechasEvento() {
        return Array.from(formRoot.querySelectorAll('#fechasEventoWrapper .ceFechaRow')).map((fila) => {
            const selects = fila.querySelectorAll('select');
            const anio = selects[0]?.value || '';
            const mes = selects[1]?.value || '';
            const dia = selects[2]?.value || '';

            return {
                anio,
                mes,
                dia,
                iso: crearIsoFecha({ anio, mes, dia }),
            };
        });
    }

    function obtenerReferencias() {
        const textosReferencia = Array.from(formRoot.querySelectorAll('#referenciasWrapper .ceRefRow input[type="text"]'))
            .map((input) => input.value.trim())
            .filter(Boolean);

        const linksReferencia = Array.from(formRoot.querySelectorAll('#referenciasWrapper input[type="url"]'))
            .map((input) => input.value.trim())
            .filter(Boolean);

        const maxLength = Math.max(textosReferencia.length, linksReferencia.length);
        const referencias = [];

        for (let i = 0; i < maxLength; i++) {
            referencias.push({
                texto: textosReferencia[i] || '',
                link: linksReferencia[i] || '',
            });
        }

        return referencias.filter((item) => item.texto || item.link);
    }

    function obtenerAspectosFormularioSeleccionados(tipoFormularioSeleccionado) {
        if (!tipoFormularioSeleccionado) {
            return [];
        }

        const subFormId = tipoFormularioSeleccionado === 'inscripcion'
            ? '#subFormInscripcion'
            : '#subFormConfirmacion';

        return Array.from(formRoot.querySelectorAll(`${subFormId} input[type="checkbox"]:checked`))
            .map((checkbox) => checkbox.closest('label')?.textContent?.trim() || '')
            .filter(Boolean);
    }

    function construirPayloadFormularioEvento() {
        const tipoFormularioSeleccionado = formRoot.querySelector('#tipoFormulario')?.value || '';

        const palabrasClave = (formRoot.querySelector('#palabrasClave')?.value || '')
            .split(',')
            .map((valor) => valor.trim())
            .filter(Boolean);

        return {
            nombreEvento: formRoot.querySelector('#nombreEvento')?.value.trim() || '',
            fechaPublicacion: obtenerFechaDesdeSelects('fechaPubAnio', 'fechaPubMes', 'fechaPubDia'),
            fechasEvento: obtenerFechasEvento(),
            horario: {
                horaInicio: formRoot.querySelector('#horaInicio')?.value || '',
                horaFin: formRoot.querySelector('#horaFin')?.value || '',
            },
            lugarEvento: formRoot.querySelector('#lugarEvento')?.value.trim() || '',
            linkCalendar: formRoot.querySelector('#linkCalendar')?.value.trim() || '',
            descripcionEvento: formRoot.querySelector('#descripcionEvento')?.value.trim() || '',
            objetivosEvento: normalizarHtmlEditor(formRoot.querySelector('#objetivosEditor')),
            agendaEvento: normalizarHtmlEditor(formRoot.querySelector('#agendaEditor')),
            agendaLecturaFacil: normalizarHtmlEditor(formRoot.querySelector('#agendaFacilEditor')),
            contacto: {
                nombreCompleto: formRoot.querySelector('#contactoNombre')?.value.trim() || '',
                correoElectronico: formRoot.querySelector('#contactoCorreo')?.value.trim() || '',
            },
            descripcionImagen: formRoot.querySelector('#descImagen')?.value.trim() || '',
            publicoMeta: formRoot.querySelector('#publicoMeta')?.value.trim() || '',
            cupoEvento: formRoot.querySelector('#cupoEvento')?.value || '',
            infoAdicional: normalizarHtmlEditor(formRoot.querySelector('#infoAdicionalEditor')),
            referencias: obtenerReferencias(),
            palabrasClave,
            formularioInteresados: {
                tipo: tipoFormularioSeleccionado,
                aspectosSeleccionados: obtenerAspectosFormularioSeleccionados(tipoFormularioSeleccionado),
            },
            fijarImportante: (formRoot.querySelector('input[name="fijarImportante"]:checked')?.value || '') === 'si',
            listaDifusion: formRoot.querySelector('#listaDifusion')?.value || '',
            fechaFinVisualizacion: obtenerFechaDesdeSelects('fechaFinAnio', 'fechaFinMes', 'fechaFinDia'),
            redesSociales: Array.from(formRoot.querySelectorAll('input[name="redes"]:checked')).map((input) => input.value),
            estado: 'pendiente_aprobacion',
        };
    }

    function agregarArchivosAFormData(formData) {
        formRoot.querySelectorAll('#imagenesWrapper input[type="file"]').forEach((input) => {
            if (input.files?.[0]) {
                formData.append('imagenes', input.files[0]);
            }
        });

        formRoot.querySelectorAll('#videosWrapper input[type="file"]').forEach((input) => {
            if (input.files?.[0]) {
                formData.append('videos', input.files[0]);
            }
        });
    }

    function construirFormDataEvento(payload) {
        const formData = new FormData();

        formData.append('nombreEvento', payload.nombreEvento);
        formData.append('fechaPublicacion', JSON.stringify(payload.fechaPublicacion));
        formData.append('fechasEvento', JSON.stringify(payload.fechasEvento));
        formData.append('horario', JSON.stringify(payload.horario));
        formData.append('lugarEvento', payload.lugarEvento);
        formData.append('linkCalendar', payload.linkCalendar);
        formData.append('descripcionEvento', payload.descripcionEvento);
        formData.append('objetivosEvento', payload.objetivosEvento);
        formData.append('agendaEvento', payload.agendaEvento);
        formData.append('agendaLecturaFacil', payload.agendaLecturaFacil);
        formData.append('contacto', JSON.stringify(payload.contacto));
        formData.append('descripcionImagen', payload.descripcionImagen);
        formData.append('publicoMeta', payload.publicoMeta);
        formData.append('cupoEvento', payload.cupoEvento);
        formData.append('infoAdicional', payload.infoAdicional);
        formData.append('referencias', JSON.stringify(payload.referencias));
        formData.append('palabrasClave', JSON.stringify(payload.palabrasClave));
        formData.append('formularioInteresados', JSON.stringify(payload.formularioInteresados));
        formData.append('fijarImportante', String(payload.fijarImportante));
        formData.append('listaDifusion', payload.listaDifusion);
        formData.append('fechaFinVisualizacion', JSON.stringify(payload.fechaFinVisualizacion));
        formData.append('redesSociales', JSON.stringify(payload.redesSociales));
        formData.append('estado', payload.estado);

        agregarArchivosAFormData(formData);

        return formData;
    }

    async function obtenerImagenPrincipalDeFormulario() {
        const primerInput = formRoot.querySelector('#imagenesWrapper input[type="file"]');
        const archivo = primerInput?.files?.[0];

        if (!archivo) {
            return '';
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(archivo);
        });
    }

    async function fetchEventoDesdeBackend(eventoId) {
        if (!eventoId) {
            return null;
        }

        try {
            const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`);
            if (!response.ok) {
                return null;
            }

            const body = await response.json();
            return body?.evento || null;
        } catch {
            return null;
        }
    }

    function construirPreviewDesdeFormulario() {
        const payload = construirPayloadFormularioEvento();
        return {
            ...payload,
            imagenes: [],
        };
    }

    function formatearTextoFecha(fecha) {
        if (!fecha || !fecha.iso) {
            return '';
        }

        const fechaObj = new Date(fecha.iso);
        if (Number.isNaN(fechaObj.getTime())) {
            return '';
        }

        return fechaObj.toLocaleDateString('es-CR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    function formatearFechaCorta(fecha) {
        if (!fecha || !fecha.iso) {
            return { dia: '', mes: '' };
        }

        const fechaObj = new Date(fecha.iso);
        if (Number.isNaN(fechaObj.getTime())) {
            return { dia: '', mes: '' };
        }

        return {
            dia: String(fechaObj.getDate()).padStart(2, '0'),
            mes: fechaObj.toLocaleString('es-CR', { month: 'short' }).toUpperCase(),
        };
    }

    function escapeHtmlPreview(texto) {
        return String(texto || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function limpiarTextoHtml(texto) {
        return String(texto || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .trim();
    }

    function construirParrafosPreview(texto, fallback = 'No hay información disponible.') {
        const parrafos = String(texto || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .split(/\r?\n+/)
            .map((parrafo) => limpiarTextoHtml(parrafo))
            .filter(Boolean);

        if (!parrafos.length) {
            return `<p>${escapeHtmlPreview(fallback)}</p>`;
        }

        return parrafos.map((parrafo) => `<p>${escapeHtmlPreview(parrafo)}</p>`).join('');
    }

    function construirListaPreview(texto, maxItems = 4) {
        const items = String(texto || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .split(/\r?\n+/)
            .map((item) => limpiarTextoHtml(item))
            .filter(Boolean)
            .slice(0, maxItems);

        if (!items.length) {
            return '<li>No hay objetivos especificados.</li>';
        }

        return items.map((item) => `<li>${escapeHtmlPreview(item)}</li>`).join('');
    }

    function construirAgendaPreview(texto) {
        const lineas = String(texto || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .split(/\r?\n+/)
            .map((linea) => limpiarTextoHtml(linea))
            .filter(Boolean);

        if (!lineas.length) {
            return `
                <div class="eventoPoliticaAgendaFila">
                    <div class="eventoPoliticaAgendaHora">Pendiente</div>
                    <div class="eventoPoliticaAgendaDetalle">No hay agenda registrada para este evento.</div>
                </div>
            `;
        }

        return lineas.slice(0, 8).map((linea) => {
            const matchHora = linea.match(/\b\d{1,2}(:\d{2})?\s*(am|pm)?/i);
            const hora = matchHora ? matchHora[0] : 'Actividad';
            const detalle = linea.replace(hora, '').replace(/^\s*[-:]/, '').trim() || linea;

            return `
                <div class="eventoPoliticaAgendaFila">
                    <div class="eventoPoliticaAgendaHora">${escapeHtmlPreview(hora)}</div>
                    <div class="eventoPoliticaAgendaDetalle">${escapeHtmlPreview(detalle)}</div>
                </div>
            `;
        }).join('');
    }

    function obtenerFechaPrincipalPreview(evento) {
        if (Array.isArray(evento?.fechasEvento) && evento.fechasEvento.length > 0) {
            return evento.fechasEvento[0];
        }
        return evento?.fechaPublicacion || null;
    }

    function obtenerImagenesCarruselPreview(evento, imagenPrincipal) {
        const imagenes = Array.isArray(evento?.imagenes)
            ? evento.imagenes.map((item) => normalizarRutaImagenPreview(item?.ruta || item)).filter(Boolean)
            : [];

        const base = imagenes.length ? imagenes : [imagenPrincipal || './assets/img/eventos-discapacidad.webp'];
        const resultado = base.slice(0, 4);
        while (resultado.length < 4) {
            resultado.push(resultado[resultado.length - 1]);
        }
        return resultado;
    }

    function generarResumenLecturaFacilPreview(root, tituloEvento, cuposTexto) {
        const descripcion = Array.from(root.querySelectorAll('.eventoPoliticaBloqueContenido p'))
            .map((elemento) => elemento.textContent.trim())
            .filter(Boolean);

        const objetivos = Array.from(root.querySelectorAll('.eventoPoliticaListaObjetivos li'))
            .map((elemento) => elemento.textContent.trim())
            .filter(Boolean);

        const agenda = Array.from(root.querySelectorAll('.eventoPoliticaAgendaFila'))
            .map((fila) => {
                const hora = fila.querySelector('.eventoPoliticaAgendaHora')?.textContent.trim();
                const detalle = fila.querySelector('.eventoPoliticaAgendaDetalle')?.textContent.trim();
                return hora && detalle ? `${hora}: ${detalle}` : null;
            })
            .filter(Boolean);

        const datosEvento = Array.from(root.querySelectorAll('.eventoPoliticaListaInfo li'))
            .map((elemento) => elemento.textContent.replace(/\s+/g, ' ').trim())
            .filter(Boolean);

        const parrafos = [`Este evento se llama ${tituloEvento}.`];
        if (datosEvento.length > 0) parrafos.push(`Datos clave: ${datosEvento.join('. ')}.`);
        if (descripcion.length > 0) parrafos.push(`Resumen rápido: ${descripcion.slice(0, 2).join(' ')}`);
        if (objetivos.length > 0) parrafos.push(`Objetivos principales: ${objetivos.slice(0, 2).join(' ')}`);
        if (agenda.length > 0) parrafos.push(`Agenda del evento: ${agenda.slice(0, 3).join(' / ')}.`);
        parrafos.push(`Disponibilidad: ${cuposTexto}.`);

        return parrafos;
    }

    function conectarLecturaFacilPreview(modalElement, tituloEvento, cuposTexto) {
        const root = modalElement.querySelector('.eventoPreviewTemplateRoot');
        if (!root) return;

        const boton = root.querySelector('#btnLecturaFacilEventoPreview');
        const ventana = root.querySelector('#lecturaFacilVentanaPreview');
        const titulo = root.querySelector('#lecturaFacilTituloPreview');
        const contenido = root.querySelector('#lecturaFacilContenidoPreview');

        if (!boton || !ventana || !titulo || !contenido) return;

        boton.addEventListener('click', () => {
            const visible = !ventana.classList.contains('d-none');
            if (visible) {
                ventana.classList.add('d-none');
                boton.classList.remove('is-active');
                boton.setAttribute('aria-expanded', 'false');
                return;
            }

            const parrafos = generarResumenLecturaFacilPreview(root, tituloEvento, cuposTexto);
            titulo.textContent = tituloEvento;
            contenido.innerHTML = parrafos.map((parrafo) => `<p>${escapeHtmlPreview(parrafo)}</p>`).join('');

            ventana.classList.remove('d-none');
            boton.classList.add('is-active');
            boton.setAttribute('aria-expanded', 'true');
        });
    }

    function renderContenidoModalTemplate(modalElement, evento, imagenFuente) {
        const modalBody = modalElement.querySelector('.modalVistaPreviaBody');
        if (!modalBody) {
            return;
        }

        const fecha = obtenerFechaPrincipalPreview(evento);
        const fechaCorta = formatearFechaCorta(fecha);
        const fechaCompleta = formatearTextoFecha(fecha) || 'Sin fecha disponible';
        const fechaObj = fecha?.iso ? new Date(fecha.iso) : null;
        const mesLargo = (fechaObj && !Number.isNaN(fechaObj.getTime()))
            ? fechaObj.toLocaleString('es-CR', { month: 'long' })
            : 'sin mes';
        const anio = (fechaObj && !Number.isNaN(fechaObj.getTime())) ? fechaObj.getFullYear() : '';

        const nombreEvento = evento?.nombreEvento || 'Sin título';
        const descripcion = evento?.descripcionEvento || '';
        const objetivos = evento?.objetivosEvento || '';
        const agenda = evento?.agendaEvento || '';
        const infoAdicional = evento?.infoAdicional || '';
        const lugar = evento?.lugarEvento || 'No definido';
        const horaInicio = evento?.horario?.horaInicio || 'No definido';
        const horaFin = evento?.horario?.horaFin || 'No definido';
        const publicoMeta = evento?.publicoMeta || 'No definido';
        const cuposTexto = evento?.cupoEvento ? `${evento.cupoEvento} cupos disponibles` : 'No definido';
        const linkCalendar = evento?.linkCalendar || '#';
        const contactoNombre = evento?.contacto?.nombreCompleto || evento?.contacto?.nombre || 'No definido';
        const contactoCorreo = evento?.contacto?.correoElectronico || evento?.contacto?.correo || 'No definido';
        const telefono = evento?.contacto?.telefono || 'No definido';
        const institucion = evento?.contacto?.institucion || '';
        const imagenesCarrusel = obtenerImagenesCarruselPreview(evento, imagenFuente);

        modalBody.innerHTML = `
            <div class="eventoPreviewTemplateRoot">
                <div id="estructuraEventosPolitica" class="eventoPoliticaDetalleWrapper">
                    <section class="eventoPoliticaDetalleVista" aria-labelledby="previewTituloModalPlantilla">
                        <div class="eventoPoliticaHeroPortada">
                            <img src="${escapeHtmlPreview(imagenFuente || './assets/img/eventos-discapacidad.webp')}" alt="Imagen del evento ${escapeHtmlPreview(nombreEvento)}">
                        </div>

                        <div class="eventoPoliticaContenidoInterior px-lg-5">
                            <div class="eventoPoliticaTituloFranja d-flex align-items-center gap-3">
                                <div class="eventoPoliticaFechaBadge" aria-hidden="true">
                                    <span class="eventoPoliticaFechaDia">${escapeHtmlPreview(fechaCorta.dia || '00')}</span>
                                    <span class="eventoPoliticaFechaMes">${escapeHtmlPreview(fechaCorta.mes || '---')}</span>
                                </div>
                                <h1 id="previewTituloModalPlantilla" class="eventoPoliticaTituloPrincipal mb-0">${escapeHtmlPreview(nombreEvento)}</h1>
                            </div>

                            <div class="row g-4 eventoPoliticaContenido pt-4">
                                <div class="col-12 col-lg-7">
                                    <section class="eventoPoliticaBloqueContenido" aria-labelledby="previewDescripcionModalTitle">
                                        <h2 id="previewDescripcionModalTitle" class="eventoPoliticaSeccionTitulo">Descripción</h2>
                                        <div class="eventoPoliticaInfoAdicionalTexto">${construirParrafosPreview(descripcion, 'No hay descripción disponible.')}</div>

                                        <h2 class="eventoPoliticaSeccionTitulo mt-4">Objetivos</h2>
                                        <ol class="eventoPoliticaListaObjetivos">${construirListaPreview(objetivos, 3)}</ol>
                                    </section>
                                </div>

                                <div class="col-12 col-lg-5">
                                    <aside class="eventoPoliticaSidebar d-flex flex-column gap-3" aria-label="Información complementaria del evento">
                                        <section class="eventoPoliticaCaja eventoPoliticaCajaClara" aria-labelledby="previewInfoModalTitle">
                                            <h2 id="previewInfoModalTitle" class="eventoPoliticaSeccionTitulo">Información del evento</h2>
                                            <ul class="eventoPoliticaListaInfo">
                                                <li><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtmlPreview(fechaCompleta)}</li>
                                                <li><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtmlPreview(horaInicio)} - ${escapeHtmlPreview(horaFin)}</li>
                                                <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtmlPreview(lugar)}</li>
                                            </ul>
                                            <div class="eventoPoliticaContacto">
                                                <p class="mb-1 fw-semibold">${escapeHtmlPreview(contactoNombre)}${institucion ? `<br>${escapeHtmlPreview(institucion)}` : ''}</p>
                                                <p class="mb-1">Teléfono: ${escapeHtmlPreview(telefono)}</p>
                                                <p class="mb-0">Correo electrónico: ${escapeHtmlPreview(contactoCorreo)}</p>
                                            </div>
                                        </section>

                                        <section class="eventoPoliticaCaja eventoPoliticaCajaAzul" aria-labelledby="previewPublicoMetaModalTitle">
                                            <h2 id="previewPublicoMetaModalTitle" class="eventoPoliticaSeccionTitulo text-white">Público Meta</h2>
                                            <p class="eventoPoliticaTextoBlanco">${escapeHtmlPreview(publicoMeta)}</p>
                                            <div class="eventoPoliticaAccionMeta d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                                <strong class="eventoPoliticaCupos">${escapeHtmlPreview(cuposTexto)}</strong>
                                                <a class="eventoPoliticaBotonInscripcion text-decoration-none" href="${escapeHtmlPreview(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
                                            </div>
                                        </section>

                                        <section class="eventoPoliticaEnlaceEvento" aria-labelledby="previewEnlaceModalTitle">
                                            <h2 id="previewEnlaceModalTitle" class="eventoPoliticaSeccionTitulo">Enlace del evento</h2>
                                            <a href="${escapeHtmlPreview(linkCalendar)}" target="_blank" rel="noopener noreferrer">${escapeHtmlPreview(linkCalendar)}</a>
                                        </section>
                                    </aside>
                                </div>
                            </div>
                        </div>

                        <div class="eventoPoliticaInfoAdicionalCard mt-5">
                            <div class="eventoPoliticaInfoAdicionalContenido">
                                <section class="eventoPoliticaAgendaSection" aria-labelledby="previewAgendaModalTitle">
                                    <h2 id="previewAgendaModalTitle" class="eventoPoliticaAgendaTitulo">Programa / Agenda del evento</h2>

                                    <div class="eventoPoliticaAgendaTabla mt-3">
                                        <div class="eventoPoliticaAgendaCabecera">Día ${escapeHtmlPreview(fechaCorta.dia || '00')} de ${escapeHtmlPreview(mesLargo)} ${escapeHtmlPreview(anio)}</div>
                                        ${construirAgendaPreview(agenda)}
                                    </div>
                                </section>

                                <h2 class="eventoPoliticaInfoAdicionalTitulo">Información Adicional</h2>
                                <div class="eventoPoliticaInfoAdicionalTexto">${construirParrafosPreview(infoAdicional, 'No hay información adicional.')}</div>

                                <div class="eventoPoliticaInfoAdicionalAcciones d-flex flex-wrap gap-3 mt-4">
                                    <button id="btnLecturaFacilEventoPreview" type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--primary" aria-controls="lecturaFacilVentanaPreview" aria-expanded="false">Lectura Fácil del Evento</button>
                                    <button type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--secondary">Realizar consulta</button>
                                </div>

                                <div id="lecturaFacilVentanaPreview" class="eventoPoliticaLecturaFacilVentana d-none" role="region" aria-live="polite" aria-labelledby="lecturaFacilTituloPreview">
                                    <h3 id="lecturaFacilTituloPreview" class="eventoPoliticaLecturaFacilTitulo"></h3>
                                    <div id="lecturaFacilContenidoPreview" class="eventoPoliticaLecturaFacilContenido"></div>
                                </div>

                                <div id="previewEventoCarousel" class="carousel slide eventoPoliticaCarruselWrap mt-5" data-bs-ride="false" aria-label="Galería del evento">
                                    <div class="carousel-indicators eventoPoliticaCarruselIndicadores">
                                        ${imagenesCarrusel.map((_, indice) => `<button type="button" data-bs-target="#previewEventoCarousel" data-bs-slide-to="${indice}" class="eventoPoliticaCarruselDot ${indice === 0 ? 'active' : ''}" ${indice === 0 ? 'aria-current="true"' : ''} aria-label="Diapositiva ${indice + 1}"></button>`).join('')}
                                    </div>

                                    <div class="carousel-inner eventoPoliticaCarruselVista">
                                        ${imagenesCarrusel.map((src, indice) => `<div class="carousel-item ${indice === 0 ? 'active' : ''}"><img src="${escapeHtmlPreview(src)}" class="d-block w-100 eventoPoliticaCarruselImagen" alt="Imagen ${indice + 1} del evento ${escapeHtmlPreview(nombreEvento)}"></div>`).join('')}
                                    </div>

                                    <button class="carousel-control-prev eventoPoliticaCarruselControl" type="button" data-bs-target="#previewEventoCarousel" data-bs-slide="prev" aria-label="Ver imagen anterior">
                                        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                                    </button>
                                    <button class="carousel-control-next eventoPoliticaCarruselControl" type="button" data-bs-target="#previewEventoCarousel" data-bs-slide="next" aria-label="Ver imagen siguiente">
                                        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                    </button>
                                </div>

                                <div class="text-center mt-4">
                                    <a class="eventoPoliticaInscripcionEventoBtn text-decoration-none" href="${escapeHtmlPreview(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;

        conectarLecturaFacilPreview(modalElement, nombreEvento, cuposTexto);
    }

    async function renderModalVistaPrevia(evento) {
        const modalElement = document.getElementById('modalVistaPreviaEvento');
        if (!modalElement) {
            return;
        }

        let imagenFuente = '';
        if (evento.imagenes && Array.isArray(evento.imagenes) && evento.imagenes.length > 0) {
            imagenFuente = construirUrlImagenEvento(evento.imagenes[0].ruta);
        }

        if (!imagenFuente) {
            imagenFuente = await obtenerImagenPrincipalDeFormulario();
        }

        renderContenidoModalTemplate(modalElement, evento, imagenFuente || './assets/img/eventos-discapacidad.webp');

        const modalInstance = globalThis.bootstrap?.Modal?.getOrCreateInstance(modalElement);
        if (modalInstance) {
            modalInstance.show();
        }
    }

    async function mostrarVistaPreviaEvento() {
        const editContext = getCrearEventoEditContext();
        let eventoPreview = null;

        if (editContext?.eventoId) {
            eventoPreview = await fetchEventoDesdeBackend(editContext.eventoId);
        }

        if (!eventoPreview) {
            eventoPreview = construirPreviewDesdeFormulario();
        }

        await renderModalVistaPrevia(eventoPreview);
    }

    function aseguraryConectarBotonVistaPrevia() {
        const btnVistaPrevia = formRoot.querySelector('#btnPreviewEvento');
        if (!btnVistaPrevia) {
            return;
        }

        btnVistaPrevia.addEventListener('click', async () => {
            await mostrarVistaPreviaEvento();
        });
    }

    aseguraryConectarBotonVistaPrevia();

    async function parseJsonResponse(response) {
        const text = await response.text();

        try {
            return text ? JSON.parse(text) : {};
        } catch (parseError) {
            throw new Error(`Respuesta del servidor no válida: ${text}`);
        }
    }

    async function guardarFormularioEvento() {
        const payload = construirPayloadFormularioEvento();
        const formData = construirFormDataEvento(payload);

        const response = await fetch('/api/form-evento', {
            method: 'POST',
            body: formData,
        });

        const responseBody = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(responseBody?.mensaje || 'No se pudo guardar el formulario de evento.');
        }

        return responseBody;
    }

    async function actualizarFormularioEvento(eventoId, estadoEvento = 'pendiente_aprobacion') {
        const payload = construirPayloadFormularioEvento();
        payload.estado = estadoEvento;

        const formData = construirFormDataEvento(payload);

        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`, {
            method: 'PATCH',
            body: formData,
        });

        const responseBody = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(responseBody?.mensaje || 'No se pudo actualizar el evento.');
        }

        return responseBody;
    }

    function asegurarBotonesNavegacion() {
        if (!document.getElementById('btnSiguiente') && paso1) {
            const accionesPaso1 = document.createElement('div');
            accionesPaso1.className = 'ceActions ceActionsEnd mt-4';
            accionesPaso1.innerHTML = `
        <button type="button" class="ceBtn ceBtnPrimary" id="btnSiguiente">
          Siguiente <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      `;
            paso1.appendChild(accionesPaso1);
        }

        if ((!document.getElementById('btnAnterior') || !document.getElementById('btnEnviarAprobacion')) && paso2) {
            let actionBtns = paso2.querySelector('.ceActionBtns');
            if (!actionBtns) {
                const accionesPaso2 = document.createElement('div');
                accionesPaso2.className = 'ceActions mt-4';
                accionesPaso2.innerHTML = `
          <div class="ceActionIcons">
            <button type="button" class="ceIconBtn" aria-label="Vista previa del evento">
              <i class="fa-regular fa-eye" aria-hidden="true"></i>
            </button>
            <button type="button" class="ceIconBtn" aria-label="Guardar borrador">
              <i class="fa-regular fa-floppy-disk" aria-hidden="true"></i>
            </button>
          </div>
          <div class="ceActionBtns"></div>
        `;
                paso2.appendChild(accionesPaso2);
                actionBtns = accionesPaso2.querySelector('.ceActionBtns');
            }

            if (!document.getElementById('btnAnterior')) {
                const btnAnteriorNuevo = document.createElement('button');
                btnAnteriorNuevo.type = 'button';
                btnAnteriorNuevo.className = 'ceBtn ceBtnSecondary';
                btnAnteriorNuevo.id = 'btnAnterior';
                btnAnteriorNuevo.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Anterior';
                actionBtns.appendChild(btnAnteriorNuevo);
            }

            if (!document.getElementById('btnEnviarAprobacion')) {
                const btnEnviarNuevo = document.createElement('button');
                btnEnviarNuevo.type = 'button';
                btnEnviarNuevo.className = 'ceBtn ceBtnPrimary';
                btnEnviarNuevo.id = 'btnEnviarAprobacion';
                btnEnviarNuevo.innerHTML = 'Enviar a aprobación <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
                actionBtns.appendChild(btnEnviarNuevo);
            }
        }
    }

    asegurarBotonesNavegacion();

    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnEnviarAprobacion = document.getElementById('btnEnviarAprobacion');
    const btnGuardarIcono = formRoot.querySelector('.ceIconBtn[aria-label="Guardar borrador"]');

    [btnSiguiente, btnAnterior, btnEnviarAprobacion].forEach((btn) => {
        if (!btn) {
            return;
        }
        btn.classList.remove('d-none');
        btn.hidden = false;
    });

    function irAPaso2() {
        paso1.classList.add('d-none');
        paso2.classList.remove('d-none');
        stepIndicator1.classList.remove('ceStepActive');
        stepIndicator2.classList.add('ceStepActive');
        stepDot1?.classList.remove('ceStepDotActive');
        stepDot2?.classList.add('ceStepDotActive');
        stepLabel.textContent = 'Información del evento';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function irAPaso1() {
        paso2.classList.add('d-none');
        paso1.classList.remove('d-none');
        stepIndicator2.classList.remove('ceStepActive');
        stepIndicator1.classList.add('ceStepActive');
        stepDot2?.classList.remove('ceStepDotActive');
        stepDot1?.classList.add('ceStepDotActive');
        stepLabel.textContent = 'Información del evento';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnSiguiente?.addEventListener('click', () => {
        if (!validarPaso1()) {
            mostrarModalEventoIncompleto();
            return;
        }

        irAPaso2();
    });
    btnAnterior?.addEventListener('click', irAPaso1);
    stepIndicator1?.addEventListener('click', irAPaso1);
    stepIndicator2?.addEventListener('click', () => {
        if (paso1.classList.contains('d-none')) {
            irAPaso2();
            return;
        }

        if (validarPaso1()) {
            irAPaso2();
        }
    });

    btnEnviarAprobacion?.addEventListener('click', async () => {
        if (!validarPaso2()) {
            mostrarModalEventoIncompleto();
            return;
        }

        btnEnviarAprobacion.disabled = true;

        try {
            await guardarFormularioEvento();
            limpiarErroresCrearEvento();

            const draftManager = globalThis.crearEventoDraftManager;
            draftManager?.discardForm?.();
            draftManager?.resetDraftKey?.();
            mostrarModalEventoEnviado();
            irAPaso1();
        } catch (error) {
            alert(error.message || 'Ocurrió un error al guardar el evento.');
        } finally {
            btnEnviarAprobacion.disabled = false;
        }
    });

    btnGuardarIcono?.addEventListener('click', async () => {
        btnGuardarIcono.disabled = true;

        try {
            const editContext = getCrearEventoEditContext();

            if (isPendingEditionContext(editContext)) {
                const confirmed = await confirmarEdicionEvento();
                if (!confirmed) {
                    return;
                }

                await actualizarFormularioEvento(editContext.eventoId, editContext.estado);
                limpiarErroresCrearEvento();

                await clearCrearEventoDraft();
                clearCrearEventoEditContext();
                clearCrearEventoFormData();

                mostrarModalEventoEditado();
                irAPaso1();
                return;
            }

            await saveCrearEventoDraft();
            resetCrearEventoDraftKey();
            clearCrearEventoLocalDraft();
            clearCrearEventoEditContext();
            clearCrearEventoFormData();
            irAPaso1();
            alert('Borrador guardado correctamente.');
        } catch (error) {
            alert(error.message || 'No se pudieron guardar los cambios.');
        } finally {
            btnGuardarIcono.disabled = false;
        }
    });



    // ── Mostrar nombre de archivo seleccionado  

    formRoot.addEventListener('change', (e) => {
        if (e.target.classList.contains('ceFileReal')) {
            const nombreEl = e.target.closest('.ceFileInput').querySelector('.ceFileName');
            if (e.target.files.length > 0) {
                nombreEl.textContent = e.target.files[0].name;
            } else {
                nombreEl.textContent = 'Adjuntar Documento';
            }
        }
    });

}

const crearEventoDraftStorageKey = 'gestionEditor.crearEventoDraft';
const crearEventoDraftKeyStorageKey = 'gestionEditor.crearEventoDraftKey';
const crearEventoPreloadStorageKey = 'gestionEditor.crearEventoPreload';
const crearEventoEditContextStorageKey = 'gestionEditor.crearEventoEditContext';
const crearEventoDraftEndpoint = '/api/form-borrador';

function getCrearEventoDraftKey() {
    const existingDraftKey = localStorage.getItem(crearEventoDraftKeyStorageKey);

    if (existingDraftKey) {
        return existingDraftKey;
    }

    const newDraftKey = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(crearEventoDraftKeyStorageKey, newDraftKey);
    return newDraftKey;
}

function clearCrearEventoDraftKey() {
    localStorage.removeItem(crearEventoDraftKeyStorageKey);
}

function resetCrearEventoDraftKey() {
    clearCrearEventoDraftKey();
}

function getCrearEventoEditContext() {
    const raw = sessionStorage.getItem(crearEventoEditContextStorageKey);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        sessionStorage.removeItem(crearEventoEditContextStorageKey);
        return null;
    }
}

function setCrearEventoEditContext(context) {
    if (!context || typeof context !== 'object') {
        sessionStorage.removeItem(crearEventoEditContextStorageKey);
        return;
    }

    sessionStorage.setItem(crearEventoEditContextStorageKey, JSON.stringify(context));
}

function clearCrearEventoEditContext() {
    sessionStorage.removeItem(crearEventoEditContextStorageKey);
}

async function saveCrearEventoDraftToBackend(snapshot) {
    const draftKey = getCrearEventoDraftKey();
    const response = await fetch(crearEventoDraftEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            draftKey,
            snapshot,
        }),
    });

    if (!response.ok) {
        throw new Error('No se pudo guardar el borrador.');
    }

    return response.json();
}

function sendCrearEventoDraftBeacon(snapshot) {
    const draftKey = getCrearEventoDraftKey();
    const payload = JSON.stringify({
        draftKey,
        snapshot,
    });

    if (navigator.sendBeacon) {
        navigator.sendBeacon(crearEventoDraftEndpoint, new Blob([payload], { type: 'application/json' }));
        return;
    }

    fetch(crearEventoDraftEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
    }).catch(() => {});
}

async function loadCrearEventoDraftFromBackend() {
    const draftKey = localStorage.getItem(crearEventoDraftKeyStorageKey);

    if (!draftKey) {
        return null;
    }

    const response = await fetch(`${crearEventoDraftEndpoint}/${encodeURIComponent(draftKey)}`);

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.borrador?.snapshot || null;
}

async function deleteCrearEventoDraftFromBackend() {
    const draftKey = localStorage.getItem(crearEventoDraftKeyStorageKey);

    sessionStorage.removeItem(crearEventoDraftStorageKey);
    clearCrearEventoDraftKey();

    if (!draftKey) {
        return;
    }

    await fetch(`${crearEventoDraftEndpoint}/${encodeURIComponent(draftKey)}`, {
        method: 'DELETE',
    }).catch(() => {});
}

function getCrearEventoRoot() {
    return document.querySelector('.ceCard');
}

function setSelectIfExists(selectEl, value) {
    if (!selectEl || value === null || value === undefined) {
        return;
    }

    const stringValue = String(value);
    if (Array.from(selectEl.options).some((opt) => opt.value === stringValue)) {
        selectEl.value = stringValue;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function setInputIfExists(root, selector, value = '') {
    const element = root.querySelector(selector);
    if (!element) {
        return;
    }

    element.value = String(value || '');
}

function setEditorIfExists(root, selector, value = '') {
    const element = root.querySelector(selector);
    if (!element) {
        return;
    }

    element.innerHTML = String(value || '');
}

function setFechaFromObject(root, prefix, fecha = {}) {
    const anioEl = root.querySelector(`#${prefix}Anio`);
    const mesEl = root.querySelector(`#${prefix}Mes`);
    const diaEl = root.querySelector(`#${prefix}Dia`);

    setSelectIfExists(anioEl, fecha.anio);
    setSelectIfExists(mesEl, fecha.mes);
    setSelectIfExists(diaEl, fecha.dia);
}

function clearExtraRows(root, wrapperSelector, rowSelector) {
    const wrapper = root.querySelector(wrapperSelector);
    if (!wrapper) {
        return;
    }

    const rows = wrapper.querySelectorAll(rowSelector);
    rows.forEach((row, index) => {
        if (index > 0) {
            row.remove();
        }
    });
}

function ensureRows(root, wrapperSelector, rowSelector, targetCount) {
    const wrapper = root.querySelector(wrapperSelector);
    if (!wrapper || targetCount <= 1) {
        return;
    }

    while (wrapper.querySelectorAll(rowSelector).length < targetCount) {
        const lastRow = wrapper.querySelector(`${rowSelector}:last-child`);
        const addButton = lastRow?.querySelector('.ceCircleBtnAdd');
        addButton?.click();
    }
}

function applyEventoDataToCrearEventoForm(root, evento) {
    if (!root || !evento) {
        return;
    }

    setInputIfExists(root, '#nombreEvento', evento.nombreEvento);
    setFechaFromObject(root, 'fechaPub', evento.fechaPublicacion);

    const fechasEvento = Array.isArray(evento.fechasEvento) ? evento.fechasEvento : [];
    clearExtraRows(root, '#fechasEventoWrapper', '.ceFechaRow');
    ensureRows(root, '#fechasEventoWrapper', '.ceFechaRow', Math.max(1, fechasEvento.length));

    const fechaRows = root.querySelectorAll('#fechasEventoWrapper .ceFechaRow');
    fechaRows.forEach((row, index) => {
        const fecha = fechasEvento[index] || fechasEvento[0] || {};
        const selects = row.querySelectorAll('select');
        setSelectIfExists(selects[0], fecha.anio);
        setSelectIfExists(selects[1], fecha.mes);
        setSelectIfExists(selects[2], fecha.dia);
    });

    setSelectIfExists(root.querySelector('#horaInicio'), evento?.horario?.horaInicio);
    setSelectIfExists(root.querySelector('#horaFin'), evento?.horario?.horaFin);
    setInputIfExists(root, '#lugarEvento', evento.lugarEvento);
    setInputIfExists(root, '#linkCalendar', evento.linkCalendar);
    setInputIfExists(root, '#descripcionEvento', evento.descripcionEvento);
    setEditorIfExists(root, '#objetivosEditor', evento.objetivosEvento);
    setEditorIfExists(root, '#agendaEditor', evento.agendaEvento);
    setEditorIfExists(root, '#agendaFacilEditor', evento.agendaLecturaFacil);
    setInputIfExists(root, '#contactoNombre', evento?.contacto?.nombreCompleto);
    setInputIfExists(root, '#contactoCorreo', evento?.contacto?.correoElectronico);
    setInputIfExists(root, '#descImagen', evento.descripcionImagen);
    setInputIfExists(root, '#publicoMeta', evento.publicoMeta);
    setSelectIfExists(root.querySelector('#cupoEvento'), evento.cupoEvento);
    setEditorIfExists(root, '#infoAdicionalEditor', evento.infoAdicional);
    setInputIfExists(root, '#palabrasClave', Array.isArray(evento.palabrasClave) ? evento.palabrasClave.join(', ') : '');
    setSelectIfExists(root.querySelector('#tipoFormulario'), evento?.formularioInteresados?.tipo);
    root.querySelector('#tipoFormulario')?.dispatchEvent(new Event('change', { bubbles: true }));
    setSelectIfExists(root.querySelector('#listaDifusion'), evento.listaDifusion);
    setFechaFromObject(root, 'fechaFin', evento.fechaFinVisualizacion);

    const fijarImportanteSi = root.querySelector('input[name="fijarImportante"][value="si"]');
    const fijarImportanteNo = root.querySelector('input[name="fijarImportante"][value="no"]');
    const isImportant = Boolean(evento.fijarImportante);
    if (fijarImportanteSi) {
        fijarImportanteSi.checked = isImportant;
    }
    if (fijarImportanteNo) {
        fijarImportanteNo.checked = !isImportant;
    }

    const redes = new Set(Array.isArray(evento.redesSociales) ? evento.redesSociales : []);
    root.querySelectorAll('input[name="redes"]').forEach((checkbox) => {
        checkbox.checked = redes.has(checkbox.value);
    });

    const aspectos = new Set(Array.isArray(evento?.formularioInteresados?.aspectosSeleccionados)
        ? evento.formularioInteresados.aspectosSeleccionados
        : []);
    root.querySelectorAll('#subFormInscripcion input[type="checkbox"], #subFormConfirmacion input[type="checkbox"]').forEach((checkbox) => {
        const text = checkbox.closest('label')?.textContent?.trim() || '';
        checkbox.checked = aspectos.has(text);
    });
}

function applyPendingCrearEventoPreload() {
    const preloadRaw = sessionStorage.getItem(crearEventoPreloadStorageKey);

    if (!preloadRaw) {
        return;
    }

    let preload;
    try {
        preload = JSON.parse(preloadRaw);
    } catch {
        sessionStorage.removeItem(crearEventoPreloadStorageKey);
        return;
    }

    sessionStorage.removeItem(crearEventoPreloadStorageKey);

    const formRoot = getCrearEventoRoot();
    if (!formRoot) {
        return;
    }

    if (preload?.type === 'snapshot' && Array.isArray(preload?.snapshot)) {
        clearCrearEventoEditContext();
        clearCrearEventoFormData();
        restoreCrearEventoForm(formRoot, preload.snapshot);
        return;
    }

    if (preload?.type === 'evento' && preload?.evento) {
        setCrearEventoEditContext({
            source: preload?.editContext?.source || 'evento',
            eventoId: preload?.editContext?.eventoId || preload?.evento?._id || '',
            estado: preload?.editContext?.estado || preload?.evento?.estado || '',
            statusTab: preload?.editContext?.statusTab || '',
        });
        clearCrearEventoFormData();
        applyEventoDataToCrearEventoForm(formRoot, preload.evento);
        return;
    }

    clearCrearEventoEditContext();
}

function serializeCrearEventoForm(formRoot) {
    if (!formRoot) {
        return [];
    }

    const fields = formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"]');

    return Array.from(fields).map((field) => {
        if (field.getAttribute('contenteditable') === 'true') {
            return {
                kind: 'contenteditable',
                html: field.innerHTML,
            };
        }

        if (field.type === 'checkbox' || field.type === 'radio') {
            return {
                kind: 'checkable',
                checked: field.checked,
            };
        }

        if (field.type === 'file') {
            return {
                kind: 'file',
                hasFiles: field.files?.length > 0,
                fileName: field.files?.[0]?.name || '',
            };
        }

        return {
            kind: 'value',
            value: field.value,
        };
    });
}

function applyCrearEventoContentEditableSnapshot(field, fieldSnapshot) {
    field.innerHTML = fieldSnapshot.html || '';
}

function applyCrearEventoCheckableSnapshot(field, fieldSnapshot) {
    field.checked = Boolean(fieldSnapshot.checked);
}

function applyCrearEventoValueSnapshot(field, fieldSnapshot) {
    field.value = fieldSnapshot.value || '';
}

function applyCrearEventoFileSnapshot(field, fieldSnapshot) {
    const fileNameEl = field.closest('.ceFileInput')?.querySelector('.ceFileName');

    if (fileNameEl) {
        fileNameEl.textContent = fieldSnapshot.fileName || 'Adjuntar Documento';
    }
}

function restoreCrearEventoForm(formRoot, snapshot) {
    if (!formRoot || !Array.isArray(snapshot) || !snapshot.length) {
        return;
    }

    const fields = Array.from(formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"]'));
    const restoreLength = Math.min(fields.length, snapshot.length);

    for (let i = 0; i < restoreLength; i++) {
        const field = fields[i];
        const fieldSnapshot = snapshot[i];

        if (fieldSnapshot.kind === 'contenteditable' && field.getAttribute('contenteditable') === 'true') {
            applyCrearEventoContentEditableSnapshot(field, fieldSnapshot);
            continue;
        }

        if (fieldSnapshot.kind === 'checkable' && (field.type === 'checkbox' || field.type === 'radio')) {
            applyCrearEventoCheckableSnapshot(field, fieldSnapshot);
            continue;
        }

        if (fieldSnapshot.kind === 'value' && 'value' in field) {
            applyCrearEventoValueSnapshot(field, fieldSnapshot);
            continue;
        }

        if (fieldSnapshot.kind === 'file' && field.type === 'file') {
            applyCrearEventoFileSnapshot(field, fieldSnapshot);
        }
    }
}

function hasAnyTypedData(formRoot) {
    if (!formRoot) {
        return false;
    }

    const textInputs = formRoot.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], input[type="tel"], input[type="number"], input[type="search"], input[type="password"]');
    const textareas = formRoot.querySelectorAll('textarea');
    const contentEditors = formRoot.querySelectorAll('[contenteditable="true"]');
    const fileInputs = formRoot.querySelectorAll('input[type="file"]');

    const hasText = Array.from(textInputs).some((input) => input.value.trim() !== '');
    const hasTextarea = Array.from(textareas).some((textarea) => textarea.value.trim() !== '');
    const hasEditorText = Array.from(contentEditors).some((editor) => editor.textContent.trim() !== '');
    const hasFiles = Array.from(fileInputs).some((input) => input.files?.length > 0);

    return hasText || hasTextarea || hasEditorText || hasFiles;
}

async function saveCrearEventoDraft(options = {}) {
    const formRoot = getCrearEventoRoot();
    const draftSnapshot = serializeCrearEventoForm(formRoot);

    if (!draftSnapshot.length) {
        return null;
    }

    sessionStorage.setItem(crearEventoDraftStorageKey, JSON.stringify(draftSnapshot));

    if (options.background) {
        sendCrearEventoDraftBeacon(draftSnapshot);
        return draftSnapshot;
    }

    await saveCrearEventoDraftToBackend(draftSnapshot);
    return draftSnapshot;
}

function clearCrearEventoLocalDraft() {
    sessionStorage.removeItem(crearEventoDraftStorageKey);
}

async function clearCrearEventoDraft() {
    clearCrearEventoLocalDraft();
    await deleteCrearEventoDraftFromBackend();
}

function clearCrearEventoFormData() {
    const formRoot = getCrearEventoRoot();
    if (!formRoot) {
        return;
    }

    const keepOnlyFirstRow = (wrapperSelector, rowSelector) => {
        const wrapper = formRoot.querySelector(wrapperSelector);
        if (!wrapper) {
            return;
        }

        const rows = wrapper.querySelectorAll(rowSelector);
        rows.forEach((row, index) => {
            if (index > 0) {
                row.remove();
            }
        });
    };

    keepOnlyFirstRow('#fechasEventoWrapper', '.ceFechaRow');
    keepOnlyFirstRow('#imagenesWrapper', '.ceFileRow');
    keepOnlyFirstRow('#videosWrapper', '.ceFileRow');
    keepOnlyFirstRow('#referenciasWrapper', '.ceRefRow');

    const fields = formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"]');
    fields.forEach((field) => {
        if (field.getAttribute('contenteditable') === 'true') {
            field.innerHTML = '';
            return;
        }

        if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = Boolean(field.defaultChecked);
            return;
        }

        if (field.type === 'file') {
            field.value = '';
            return;
        }

        if (field.tagName === 'SELECT') {
            field.selectedIndex = field.options.length > 0 ? 0 : -1;
            return;
        }

        if ('value' in field) {
            field.value = '';
        }
    });

    formRoot.querySelectorAll('.ceFileName').forEach((fileNameEl) => {
        fileNameEl.textContent = 'Adjuntar Documento';
    });

    const tipoFormulario = formRoot.querySelector('#tipoFormulario');
    const subFormInscripcion = formRoot.querySelector('#subFormInscripcion');
    const subFormConfirmacion = formRoot.querySelector('#subFormConfirmacion');

    if (tipoFormulario) {
        tipoFormulario.value = '';
    }

    subFormInscripcion?.classList.add('d-none');
    subFormConfirmacion?.classList.add('d-none');

    const hoy = new Date();
    const anio = String(hoy.getFullYear());
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    const setFecha = (anioEl, mesEl, diaEl) => {
        if (!anioEl || !mesEl || !diaEl) {
            return;
        }

        anioEl.value = anio;
        anioEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (Array.from(mesEl.options).some((opt) => opt.value === mes)) {
            mesEl.value = mes;
            mesEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (Array.from(diaEl.options).some((opt) => opt.value === dia)) {
            diaEl.value = dia;
        }
    };

    setFecha(
        formRoot.querySelector('#fechaPubAnio'),
        formRoot.querySelector('#fechaPubMes'),
        formRoot.querySelector('#fechaPubDia'),
    );

    setFecha(
        formRoot.querySelector('#fechaFinAnio'),
        formRoot.querySelector('#fechaFinMes'),
        formRoot.querySelector('#fechaFinDia'),
    );

    const primeraFechaEvento = formRoot.querySelector('#fechasEventoWrapper .ceFechaRow');
    if (primeraFechaEvento) {
        const selects = primeraFechaEvento.querySelectorAll('select');
        setFecha(selects[0], selects[1], selects[2]);
    }

    const horaInicio = formRoot.querySelector('#horaInicio');
    const horaFin = formRoot.querySelector('#horaFin');

    if (horaInicio && Array.from(horaInicio.options).some((opt) => opt.value === '14:00')) {
        horaInicio.value = '14:00';
    }

    if (horaFin && Array.from(horaFin.options).some((opt) => opt.value === '17:00')) {
        horaFin.value = '17:00';
    }
}

async function restoreCrearEventoDraft() {
    const formRoot = getCrearEventoRoot();
    const rawSnapshot = sessionStorage.getItem(crearEventoDraftStorageKey);

    if (!formRoot) {
        return;
    }

    if (rawSnapshot) {
        try {
            const snapshot = JSON.parse(rawSnapshot);
            restoreCrearEventoForm(formRoot, snapshot);
            return;
        } catch {
            sessionStorage.removeItem(crearEventoDraftStorageKey);
        }
    }

    try {
        const snapshot = await loadCrearEventoDraftFromBackend();
        if (snapshot) {
            sessionStorage.setItem(crearEventoDraftStorageKey, JSON.stringify(snapshot));
            restoreCrearEventoForm(formRoot, snapshot);
        }
    } catch {
        sessionStorage.removeItem(crearEventoDraftStorageKey);
    }
}

globalThis.crearEventoDraftManager = {
    hasTypedData: () => hasAnyTypedData(getCrearEventoRoot()),
    saveDraft: saveCrearEventoDraft,
    restoreDraft: restoreCrearEventoDraft,
    resetDraftKey: resetCrearEventoDraftKey,
    clearLocalDraft: clearCrearEventoLocalDraft,
    clearDraft: clearCrearEventoDraft,
    clearEditContext: clearCrearEventoEditContext,
    clearFormData: clearCrearEventoFormData,
    discardForm: async () => {
        clearCrearEventoFormData();
        clearCrearEventoEditContext();
        await clearCrearEventoDraft();
    },
};

globalThis.applyPendingCrearEventoPreload = applyPendingCrearEventoPreload;

async function fetchEventoPreviewById(eventoId) {
    if (!eventoId) {
        return null;
    }

    try {
        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`);
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data?.evento || null;
    } catch {
        return null;
    }
}

async function fetchBorradorPreviewByKey(draftKey) {
    if (!draftKey) {
        return null;
    }

    try {
        const response = await fetch(`/api/form-borrador/${encodeURIComponent(draftKey)}`);
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data?.borrador || null;
    } catch {
        return null;
    }
}

function normalizarRutaImagenPreview(ruta) {
    return construirUrlImagenEvento(ruta);
}

function construirPreviewDesdeBorradorSnapshot(snapshot) {
    if (!Array.isArray(snapshot)) {
        return {};
    }

    const getValue = (idx) => {
        const item = snapshot[idx];
        return item?.kind === 'value' ? String(item.value || '').trim() : '';
    };

    const getHtml = (idx) => {
        const item = snapshot[idx];
        return item?.kind === 'contenteditable' ? String(item.html || '').trim() : '';
    };

    const primeraFechaEvento = {
        anio: getValue(4),
        mes: getValue(5),
        dia: getValue(6),
        iso: crearIsoFecha({
            anio: getValue(4),
            mes: getValue(5),
            dia: getValue(6),
        }),
    };

    return {
        nombreEvento: getValue(3) || 'Sin título',
        descripcionEvento: getValue(11) || '',
        objetivosEvento: getHtml(12) || '',
        agendaEvento: getHtml(13) || '',
        infoAdicional: getHtml(22) || '',
        publicoMeta: getValue(20) || '',
        cupoEvento: getValue(21) || '',
        lugarEvento: getValue(9) || '',
        linkCalendar: getValue(10) || '',
        contacto: {
            nombreCompleto: getValue(15) || '',
            correoElectronico: getValue(16) || '',
        },
        fechasEvento: (primeraFechaEvento.anio && primeraFechaEvento.mes && primeraFechaEvento.dia) ? [primeraFechaEvento] : [],
        fechaPublicacion: {
            anio: getValue(0),
            mes: getValue(1),
            dia: getValue(2),
            iso: crearIsoFecha({
                anio: getValue(0),
                mes: getValue(1),
                dia: getValue(2),
            }),
        },
        horario: {
            horaInicio: getValue(7) || '',
            horaFin: getValue(8) || '',
        },
        imagenes: [],
    };
}

function formatearTextoFecha(fecha) {
    if (!fecha || !fecha.iso) {
        return '';
    }

    const fechaObj = new Date(fecha.iso);
    if (Number.isNaN(fechaObj.getTime())) {
        return '';
    }

    return fechaObj.toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatearFechaCorta(fecha) {
    if (!fecha || !fecha.iso) {
        return { dia: '', mes: '' };
    }

    const fechaObj = new Date(fecha.iso);
    if (Number.isNaN(fechaObj.getTime())) {
        return { dia: '', mes: '' };
    }

    return {
        dia: String(fechaObj.getDate()).padStart(2, '0'),
        mes: fechaObj.toLocaleString('es-CR', { month: 'short' }).toUpperCase(),
    };
}

function escapeHtmlPreviewGlobal(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function limpiarTextoHtmlGlobal(texto) {
    return String(texto || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
}

function construirParrafosPreviewGlobal(texto, fallback = 'No hay información disponible.') {
    const parrafos = String(texto || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .split(/\r?\n+/)
        .map((parrafo) => limpiarTextoHtmlGlobal(parrafo))
        .filter(Boolean);

    if (!parrafos.length) {
        return `<p>${escapeHtmlPreviewGlobal(fallback)}</p>`;
    }

    return parrafos.map((parrafo) => `<p>${escapeHtmlPreviewGlobal(parrafo)}</p>`).join('');
}

function construirListaPreviewGlobal(texto, maxItems = 4) {
    const items = String(texto || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .split(/\r?\n+/)
        .map((item) => limpiarTextoHtmlGlobal(item))
        .filter(Boolean)
        .slice(0, maxItems);

    if (!items.length) {
        return '<li>No hay objetivos especificados.</li>';
    }

    return items.map((item) => `<li>${escapeHtmlPreviewGlobal(item)}</li>`).join('');
}

function construirAgendaPreviewGlobal(texto) {
    const lineas = String(texto || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .split(/\r?\n+/)
        .map((linea) => limpiarTextoHtmlGlobal(linea))
        .filter(Boolean);

    if (!lineas.length) {
        return `
            <div class="eventoPoliticaAgendaFila">
                <div class="eventoPoliticaAgendaHora">Pendiente</div>
                <div class="eventoPoliticaAgendaDetalle">No hay agenda registrada para este evento.</div>
            </div>
        `;
    }

    return lineas.slice(0, 8).map((linea) => {
        const matchHora = linea.match(/\b\d{1,2}(:\d{2})?\s*(am|pm)?/i);
        const hora = matchHora ? matchHora[0] : 'Actividad';
        const detalle = linea.replace(hora, '').replace(/^\s*[-:]/, '').trim() || linea;

        return `
            <div class="eventoPoliticaAgendaFila">
                <div class="eventoPoliticaAgendaHora">${escapeHtmlPreviewGlobal(hora)}</div>
                <div class="eventoPoliticaAgendaDetalle">${escapeHtmlPreviewGlobal(detalle)}</div>
            </div>
        `;
    }).join('');
}

function obtenerFechaPrincipalPreviewGlobal(evento) {
    if (Array.isArray(evento?.fechasEvento) && evento.fechasEvento.length > 0) {
        return evento.fechasEvento[0];
    }
    return evento?.fechaPublicacion || null;
}

function obtenerImagenesCarruselPreviewGlobal(evento, imagenPrincipal) {
    const imagenes = Array.isArray(evento?.imagenes)
        ? evento.imagenes.map((item) => normalizarRutaImagenPreview(item?.ruta || item)).filter(Boolean)
        : [];

    const base = imagenes.length ? imagenes : [imagenPrincipal || './assets/img/eventos-discapacidad.webp'];
    const resultado = base.slice(0, 4);
    while (resultado.length < 4) {
        resultado.push(resultado[resultado.length - 1]);
    }
    return resultado;
}

function generarResumenLecturaFacilPreviewGlobal(root, tituloEvento, cuposTexto) {
    const descripcion = Array.from(root.querySelectorAll('.eventoPoliticaBloqueContenido p'))
        .map((elemento) => elemento.textContent.trim())
        .filter(Boolean);

    const objetivos = Array.from(root.querySelectorAll('.eventoPoliticaListaObjetivos li'))
        .map((elemento) => elemento.textContent.trim())
        .filter(Boolean);

    const agenda = Array.from(root.querySelectorAll('.eventoPoliticaAgendaFila'))
        .map((fila) => {
            const hora = fila.querySelector('.eventoPoliticaAgendaHora')?.textContent.trim();
            const detalle = fila.querySelector('.eventoPoliticaAgendaDetalle')?.textContent.trim();
            return hora && detalle ? `${hora}: ${detalle}` : null;
        })
        .filter(Boolean);

    const datosEvento = Array.from(root.querySelectorAll('.eventoPoliticaListaInfo li'))
        .map((elemento) => elemento.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

    const parrafos = [`Este evento se llama ${tituloEvento}.`];
    if (datosEvento.length > 0) parrafos.push(`Datos clave: ${datosEvento.join('. ')}.`);
    if (descripcion.length > 0) parrafos.push(`Resumen rápido: ${descripcion.slice(0, 2).join(' ')}`);
    if (objetivos.length > 0) parrafos.push(`Objetivos principales: ${objetivos.slice(0, 2).join(' ')}`);
    if (agenda.length > 0) parrafos.push(`Agenda del evento: ${agenda.slice(0, 3).join(' / ')}.`);
    parrafos.push(`Disponibilidad: ${cuposTexto}.`);

    return parrafos;
}

function conectarLecturaFacilPreviewGlobal(modalElement, tituloEvento, cuposTexto) {
    const root = modalElement.querySelector('.eventoPreviewTemplateRoot');
    if (!root) return;

    const boton = root.querySelector('#btnLecturaFacilEventoPreview');
    const ventana = root.querySelector('#lecturaFacilVentanaPreview');
    const titulo = root.querySelector('#lecturaFacilTituloPreview');
    const contenido = root.querySelector('#lecturaFacilContenidoPreview');

    if (!boton || !ventana || !titulo || !contenido) return;

    boton.addEventListener('click', () => {
        const visible = !ventana.classList.contains('d-none');
        if (visible) {
            ventana.classList.add('d-none');
            boton.classList.remove('is-active');
            boton.setAttribute('aria-expanded', 'false');
            return;
        }

        const parrafos = generarResumenLecturaFacilPreviewGlobal(root, tituloEvento, cuposTexto);
        titulo.textContent = tituloEvento;
        contenido.innerHTML = parrafos.map((parrafo) => `<p>${escapeHtmlPreviewGlobal(parrafo)}</p>`).join('');

        ventana.classList.remove('d-none');
        boton.classList.add('is-active');
        boton.setAttribute('aria-expanded', 'true');
    });
}

function renderContenidoModalTemplateGlobal(modalElement, evento, imagenFuente) {
    const modalBody = modalElement.querySelector('.modalVistaPreviaBody');
    if (!modalBody) {
        return;
    }

    const fecha = obtenerFechaPrincipalPreviewGlobal(evento);
    const fechaCorta = formatearFechaCorta(fecha);
    const fechaCompleta = formatearTextoFecha(fecha) || 'Sin fecha disponible';
    const fechaObj = fecha?.iso ? new Date(fecha.iso) : null;
    const mesLargo = (fechaObj && !Number.isNaN(fechaObj.getTime()))
        ? fechaObj.toLocaleString('es-CR', { month: 'long' })
        : 'sin mes';
    const anio = (fechaObj && !Number.isNaN(fechaObj.getTime())) ? fechaObj.getFullYear() : '';

    const nombreEvento = evento?.nombreEvento || 'Sin título';
    const descripcion = evento?.descripcionEvento || '';
    const objetivos = evento?.objetivosEvento || '';
    const agenda = evento?.agendaEvento || '';
    const infoAdicional = evento?.infoAdicional || '';
    const lugar = evento?.lugarEvento || 'No definido';
    const horaInicio = evento?.horario?.horaInicio || 'No definido';
    const horaFin = evento?.horario?.horaFin || 'No definido';
    const publicoMeta = evento?.publicoMeta || 'No definido';
    const cuposTexto = evento?.cupoEvento ? `${evento.cupoEvento} cupos disponibles` : 'No definido';
    const linkCalendar = evento?.linkCalendar || '#';
    const contactoNombre = evento?.contacto?.nombreCompleto || evento?.contacto?.nombre || 'No definido';
    const contactoCorreo = evento?.contacto?.correoElectronico || evento?.contacto?.correo || 'No definido';
    const telefono = evento?.contacto?.telefono || 'No definido';
    const institucion = evento?.contacto?.institucion || '';
    const imagenesCarrusel = obtenerImagenesCarruselPreviewGlobal(evento, imagenFuente);

    modalBody.innerHTML = `
        <div class="eventoPreviewTemplateRoot">
            <div id="estructuraEventosPolitica" class="eventoPoliticaDetalleWrapper">
                <section class="eventoPoliticaDetalleVista" aria-labelledby="previewTituloModalPlantilla">
                    <div class="eventoPoliticaHeroPortada">
                        <img src="${escapeHtmlPreviewGlobal(imagenFuente || './assets/img/eventos-discapacidad.webp')}" alt="Imagen del evento ${escapeHtmlPreviewGlobal(nombreEvento)}">
                    </div>

                    <div class="eventoPoliticaContenidoInterior px-lg-5">
                        <div class="eventoPoliticaTituloFranja d-flex align-items-center gap-3">
                            <div class="eventoPoliticaFechaBadge" aria-hidden="true">
                                <span class="eventoPoliticaFechaDia">${escapeHtmlPreviewGlobal(fechaCorta.dia || '00')}</span>
                                <span class="eventoPoliticaFechaMes">${escapeHtmlPreviewGlobal(fechaCorta.mes || '---')}</span>
                            </div>
                            <h1 id="previewTituloModalPlantilla" class="eventoPoliticaTituloPrincipal mb-0">${escapeHtmlPreviewGlobal(nombreEvento)}</h1>
                        </div>

                        <div class="row g-4 eventoPoliticaContenido pt-4">
                            <div class="col-12 col-lg-7">
                                <section class="eventoPoliticaBloqueContenido" aria-labelledby="previewDescripcionModalTitle">
                                    <h2 id="previewDescripcionModalTitle" class="eventoPoliticaSeccionTitulo">Descripción</h2>
                                    <div class="eventoPoliticaInfoAdicionalTexto">${construirParrafosPreviewGlobal(descripcion, 'No hay descripción disponible.')}</div>

                                    <h2 class="eventoPoliticaSeccionTitulo mt-4">Objetivos</h2>
                                    <ol class="eventoPoliticaListaObjetivos">${construirListaPreviewGlobal(objetivos, 3)}</ol>
                                </section>
                            </div>

                            <div class="col-12 col-lg-5">
                                <aside class="eventoPoliticaSidebar d-flex flex-column gap-3" aria-label="Información complementaria del evento">
                                    <section class="eventoPoliticaCaja eventoPoliticaCajaClara" aria-labelledby="previewInfoModalTitle">
                                        <h2 id="previewInfoModalTitle" class="eventoPoliticaSeccionTitulo">Información del evento</h2>
                                        <ul class="eventoPoliticaListaInfo">
                                            <li><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtmlPreviewGlobal(fechaCompleta)}</li>
                                            <li><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtmlPreviewGlobal(horaInicio)} - ${escapeHtmlPreviewGlobal(horaFin)}</li>
                                            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtmlPreviewGlobal(lugar)}</li>
                                        </ul>
                                        <div class="eventoPoliticaContacto">
                                            <p class="mb-1 fw-semibold">${escapeHtmlPreviewGlobal(contactoNombre)}${institucion ? `<br>${escapeHtmlPreviewGlobal(institucion)}` : ''}</p>
                                            <p class="mb-1">Teléfono: ${escapeHtmlPreviewGlobal(telefono)}</p>
                                            <p class="mb-0">Correo electrónico: ${escapeHtmlPreviewGlobal(contactoCorreo)}</p>
                                        </div>
                                    </section>

                                    <section class="eventoPoliticaCaja eventoPoliticaCajaAzul" aria-labelledby="previewPublicoMetaModalTitle">
                                        <h2 id="previewPublicoMetaModalTitle" class="eventoPoliticaSeccionTitulo text-white">Público Meta</h2>
                                        <p class="eventoPoliticaTextoBlanco">${escapeHtmlPreviewGlobal(publicoMeta)}</p>
                                        <div class="eventoPoliticaAccionMeta d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                            <strong class="eventoPoliticaCupos">${escapeHtmlPreviewGlobal(cuposTexto)}</strong>
                                            <a class="eventoPoliticaBotonInscripcion text-decoration-none" href="${escapeHtmlPreviewGlobal(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
                                        </div>
                                    </section>

                                    <section class="eventoPoliticaEnlaceEvento" aria-labelledby="previewEnlaceModalTitle">
                                        <h2 id="previewEnlaceModalTitle" class="eventoPoliticaSeccionTitulo">Enlace del evento</h2>
                                        <a href="${escapeHtmlPreviewGlobal(linkCalendar)}" target="_blank" rel="noopener noreferrer">${escapeHtmlPreviewGlobal(linkCalendar)}</a>
                                    </section>
                                </aside>
                            </div>
                        </div>
                    </div>

                    <div class="eventoPoliticaInfoAdicionalCard mt-5">
                        <div class="eventoPoliticaInfoAdicionalContenido">
                            <section class="eventoPoliticaAgendaSection" aria-labelledby="previewAgendaModalTitle">
                                <h2 id="previewAgendaModalTitle" class="eventoPoliticaAgendaTitulo">Programa / Agenda del evento</h2>

                                <div class="eventoPoliticaAgendaTabla mt-3">
                                    <div class="eventoPoliticaAgendaCabecera">Día ${escapeHtmlPreviewGlobal(fechaCorta.dia || '00')} de ${escapeHtmlPreviewGlobal(mesLargo)} ${escapeHtmlPreviewGlobal(anio)}</div>
                                    ${construirAgendaPreviewGlobal(agenda)}
                                </div>
                            </section>

                            <h2 class="eventoPoliticaInfoAdicionalTitulo">Información Adicional</h2>
                            <div class="eventoPoliticaInfoAdicionalTexto">${construirParrafosPreviewGlobal(infoAdicional, 'No hay información adicional.')}</div>

                            <div class="eventoPoliticaInfoAdicionalAcciones d-flex flex-wrap gap-3 mt-4">
                                <button id="btnLecturaFacilEventoPreview" type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--primary" aria-controls="lecturaFacilVentanaPreview" aria-expanded="false">Lectura Fácil del Evento</button>
                                <button type="button" class="eventoPoliticaInfoAdicionalBtn eventoPoliticaInfoAdicionalBtn--secondary">Realizar consulta</button>
                            </div>

                            <div id="lecturaFacilVentanaPreview" class="eventoPoliticaLecturaFacilVentana d-none" role="region" aria-live="polite" aria-labelledby="lecturaFacilTituloPreview">
                                <h3 id="lecturaFacilTituloPreview" class="eventoPoliticaLecturaFacilTitulo"></h3>
                                <div id="lecturaFacilContenidoPreview" class="eventoPoliticaLecturaFacilContenido"></div>
                            </div>

                            <div id="previewEventoCarousel" class="carousel slide eventoPoliticaCarruselWrap mt-5" data-bs-ride="false" aria-label="Galería del evento">
                                <div class="carousel-indicators eventoPoliticaCarruselIndicadores">
                                    ${imagenesCarrusel.map((_, indice) => `<button type="button" data-bs-target="#previewEventoCarousel" data-bs-slide-to="${indice}" class="eventoPoliticaCarruselDot ${indice === 0 ? 'active' : ''}" ${indice === 0 ? 'aria-current="true"' : ''} aria-label="Diapositiva ${indice + 1}"></button>`).join('')}
                                </div>

                                <div class="carousel-inner eventoPoliticaCarruselVista">
                                    ${imagenesCarrusel.map((src, indice) => `<div class="carousel-item ${indice === 0 ? 'active' : ''}"><img src="${escapeHtmlPreviewGlobal(src)}" class="d-block w-100 eventoPoliticaCarruselImagen" alt="Imagen ${indice + 1} del evento ${escapeHtmlPreviewGlobal(nombreEvento)}"></div>`).join('')}
                                </div>

                                <button class="carousel-control-prev eventoPoliticaCarruselControl" type="button" data-bs-target="#previewEventoCarousel" data-bs-slide="prev" aria-label="Ver imagen anterior">
                                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                                </button>
                                <button class="carousel-control-next eventoPoliticaCarruselControl" type="button" data-bs-target="#previewEventoCarousel" data-bs-slide="next" aria-label="Ver imagen siguiente">
                                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                </button>
                            </div>

                            <div class="text-center mt-4">
                                <a class="eventoPoliticaInscripcionEventoBtn text-decoration-none" href="${escapeHtmlPreviewGlobal(linkCalendar)}" target="_blank" rel="noopener noreferrer">Inscripción a Evento</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    conectarLecturaFacilPreviewGlobal(modalElement, nombreEvento, cuposTexto);
}

async function renderModalVistaPreviaGlobal(evento) {
    const modalElement = document.getElementById('modalVistaPreviaEvento');
    if (!modalElement) {
        return;
    }

    let imagenFuente = '';
    if (evento?.imagenes && Array.isArray(evento.imagenes) && evento.imagenes.length > 0) {
        imagenFuente = construirUrlImagenEvento(evento.imagenes[0].ruta);
    }

    renderContenidoModalTemplateGlobal(modalElement, evento, imagenFuente || './assets/img/eventos-discapacidad.webp');

    const modalInstance = globalThis.bootstrap?.Modal?.getOrCreateInstance(modalElement);
    if (modalInstance) {
        modalInstance.show();
    }
}

async function mostrarVistaPreviaEventoPorId(eventoId, source = 'evento') {
    if (!eventoId) {
        return;
    }

    let evento = null;
    if (source === 'borrador') {
        const borrador = await fetchBorradorPreviewByKey(eventoId);
        if (borrador) {
            evento = construirPreviewDesdeBorradorSnapshot(borrador.snapshot);
        }
    } else {
        evento = await fetchEventoPreviewById(eventoId);
    }

    if (!evento) {
        return;
    }

    await renderModalVistaPreviaGlobal(evento);
}

globalThis.mostrarVistaPreviaEventoPorId = mostrarVistaPreviaEventoPorId;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrearEvento);
} else {
    initCrearEvento();
}

const crearEventoObserver = new MutationObserver(() => {
    initCrearEvento();
});

if (document.body) {
    crearEventoObserver.observe(document.body, { childList: true, subtree: true });
}

globalThis.initCrearEvento = initCrearEvento;