(function initEventosAprobadosModule() {
    let pendingDeleteEventId = null;
    let pendingEditEventId = null;
    let pendingEditEventData = null;
    let adminEditFormTemplateCache = '';
    let allPublishedEvents = [];
    let publishedFilterText = '';

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

    const parseFechaValue = (fecha) => {
        if (!fecha) {
            return null;
        }

        if (typeof fecha === 'string') {
            const date = new Date(fecha);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (typeof fecha !== 'object') {
            return null;
        }

        if (fecha.iso) {
            const isoDate = new Date(fecha.iso);
            return Number.isNaN(isoDate.getTime()) ? null : isoDate;
        }

        const anio = Number.parseInt(fecha.anio, 10);
        const mes = Number.parseInt(fecha.mes, 10);
        const dia = Number.parseInt(fecha.dia, 10);

        if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) {
            return null;
        }

        const date = new Date(anio, mes - 1, dia);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatFecha = (fecha) => {
        const parsedDate = parseFechaValue(fecha);

        if (!parsedDate) {
            return 'N/A';
        }

        const dia = String(parsedDate.getDate()).padStart(2, '0');
        const meses = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const anio = parsedDate.getFullYear();

        return `${dia}/${meses}/${anio}`;
    };

    const normalizarTexto = (value) => {
        return String(value || '')
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const getPublishedFilterValue = (evento, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            return formatFecha(evento?.updatedAt);
        }

        if (filtroSeleccionado === 'Nombre del Editor') {
            return evento?.contacto?.nombreCompleto || '';
        }

        return evento?.nombreEvento || '';
    };

    const comparePublishedByFilter = (a, b, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            const dateA = parseFechaValue(a?.updatedAt);
            const dateB = parseFechaValue(b?.updatedAt);
            const timeA = dateA instanceof Date && !Number.isNaN(dateA.getTime()) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
            const timeB = dateB instanceof Date && !Number.isNaN(dateB.getTime()) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
            return timeA - timeB;
        }

        const valueA = normalizarTexto(getPublishedFilterValue(a, filtroSeleccionado));
        const valueB = normalizarTexto(getPublishedFilterValue(b, filtroSeleccionado));
        return valueA.localeCompare(valueB, 'es', { sensitivity: 'base' });
    };

    const applyPublishedFilters = (eventos = []) => {
        const filtroSelect = document.getElementById('gestionEventosFiltro');
        const filtroSeleccionado = filtroSelect?.value || 'Título del Evento';
        const termino = normalizarTexto(publishedFilterText);
        const baseOrdenada = [...eventos].sort((a, b) => comparePublishedByFilter(a, b, filtroSeleccionado));

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
            const valor = normalizarTexto(getPublishedFilterValue(evento, filtroSeleccionado));
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

    const applyCurrentPublishedFilters = () => {
        const filteredResult = applyPublishedFilters(allPublishedEvents);
        renderEventosAprobadosCards(filteredResult.ordered, filteredResult);
    };

    const getModalInstanceById = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            return null;
        }

        return globalThis.bootstrap.Modal.getInstance(modalElement) || new globalThis.bootstrap.Modal(modalElement);
    };

    const fechaToInputDate = (fecha) => {
        const parsedDate = parseFechaValue(fecha);

        if (!parsedDate) {
            return '';
        }

        const anio = parsedDate.getFullYear();
        const mes = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const dia = String(parsedDate.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    const inputDateToFecha = (inputDate) => {
        if (!inputDate || !String(inputDate).includes('-')) {
            return { anio: '', mes: '', dia: '', iso: '' };
        }

        const [anio, mes, dia] = String(inputDate).split('-');
        return {
            anio,
            mes,
            dia,
            iso: `${anio}-${mes}-${dia}`,
        };
    };

    const fetchEventoById = async (eventoId) => {
        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`);

        if (!response.ok) {
            throw new Error('No se pudo consultar la información del evento.');
        }

        const data = await response.json();
        return data?.evento || null;
    };

    const ensureCreateEventoScriptLoaded = async () => {
        if (typeof globalThis.initCrearEvento === 'function') {
            return;
        }

        const existingScript = document.querySelector('script[data-admin-create-evento="true"]');
        if (existingScript) {
            await new Promise((resolve) => {
                if (typeof globalThis.initCrearEvento === 'function') {
                    resolve();
                    return;
                }

                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => resolve(), { once: true });
            });
            return;
        }

        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '../js/pages/crea-evento.js';
            script.dataset.adminCreateEvento = 'true';
            script.addEventListener('load', () => resolve(), { once: true });
            script.addEventListener('error', () => resolve(), { once: true });
            document.body.appendChild(script);
        });
    };

    const loadAdminEditFormTemplate = async () => {
        if (adminEditFormTemplateCache) {
            return adminEditFormTemplateCache;
        }

        const response = await fetch('../js/pages/gestion-editor.js', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('No se pudo cargar la plantilla de edición.');
        }

        const scriptText = await response.text();
        const createTemplateRegex = /'crear-evento':\s*\{[\s\S]*?html:\s*`([\s\S]*?)`,\s*\},/;
        const match = createTemplateRegex.exec(scriptText);

        if (!match?.[1]) {
            throw new Error('No se encontró la plantilla del formulario de evento.');
        }

        adminEditFormTemplateCache = match[1];
        return adminEditFormTemplateCache;
    };

    const renderAdminEditFormInModal = async () => {
        const host = document.getElementById('modalEditarEventoAdminFormHost');
        if (!host) {
            throw new Error('No se encontró el contenedor del formulario de edición.');
        }

        if (!host.querySelector('.ceCard')) {
            const templateHtml = await loadAdminEditFormTemplate();
            host.innerHTML = templateHtml;
            await ensureCreateEventoScriptLoaded();
            globalThis.initCrearEvento?.();

            host.querySelector('nav.breadcrumbEventos')?.remove();
            const sendButton = host.querySelector('#btnEnviarAprobacion');
            if (sendButton) {
                sendButton.style.display = 'none';
            }
        }

        return host;
    };

    const setSelectIfExists = (selectEl, value) => {
        if (!selectEl || value === undefined || value === null) {
            return;
        }

        const valueString = String(value);
        if (Array.from(selectEl.options).some((opt) => opt.value === valueString)) {
            selectEl.value = valueString;
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const populateEditarEventoModal = (evento, modalRoot) => {
        const nombreInput = modalRoot?.querySelector('#nombreEvento');
        const lugarInput = modalRoot?.querySelector('#lugarEvento');
        const linkInput = modalRoot?.querySelector('#linkCalendar');
        const descripcionInput = modalRoot?.querySelector('#descripcionEvento');
        const objetivosEditor = modalRoot?.querySelector('#objetivosEditor');
        const agendaEditor = modalRoot?.querySelector('#agendaEditor');
        const agendaFacilEditor = modalRoot?.querySelector('#agendaFacilEditor');
        const fechaPubAnio = modalRoot?.querySelector('#fechaPubAnio');
        const fechaPubMes = modalRoot?.querySelector('#fechaPubMes');
        const fechaPubDia = modalRoot?.querySelector('#fechaPubDia');

        if (nombreInput) {
            nombreInput.value = evento?.nombreEvento || '';
        }

        setSelectIfExists(fechaPubAnio, evento?.fechaPublicacion?.anio);
        setSelectIfExists(fechaPubMes, evento?.fechaPublicacion?.mes);
        setSelectIfExists(fechaPubDia, evento?.fechaPublicacion?.dia);

        if (lugarInput) {
            lugarInput.value = evento?.lugarEvento || '';
        }

        if (linkInput) {
            linkInput.value = evento?.linkCalendar || '';
        }

        if (descripcionInput) {
            descripcionInput.value = evento?.descripcionEvento || '';
        }

        if (objetivosEditor) {
            objetivosEditor.innerHTML = evento?.objetivosEvento || '';
        }

        if (agendaEditor) {
            agendaEditor.innerHTML = evento?.agendaEvento || '';
        }

        if (agendaFacilEditor) {
            agendaFacilEditor.innerHTML = evento?.agendaLecturaFacil || '';
        }
    };

    const buildEventoEditFormData = (eventoBase, edits) => {
        const formData = new FormData();

        formData.append('nombreEvento', edits.nombreEvento || eventoBase?.nombreEvento || '');
        formData.append('fechaPublicacion', JSON.stringify(edits.fechaPublicacion || eventoBase?.fechaPublicacion || {}));
        formData.append('fechasEvento', JSON.stringify(eventoBase?.fechasEvento || []));
        formData.append('horario', JSON.stringify(eventoBase?.horario || {}));
        formData.append('lugarEvento', edits.lugarEvento || eventoBase?.lugarEvento || '');
        formData.append('linkCalendar', edits.linkCalendar || eventoBase?.linkCalendar || '');
        formData.append('descripcionEvento', edits.descripcionEvento || eventoBase?.descripcionEvento || '');
        formData.append('objetivosEvento', eventoBase?.objetivosEvento || '');
        formData.append('agendaEvento', eventoBase?.agendaEvento || '');
        formData.append('agendaLecturaFacil', eventoBase?.agendaLecturaFacil || '');
        formData.append('contacto', JSON.stringify(eventoBase?.contacto || {}));
        formData.append('descripcionImagen', eventoBase?.descripcionImagen || '');
        formData.append('publicoMeta', eventoBase?.publicoMeta || '');
        formData.append('cupoEvento', eventoBase?.cupoEvento || '');
        formData.append('infoAdicional', eventoBase?.infoAdicional || '');
        formData.append('referencias', JSON.stringify(eventoBase?.referencias || []));
        formData.append('palabrasClave', JSON.stringify(eventoBase?.palabrasClave || []));
        formData.append('formularioInteresados', JSON.stringify(eventoBase?.formularioInteresados || {}));
        formData.append('fijarImportante', String(Boolean(eventoBase?.fijarImportante)));
        formData.append('listaDifusion', eventoBase?.listaDifusion || '');
        formData.append('fechaFinVisualizacion', JSON.stringify(eventoBase?.fechaFinVisualizacion || {}));
        formData.append('redesSociales', JSON.stringify(eventoBase?.redesSociales || []));
        formData.append('estado', eventoBase?.estado || 'aprobado');

        return formData;
    };

    const saveAdminEventEdition = async (eventoId, eventoBase, edits) => {
        const formData = buildEventoEditFormData(eventoBase, edits);

        const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`, {
            method: 'PATCH',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('No se pudo guardar la edición del evento.');
        }
    };

    const openEditModal = async (eventoId) => {
        const modalInstance = getModalInstanceById('modalEditarEventoAdmin');

        if (!modalInstance) {
            return;
        }

        const evento = await fetchEventoById(eventoId);
        if (!evento) {
            throw new Error('No se encontró el evento a editar.');
        }

        const modalRoot = await renderAdminEditFormInModal();

        pendingEditEventId = eventoId;
        pendingEditEventData = evento;
        populateEditarEventoModal(evento, modalRoot);
        modalInstance.show();
    };

    const renderEventosAprobadosCards = (eventos, filterStats = null) => {
        const container = document.getElementById('cardsEventosPublicadosAdmin');
        const conteo = document.getElementById('eventosPublicadosConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            if (filterStats && publishedFilterText.trim()) {
                conteo.textContent = `${filterStats.matches} coincidencia(s) de ${filterStats.total} publicados`;
            } else {
                conteo.textContent = `${eventos.length} publicados`;
            }
        }

        if (!Array.isArray(eventos) || eventos.length === 0) {
            container.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-muted">No hay eventos publicados.</p>
                    </div>
                </div>
            `;
            return;
        }

        const cardsHtml = eventos
            .map((evento) => {
                const titulo = escapeHtml(evento.nombreEvento || 'Sin título');
                const fechaCreacion = formatFecha(evento.createdAt);
                const fechaPublicacion = formatFecha(evento.updatedAt);
                const eventoId = escapeHtml(evento._id || '');

                return `
                    <div class="row border-bottom border-1 border-secondary-subtle">
                        <div class="col-12">
                            <div class="eventoCardPublicada d-flex justify-content-between p-3" aria-label="Evento publicado">
                                <div class="eventoCardPublicadaHeader ms-5">
                                    <p class="eventoCardPublicadaTitulo fw-bold">${titulo}</p>
                                    <p class="eventoCardPublicadaMeta"><span>Fecha de creación:</span> ${fechaCreacion}</p>
                                    <p class="eventoCardPublicadaMeta"><span>Fecha de publicación:</span> ${fechaPublicacion}</p>
                                </div>

                                <div class="eventoCardPublicadaAcciones mt-3" aria-label="Acciones del evento publicado">
                                    <button class="btn eventoCardBtnIcon" type="button" 
                                        aria-label="Ver evento"
                                        data-accion="ver"
                                        data-evento-id="${eventoId}">
                                        <i class="fa-regular fa-eye" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn eventoCardBtnIcon" type="button" 
                                        aria-label="Editar evento"
                                        data-accion="editar"
                                        data-evento-id="${eventoId}">
                                        <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn eventoCardBtnIcon" type="button" 
                                        aria-label="Eliminar evento"
                                        data-accion="eliminar"
                                        data-evento-id="${eventoId}">
                                        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = cardsHtml;
        bindEventosAprobadosActions();
    };

    const bindPublishedFilterControls = () => {
        const filtroSelect = document.getElementById('gestionEventosFiltro');
        const busquedaInput = document.getElementById('gestionEventosBusqueda');
        const buscarBtn = document.querySelector('.gestionEventosSearchBtn');
        const limpiarBtn = document.getElementById('eventosPublicadosLimpiarFiltro');

        if (!filtroSelect || !busquedaInput) {
            return;
        }

        if (filtroSelect.dataset.publishedFiltersBound === 'true') {
            return;
        }

        const ejecutarBusqueda = () => {
            publishedFilterText = busquedaInput.value || '';
            applyCurrentPublishedFilters();
        };

        buscarBtn?.addEventListener('click', ejecutarBusqueda);

        busquedaInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                ejecutarBusqueda();
            }
        });

        busquedaInput.addEventListener('input', () => {
            publishedFilterText = busquedaInput.value || '';
            applyCurrentPublishedFilters();
        });

        filtroSelect.addEventListener('change', () => {
            applyCurrentPublishedFilters();
        });

        limpiarBtn?.addEventListener('click', () => {
            publishedFilterText = '';
            busquedaInput.value = '';
            filtroSelect.selectedIndex = 0;
            applyCurrentPublishedFilters();
        });

        filtroSelect.dataset.publishedFiltersBound = 'true';
    };

    const eliminarEvento = async (eventoId) => {
        const response = await fetch(`/api/form-evento/${eventoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('No se pudo eliminar el evento.');
        }

        return response.json();
    };

    const openDeleteModal = (eventoId) => {
        pendingDeleteEventId = eventoId;
        const modalInstance = getModalInstanceById('modalEliminarEventoPublicado');
        modalInstance?.show();
    };

    const bindDeleteModalActions = () => {
        const modalElement = document.getElementById('modalEliminarEventoPublicado');

        if (!modalElement || modalElement.dataset.deleteBoundPublicado === 'true') {
            return;
        }

        const eliminarBtn = modalElement.querySelector('.modalEliminarEventoBtnEliminar');

        if (!eliminarBtn) {
            return;
        }

        eliminarBtn.addEventListener('click', async () => {
            if (!pendingDeleteEventId) {
                return;
            }

            eliminarBtn.disabled = true;

            try {
                await eliminarEvento(pendingDeleteEventId);
                pendingDeleteEventId = null;

                const modalInstance = getModalInstanceById('modalEliminarEventoPublicado');
                modalInstance?.hide();

                await loadEventosAprobadosAdmin();
            } catch (error) {
                console.error(error);
            } finally {
                eliminarBtn.disabled = false;
            }
        });

        modalElement.dataset.deleteBoundPublicado = 'true';
    };

    const bindEditarEventoModalActions = () => {
        const modalElement = document.getElementById('modalEditarEventoAdmin');
        const successModalElement = document.getElementById('modalEventoEditadoAdmin');

        if (!modalElement || !successModalElement || modalElement.dataset.editBound === 'true') {
            return;
        }

        const getEditField = (selector) => modalElement.querySelector(`#modalEditarEventoAdminFormHost ${selector}`);
        const guardarBtn = modalElement.querySelector('.modalEditarEventoAdminBtnGuardar');

        guardarBtn?.addEventListener('click', async () => {
            if (!pendingEditEventId || !pendingEditEventData) {
                return;
            }

            guardarBtn.disabled = true;

            try {
                const edits = {
                    nombreEvento: getEditField('#nombreEvento')?.value?.trim() || '',
                    fechaPublicacion: {
                        anio: getEditField('#fechaPubAnio')?.value || '',
                        mes: getEditField('#fechaPubMes')?.value || '',
                        dia: getEditField('#fechaPubDia')?.value || '',
                        iso: inputDateToFecha(fechaToInputDate({
                            anio: getEditField('#fechaPubAnio')?.value,
                            mes: getEditField('#fechaPubMes')?.value,
                            dia: getEditField('#fechaPubDia')?.value,
                        })).iso,
                    },
                    lugarEvento: getEditField('#lugarEvento')?.value?.trim() || '',
                    linkCalendar: getEditField('#linkCalendar')?.value?.trim() || '',
                    descripcionEvento: getEditField('#descripcionEvento')?.value?.trim() || '',
                };

                await saveAdminEventEdition(pendingEditEventId, pendingEditEventData, edits);

                getModalInstanceById('modalEditarEventoAdmin')?.hide();
                getModalInstanceById('modalEventoEditadoAdmin')?.show();

                await loadEventosAprobadosAdmin();
            } catch (error) {
                console.error(error);
            } finally {
                guardarBtn.disabled = false;
            }
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            pendingEditEventId = null;
            pendingEditEventData = null;
        });

        modalElement.dataset.editBound = 'true';
    };

    const bindEventosAprobadosActions = () => {
        const container = document.getElementById('cardsEventosPublicadosAdmin');

        if (!container || container.dataset.aprobadosBound === 'true') {
            return;
        }

        container.addEventListener('click', async (event) => {
            const btn = event.target.closest('[data-accion][data-evento-id]');

            if (!btn) {
                return;
            }

            const eventoId = btn.dataset.eventoId;
            const accion = btn.dataset.accion;

            if (!eventoId || !accion) {
                return;
            }

            if (accion === 'eliminar') {
                openDeleteModal(eventoId);
                return;
            }

            if (accion === 'ver') {
                console.info('Accion ver pendiente para evento:', eventoId);
                return;
            }

            if (accion === 'editar') {
                try {
                    await openEditModal(eventoId);
                } catch (error) {
                    console.error(error);
                }
            }
        });

        container.dataset.aprobadosBound = 'true';
    };

    const loadEventosAprobadosAdmin = async () => {
        const container = document.getElementById('cardsEventosPublicadosAdmin');
        const conteo = document.getElementById('eventosPublicadosConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            conteo.textContent = 'Cargando...';
        }

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-12">
                    <p class="text-muted">Cargando eventos publicados...</p>
                </div>
            </div>
        `;

        try {
            const response = await fetch('/api/form-evento?estado=aprobado&estadoVigencia=activo');

            if (!response.ok) {
                throw new Error('No se pudo consultar la lista de eventos publicados.');
            }

            const data = await response.json();
            allPublishedEvents = Array.isArray(data?.eventos) ? data.eventos : [];
            applyCurrentPublishedFilters();
        } catch (error) {
            if (conteo) {
                conteo.textContent = 'Error';
            }

            container.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-danger">No se pudieron cargar los eventos publicados.</p>
                    </div>
                </div>
            `;
            console.error(error);
        }
    };

    globalThis.initEventosAprobadosAdmin = async () => {
        bindPublishedFilterControls();
        bindDeleteModalActions();
        bindEditarEventoModalActions();
        bindEventosAprobadosActions();
        await loadEventosAprobadosAdmin();
    };
})();
