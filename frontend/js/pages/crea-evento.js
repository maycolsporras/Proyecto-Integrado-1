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

    function generarMeses(selectEl, mesSeleccionado = mesActual) {
        const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        meses.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            if (m === mesSeleccionado) opt.selected = true;
            selectEl.appendChild(opt);
        });
    }

    function actualizarDiasDisponibles(selectAnio, selectMes, selectDia) {
        const anioSeleccionado = Number.parseInt(selectAnio.value, 10);
        const mesSeleccionado = Number.parseInt(selectMes.value, 10);

        const dias = selectDia.querySelectorAll('option');
        dias.forEach(opcion => {
            const diaValor = Number.parseInt(opcion.value, 10);
            const esAnioActual = anioSeleccionado === anioActual;
            const esMesActual = mesSeleccionado === Number.parseInt(mesActual, 10);
            const esAnioYMesActual = esAnioActual && esMesActual;

            if (esAnioYMesActual && diaValor < Number.parseInt(diaActual, 10)) {
                opcion.disabled = true;
                opcion.textContent = `${String(diaValor).padStart(2, '0')} (pasado)`;
            } else {
                opcion.disabled = false;
                opcion.textContent = String(diaValor).padStart(2, '0');
            }
        });

        if (selectDia.selectedOptions?.[0]?.disabled) {
            selectDia.value = '';
        }
    }

    function generarDias(selectEl, diaSeleccionado = diaActual) {
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = String(d).padStart(2, '0');
            opt.textContent = String(d).padStart(2, '0');
            if (opt.value === diaSeleccionado) opt.selected = true;
            selectEl.appendChild(opt);
        }
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
    generarMeses(selectFechaPubMes);
    generarDias(selectFechaPubDia);
    generarHoras(document.getElementById('horaInicio'), '14');
    generarHoras(document.getElementById('horaFin'), '17');

    actualizarDiasDisponibles(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);

    selectFechaPubAnio.addEventListener('change', () => {
        actualizarDiasDisponibles(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);
    });

    selectFechaPubMes.addEventListener('change', () => {
        actualizarDiasDisponibles(selectFechaPubAnio, selectFechaPubMes, selectFechaPubDia);
    });

    marcarSelectsRequeridos(formRoot, '#fechaPubAnio, #fechaPubMes, #fechaPubDia, #horaInicio, #horaFin, #fechaFinAnio, #fechaFinMes, #fechaFinDia');

    // Fecha de visualización final (paso 2)
    const selectFechaFinAnio = document.getElementById('fechaFinAnio');
    const selectFechaFinMes = document.getElementById('fechaFinMes');
    const selectFechaFinDia = document.getElementById('fechaFinDia');

    generarAnios(selectFechaFinAnio);
    generarMeses(selectFechaFinMes);
    generarDias(selectFechaFinDia);

    actualizarDiasDisponibles(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);

    selectFechaFinAnio.addEventListener('change', () => {
        actualizarDiasDisponibles(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);
    });

    selectFechaFinMes.addEventListener('change', () => {
        actualizarDiasDisponibles(selectFechaFinAnio, selectFechaFinMes, selectFechaFinDia);
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
        generarMeses(fechaSelects[1]);
        generarDias(fechaSelects[2]);

        actualizarDiasDisponibles(fechaSelects[0], fechaSelects[1], fechaSelects[2]);

        fechaSelects[0].addEventListener('change', () => {
            actualizarDiasDisponibles(fechaSelects[0], fechaSelects[1], fechaSelects[2]);
        });

        fechaSelects[1].addEventListener('change', () => {
            actualizarDiasDisponibles(fechaSelects[0], fechaSelects[1], fechaSelects[2]);
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

    async function guardarFormularioEvento() {
        const payload = construirPayloadFormularioEvento();
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

        const response = await fetch('/api/form-evento', {
            method: 'POST',
            body: formData,
        });

        const responseBody = await response.json();

        if (!response.ok) {
            throw new Error(responseBody?.mensaje || 'No se pudo guardar el formulario de evento.');
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
            mostrarModalEventoEnviado();
            irAPaso1();
        } catch (error) {
            alert(error.message || 'Ocurrió un error al guardar el evento.');
        } finally {
            btnEnviarAprobacion.disabled = false;
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
    clearFormData: clearCrearEventoFormData,
    discardForm: async () => {
        clearCrearEventoFormData();
        await clearCrearEventoDraft();
    },
};

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