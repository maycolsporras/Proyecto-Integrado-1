(function initEventosPendientesAprobacionModule() {
    let pendingDeleteEventId = null;
    let pendingRejectEventId = null;
    let pendingApproveEventId = null;
    let allPendingEvents = [];
    let pendingFilterText = '';

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

    const parseFecha = (fecha) => {
        if (!fecha || typeof fecha !== 'object') {
            return null;
        }

        const anio = Number.parseInt(fecha.anio, 10);
        const mes = Number.parseInt(fecha.mes, 10);
        const dia = Number.parseInt(fecha.dia, 10);

        if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
            const parsedFromParts = new Date(anio, mes - 1, dia);
            if (!Number.isNaN(parsedFromParts.getTime())) {
                return parsedFromParts;
            }
        }

        if (fecha.iso) {
            const parsedFromIso = new Date(fecha.iso);
            if (!Number.isNaN(parsedFromIso.getTime())) {
                return parsedFromIso;
            }
        }

        return null;
    };

    const formatFecha = (fecha) => {
        const parsedDate = parseFecha(fecha);

        if (!parsedDate) {
            return 'Sin fecha';
        }

        return parsedDate.toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getFechaEventoPrincipal = (evento) => {
        const fechasEvento = Array.isArray(evento?.fechasEvento) ? evento.fechasEvento : [];
        const fechasValidas = fechasEvento
            .map((fecha) => parseFecha(fecha))
            .filter(Boolean)
            .sort((a, b) => a - b);

        if (fechasValidas.length > 0) {
            return fechasValidas[0];
        }

        return parseFecha(evento?.fechaFinVisualizacion) || parseFecha(evento?.fechaPublicacion);
    };

    const formatFechaFromDate = (dateValue) => {
        if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
            return 'Sin fecha';
        }

        return dateValue.toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const normalizarTexto = (value) => {
        return String(value || '')
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const getPendingFilterValue = (evento, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            return formatFechaFromDate(getFechaEventoPrincipal(evento));
        }

        if (filtroSeleccionado === 'Nombre del Editor') {
            return evento?.contacto?.nombreCompleto || '';
        }

        return evento?.nombreEvento || '';
    };

    const comparePendingByFilter = (a, b, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            const dateA = getFechaEventoPrincipal(a);
            const dateB = getFechaEventoPrincipal(b);
            const timeA = dateA instanceof Date && !Number.isNaN(dateA.getTime()) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
            const timeB = dateB instanceof Date && !Number.isNaN(dateB.getTime()) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
            return timeA - timeB;
        }

        const valueA = normalizarTexto(getPendingFilterValue(a, filtroSeleccionado));
        const valueB = normalizarTexto(getPendingFilterValue(b, filtroSeleccionado));
        return valueA.localeCompare(valueB, 'es', { sensitivity: 'base' });
    };

    const applyPendingFilters = (eventos = []) => {
        const filtroSelect = document.getElementById('gestionEventosFiltro');
        const filtroSeleccionado = filtroSelect?.value || 'Título del Evento';
        const termino = normalizarTexto(pendingFilterText);
        const baseOrdenada = [...eventos].sort((a, b) => comparePendingByFilter(a, b, filtroSeleccionado));

        if (!termino) {
            return {
                ordered: baseOrdenada,
                matches: baseOrdenada.length,
                total: baseOrdenada.length,
            };
        }

        const matches = [];
        const restantes = [];

        baseOrdenada.forEach((evento) => {
            const valor = normalizarTexto(getPendingFilterValue(evento, filtroSeleccionado));
            if (valor.includes(termino)) {
                matches.push(evento);
            } else {
                restantes.push(evento);
            }
        });

        return {
            ordered: [...matches, ...restantes],
            matches: matches.length,
            total: eventos.length,
        };
    };

    const applyCurrentPendingFilters = () => {
        const filteredResult = applyPendingFilters(allPendingEvents);
        renderAprobacionEventosCards(filteredResult.ordered, filteredResult);
    };

    const renderAprobacionEventosCards = (eventos = [], filterStats = null) => {
        const container = document.getElementById('aprobacionEventosAdmin');
        const conteo = document.getElementById('aprobacionEventosConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            if (filterStats && pendingFilterText.trim()) {
                conteo.textContent = `${filterStats.matches} coincidencia(s) de ${filterStats.total} pendientes`;
            } else {
                conteo.textContent = `${eventos.length} pendientes`;
            }
        }

        if (!eventos.length) {
            container.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-muted">No hay eventos pendientes de aprobación.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = eventos.map((evento) => {
            const fechaEventoPrincipal = getFechaEventoPrincipal(evento);
            const nombreEvento = escapeHtml(evento?.nombreEvento || 'Sin título');
            const autor = escapeHtml(evento?.contacto?.nombreCompleto || 'Sin autor');
            const fechaEvento = formatFechaFromDate(fechaEventoPrincipal);
            const fechaPublicacion = formatFecha(evento?.fechaPublicacion);
            const eventId = escapeHtml(evento?._id || '');

            return `
                <div class="row mt-3" data-evento-id="${eventId}">
                    <div class="col-12 eventosPendientesAprobacion">
                        <article class="eventoCardAprobacion" aria-label="Evento pendiente de aprobación">
                            <div class="eventoCardAprobacionHeader">
                                <p class="eventoCardTitulo">${nombreEvento}</p>
                                <p class="eventoCardMeta"><span>Fecha del evento:</span> ${fechaEvento}</p>
                            </div>

                            <div class="eventoCardAprobacionBody row g-2 align-items-end">
                                <div class="eventoCardInfo col-12 col-sm">
                                    <p class="eventoCardMeta"><span>Autor:</span> ${autor}</p>
                                    <p class="eventoCardMeta"><span>Fecha para publicación:</span> ${fechaPublicacion}</p>
                                </div>

                                <div class="eventoCardAcciones col-12 col-sm-auto d-flex justify-content-sm-end" aria-label="Acciones del evento">
                                    <button class="btn eventoCardBtnIcon" type="button" aria-label="Ver evento" data-accion="ver" data-evento-id="${eventId}">
                                        <i class="fa-regular fa-eye" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn eventoCardBtnIcon" type="button" aria-label="Editar evento" data-accion="editar" data-evento-id="${eventId}">
                                        <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn eventoCardBtnIcon" type="button" aria-label="Eliminar evento" data-accion="eliminar" data-evento-id="${eventId}">
                                        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                    <div class="col-12">
                        <div class="eventoCardDecision" aria-label="Aprobar o rechazar evento">
                            <button class="btn eventoCardDecisionBtn eventoCardDecisionBtnReject" type="button" aria-label="Rechazar evento" data-estado="rechazado" data-evento-id="${eventId}">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                            <button class="btn eventoCardDecisionBtn eventoCardDecisionBtnApprove" type="button" aria-label="Aprobar evento" data-estado="aprobado" data-evento-id="${eventId}">
                                <i class="fa-solid fa-check" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const bindPendingFilterControls = () => {
        const filtroSelect = document.getElementById('gestionEventosFiltro');
        const busquedaInput = document.getElementById('gestionEventosBusqueda');
        const buscarBtn = document.querySelector('.gestionEventosSearchBtn');
        const limpiarBtn = document.getElementById('aprobacionEventosLimpiarFiltro');

        if (!filtroSelect || !busquedaInput) {
            return;
        }

        if (filtroSelect.dataset.pendingFiltersBound === 'true') {
            return;
        }

        const ejecutarBusqueda = () => {
            pendingFilterText = busquedaInput.value || '';
            applyCurrentPendingFilters();
        };

        buscarBtn?.addEventListener('click', ejecutarBusqueda);

        busquedaInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                ejecutarBusqueda();
            }
        });

        busquedaInput.addEventListener('input', () => {
            pendingFilterText = busquedaInput.value || '';
            applyCurrentPendingFilters();
        });

        filtroSelect.addEventListener('change', () => {
            applyCurrentPendingFilters();
        });

        limpiarBtn?.addEventListener('click', () => {
            pendingFilterText = '';
            busquedaInput.value = '';
            filtroSelect.selectedIndex = 0;
            applyCurrentPendingFilters();
        });

        filtroSelect.dataset.pendingFiltersBound = 'true';
    };

    const actualizarEstadoEvento = async (eventoId, estado, motivoRechazo = '') => {
        const payload = { estado };

        if (estado === 'rechazado') {
            payload.motivoRechazo = motivoRechazo;
        }

        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('No se pudo actualizar el estado del evento.');
        }
    };

    const eliminarEvento = async (eventoId) => {
        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('No se pudo eliminar el evento.');
        }
    };

    const getModalInstanceById = (modalId) => {
        const modalElement = document.getElementById(modalId);

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return null;
        }

        return globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);
    };

    const getDeleteModalInstance = () => {
        return getModalInstanceById('modalEliminarEvento');
    };

    const openDeleteModal = (eventoId) => {
        const modalInstance = getDeleteModalInstance();
        if (!modalInstance) {
            return;
        }

        pendingDeleteEventId = eventoId;
        modalInstance.show();
    };

    const bindDeleteModalActions = () => {
        const modalElement = document.getElementById('modalEliminarEvento');
        if (!modalElement || modalElement.dataset.deleteBound === 'true') {
            return;
        }

        const confirmButton = modalElement.querySelector('.modalEliminarEventoBtnEliminar');

        confirmButton?.addEventListener('click', async () => {
            if (!pendingDeleteEventId) {
                return;
            }

            confirmButton.disabled = true;

            try {
                await eliminarEvento(pendingDeleteEventId);
                pendingDeleteEventId = null;
                const modalInstance = getDeleteModalInstance();
                modalInstance?.hide();
                await loadAprobacionEventosAdmin();
            } catch (error) {
                console.error(error);
            } finally {
                confirmButton.disabled = false;
            }
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            pendingDeleteEventId = null;
        });

        modalElement.dataset.deleteBound = 'true';
    };

    const bindRechazoEventoModalActions = () => {
        const modalRechazar = document.getElementById('modalRechazarEvento');
        const modalMotivo = document.getElementById('modalRechazoEvento');

        if (!modalRechazar || !modalMotivo || modalRechazar.dataset.rejectBound === 'true') {
            return;
        }

        const confirmarRechazoBtn = modalRechazar.querySelector('.modalRechazarEventoBtnConfirmar');
        const aceptarMotivoBtn = modalMotivo.querySelector('.modalRechazoEventoBtnAceptar');
        const motivoTextarea = modalMotivo.querySelector('#modalRechazoEventoTextarea');
        const contador = modalMotivo.querySelector('#modalRechazoEventoContador');

        const limpiarMotivo = () => {
            if (motivoTextarea) {
                motivoTextarea.value = '';
            }

            if (contador) {
                contador.textContent = '0 / 300 caracteres';
            }
        };

        motivoTextarea?.addEventListener('input', () => {
            if (contador) {
                contador.textContent = `${motivoTextarea.value.length} / 300 caracteres`;
            }
        });

        confirmarRechazoBtn?.addEventListener('click', () => {
            const rechazarInstance = getModalInstanceById('modalRechazarEvento');
            const motivoInstance = getModalInstanceById('modalRechazoEvento');

            rechazarInstance?.hide();
            motivoInstance?.show();
        });

        aceptarMotivoBtn?.addEventListener('click', async () => {
            if (!pendingRejectEventId) {
                return;
            }

            const motivo = motivoTextarea?.value?.trim() || '';
            if (!motivo) {
                motivoTextarea?.focus();
                return;
            }

            aceptarMotivoBtn.disabled = true;

            try {
                await actualizarEstadoEvento(pendingRejectEventId, 'rechazado', motivo);
                pendingRejectEventId = null;
                const motivoInstance = getModalInstanceById('modalRechazoEvento');
                motivoInstance?.hide();
                limpiarMotivo();
                await loadAprobacionEventosAdmin();
            } catch (error) {
                console.error(error);
            } finally {
                aceptarMotivoBtn.disabled = false;
            }
        });

        modalRechazar.addEventListener('hidden.bs.modal', () => {
            if (!document.getElementById('modalRechazoEvento')?.classList.contains('show')) {
                pendingRejectEventId = null;
            }
        });

        modalMotivo.addEventListener('hidden.bs.modal', () => {
            pendingRejectEventId = null;
            limpiarMotivo();
        });

        modalRechazar.dataset.rejectBound = 'true';
    };

    const bindAprobarEventoModalActions = () => {
        const modalAprobar = document.getElementById('modalAprobarPublicarEvento');
        const modalPublicado = document.getElementById('modalEventoPublicado');

        if (!modalAprobar || !modalPublicado || modalAprobar.dataset.approveBound === 'true') {
            return;
        }

        const confirmarAprobacionBtn = modalAprobar.querySelector('.modalAprobarEventoBtnAceptar');
        const continuarPublicadoBtn = modalPublicado.querySelector('.modalEventoPublicadoBtnContinuar');

        confirmarAprobacionBtn?.addEventListener('click', async () => {
            if (!pendingApproveEventId) {
                return;
            }

            confirmarAprobacionBtn.disabled = true;

            try {
                await actualizarEstadoEvento(pendingApproveEventId, 'aprobado');
                pendingApproveEventId = null;

                const aprobarInstance = getModalInstanceById('modalAprobarPublicarEvento');
                const publicadoInstance = getModalInstanceById('modalEventoPublicado');

                aprobarInstance?.hide();
                publicadoInstance?.show();
            } catch (error) {
                console.error(error);
            } finally {
                confirmarAprobacionBtn.disabled = false;
            }
        });

        continuarPublicadoBtn?.addEventListener('click', async () => {
            await loadAprobacionEventosAdmin();
        });

        modalAprobar.addEventListener('hidden.bs.modal', () => {
            if (!document.getElementById('modalEventoPublicado')?.classList.contains('show')) {
                pendingApproveEventId = null;
            }
        });

        modalAprobar.dataset.approveBound = 'true';
    };

    const loadAprobacionEventosAdmin = async () => {
        const container = document.getElementById('aprobacionEventosAdmin');
        const conteo = document.getElementById('aprobacionEventosConteo');

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-12">
                    <p class="text-muted">Cargando eventos pendientes...</p>
                </div>
            </div>
        `;

        if (conteo) {
            conteo.textContent = 'Cargando...';
        }

        try {
            const response = await fetch('/api/form-evento?estado=pendiente_aprobacion');
            if (!response.ok) {
                throw new Error('No se pudo consultar la lista de eventos pendientes.');
            }

            const data = await response.json();
            allPendingEvents = Array.isArray(data?.eventos) ? data.eventos : [];
            applyCurrentPendingFilters();
        } catch (error) {
            if (conteo) {
                conteo.textContent = 'Error';
            }

            container.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-danger">No se pudieron cargar los eventos pendientes.</p>
                    </div>
                </div>
            `;
            console.error(error);
        }
    };

    const bindAprobacionEventosActions = () => {
        const container = document.getElementById('aprobacionEventosAdmin');
        if (!container || container.dataset.aprobacionBound === 'true') {
            return;
        }

        container.addEventListener('click', async (event) => {
            const actionBtn = event.target.closest('[data-accion][data-evento-id]');
            if (actionBtn) {
                const eventoId = actionBtn.dataset.eventoId;
                const accion = actionBtn.dataset.accion;

                if (accion === 'eliminar' && eventoId) {
                    openDeleteModal(eventoId);
                }

                return;
            }

            const estadoBtn = event.target.closest('[data-estado][data-evento-id]');
            if (!estadoBtn) {
                return;
            }

            const eventoId = estadoBtn.dataset.eventoId;
            const estado = estadoBtn.dataset.estado;

            if (!eventoId || !estado) {
                return;
            }

            if (estado === 'rechazado') {
                pendingRejectEventId = eventoId;
                const modalRechazarInstance = getModalInstanceById('modalRechazarEvento');
                modalRechazarInstance?.show();
                return;
            }

            if (estado === 'aprobado') {
                pendingApproveEventId = eventoId;
                const modalAprobarInstance = getModalInstanceById('modalAprobarPublicarEvento');
                modalAprobarInstance?.show();
                return;
            }

            estadoBtn.disabled = true;

            try {
                await actualizarEstadoEvento(eventoId, estado);
                await loadAprobacionEventosAdmin();
            } catch (error) {
                estadoBtn.disabled = false;
                console.error(error);
            }
        });

        container.dataset.aprobacionBound = 'true';
    };

    globalThis.initAprobacionEventosAdmin = async () => {
        bindPendingFilterControls();
        bindDeleteModalActions();
        bindRechazoEventoModalActions();
        bindAprobarEventoModalActions();
        bindAprobacionEventosActions();
        await loadAprobacionEventosAdmin();
    };
})();