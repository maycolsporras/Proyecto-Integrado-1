(function initEventosPublicadosEditorModule() {
    let pendingEditEventId = null;
    let pendingEditEventData = null;
    let editorEditFormTemplateCache = '';
    let allPublishedEditorEvents = [];
    let publishedEditorFilterText = '';

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

        const anio = Number.parseInt(fecha.anio, 10);
        const mes = Number.parseInt(fecha.mes, 10);
        const dia = Number.parseInt(fecha.dia, 10);

        if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
            const date = new Date(anio, mes - 1, dia);
            if (!Number.isNaN(date.getTime())) {
                return date;
            }
        }

        if (fecha.iso) {
            const isoDate = new Date(fecha.iso);
            return Number.isNaN(isoDate.getTime()) ? null : isoDate;
        }

        return null;
    };

    const formatFecha = (fecha) => {
        const parsedDate = parseFechaValue(fecha);

        if (!parsedDate) {
            return 'N/A';
        }

        return parsedDate.toLocaleDateString('es-CR', {
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

    const getPublishedEditorFilterValue = (evento, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            return formatFecha(evento?.updatedAt);
        }

        if (filtroSeleccionado === 'Nombre del Editor') {
            return evento?.contacto?.nombreCompleto || '';
        }

        return evento?.nombreEvento || '';
    };

    const comparePublishedEditorByFilter = (a, b, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Fecha del Evento') {
            const dateA = parseFechaValue(a?.updatedAt);
            const dateB = parseFechaValue(b?.updatedAt);
            const timeA = dateA instanceof Date && !Number.isNaN(dateA.getTime()) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
            const timeB = dateB instanceof Date && !Number.isNaN(dateB.getTime()) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
            return timeA - timeB;
        }

        const valueA = normalizarTexto(getPublishedEditorFilterValue(a, filtroSeleccionado));
        const valueB = normalizarTexto(getPublishedEditorFilterValue(b, filtroSeleccionado));
        return valueA.localeCompare(valueB, 'es', { sensitivity: 'base' });
    };

    const applyPublishedEditorFilters = (eventos = []) => {
        const filtroSelect = document.getElementById('gestionEventosPublicadosEditorFiltro');
        const filtroSeleccionado = filtroSelect?.value || 'Título del Evento';
        const termino = normalizarTexto(publishedEditorFilterText);
        const baseOrdenada = [...eventos].sort((a, b) => comparePublishedEditorByFilter(a, b, filtroSeleccionado));

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
            const valor = normalizarTexto(getPublishedEditorFilterValue(evento, filtroSeleccionado));
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

    const renderEventosPublicadosEditorCards = (eventos = [], filterStats = null) => {
        const container = document.getElementById('cardsEventosPublicadosEditor');
        const conteo = document.getElementById('eventosPublicadosEditorConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            if (filterStats && publishedEditorFilterText.trim()) {
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

        container.innerHTML = eventos.map((evento) => {
            const eventId = escapeHtml(evento?._id || '');
            const titulo = escapeHtml(evento?.nombreEvento || 'Sin título');
            const fechaCreacion = formatFecha(evento?.createdAt);
            const fechaPublicacion = formatFecha(evento?.updatedAt);

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
                                <button class="btn eventoCardBtnIcon" type="button" aria-label="Ver evento" data-accion="ver" data-evento-id="${eventId}">
                                    <i class="fa-regular fa-eye" aria-hidden="true"></i>
                                </button>
                                <button class="btn eventoCardBtnIcon" type="button" aria-label="Editar evento" data-accion="editar" data-evento-id="${eventId}">
                                    <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const applyCurrentPublishedEditorFilters = () => {
        const filteredResult = applyPublishedEditorFilters(allPublishedEditorEvents);
        renderEventosPublicadosEditorCards(filteredResult.ordered, filteredResult);
    };

    const getModalInstanceById = (modalId) => {
        const modalElement = document.getElementById(modalId);

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return null;
        }

        return globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);
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

        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '../js/pages/crea-evento.js';
            script.addEventListener('load', () => resolve(), { once: true });
            script.addEventListener('error', () => resolve(), { once: true });
            document.body.appendChild(script);
        });
    };

    const loadEditorEditFormTemplate = async () => {
        if (editorEditFormTemplateCache) {
            return editorEditFormTemplateCache;
        }

        const response = await fetch('../js/pages/gestion-editor.js', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('No se pudo cargar la plantilla de edición.');
        }

        const scriptText = await response.text();
        const templateRegex = /'crear-evento':\s*\{[\s\S]*?html:\s*`([\s\S]*?)`,\s*\},/;
        const match = templateRegex.exec(scriptText);

        if (!match?.[1]) {
            throw new Error('No se encontró la plantilla del formulario de evento.');
        }

        editorEditFormTemplateCache = match[1];
        return editorEditFormTemplateCache;
    };

    const renderEditorEditFormInModal = async () => {
        const host = document.getElementById('modalEditarEventoEditorFormHost');
        if (!host) {
            throw new Error('No se encontró el contenedor del formulario de edición.');
        }

        if (!host.querySelector('.ceCard')) {
            const templateHtml = await loadEditorEditFormTemplate();
            host.innerHTML = templateHtml;
            await ensureCreateEventoScriptLoaded();
            globalThis.initCrearEvento?.();

            host.querySelector('nav.breadcrumbEventos')?.remove();
            host.querySelector('#btnEnviarAprobacion')?.remove();
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

    const populateEditorEditForm = (evento, modalRoot) => {
        modalRoot?.querySelector('#nombreEvento')?.setAttribute('value', '');

        const nombreInput = modalRoot?.querySelector('#nombreEvento');
        const lugarInput = modalRoot?.querySelector('#lugarEvento');
        const linkInput = modalRoot?.querySelector('#linkCalendar');
        const descripcionInput = modalRoot?.querySelector('#descripcionEvento');
        const objetivosEditor = modalRoot?.querySelector('#objetivosEditor');
        const agendaEditor = modalRoot?.querySelector('#agendaEditor');
        const agendaFacilEditor = modalRoot?.querySelector('#agendaFacilEditor');

        if (nombreInput) {
            nombreInput.value = evento?.nombreEvento || '';
        }

        setSelectIfExists(modalRoot?.querySelector('#fechaPubAnio'), evento?.fechaPublicacion?.anio);
        setSelectIfExists(modalRoot?.querySelector('#fechaPubMes'), evento?.fechaPublicacion?.mes);
        setSelectIfExists(modalRoot?.querySelector('#fechaPubDia'), evento?.fechaPublicacion?.dia);

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
        formData.append('objetivosEvento', edits.objetivosEvento || eventoBase?.objetivosEvento || '');
        formData.append('agendaEvento', edits.agendaEvento || eventoBase?.agendaEvento || '');
        formData.append('agendaLecturaFacil', edits.agendaLecturaFacil || eventoBase?.agendaLecturaFacil || '');
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

    const saveEditorEventEdition = async (eventoId, eventoBase, edits) => {
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
        const modalInstance = getModalInstanceById('modalEditarEventoEditor');
        if (!modalInstance) {
            return;
        }

        const evento = await fetchEventoById(eventoId);
        if (!evento) {
            throw new Error('No se encontró el evento a editar.');
        }

        const modalRoot = await renderEditorEditFormInModal();
        pendingEditEventId = eventoId;
        pendingEditEventData = evento;
        populateEditorEditForm(evento, modalRoot);
        modalInstance.show();
    };

    const bindEditarEventoModalActions = () => {
        const modalElement = document.getElementById('modalEditarEventoEditor');
        const successModalElement = document.getElementById('modalEventoEditadoEditor');

        if (!modalElement || !successModalElement || modalElement.dataset.editBound === 'true') {
            return;
        }

        const getEditField = (selector) => modalElement.querySelector(`#modalEditarEventoEditorFormHost ${selector}`);
        const guardarBtn = modalElement.querySelector('.modalEditarEventoEditorBtnGuardar');

        guardarBtn?.addEventListener('click', async () => {
            if (!pendingEditEventId || !pendingEditEventData) {
                return;
            }

            guardarBtn.disabled = true;

            try {
                const anio = getEditField('#fechaPubAnio')?.value || '';
                const mes = getEditField('#fechaPubMes')?.value || '';
                const dia = getEditField('#fechaPubDia')?.value || '';

                const edits = {
                    nombreEvento: getEditField('#nombreEvento')?.value?.trim() || '',
                    fechaPublicacion: {
                        anio,
                        mes,
                        dia,
                        iso: anio && mes && dia ? `${anio}-${mes}-${dia}` : '',
                    },
                    lugarEvento: getEditField('#lugarEvento')?.value?.trim() || '',
                    linkCalendar: getEditField('#linkCalendar')?.value?.trim() || '',
                    descripcionEvento: getEditField('#descripcionEvento')?.value?.trim() || '',
                    objetivosEvento: getEditField('#objetivosEditor')?.innerHTML || '',
                    agendaEvento: getEditField('#agendaEditor')?.innerHTML || '',
                    agendaLecturaFacil: getEditField('#agendaFacilEditor')?.innerHTML || '',
                };

                await saveEditorEventEdition(pendingEditEventId, pendingEditEventData, edits);

                getModalInstanceById('modalEditarEventoEditor')?.hide();
                getModalInstanceById('modalEventoEditadoEditor')?.show();
                await loadEventosPublicadosEditor();
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

    const bindPublishedEditorActions = () => {
        const container = document.getElementById('cardsEventosPublicadosEditor');

        if (!container || container.dataset.editorPublishedActionsBound === 'true') {
            return;
        }

        container.addEventListener('click', async (event) => {
            const btn = event.target.closest('[data-accion][data-evento-id]');
            if (!btn) {
                return;
            }

            const accion = btn.dataset.accion;
            const eventoId = btn.dataset.eventoId;

            if (accion !== 'editar' || !eventoId) {
                return;
            }

            try {
                await openEditModal(eventoId);
            } catch (error) {
                console.error(error);
            }
        });

        container.dataset.editorPublishedActionsBound = 'true';
    };

    const bindPublishedEditorFilterControls = () => {
        const filtroSelect = document.getElementById('gestionEventosPublicadosEditorFiltro');
        const busquedaInput = document.getElementById('gestionEventosPublicadosEditorBusqueda');
        const buscarBtn = document.getElementById('gestionEventosPublicadosEditorBuscarBtn');
        const limpiarBtn = document.getElementById('eventosPublicadosEditorLimpiarFiltro');

        if (!filtroSelect || !busquedaInput || filtroSelect.dataset.editorPublishedFiltersBound === 'true') {
            return;
        }

        const ejecutarBusqueda = () => {
            publishedEditorFilterText = busquedaInput.value || '';
            applyCurrentPublishedEditorFilters();
        };

        buscarBtn?.addEventListener('click', ejecutarBusqueda);

        busquedaInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                ejecutarBusqueda();
            }
        });

        busquedaInput.addEventListener('input', () => {
            publishedEditorFilterText = busquedaInput.value || '';
            applyCurrentPublishedEditorFilters();
        });

        filtroSelect.addEventListener('change', () => {
            applyCurrentPublishedEditorFilters();
        });

        limpiarBtn?.addEventListener('click', () => {
            publishedEditorFilterText = '';
            busquedaInput.value = '';
            filtroSelect.selectedIndex = 0;
            applyCurrentPublishedEditorFilters();
        });

        filtroSelect.dataset.editorPublishedFiltersBound = 'true';
    };

    const loadEventosPublicadosEditor = async () => {
        const container = document.getElementById('cardsEventosPublicadosEditor');
        const conteo = document.getElementById('eventosPublicadosEditorConteo');

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
            allPublishedEditorEvents = Array.isArray(data?.eventos) ? data.eventos : [];
            applyCurrentPublishedEditorFilters();
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

    globalThis.initEventosPublicadosEditor = async () => {
        bindPublishedEditorFilterControls();
        bindEditarEventoModalActions();
        bindPublishedEditorActions();
        await loadEventosPublicadosEditor();
    };
})();
