function initSuscriptoresEditor() {
    const contentPanel = document.getElementById('gestionEditorContentPanel');
    const statusButtons = contentPanel?.querySelectorAll('.btnListasDifusionEdit[data-status]');
    const cardsContainer = contentPanel?.querySelector('#cardsSuscriptoresEditor');
    const filtroSelect = contentPanel?.querySelector('#gestionEventosFiltro');
    const busquedaInput = contentPanel?.querySelector('#gestionEventosBusqueda');
    const searchButton = contentPanel?.querySelector('.gestionEventosSearchBtn');
    const conteo = contentPanel?.querySelector('#suscriptoresEditorConteo');

    if (!statusButtons?.length || !cardsContainer) {
        return;
    }

    if (cardsContainer.dataset.suscriptoresInitialized === 'true') {
        return;
    }

    cardsContainer.dataset.suscriptoresInitialized = 'true';

    const escapeHtml = (text) => {
        if (text === null || text === undefined) {
            return '';
        }

        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const normalizarTexto = (value) => {
        return String(value || '')
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const suscriptoresByStatus = {
        edicion: [],
        pendiente: [],
        rechazado: [],
    };

    const suscriptoresState = {
        filtroSeleccionado: 'Nombre del Suscriptor',
        filtroTexto: '',
        statusActual: 'edicion',
        loading: false,
    };

    const backendStatusMap = {
        edicion: 'aprobado',
        pendiente: 'pendiente_aprobacion',
        rechazado: 'rechazado',
    };

    const statusLabelMap = {
        edicion: 'aprobados',
        pendiente: 'pendientes de aprobación',
        rechazado: 'rechazados',
    };

    const rechazoState = {
        suscriptorId: '',
        motivo: '',
    };

    const asignacionState = {
        suscriptorId: '',
    };

    const ensureModalesRechazoSuscriptor = () => {
        const modalRechazo = document.getElementById('modalRechazoSuscriptor');
        const modalConfirmacion = document.getElementById('modalConfirmacionRechazoSuscriptor');

        if (modalRechazo && modalConfirmacion) {
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="modalRechazoSuscriptor" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modalRechazoListaDifusionAncho">
                    <div class="modal-content modalRechazoListaDifusionContenido">
                        <div class="modal-body modalRechazoListaDifusionBody">
                            <p class="modalRechazoListaDifusionTitulo">Rechazo de Suscriptor</p>
                            <p class="modalRechazoListaDifusionDescripcion">
                                Para realizar el rechazo de un suscriptor, favor indicar el motivo por el cual fue rechazado en el recuadro siguiente. Este será enviado al solicitante de la suscripción.
                            </p>
                            <textarea id="modalRechazoSuscriptorMotivoInput" class="form-control modalRechazoListaDifusionCajaMotivo" maxlength="300" placeholder="introduzca el motivo del rechazo"></textarea>
                            <div class="modalRechazoListaDifusionAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                <button type="button" class="btn modalRechazoListaDifusionBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn modalRechazoListaDifusionBtnAceptar px-4" id="modalRechazoSuscriptorContinuarBtn">Continuar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="modalConfirmacionRechazoSuscriptor" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                    <div class="modal-content modalEliminarEventoContenido">
                        <div class="modal-body modalEliminarEventoBody">
                            <p class="modalEliminarEventoTitulo">¿Rechazar?</p>
                            <p class="modalEliminarEventoDescripcion">
                                Al rechazar un usuario este no puede ser agregado a una lista de difusión, ¿está seguro que desea continuar con este proceso?
                            </p>
                            <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn modalEliminarEventoBtnEliminar px-4" id="modalConfirmacionRechazoSuscriptorBtn">Rechazar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    const abrirFlujoRechazoSuscriptor = (suscriptorId) => {
        ensureModalesRechazoSuscriptor();

        const modalRechazoEl = document.getElementById('modalRechazoSuscriptor');
        const motivoInput = document.getElementById('modalRechazoSuscriptorMotivoInput');

        if (!modalRechazoEl || !motivoInput) {
            return;
        }

        rechazoState.suscriptorId = suscriptorId;
        rechazoState.motivo = '';
        motivoInput.value = '';

        const modalRechazoInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalRechazoEl);
        modalRechazoInstance?.show();
    };

    const initFlujoRechazoSuscriptor = () => {
        ensureModalesRechazoSuscriptor();

        const modalRechazoEl = document.getElementById('modalRechazoSuscriptor');
        const modalConfirmacionEl = document.getElementById('modalConfirmacionRechazoSuscriptor');
        const continuarBtn = document.getElementById('modalRechazoSuscriptorContinuarBtn');
        const confirmarBtn = document.getElementById('modalConfirmacionRechazoSuscriptorBtn');
        const motivoInput = document.getElementById('modalRechazoSuscriptorMotivoInput');

        if (!modalRechazoEl || !modalConfirmacionEl || !continuarBtn || !confirmarBtn || !motivoInput) {
            return;
        }

        if (modalRechazoEl.dataset.rechazoSuscriptorBound === 'true') {
            return;
        }

        const modalRechazoInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalRechazoEl);
        const modalConfirmacionInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalConfirmacionEl);

        continuarBtn.addEventListener('click', () => {
            const motivoNormalizado = String(motivoInput.value || '').trim();

            if (!motivoNormalizado) {
                globalThis.alert('Debe ingresar un motivo para rechazar al suscriptor.');
                return;
            }

            rechazoState.motivo = motivoNormalizado;

            const onHidden = () => {
                modalRechazoEl.removeEventListener('hidden.bs.modal', onHidden);
                modalConfirmacionInstance?.show();
            };

            modalRechazoEl.addEventListener('hidden.bs.modal', onHidden);
            modalRechazoInstance?.hide();
        });

        confirmarBtn.addEventListener('click', async () => {
            if (!rechazoState.suscriptorId || !rechazoState.motivo) {
                globalThis.alert('No se encontró la información de rechazo del suscriptor.');
                return;
            }

            confirmarBtn.disabled = true;

            try {
                await actualizarEstadoSuscriptor(rechazoState.suscriptorId, 'rechazado', rechazoState.motivo);
                modalConfirmacionInstance?.hide();
                rechazoState.suscriptorId = '';
                rechazoState.motivo = '';
                await cargarSuscriptoresPorEstado();
            } catch (error) {
                globalThis.alert(error.message || 'No se pudo actualizar el estado del suscriptor.');
            } finally {
                confirmarBtn.disabled = false;
            }
        });

        modalConfirmacionEl.addEventListener('hidden.bs.modal', () => {
            rechazoState.suscriptorId = '';
            rechazoState.motivo = '';
        });

        modalRechazoEl.dataset.rechazoSuscriptorBound = 'true';
    };

    const ensureModalAsignarListaSuscriptor = () => {
        const modalAsignar = document.getElementById('modalAsignarListaSuscriptor');
        const modalExito = document.getElementById('modalListaDifusionAsignada');

        if (modalAsignar && modalExito) {
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="modalAsignarListaSuscriptor" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modalAsignarListaSuscriptorAncho">
                    <div class="modal-content modalAsignarListaSuscriptorContenido">
                        <div class="modal-body modalAsignarListaSuscriptorBody">
                            <p class="modalAsignarListaSuscriptorTitulo">Asignar lista al suscriptor</p>
                            <p class="modalAsignarListaSuscriptorDescripcion">
                                Usted desea agregar a este suscriptor a las listas de difusión de la sección de noticias, favor seleccione una o varias de las listas que considere sean de interés para este usuario.
                            </p>

                            <form class="modalAsignarListaSuscriptorFormulario" action="#">
                                <select id="modalAsignarListaSuscriptorSelect" class="form-select modalAsignarListaSuscriptorSelect" aria-label="Seleccionar listas de difusión">
                                    <option value="">seleccione el/los datos necesarios</option>
                                </select>

                                <div class="modalAsignarListaSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-5">
                                    <button type="button" class="btn modalAsignarListaSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="button" class="btn modalAsignarListaSuscriptorBtnAceptar px-4" id="modalAsignarListaSuscriptorAceptarBtn">Aceptar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="modalListaDifusionAsignada" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                    <div class="modal-content modalSuscripcionEnviadaContenido">
                        <div class="modal-body modalSuscripcionEnviadaBody">
                            <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <p class="modalSuscripcionEnviadaTitulo">Listas de Difusión Asignada</p>
                            <p class="modalSuscripcionEnviadaDescripcion">
                                Se asignaron con éxito las listas seleccionadas al usuario. Para modificar o eliminar este usuario puede revisarlo en la sección del menú principal en <span class="modalSuscripcionEnviadaDescripcionNegrita">Usuarios Suscritos.</span>
                            </p>
                            <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    const cargarListasDifusionAprobadas = async () => {
        const response = await fetch('/api/lista-difusion?estado=aprobada');

        if (!response.ok) {
            throw new Error('No se pudieron cargar las listas de difusión aprobadas.');
        }

        const body = await response.json().catch(() => ({}));
        return Array.isArray(body?.listas) ? body.listas : [];
    };

    const abrirModalAsignarLista = async (suscriptorId) => {
        ensureModalAsignarListaSuscriptor();

        const modalEl = document.getElementById('modalAsignarListaSuscriptor');
        const selectEl = document.getElementById('modalAsignarListaSuscriptorSelect');

        if (!modalEl || !selectEl) {
            return;
        }

        const modalInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalEl);
        asignacionState.suscriptorId = suscriptorId;

        selectEl.innerHTML = '<option value="">cargando listas aprobadas...</option>';
        modalInstance?.show();

        try {
            const listasAprobadas = await cargarListasDifusionAprobadas();

            if (!listasAprobadas.length) {
                selectEl.innerHTML = '<option value="">No hay listas de difusión aprobadas disponibles</option>';
                return;
            }

            const opciones = ['<option value="">seleccione el/los datos necesarios</option>']
                .concat(listasAprobadas.map((lista) => `<option value="${escapeHtml(lista._id)}">${escapeHtml(lista.nombreLista || 'Lista sin nombre')}</option>`));
            selectEl.innerHTML = opciones.join('');
        } catch (error) {
            selectEl.innerHTML = '<option value="">No se pudieron cargar las listas</option>';
            globalThis.alert(error.message || 'No se pudieron cargar las listas de difusión.');
        }
    };

    const asignarListaSuscriptor = async (suscriptorId, listaId) => {
        const response = await fetch(`/api/suscriptores/${encodeURIComponent(suscriptorId)}/listas-difusion`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listaIds: [listaId] }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.mensaje || 'No se pudo asignar la lista al suscriptor.');
        }
    };

    const eliminarSuscriptor = async (suscriptorId) => {
        const response = await fetch(`/api/suscriptores/${encodeURIComponent(suscriptorId)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.mensaje || 'No se pudo eliminar el suscriptor.');
        }
    };

    const initFlujoAsignarListaSuscriptor = () => {
        ensureModalAsignarListaSuscriptor();

        const modalAsignarEl = document.getElementById('modalAsignarListaSuscriptor');
        const modalExitoEl = document.getElementById('modalListaDifusionAsignada');
        const selectEl = document.getElementById('modalAsignarListaSuscriptorSelect');
        const aceptarBtn = document.getElementById('modalAsignarListaSuscriptorAceptarBtn');

        if (!modalAsignarEl || !modalExitoEl || !selectEl || !aceptarBtn) {
            return;
        }

        if (modalAsignarEl.dataset.asignarListaBound === 'true') {
            return;
        }

        const modalAsignarInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalAsignarEl);
        const modalExitoInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalExitoEl);

        aceptarBtn.addEventListener('click', async () => {
            const listaIdSeleccionada = String(selectEl.value || '').trim();

            if (!listaIdSeleccionada) {
                globalThis.alert('Debe seleccionar una lista de difusión para continuar.');
                return;
            }

            if (!asignacionState.suscriptorId) {
                globalThis.alert('No se encontró el suscriptor a actualizar.');
                return;
            }

            aceptarBtn.disabled = true;

            try {
                await asignarListaSuscriptor(asignacionState.suscriptorId, listaIdSeleccionada);

                const onHidden = () => {
                    modalAsignarEl.removeEventListener('hidden.bs.modal', onHidden);
                    modalExitoInstance?.show();
                };

                modalAsignarEl.addEventListener('hidden.bs.modal', onHidden);
                modalAsignarInstance?.hide();
                await cargarSuscriptoresPorEstado();
            } catch (error) {
                globalThis.alert(error.message || 'No se pudo asignar la lista de difusión.');
            } finally {
                aceptarBtn.disabled = false;
            }
        });

        modalAsignarEl.addEventListener('hidden.bs.modal', () => {
            asignacionState.suscriptorId = '';
            selectEl.value = '';
        });

        modalAsignarEl.dataset.asignarListaBound = 'true';
    };

    const formatearFecha = (isoDate) => {
        if (!isoDate) {
            return 'No disponible';
        }

        const fecha = new Date(isoDate);
        if (Number.isNaN(fecha.getTime())) {
            return 'No disponible';
        }

        return fecha.toLocaleDateString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const obtenerBadgePorEstado = (statusKey) => {
        if (statusKey === 'pendiente') {
            return 'pendiente';
        }

        if (statusKey === 'rechazado') {
            return 'rechazado';
        }

        return 'aprobado';
    };

    const adaptarSuscriptor = (suscriptor) => ({
        id: suscriptor?._id || '',
        nombre: suscriptor?.nombreCompleto || 'Nombre no disponible',
        oficio: suscriptor?.profesionOficio || 'No disponible',
        lista: suscriptor?.entidadVinculada || 'No disponible',
        listasDifusion: Array.isArray(suscriptor?.listasDifusion) ? suscriptor.listasDifusion : [],
        correo: suscriptor?.correoElectronico || 'No disponible',
        razon: suscriptor?.razonNotificacion || 'No disponible',
        fecha: formatearFecha(suscriptor?.createdAt),
        motivo: suscriptor?.motivoRechazo || '',
    });

    const actualizarEstadoSuscriptor = async (suscriptorId, nuevoEstado, motivoRechazo = '') => {
        const payload = { estado: nuevoEstado };

        if (nuevoEstado === 'rechazado') {
            payload.motivoRechazo = motivoRechazo;
        }

        const response = await fetch(`/api/suscriptores/${encodeURIComponent(suscriptorId)}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.mensaje || 'No se pudo actualizar el estado del suscriptor.');
        }

        return response.json().catch(() => ({}));
    };

    const renderEstadoDeCarga = () => {
        const etiqueta = statusLabelMap[suscriptoresState.statusActual] || 'suscriptores';
        cardsContainer.innerHTML = `
            <div class="row mt-3">
                <div class="col-12">
                    <p class="text-muted mb-0">Cargando ${escapeHtml(etiqueta)}...</p>
                </div>
            </div>
        `;

        if (conteo) {
            conteo.textContent = 'Cargando...';
        }
    };

    const renderEstadoDeError = () => {
        cardsContainer.innerHTML = `
            <div class="row mt-3">
                <div class="col-12">
                    <p class="text-danger mb-0">No se pudieron cargar los suscriptores. Intente nuevamente.</p>
                </div>
            </div>
        `;

        if (conteo) {
            conteo.textContent = '0 suscriptores';
        }
    };

    const cargarSuscriptoresPorEstado = async () => {
        const statusKey = suscriptoresState.statusActual;
        const backendStatus = backendStatusMap[statusKey] || 'aprobado';

        suscriptoresState.loading = true;
        renderEstadoDeCarga();

        try {
            const response = await fetch(`/api/suscriptores?estado=${encodeURIComponent(backendStatus)}`);

            if (!response.ok) {
                throw new Error('No se pudieron obtener suscriptores');
            }

            const body = await response.json();
            const suscriptores = Array.isArray(body?.suscriptores) ? body.suscriptores : [];
            suscriptoresByStatus[statusKey] = suscriptores.map(adaptarSuscriptor);
            renderSuscriptores();
        } catch (error) {
            suscriptoresByStatus[statusKey] = [];
            renderEstadoDeError();
        } finally {
            suscriptoresState.loading = false;
        }
    };

    const getSuscriptorFilterValue = (suscriptor, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Oficio') {
            return suscriptor.oficio || '';
        }

        if (filtroSeleccionado === 'Lista de difusión') {
            return suscriptor.lista || '';
        }

        return suscriptor.nombre || '';
    };

    const renderSuscriptores = () => {
        const listaBase = Array.isArray(suscriptoresByStatus[suscriptoresState.statusActual])
            ? [...suscriptoresByStatus[suscriptoresState.statusActual]]
            : [];
        const terminoBusqueda = normalizarTexto(suscriptoresState.filtroTexto);
        const filtroSeleccionado = suscriptoresState.filtroSeleccionado || 'Nombre del Suscriptor';

        const resultados = !terminoBusqueda
            ? listaBase
            : listaBase.filter((suscriptor) => {
                const valorFiltro = normalizarTexto(getSuscriptorFilterValue(suscriptor, filtroSeleccionado));
                return valorFiltro.includes(terminoBusqueda);
            });

        if (conteo) {
            if (terminoBusqueda) {
                conteo.textContent = `${resultados.length} coincidencia(s) de ${listaBase.length} ${statusLabelMap[suscriptoresState.statusActual] || 'suscriptores'}`;
            } else {
                conteo.textContent = `${resultados.length} ${statusLabelMap[suscriptoresState.statusActual] || 'suscriptores'}`;
            }
        }

        if (!resultados.length) {
            cardsContainer.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-muted mb-0">No hay ${escapeHtml(statusLabelMap[suscriptoresState.statusActual] || 'suscriptores')} para mostrar.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (suscriptoresState.statusActual === 'pendiente') {
            cardsContainer.innerHTML = resultados.map((suscriptor) => {
                return `
                    <div class="container-fluid py-3">
                        <article class="suscriptoresPendientesAprobacionCard" aria-label="Solicitud de suscriptor">
                            <header class="suscriptoresPendientesAprobacionHeader">
                                <p class="suscriptoresPendientesAprobacionNombre">${escapeHtml(suscriptor.nombre || 'Nombre no disponible')}</p>
                                <p class="suscriptoresPendientesAprobacionFecha">Fecha de solicitud: ${escapeHtml(suscriptor.fecha || 'No disponible')}</p>
                            </header>

                            <div class="suscriptoresPendientesAprobacionTabla" role="table" aria-label="Datos del suscriptor">
                                <div class="suscriptoresPendientesAprobacionFila" role="row">
                                    <p class="suscriptoresPendientesAprobacionEtiqueta" role="cell">Correo Electrónico:</p>
                                    <p class="suscriptoresPendientesAprobacionValor" role="cell">${escapeHtml(suscriptor.correo || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresPendientesAprobacionFila" role="row">
                                    <p class="suscriptoresPendientesAprobacionEtiqueta" role="cell">Profesión u Oficio:</p>
                                    <p class="suscriptoresPendientesAprobacionValor" role="cell">${escapeHtml(suscriptor.oficio || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresPendientesAprobacionFila" role="row">
                                    <p class="suscriptoresPendientesAprobacionEtiqueta" role="cell">Entidad para la que trabaja o está vinculado:</p>
                                    <p class="suscriptoresPendientesAprobacionValor" role="cell">${escapeHtml(suscriptor.lista || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresPendientesAprobacionFila" role="row">
                                    <p class="suscriptoresPendientesAprobacionEtiqueta" role="cell">Razón por la que desea ser notificado:</p>
                                    <p class="suscriptoresPendientesAprobacionValor" role="cell">${escapeHtml(suscriptor.razon || 'No disponible')}</p>
                                </div>
                            </div>

                            <div class="suscriptoresPendientesAprobacionAcciones" aria-label="Aprobar o rechazar suscriptor">
                                <button class="btn suscriptoresPendientesAprobacionBtn" type="button" data-action="rechazar" data-suscriptor-id="${escapeHtml(suscriptor.id)}" aria-label="Rechazar suscriptor">
                                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                                </button>
                                <button class="btn suscriptoresPendientesAprobacionBtn" type="button" data-action="aprobar" data-suscriptor-id="${escapeHtml(suscriptor.id)}" aria-label="Aprobar suscriptor">
                                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                                </button>
                            </div>
                        </article>
                    </div>
                `;
            }).join('');

            return;
        }

        if (suscriptoresState.statusActual === 'edicion') {
            cardsContainer.innerHTML = resultados.map((suscriptor) => {
                const listasDifusionTexto = Array.isArray(suscriptor.listasDifusion) && suscriptor.listasDifusion.length
                    ? suscriptor.listasDifusion.map((item) => escapeHtml(item)).join(', ')
                    : 'No disponibles';

                return `
                    <div class="row border-bottom border-1 border-secondary-subtle ">
                        <div class="col-12">
                            <div class="eventoCardPublicada d-flex justify-content-between p-3" aria-label="Evento publicado">
                                <div class="eventoCardPublicadaHeader ms-5">
                                    <p class="eventoCardPublicadaTitulo fw-bold">${escapeHtml(suscriptor.nombre || 'Nombre no disponible')}</p>
                                    <p class="eventoCardPublicadaMeta"><span>Profesión u oficio:</span> ${escapeHtml(suscriptor.oficio || 'No disponible')}</p>
                                    <p class="eventoCardPublicadaMeta"><span>Entidad a la que pertenece:</span> ${escapeHtml(suscriptor.lista || 'No disponible')}</p>
                                    <p class="eventoCardPublicadaMeta"><span>Listas de difusión:</span> ${listasDifusionTexto}</p>
                                </div>

                                <div class="eventoCardPublicadaAcciones mt-3" aria-label="Acciones del evento publicado">
                                    <button class="btn eventoCardBtnIcon" type="button" data-action="editar" data-suscriptor-id="${escapeHtml(suscriptor.id)}" aria-label="Editar suscriptor">
                                        <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn eventoCardBtnIcon" type="button" data-action="eliminar" data-suscriptor-id="${escapeHtml(suscriptor.id)}" aria-label="Eliminar suscriptor">
                                        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return;
        }

        if (suscriptoresState.statusActual === 'rechazado') {
            cardsContainer.innerHTML = resultados.map((suscriptor) => {
                return `
                    <div class="container-fluid py-3">
                        <article class="suscriptoresRechazadosCard" aria-label="Solicitud de suscriptor">
                            <header class="suscriptoresRechazadosHeader">
                                <p class="suscriptoresRechazadosNombre">${escapeHtml(suscriptor.nombre || 'Nombre no disponible')}</p>
                                <p class="suscriptoresRechazadosFecha">Fecha de solicitud: ${escapeHtml(suscriptor.fecha || 'No disponible')}</p>
                            </header>

                            <div class="suscriptoresRechazadosTabla" role="table" aria-label="Datos del suscriptor">
                                <div class="suscriptoresRechazadosFila" role="row">
                                    <p class="suscriptoresRechazadosEtiqueta" role="cell">Correo Electrónico:</p>
                                    <p class="suscriptoresRechazadosValor" role="cell">${escapeHtml(suscriptor.correo || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresRechazadosFila" role="row">
                                    <p class="suscriptoresRechazadosEtiqueta" role="cell">Profesión u Oficio:</p>
                                    <p class="suscriptoresRechazadosValor" role="cell">${escapeHtml(suscriptor.oficio || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresRechazadosFila" role="row">
                                    <p class="suscriptoresRechazadosEtiqueta" role="cell">Entidad para la que trabaja o está vinculado:</p>
                                    <p class="suscriptoresRechazadosValor" role="cell">${escapeHtml(suscriptor.lista || 'No disponible')}</p>
                                </div>

                                <div class="suscriptoresRechazadosFila" role="row">
                                    <p class="suscriptoresRechazadosEtiqueta" role="cell">Razón por la que desea ser notificado:</p>
                                    <p class="suscriptoresRechazadosValor" role="cell">${escapeHtml(suscriptor.razon || 'No disponible')}</p>
                                </div>
                            </div>
                        </article>
                    </div>
                `;
            }).join('');

            return;
        }

        cardsContainer.innerHTML = resultados.map((suscriptor) => {
            const motivoRechazo = suscriptoresState.statusActual === 'rechazado'
                ? `<p class="eventoCardPublicadaMeta mb-1"><span>Motivo de rechazo:</span> ${escapeHtml(suscriptor.motivo || 'No disponible')}</p>`
                : '';

            return `
                <div class="row border-bottom border-1 border-secondary-subtle py-3">
                    <div class="col-12">
                        <div class="eventoCardPublicada d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 p-3" aria-label="Suscriptor">
                            <div class="eventoCardPublicadaHeader ms-lg-5">
                                <p class="eventoCardPublicadaTitulo fw-bold mb-1">${escapeHtml(suscriptor.nombre || 'Nombre no disponible')}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Oficio:</span> ${escapeHtml(suscriptor.oficio || 'No disponible')}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Lista de difusión:</span> ${escapeHtml(suscriptor.lista || 'No disponible')}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Correo electrónico:</span> ${escapeHtml(suscriptor.correo || 'No disponible')}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Fecha de registro:</span> ${escapeHtml(suscriptor.fecha || 'No disponible')}</p>
                                ${motivoRechazo}
                            </div>

                            <div class="eventoCardPublicadaAcciones d-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0" aria-label="Acciones del suscriptor">
                                <span class="badge text-bg-secondary text-uppercase">${escapeHtml(obtenerBadgePorEstado(suscriptoresState.statusActual))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const setActiveButton = (button) => {
        statusButtons.forEach((statusButton) => {
            statusButton.classList.remove('is-active');
        });

        button.classList.add('is-active');
    };

    if (filtroSelect) {
        filtroSelect.value = suscriptoresState.filtroSeleccionado;

        if (filtroSelect.dataset.suscriptoresBound !== 'true') {
            filtroSelect.addEventListener('change', () => {
                suscriptoresState.filtroSeleccionado = filtroSelect.value || 'Nombre del Suscriptor';
                renderSuscriptores();
            });

            filtroSelect.dataset.suscriptoresBound = 'true';
        }
    }

    if (busquedaInput) {
        busquedaInput.value = suscriptoresState.filtroTexto;

        if (busquedaInput.dataset.suscriptoresBound !== 'true') {
            busquedaInput.addEventListener('input', () => {
                suscriptoresState.filtroTexto = busquedaInput.value || '';
                renderSuscriptores();
            });

            busquedaInput.dataset.suscriptoresBound = 'true';
        }
    }

    if (searchButton && searchButton.dataset.suscriptoresBound !== 'true') {
        searchButton.addEventListener('click', () => {
            suscriptoresState.filtroTexto = busquedaInput?.value || '';
            renderSuscriptores();
        });

        searchButton.dataset.suscriptoresBound = 'true';
    }

    statusButtons.forEach((button) => {
        if (button.dataset.suscriptoresBound === 'true') {
            return;
        }

        button.addEventListener('click', () => {
            suscriptoresState.statusActual = button.dataset.status || 'edicion';
            setActiveButton(button);
            cargarSuscriptoresPorEstado();
        });

        button.dataset.suscriptoresBound = 'true';
    });

    if (cardsContainer.dataset.suscriptoresActionsBound !== 'true') {
        cardsContainer.addEventListener('click', async (event) => {
            const actionButton = event.target.closest('button[data-action][data-suscriptor-id]');

            if (!actionButton) {
                return;
            }

            const action = actionButton.dataset.action;
            const suscriptorId = actionButton.dataset.suscriptorId;

            if (!suscriptorId) {
                return;
            }

            try {
                if (action === 'aprobar') {
                    actionButton.disabled = true;
                    await actualizarEstadoSuscriptor(suscriptorId, 'aprobado');
                } else if (action === 'rechazar') {
                    abrirFlujoRechazoSuscriptor(suscriptorId);
                    return;
                } else if (action === 'editar') {
                    abrirModalAsignarLista(suscriptorId);
                    return;
                } else if (action === 'eliminar') {
                    const confirmar = globalThis.confirm('¿Desea eliminar este suscriptor permanentemente?');

                    if (!confirmar) {
                        return;
                    }

                    actionButton.disabled = true;
                    await eliminarSuscriptor(suscriptorId);
                } else {
                    actionButton.disabled = false;
                    return;
                }

                await cargarSuscriptoresPorEstado();
            } catch (error) {
                globalThis.alert(error.message || 'No se pudo actualizar el estado del suscriptor.');
                actionButton.disabled = false;
            }
        });

        cardsContainer.dataset.suscriptoresActionsBound = 'true';
    }

    initFlujoRechazoSuscriptor();
    initFlujoAsignarListaSuscriptor();

    const initialButton = contentPanel.querySelector('.btnListasDifusionEdit.is-active[data-status]') || statusButtons[0];

    if (!initialButton) {
        return;
    }

    suscriptoresState.statusActual = initialButton.dataset.status || 'edicion';
    setActiveButton(initialButton);
    cargarSuscriptoresPorEstado();
}

globalThis.initSuscriptoresEditor = initSuscriptoresEditor;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuscriptoresEditor);
} else {
    initSuscriptoresEditor();
}
