// Formulario dinamico de inscripcion al evento
(function initFormInscripcionModule(global) {
  const opcionesIdentificacion = [
    'Cédula nacional',
    'DIMEX',
    'Pasaporte',
    'Otro',
  ];

  const opcionesDeficiencia = [
    'Visual',
    'Auditiva',
    'Física o motora',
    'Intelectual',
    'Psicosocial',
    'Múltiple',
    'Otra',
  ];

  const opcionesProvinciasCR = [
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón',
  ];

  function normalizarAspecto(aspecto) {
    return String(aspecto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^\s*\d+\.?\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function obtenerAspectosConfigurados(evento) {
    const aspectos = Array.isArray(evento?.formularioInteresados?.aspectosSeleccionados)
      ? evento.formularioInteresados.aspectosSeleccionados
      : [];

    return new Set(aspectos.map(normalizarAspecto).filter(Boolean));
  }

  function tieneAspecto(aspectosSet, expresion) {
    return Array.from(aspectosSet).some((aspecto) => expresion.test(aspecto));
  }

  function construirOpciones(opciones, escapeHtml, valorVacio = 'seleccione el/los datos necesarios') {
    return [`<option value="">${escapeHtml(valorVacio)}</option>`, ...opciones.map((opcion) => `<option value="${escapeHtml(opcion)}">${escapeHtml(opcion)}</option>`)]
      .join('');
  }

  function construirCampoFila(etiqueta, controlHtml, escapeHtml) {
    return `
      <div class="epInscripcionFila">
        <label class="epInscripcionEtiqueta">*${escapeHtml(etiqueta)}</label>
        <div class="epInscripcionControl">${controlHtml}</div>
      </div>
    `;
  }

  function renderPaso1(aspectosSet, escapeHtml) {
    const filas = [];

    if (tieneAspecto(aspectosSet, /nombre completo/)) {
      filas.push(construirCampoFila('Nombre Completo', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" required name="nombreCompleto">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /cedula|identificacion/)) {
      filas.push(construirCampoFila('Tipo de identificación', `<select class="epInscripcionInput" required name="tipoIdentificacion">${construirOpciones(opcionesIdentificacion, escapeHtml)}</select>`, escapeHtml));
      filas.push(construirCampoFila('Número de identificación', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" required name="numeroIdentificacion">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /direccion fisica|provincia|canton|distrito|otras senales/)) {
      filas.push(`
        <div class="epInscripcionFila epInscripcionFilaCompuesta">
          <label class="epInscripcionEtiqueta">Dirección</label>
          <div class="epInscripcionControl epInscripcionGrid2">
            <div class="epInscripcionSubFila"><span>*Provincia</span><select class="epInscripcionInput" name="provincia">${construirOpciones(opcionesProvinciasCR, escapeHtml)}</select></div>
            <div class="epInscripcionSubFila"><span>*Cantón</span><input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="canton"></div>
            <div class="epInscripcionSubFila"><span>*Distrito</span><input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="distrito"></div>
            <div class="epInscripcionSubFila"><span>Otras señas</span><input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="otrasSenas"></div>
          </div>
        </div>
      `);
    }

    if (tieneAspecto(aspectosSet, /correo electronico/)) {
      filas.push(construirCampoFila('Correo Electrónico', '<input type="email" class="epInscripcionInput" placeholder="introduzca el dato solicitado" required name="correoElectronico">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /numero de telefono|telefono/)) {
      filas.push(construirCampoFila('Teléfono', '<input type="tel" class="epInscripcionInput" placeholder="introduzca el dato solicitado" required name="telefono">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /profesion u oficio/)) {
      filas.push(construirCampoFila('Profesión', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="profesion" required>', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /entidad para la que trabaja/)) {
      filas.push(construirCampoFila('Entidad para la que trabaja', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="entidadTrabajo" required>', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /condicion medica|tipo deficiencia/)) {
      filas.push(construirCampoFila('Tipo de Deficiencia', `<select class="epInscripcionInput" name="tipoDeficiencia">${construirOpciones(opcionesDeficiencia, escapeHtml)}</select>`, escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /pago de transporte|transporte/)) {
      filas.push(`
        <div class="epInscripcionFila">
          <label class="epInscripcionEtiqueta">*Requiere transporte al evento</label>
          <div class="epInscripcionControl epInscripcionRadio">
            <label><input type="radio" name="requiereTransporte" value="si" required> Sí</label>
            <label><input type="radio" name="requiereTransporte" value="no"> No</label>
          </div>
        </div>
      `);
    }

    if (!filas.length) {
      return '<p class="epInscripcionVacio">Este evento no tiene campos definidos para el paso 1.</p>';
    }

    return filas.join('');
  }

  function renderPaso2(aspectosSet, escapeHtml) {
    const filas = [];

    if (tieneAspecto(aspectosSet, /pago de transporte|transporte/)) {
      filas.push(construirCampoFila('Monto aproximado del costo del transporte', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="montoTransporte">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /hospedaje/)) {
      filas.push(`
        <div class="epInscripcionFila">
          <label class="epInscripcionEtiqueta">*Requiere hospedaje para asistir al evento</label>
          <div class="epInscripcionControl epInscripcionRadio">
            <label><input type="radio" name="requiereHospedaje" value="si"> Sí</label>
            <label><input type="radio" name="requiereHospedaje" value="no"> No</label>
          </div>
        </div>
      `);
      filas.push(construirCampoFila('Monto aproximado del costo del hospedaje', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="montoHospedaje">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /alimentacion/)) {
      filas.push(construirCampoFila('Requerimientos de alimentación', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="requerimientosAlimentacion">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /condicion medica|alergias/)) {
      filas.push(`
        <div class="epInscripcionFila">
          <label class="epInscripcionEtiqueta">*Alergias a medicamentos</label>
          <div class="epInscripcionControl epInscripcionRadio">
            <label><input type="radio" name="alergiasMedicamentos" value="si"> Sí</label>
            <label><input type="radio" name="alergiasMedicamentos" value="no"> No</label>
          </div>
        </div>
      `);
      filas.push(construirCampoFila('Describa alergias a medicamentos o alimentos', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="detalleAlergias">', escapeHtml));
      filas.push(`
        <div class="epInscripcionFila">
          <label class="epInscripcionEtiqueta">*Requiere interprete de señas</label>
          <div class="epInscripcionControl epInscripcionRadio">
            <label><input type="radio" name="requiereInterprete" value="si"> Sí</label>
            <label><input type="radio" name="requiereInterprete" value="no"> No</label>
          </div>
        </div>
      `);
      filas.push(construirCampoFila('Mencione otros apoyos que se deben de considerar para asistir al evento', '<input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="otrosApoyos">', escapeHtml));
    }

    if (tieneAspecto(aspectosSet, /adjuntar documentos/)) {
      filas.push(`
        <div class="epInscripcionFila epInscripcionFilaCompuesta">
          <label class="epInscripcionEtiqueta">*Adjuntar documentos</label>
          <div class="epInscripcionControl epInscripcionDocumentos">
            <div class="epInscripcionSubFila epInscripcionSubFilaAdjuntos">
              <span>Imágenes</span>
              <div id="formInscripcionImagenesWrapper" class="epAdjuntosWrapper" data-group="imagenes" data-accept="image/*" data-name="imagenesAdjuntas[]"></div>
            </div>
            <div class="epInscripcionSubFila">
              <span>Descripción de imagen</span>
              <input type="text" class="epInscripcionInput" placeholder="introduzca el dato solicitado" name="descripcionImagenAdjunta">
            </div>
            <div class="epInscripcionSubFila epInscripcionSubFilaAdjuntos">
              <span>Video</span>
              <div id="formInscripcionVideosWrapper" class="epAdjuntosWrapper" data-group="videos" data-accept="video/*" data-name="videoAdjunto[]"></div>
            </div>
          </div>
        </div>
      `);
    }

    if (tieneAspecto(aspectosSet, /autorizacion para recibir notificaciones/)) {
      filas.push(`
        <div class="epInscripcionFila epInscripcionFilaCheckUnica">
          <label class="epInscripcionCheckLabel">
            <input type="checkbox" required name="autorizaNotificaciones">
            Autorizo notificaciones de este evento por medio de correo electrónico y teléfono
          </label>
        </div>
      `);
    }

    if (!filas.length) {
      return '<p class="epInscripcionVacio">Este evento no tiene campos definidos para el paso 2.</p>';
    }

    return filas.join('');
  }

  function crearFilaAdjunto({ group, accept, name }) {
    return `
      <div class="ceFileRow jsInscripcionFileRow" data-group="${group}">
        <div class="ceFileInput">
          <i class="fa-solid fa-paperclip ceFileIcon" aria-hidden="true"></i>
          <span class="ceFileName jsInscripcionFileName">Adjuntar Documento</span>
          <input type="file" class="ceFileReal jsInscripcionFileReal" accept="${accept}" name="${name}" aria-label="Adjuntar archivo de ${group}">
        </div>
        <button type="button" class="ceCircleBtn ceCircleBtnAdd jsInscripcionFileAdd" aria-label="Agregar archivo ${group}">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
        <button type="button" class="ceCircleBtn ceCircleBtnRemove jsInscripcionFileRemove" aria-label="Quitar archivo ${group}">
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>
      </div>
      <p class="ceFileNote">máximo 10 MB por archivo</p>
    `;
  }

  function inicializarAdjuntosInscripcion(root) {
    if (!root) return;

    const wrappers = root.querySelectorAll('.epAdjuntosWrapper');
    wrappers.forEach((wrapper) => {
      if (wrapper.children.length > 0) return;

      const group = wrapper.dataset.group || 'adjunto';
      const accept = wrapper.dataset.accept || '*/*';
      const name = wrapper.dataset.name || `${group}[]`;
      wrapper.innerHTML = crearFilaAdjunto({ group, accept, name });
      actualizarEstadoBotonesAdjuntos(wrapper);
    });

    root.addEventListener('click', (eventoClick) => {
      const btnAdd = eventoClick.target.closest('.jsInscripcionFileAdd');
      const btnRemove = eventoClick.target.closest('.jsInscripcionFileRemove');

      if (btnAdd) {
        const wrapper = btnAdd.closest('.epAdjuntosWrapper');
        if (!wrapper) return;

        const group = wrapper.dataset.group || 'adjunto';
        const accept = wrapper.dataset.accept || '*/*';
        const name = wrapper.dataset.name || `${group}[]`;
        wrapper.insertAdjacentHTML('beforeend', crearFilaAdjunto({ group, accept, name }));
        actualizarEstadoBotonesAdjuntos(wrapper);
      }

      if (btnRemove) {
        const wrapper = btnRemove.closest('.epAdjuntosWrapper');
        const row = btnRemove.closest('.jsInscripcionFileRow');
        const note = row?.nextElementSibling;
        if (!wrapper || !row) return;

        const rows = wrapper.querySelectorAll('.jsInscripcionFileRow');
        if (rows.length <= 1) return;

        row.remove();
        if (note?.classList.contains('ceFileNote')) {
          note.remove();
        }
        actualizarEstadoBotonesAdjuntos(wrapper);
      }
    });

    root.addEventListener('change', (eventoChange) => {
      const input = eventoChange.target.closest('.jsInscripcionFileReal');
      if (!input) return;

      const fileNameNode = input.closest('.ceFileInput')?.querySelector('.jsInscripcionFileName');
      if (!fileNameNode) return;

      fileNameNode.textContent = input.files?.[0]?.name || 'Adjuntar Documento';
    });
  }

  function actualizarEstadoBotonesAdjuntos(wrapper) {
    const rows = wrapper.querySelectorAll('.jsInscripcionFileRow');
    rows.forEach((row) => {
      const btnRemove = row.querySelector('.jsInscripcionFileRemove');
      if (btnRemove) {
        btnRemove.disabled = rows.length === 1;
      }
    });
  }

  function crearModuloFormInscripcionEvento(contexto) {
    const {
      contenedorEventosCreados,
      breadcrumbLista,
      escapeHtml,
      obtenerFechaPrincipal,
      obtenerUrlImagenEvento,
      crearDetalleEvento,
      actualizarBreadcrumb,
      getEventoActual,
      onDetalleRender,
    } = contexto;

    function restaurarDetalleDesdeActual() {
      const eventoActual = getEventoActual?.();
      if (!eventoActual?._id) return;

      contenedorEventosCreados.innerHTML = crearDetalleEvento(eventoActual);
      onDetalleRender?.(eventoActual);
      actualizarBreadcrumb(eventoActual.nombreEvento || 'Detalle del evento');
    }

    function actualizarBreadcrumbInscripcion(tituloEvento) {
      if (!breadcrumbLista) return;

      breadcrumbLista.innerHTML = `
        <li class="breadcrumb-item"><a class="text-decoration-none" href="./index.html">Inicio</a></li>
        <li class="breadcrumb-item"><a class="text-decoration-none" href="./eventos.html">Eventos</a></li>
        <li class="breadcrumb-item"><a class="text-decoration-none" href="./eventos-politica.html">Política Nacional de Discapacidad</a></li>
        <li class="breadcrumb-item"><a class="text-decoration-none" href="#" id="breadcrumbVolverDetalleEvento">${escapeHtml(tituloEvento || 'Detalle del evento')}</a></li>
        <li class="breadcrumb-item active" aria-current="page">Formulario de Inscripción</li>
      `;

      const enlaceVolverDetalle = breadcrumbLista.querySelector('#breadcrumbVolverDetalleEvento');
      enlaceVolverDetalle?.addEventListener('click', (eventoClick) => {
        eventoClick.preventDefault();
        restaurarDetalleDesdeActual();
      });
    }

    function crearFormularioInscripcionEvento(evento) {
      const fecha = obtenerFechaPrincipal(evento) || new Date();
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = fecha.toLocaleString('es-CR', { month: 'short' }).toUpperCase();
      const imagen = obtenerUrlImagenEvento(evento.imagenes) || './assets/img/eventos-discapacidad.webp';
      const nombreEvento = evento.nombreEvento || 'Evento sin título';
      const aspectosSet = obtenerAspectosConfigurados(evento);

      return `
        <div class="eventoPoliticaDetalleContainer">
          <div class="eventoPoliticaDetalleWrapper">
            <section class="eventoPoliticaDetalleVista epInscripcionVista" aria-labelledby="titulo-evento-inscripcion">
              <div class="eventoPoliticaHeroPortada">
                <img src="${escapeHtml(imagen)}" alt="Imagen del evento ${escapeHtml(nombreEvento)}">
              </div>

              <div class="eventoPoliticaContenidoInterior px-lg-5">
                <div class="eventoPoliticaTituloFranja d-flex align-items-center gap-3">
                  <div class="eventoPoliticaFechaBadge" aria-hidden="true">
                    <span class="eventoPoliticaFechaDia">${dia}</span>
                    <span class="eventoPoliticaFechaMes">${mes}</span>
                  </div>
                  <h1 id="titulo-evento-inscripcion" class="eventoPoliticaTituloPrincipal mb-0">Formulario de Inscripción: ${escapeHtml(nombreEvento)}</h1>
                </div>

                <div class="epInscripcionCard">
                  <h2 class="epInscripcionTitulo">Información requerida para Inscripción del Evento</h2>
                  <div class="ceStepper epInscripcionStepper" aria-label="Pasos del formulario">
                    <button type="button" class="ceStep ceStepActive ceStepCurrent" data-step="1" aria-label="Ir al paso 1">
                      <span class="ceStepCircle">1</span>
                      <span class="ceStepDot ceStepDotActive"></span>
                    </button>
                    <span class="ceStepLine" aria-hidden="true"></span>
                    <button type="button" class="ceStep" data-step="2" aria-label="Ir al paso 2">
                      <span class="ceStepCircle">2</span>
                      <span class="ceStepDot"></span>
                    </button>
                  </div>

                  <form id="formInscripcionEvento" class="epInscripcionFormulario" novalidate>
                    <div class="epInscripcionPaso" data-step="1">
                      ${renderPaso1(aspectosSet, escapeHtml)}
                    </div>

                    <div class="epInscripcionPaso d-none" data-step="2">
                      ${renderPaso2(aspectosSet, escapeHtml)}
                    </div>

                    <div class="epInscripcionAcciones">
                      <button type="button" class="ceBtn ceBtnSecondary d-none" id="btnPasoAnteriorInscripcion"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i>Anterior</button>
                      <button type="button" class="ceBtn ceBtnPrimary" id="btnPasoSiguienteInscripcion">Siguiente<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
                      <button type="submit" class="ceBtn ceBtnPrimary d-none" id="btnEnviarInscripcion">Enviar<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>
      `;
    }

    function cambiarPasoInscripcion(pasoActivo) {
      const form = document.getElementById('formInscripcionEvento');
      const stepper = document.querySelector('.epInscripcionStepper');
      if (!form) return;

      form.querySelectorAll('.epInscripcionPaso').forEach((paso) => {
        const pasoActual = Number.parseInt(paso.dataset.step || '1', 10);
        paso.classList.toggle('d-none', pasoActual !== pasoActivo);
      });

      stepper?.querySelectorAll('.ceStep').forEach((stepNode) => {
        const step = Number.parseInt(stepNode.dataset.step || '1', 10);
        const estaActivo = step <= pasoActivo;
        const esPasoActual = step === pasoActivo;

        stepNode.classList.toggle('ceStepActive', estaActivo);
        stepNode.classList.toggle('ceStepCurrent', esPasoActual);
        stepNode.setAttribute('aria-current', esPasoActual ? 'step' : 'false');
        const dot = stepNode.querySelector('.ceStepDot');
        dot?.classList.toggle('ceStepDotActive', esPasoActual);
      });

      const btnAnterior = document.getElementById('btnPasoAnteriorInscripcion');
      const btnSiguiente = document.getElementById('btnPasoSiguienteInscripcion');
      const btnEnviar = document.getElementById('btnEnviarInscripcion');

      btnAnterior?.classList.toggle('d-none', pasoActivo === 1);
      btnSiguiente?.classList.toggle('d-none', pasoActivo === 2);
      btnEnviar?.classList.toggle('d-none', pasoActivo !== 2);
    }

    function configurarNavegacionFormularioInscripcion(evento) {
      const form = document.getElementById('formInscripcionEvento');
      const stepper = document.querySelector('.epInscripcionStepper');
      const btnAnterior = document.getElementById('btnPasoAnteriorInscripcion');
      const btnSiguiente = document.getElementById('btnPasoSiguienteInscripcion');

      if (!form) return;

      let pasoActivo = 1;

      function validarPasoFormulario(numeroPaso) {
        const paso = form.querySelector(`.epInscripcionPaso[data-step="${numeroPaso}"]`);
        if (!paso) return true;

        const controles = paso.querySelectorAll('input, select, textarea');
        let esValido = true;

        controles.forEach((control) => {
          if (control.type === 'file') return;

          limpiarErrorCampo(control);

          if (control.type === 'radio') {
            const grupoRadio = paso.querySelectorAll(`input[type="radio"][name="${control.name}"]`);
            const seleccionado = paso.querySelector(`input[type="radio"][name="${control.name}"]:checked`);

            if (grupoRadio.length > 0 && !seleccionado) {
              esValido = false;
              mostrarErrorCampo(grupoRadio[0], 'Debe seleccionar una opción');
            }

            return;
          }

          if (!control.value.trim()) {
            if (control.hasAttribute('required') || control.name === 'nombreCompleto' || control.name === 'correoElectronico') {
              esValido = false;
              mostrarErrorCampo(control, 'Este campo es obligatorio');
            }
            return;
          }

          if (control.type === 'email' && !esEmailValido(control.value.trim())) {
            esValido = false;
            mostrarErrorCampo(control, 'Por favor ingrese un correo electrónico válido');
            return;
          }

          if (control.name === 'telefono') {
            const telefonoNormalizado = control.value.replace(/[\s\-()]/g, '');
            if (!/^\d{8,}$/.test(telefonoNormalizado)) {
              esValido = false;
              mostrarErrorCampo(control, 'Por favor ingrese un número de teléfono válido');
            }
          }

          if (!control.checkValidity()) {
            esValido = false;
            mostrarErrorCampo(control, 'Este campo es obligatorio');
            esValido = false;
          }
        });

        return esValido;
      }

      btnSiguiente?.addEventListener('click', () => {
        if (!validarPasoFormulario(1)) {
          return;
        }

        pasoActivo = 2;
        cambiarPasoInscripcion(pasoActivo);
      });

      btnAnterior?.addEventListener('click', () => {
        pasoActivo = 1;
        cambiarPasoInscripcion(pasoActivo);
      });

      stepper?.querySelectorAll('.ceStep[data-step]').forEach((botonPaso) => {
        botonPaso.addEventListener('click', () => {
          const step = Number.parseInt(botonPaso.dataset.step || '1', 10);

          if (step > 1 && !validarPasoFormulario(1)) {
            return;
          }

          pasoActivo = Number.isNaN(step) ? 1 : step;
          cambiarPasoInscripcion(pasoActivo);
        });
      });

      inicializarAdjuntosInscripcion(form);

      // Función para validar email
      function esEmailValido(email) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
      }

      // Función para mostrar error en un campo
      function mostrarErrorCampo(input, mensaje) {
        input.classList.add('is-invalid');
        let errorDiv = input.parentElement.querySelector('.invalid-feedback');
        if (!errorDiv) {
          errorDiv = document.createElement('div');
          errorDiv.className = 'invalid-feedback d-block';
          input.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
      }

      // Función para limpiar errores de un campo
      function limpiarErrorCampo(input) {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) {
          errorDiv.remove();
        }
      }

      // Función para validar el formulario completo
      function validarFormulario() {
        let esValido = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        const errores = [];

        // Limpiar errores previos
        inputs.forEach(input => {
          if (input.type !== 'file') {
            limpiarErrorCampo(input);
          }
        });

        // Validar campos requeridos (los que tienen atributo required)
        inputs.forEach(input => {
          if (input.type === 'file') return;

          const valor = input.value.trim();
          const esRequerido = input.hasAttribute('required') || input.name === 'nombreCompleto' || input.name === 'correoElectronico';

          if (esRequerido && !valor) {
            esValido = false;
            const labelText = form.querySelector(`label[for="${input.id}"]`)?.textContent || input.name;
            mostrarErrorCampo(input, `${labelText.replace('*', '').trim()} es obligatorio`);
            errores.push(`${input.name} es obligatorio`);
          }

          // Validar formato de email
          if (input.type === 'email' && valor && !esEmailValido(valor)) {
            esValido = false;
            mostrarErrorCampo(input, 'Por favor ingrese un correo electrónico válido');
            errores.push(`${input.name} tiene formato inválido`);
          }

          // Validar teléfono si está presente
          if (input.name === 'telefono' && valor) {
            if (!/^\d{8,}$/.test(valor.replace(/[\s\-()]/g, ''))) {
              esValido = false;
              mostrarErrorCampo(input, 'Por favor ingrese un número de teléfono válido');
              errores.push(`${input.name} tiene formato inválido`);
            }
          }
        });

        // Validar checkboxes y radio buttons si existen
        const checkboxAutoriza = form.querySelector('input[name="autorizaNotificaciones"]');
        if (checkboxAutoriza && !checkboxAutoriza.checked) {
          esValido = false;
          errores.push('Debe autorizar las notificaciones');
        }

        // Mostrar resumen de errores si los hay
        if (!esValido && errores.length > 0) {
          console.warn('Errores de validación:', errores);
        }

        return esValido;
      }

      form.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();

        // Validar formulario antes de enviar
        if (!validarFormulario()) {
          console.warn('El formulario tiene errores de validación');
          return;
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        
        // Agregar el ID del evento
        payload.eventoId = evento._id;

        try {
          const response = await fetch('/api/usuario-inscrito', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const resultado = await response.json();

          if (resultado.ok) {
            console.info('Inscripción guardada correctamente:', resultado);
            
            // Mostrar el modal de inscripción exitosa
            const modalElement = document.getElementById('modalInscripcionEvento');
            if (modalElement) {
              const modal = new window.bootstrap.Modal(modalElement);
              modal.show();

              // Restaurar el detalle después de que se cierre el modal
              modalElement.addEventListener('hidden.bs.modal', () => {
                restaurarDetalleDesdeActual();
              }, { once: true });
            }
          } else {
            alert(`Error: ${resultado.mensaje}`);
            console.error('Error al guardar inscripción:', resultado);
          }
        } catch (error) {
          console.error('Error en la solicitud:', error);
          alert('Ocurrió un error al enviar la inscripción. Por favor, intente nuevamente.');
        }
      });

      // Limpiar errores cuando el usuario comienza a escribir
      form.addEventListener('input', (event) => {
        const input = event.target;
        if (input.classList.contains('is-invalid')) {
          limpiarErrorCampo(input);
        }
      });

      form.addEventListener('change', (event) => {
        const input = event.target;
        if (input.classList.contains('is-invalid')) {
          limpiarErrorCampo(input);
        }
      });
    }

    function mostrarFormularioInscripcionEvento(evento) {
      if (!contenedorEventosCreados || !evento) return;

      contenedorEventosCreados.innerHTML = crearFormularioInscripcionEvento(evento);
      actualizarBreadcrumbInscripcion(evento.nombreEvento || 'Detalle del evento');
      configurarNavegacionFormularioInscripcion(evento);
    }

    function configurarAccionesInscripcionEvento(evento) {
      if (!contenedorEventosCreados || !evento) return;

      contenedorEventosCreados.querySelectorAll('.jsAbrirFormularioInscripcion').forEach((boton) => {
        boton.addEventListener('click', () => {
          mostrarFormularioInscripcionEvento(evento);
        });
      });
    }

    return {
      configurarAccionesInscripcionEvento,
    };
  }

  global.crearModuloFormInscripcionEvento = crearModuloFormInscripcionEvento;
}(window));
