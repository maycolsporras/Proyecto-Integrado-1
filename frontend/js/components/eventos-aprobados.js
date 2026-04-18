(function initEventosAprobadosModule() {
    let pendingDeleteEventId = null;

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

    const getModalInstanceById = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            return null;
        }

        return globalThis.bootstrap.Modal.getInstance(modalElement) || new globalThis.bootstrap.Modal(modalElement);
    };

    const renderEventosAprobadosCards = (eventos) => {
        const container = document.getElementById('cardsEventosPublicadosAdmin');
        const conteo = document.getElementById('eventosPublicadosConteo');

        if (!container) {
            return;
        }

        if (conteo) {
            conteo.textContent = `${eventos.length} publicados`;
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
                console.info('Accion editar pendiente para evento:', eventoId);
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
            const eventos = Array.isArray(data?.eventos) ? data.eventos : [];

            renderEventosAprobadosCards(eventos);
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
        bindDeleteModalActions();
        bindEventosAprobadosActions();
        await loadEventosAprobadosAdmin();
    };
})();
