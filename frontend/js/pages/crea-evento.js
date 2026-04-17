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

    generarAnios(document.getElementById('fechaPubAnio'));
    generarMeses(document.getElementById('fechaPubMes'));
    generarDias(document.getElementById('fechaPubDia'));
    generarHoras(document.getElementById('horaInicio'), '14');
    generarHoras(document.getElementById('horaFin'), '17');

    // Fecha de visualización final (paso 2)
    generarAnios(document.getElementById('fechaFinAnio'));
    generarMeses(document.getElementById('fechaFinMes'));
    generarDias(document.getElementById('fechaFinDia'));

    // ── Fechas del evento dinámicas (+ / -) ───────────────────────

    const fechasWrapper = document.getElementById('fechasEventoWrapper');
    const primeraFechaRow = fechasWrapper.querySelector('.ceFechaRow');

    function inicializarFechaRow(fechaRow) {
        const fechaSelects = fechaRow.querySelectorAll('select');
        fechaSelects.forEach(select => {
            select.innerHTML = '';
        });
        generarAnios(fechaSelects[0]);
        generarMeses(fechaSelects[1]);
        generarDias(fechaSelects[2]);
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

        if (btnAdd && btnAdd.closest('.ceFechaRow')) {
            const filas = fechasWrapper.querySelectorAll('.ceFechaRow');
            fechasWrapper.appendChild(crearFechaRow(filas.length));
            actualizarBotonesFechas();
        }

        if (btnRemove && btnRemove.closest('.ceFechaRow')) {
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

    function actualizarBotonesArchivo(wrapper) {
        const filas = wrapper.querySelectorAll('.ceFileRow');
        filas.forEach(fila => {
            fila.querySelector('.ceCircleBtnRemove').disabled = filas.length === 1;
        });
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

        if (btnAdd && btnAdd.closest('.ceRefRow')) {
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
            referenciasWrapper.insertBefore(nuevaFila, linkRef);
            actualizarBotonesReferencias();
        }

        if (btnRemove && btnRemove.closest('.ceRefRow')) {
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

    btnSiguiente?.addEventListener('click', irAPaso2);
    btnAnterior?.addEventListener('click', irAPaso1);
    stepIndicator1?.addEventListener('click', irAPaso1);
    stepIndicator2?.addEventListener('click', irAPaso2);



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