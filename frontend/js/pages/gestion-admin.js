document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.gestionAdminMenuOption');
    const mobileMenuLabel = document.getElementById('gestionAdminMobileMenuLabel');
    const contentPanel = document.getElementById('gestionAdminContentPanel');

    if (!sidebarLinks.length) {
        return;
    }

    let pendingRejectListaId = null;
    let pendingDeleteListaId = null;
    let listasDifusionAprobadasCache = [];
    const listasDifusionPreviewById = new Map();



    const escapeHtml = (value) => {
        const stringValue = value == null ? '' : String(value);
        return stringValue
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return 'No disponible';
        }

        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) {
            return 'No disponible';
        }

        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderListaDifusionApprovalCards = (listas = []) => {
        const cardsContainer = contentPanel?.querySelector('#cardsAprobacionListasDifusionAdmin');
        const countLabel = contentPanel?.querySelector('#aprobacionListasConteo');

        listas.forEach((lista) => {
            if (lista?._id) {
                listasDifusionPreviewById.set(String(lista._id), lista);
            }
        });

        if (!cardsContainer) {
            return;
        }

        if (countLabel) {
            countLabel.textContent = `${listas.length} lista(s) pendiente(s) de aprobación`;
        }

        if (!listas.length) {
            cardsContainer.innerHTML = `
                <div class="row mt-4">
                    <div class="col-12">
                        <p class="text-muted mb-0">No hay listas de difusión pendientes de aprobación.</p>
                    </div>
                </div>
            `;
            return;
        }

        cardsContainer.innerHTML = listas.map((lista) => `
            <div class="row mt-4">
                <div class="col-12">
                    <article class="listaDifusionCard border border-1 border-dark bg-white" data-lista-id="${escapeHtml(lista._id)}">
                        <div class="listaDifusionHeader px-3 py-2">
                            <h3 class="h5 fw-bold mb-0">${escapeHtml(lista.nombreLista || 'Nombre de la lista de difusión')}</h3>
                        </div>

                        <div class="table-responsive">
                            <table class="table listaDifusionTabla mb-0 align-middle">
                                <tbody>
                                    <tr>
                                        <th class="w-25 text-start">Autor:</th>
                                        <td>${escapeHtml(lista.autorCorreo || 'usuario@gmail.com')}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-start">Fecha de creación:</th>
                                        <td>${escapeHtml(formatDate(lista.createdAt))}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-start">Descripción de la lista de difusión:</th>
                                        <td>
                                            <div>${escapeHtml(lista.descripcionLista || '')}</div>
                                            <div class="d-flex justify-content-end gap-2 mt-2">
                                                <button class="btn btn-outline-primary btn-sm btnEditarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Editar lista de difusión">
                                                    <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                                                </button>
                                                <button class="btn btn-outline-primary btn-sm btnEliminarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Eliminar lista de difusión">
                                                    <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </article>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button class="btn btn-outline-secondary rounded-circle btnRechazarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Rechazar lista de difusión" style="width: 36px; height: 36px; padding: 0;">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-outline-secondary rounded-circle btnAprobarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Aprobar lista de difusión" style="width: 36px; height: 36px; padding: 0;">
                            <i class="fa-solid fa-check" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const renderListasDifusionAprobadasCards = (listas = []) => {
        const cardsContainer = contentPanel?.querySelector('#cardsListasDifusionAdmin');
        const countLabel = contentPanel?.querySelector('#listasDifusionAprobadasConteo');

        listas.forEach((lista) => {
            if (lista?._id) {
                listasDifusionPreviewById.set(String(lista._id), lista);
            }
        });

        if (!cardsContainer) {
            return;
        }

        if (countLabel) {
            countLabel.textContent = `${listas.length} lista(s) aprobada(s)`;
        }

        if (!listas.length) {
            cardsContainer.innerHTML = `
                <div class="row mt-4">
                    <div class="col-12">
                        <p class="text-muted mb-0">No hay listas de difusión aprobadas.</p>
                    </div>
                </div>
            `;
            return;
        }

        cardsContainer.innerHTML = listas.map((lista) => `
            <div class="row border-bottom border-1 border-secondary-subtle ">
                <div class="col-12">
                    <div class="eventoCardPublicada d-flex justify-content-between p-3" aria-label="Evento publicado" data-lista-id="${escapeHtml(lista._id)}">
                        <div class="eventoCardPublicadaHeader ms-5">
                            <p class="eventoCardPublicadaTitulo fw-bold">${escapeHtml(lista.nombreLista || 'Nombre de la Lista')}</p>
                            <p class="eventoCardPublicadaMeta"><span>Fecha de creación:</span> ${escapeHtml(formatDate(lista.createdAt))}
                            </p>
                            <p class="eventoCardPublicadaMeta"><span>Autor:</span> ${escapeHtml(lista.autorCorreo || 'Nombre Apellido Apellido')}
                            </p>
                            <p class="eventoCardPublicadaMeta"><span>Número de suscriptores:</span> ${escapeHtml(lista.numeroSuscriptores ?? 0)}
                            </p>
                        </div>

                        <div class="eventoCardPublicadaAcciones mt-3" aria-label="Acciones del evento publicado">
                            <button class="btn eventoCardBtnIcon btnEditarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Editar evento">
                                <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                            </button>
                            <button class="btn eventoCardBtnIcon btnEliminarListaDifusionAdmin" type="button" data-lista-id="${escapeHtml(lista._id)}" aria-label="Eliminar evento">
                                <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const normalizarTextoFiltro = (value) => {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    const applyListasDifusionAdminFilters = () => {
        const filterSelect = contentPanel?.querySelector('#listasDifusionAdminFiltro');
        const searchInput = contentPanel?.querySelector('#listasDifusionAdminBusqueda');

        const criterio = normalizarTextoFiltro(filterSelect?.value || 'nombre');
        const termino = normalizarTextoFiltro(searchInput?.value || '');

        if (!termino) {
            renderListasDifusionAprobadasCards(listasDifusionAprobadasCache);
            return;
        }

        const filtradas = listasDifusionAprobadasCache.filter((lista) => {
            const nombreLista = normalizarTextoFiltro(lista?.nombreLista);
            const fechaCreacion = normalizarTextoFiltro(formatDate(lista?.createdAt));
            const autor = normalizarTextoFiltro(lista?.autorCorreo);

            if (criterio === 'fecha') {
                return fechaCreacion.includes(termino);
            }

            if (criterio === 'autor') {
                return autor.includes(termino);
            }

            return nombreLista.includes(termino);
        });

        renderListasDifusionAprobadasCards(filtradas);
    };

    const ensureEditListaDifusionModalAdmin = () => {
        let modalElement = document.getElementById('modalEditarListaDifusionAdmin');

        if (modalElement) {
            return modalElement;
        }

        const modalWrapper = document.createElement('div');
        modalWrapper.innerHTML = `
            <div class="modal fade" id="modalEditarListaDifusionAdmin" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-body p-4 p-md-5">
                            <div class="row d-flex flex-column gap-3">
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <h2 class="fw-bold">Lista de Difusión</h2>
                                </div>
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <p class="txtCrearLista">Información de la Lista</p>
                                </div>
                                <div class="col-12 d-flex justify-content-center align-items-center">
                                    <form id="formEditarListaDifusionAdmin" class="w-100" style="max-width: 800px;" novalidate>
                                        <input type="hidden" id="editarListaAdminId">
                                        <div class="mb-4">
                                            <div class="row align-items-center">
                                                <label for="editarNombreListaAdmin" class="col-12 col-lg-3 form-label">*Nombre de la lista</label>
                                                <div class="col-12 col-lg-9">
                                                    <input type="text" class="form-control" id="editarNombreListaAdmin" placeholder="Introduzca el dato solicitado" required>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-4">
                                            <div class="row align-items-start">
                                                <label for="editarDescripcionListaAdmin" class="col-12 col-lg-3 form-label">*Descripción de la lista de difusión</label>
                                                <div class="col-12 col-lg-9">
                                                    <textarea class="form-control" id="editarDescripcionListaAdmin" rows="5" placeholder="Introduzca el dato solicitado" required></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-center gap-2">
                                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="submit" class="btn btnCrearLista">
                                                <i class="fa-solid fa-circle-check me-2" aria-hidden="true"></i>Confirmar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.append(modalWrapper.firstElementChild);
        modalElement = document.getElementById('modalEditarListaDifusionAdmin');
        return modalElement;
    };

    const openEditListaDifusionModalAdmin = (lista) => {
        const modalElement = ensureEditListaDifusionModalAdmin();

        if (!modalElement || !globalThis.bootstrap?.Modal || !lista) {
            return;
        }

        const idInput = modalElement.querySelector('#editarListaAdminId');
        const nombreInput = modalElement.querySelector('#editarNombreListaAdmin');
        const descripcionInput = modalElement.querySelector('#editarDescripcionListaAdmin');

        if (!(idInput instanceof HTMLInputElement)
            || !(nombreInput instanceof HTMLInputElement)
            || !(descripcionInput instanceof HTMLTextAreaElement)) {
            return;
        }

        idInput.value = lista._id || '';
        nombreInput.value = lista.nombreLista || '';
        descripcionInput.value = lista.descripcionLista || '';

        nombreInput.classList.remove('is-invalid');
        descripcionInput.classList.remove('is-invalid');

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    };

    const validateEditListaDifusionAdminFields = (nombreInput, descripcionInput) => {
        const nombreValido = nombreInput.value.trim().length > 0;
        const descripcionValida = descripcionInput.value.trim().length > 0;

        nombreInput.classList.toggle('is-invalid', !nombreValido);
        descripcionInput.classList.toggle('is-invalid', !descripcionValida);

        return nombreValido && descripcionValida;
    };

    const closeEditListaDifusionModalAdmin = () => {
        const modalElement = document.getElementById('modalEditarListaDifusionAdmin');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    };

    const updateListaDifusionStatus = async (listaId, estado, motivoRechazo = '') => {
        const response = await fetch(`/api/lista-difusion/${encodeURIComponent(listaId)}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado, motivoRechazo }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok) {
            throw new Error(data?.mensaje || 'No se pudo actualizar el estado de la lista.');
        }
    };

    const deleteListaDifusionAdmin = async (listaId) => {
        const response = await fetch(`/api/lista-difusion/${encodeURIComponent(listaId)}`, {
            method: 'DELETE',
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok) {
            throw new Error(data?.mensaje || 'No se pudo eliminar la lista.');
        }
    };

    const loadAprobacionListasDifusionAdmin = async () => {
        const cardsContainer = contentPanel?.querySelector('#cardsAprobacionListasDifusionAdmin');
        if (!cardsContainer) {
            return;
        }

        cardsContainer.innerHTML = '<p class="text-muted mb-0">Cargando listas pendientes...</p>';

        try {
            const response = await fetch('/api/lista-difusion?estado=pendiente_aprobacion');
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(data?.mensaje || 'No fue posible consultar las listas pendientes.');
            }

            renderListaDifusionApprovalCards(Array.isArray(data.listas) ? data.listas : []);
        } catch (error) {
            cardsContainer.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Ocurrió un error al cargar las listas.')}</p>`;
        }
    };

    const loadListasDifusionAprobadasAdmin = async () => {
        const cardsContainer = contentPanel?.querySelector('#cardsListasDifusionAdmin');
        if (!cardsContainer) {
            return;
        }

        cardsContainer.innerHTML = '<p class="text-muted mb-0">Cargando listas aprobadas...</p>';

        try {
            const response = await fetch('/api/lista-difusion?estado=aprobada');
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(data?.mensaje || 'No fue posible consultar las listas aprobadas.');
            }

            listasDifusionAprobadasCache = Array.isArray(data.listas) ? data.listas : [];
            renderListasDifusionAprobadasCards(listasDifusionAprobadasCache);
        } catch (error) {
            cardsContainer.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Ocurrió un error al cargar las listas aprobadas.')}</p>`;
        }
    };

    const initAprobacionListasDifusionAdmin = () => {
        loadAprobacionListasDifusionAdmin();
    };

    const showModalListaAprobada = () => {
        const modalElement = contentPanel?.querySelector('#modalListaAprobada');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        return true;
    };

    const showModalConfirmacionRechazoLista = (listaId) => {
        const modalElement = contentPanel?.querySelector('#modalConfirmacionRechazoListaAdministrador');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        pendingRejectListaId = listaId;

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        return true;
    };

    const hideModalConfirmacionRechazoLista = () => {
        const modalElement = contentPanel?.querySelector('#modalConfirmacionRechazoListaAdministrador');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        return true;
    };

    const showModalMotivoRechazoLista = () => {
        const modalElement = contentPanel?.querySelector('#modalRechazoListaAdministrador');
        const motivoTextarea = contentPanel?.querySelector('#modalRechazoListaAdministradorMotivo');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        if (motivoTextarea instanceof HTMLTextAreaElement) {
            motivoTextarea.value = '';
            motivoTextarea.classList.remove('is-invalid');
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        return true;
    };

    const hideModalMotivoRechazoLista = () => {
        const modalElement = contentPanel?.querySelector('#modalRechazoListaAdministrador');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        return true;
    };

    const ensureModalEliminarListaDifusion = () => {
        let modalElement = document.getElementById('modalEliminarListaDifusion');

        if (modalElement) {
            return modalElement;
        }

        const modalWrapper = document.createElement('div');
        modalWrapper.innerHTML = `
            <div class="modal fade" id="modalEliminarListaDifusion" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                    <div class="modal-content modalEliminarEventoContenido">
                        <div class="modal-body modalEliminarEventoBody">
                            <p class="modalEliminarEventoTitulo">¿Eliminar?</p>
                            <p class="modalEliminarEventoDescripcion">
                                Al eliminar una lista de difusión la perderá para siempre, ¿está seguro que desea continuar con
                                este proceso?
                            </p>
                            <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn modalEliminarEventoBtnEliminar px-4">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.append(modalWrapper.firstElementChild);
        modalElement = document.getElementById('modalEliminarListaDifusion');
        return modalElement;
    };

    const showModalEliminarListaDifusion = (listaId) => {
        const modalElement = ensureModalEliminarListaDifusion();

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        pendingDeleteListaId = listaId;
        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        return true;
    };

    const hideModalEliminarListaDifusion = () => {
        const modalElement = document.getElementById('modalEliminarListaDifusion');

        if (!modalElement || !globalThis.bootstrap?.Modal) {
            return false;
        }

        globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        return true;
    };

    const sectionTemplates = {
        'aprobacion-eventos': {
            title: 'Aprobacion de Eventos',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                    href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Aprobación de Eventos
                            </li>
                        </ol>
                    </nav>
                    <div class="container-fluid">
                        <div class="row mt-5">
                            <div class="col-12 buscadorEventosTitle mb-2">
                                <p>Buscador de Eventos</p>
                            </div>
                            <div class="col-12 buscadorEventosSubtitle mb-2">
                                Filtrar por:
                            </div>
                            <div class="col-12 mb-4">
                                <div class="row g-2 align-items-center">
                                    <div class="col-12 col-sm-4 col-md-auto">
                                        <label class="visually-hidden" for="gestionEventosFiltro">Filtro de eventos</label>
                                        <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                            aria-label="Tipo de filtro">
                                            <option selected>Título del Evento</option>
                                            <option>Fecha del Evento</option>
                                            <option>Nombre del Editor</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-sm">
                                        <label class="visually-hidden" for="gestionEventosBusqueda">Dato a buscar</label>
                                        <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                            type="text" placeholder="Ingrese el dato indicado"
                                            aria-label="Ingrese el dato indicado">
                                    </div>

                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button id="aprobacionEventosLimpiarFiltro" class="btn btn-outline-secondary" type="button" aria-label="Limpiar filtros">
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center gap-3 mt-4 aprobacionEventosTitle">
                                <div class="iconoAprobacionEventos">
                                    <i class="fa-regular fa-file-lines"></i>
                                </div>
                                <p class="txtAprobacionEventos">Aprobación de Eventos</p>
                            </div>
                            <div class="mt-4 fw-bold d-flex justify-content-end">
                                <p id="aprobacionEventosConteo">Cargando...</p>
                            </div>
                        </div>
                    </div>
                    <div id="aprobacionEventosAdmin" class="cardsAprobacionEventos container-fluid mt-3">
                    </div>

                    <div class="modal fade" id="modalEliminarEvento" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <div class="modalEliminarEventoIcono" aria-hidden="true">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <p class="modalEliminarEventoTitulo">¿Eliminar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al eliminar un evento en desarrollo lo perderá para siempre, ¿está seguro que desea continuar
                                        con este proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar px-4">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalRechazarEvento" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <p class="modalEliminarEventoTitulo">¿Rechazar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al rechazar un evento, este no podrá ser publicado, ¿está seguro que desea continuar con este
                                        proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar modalRechazarEventoBtnConfirmar px-4">Rechazar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalRechazoEvento" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalRechazoSuscriptorAncho">
                            <div class="modal-content modalRechazoSuscriptorContenido">
                                <div class="modal-body modalRechazoSuscriptorBody">
                                    <p class="modalRechazoSuscriptorTitulo">Rechazo de Evento</p>
                                    <p class="modalRechazoSuscriptorDescripcion">
                                        Para realizar el rechazo de un evento, favor indicar el motivo por el cual fue rechazado en el
                                        recuadro siguiente. Este será mensaje será enviado al Editor que lo creó.
                                    </p>

                                    <form class="modalRechazoSuscriptorFormulario" action="#">
                                        <textarea id="modalRechazoEventoTextarea" class="form-control modalRechazoSuscriptorTextarea" maxlength="300" placeholder="introduzca el motivo del rechazo"></textarea>
                                        <p id="modalRechazoEventoContador" class="modalRechazoSuscriptorContador">0 / 300 caracteres</p>

                                        <div class="modalRechazoSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoSuscriptorBtnAceptar modalRechazoEventoBtnAceptar px-4">Aceptar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalAprobarPublicarEvento" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <p class="modalEliminarEventoTitulo">¿Aprobar y publicar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al aprobar un evento este se mostrará como público, ¿está seguro que desea continuar con este
                                        proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar modalAprobarEventoBtnAceptar px-4">Aceptar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEventoPublicado" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                            <div class="modal-content modalSuscripcionEnviadaContenido">
                                <div class="modal-body modalSuscripcionEnviadaBody">
                                    <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <p class="modalSuscripcionEnviadaTitulo">Evento Publicado</p>
                                    <p class="modalSuscripcionEnviadaDescripcion">
                                        Se publicó con éxito el evento seleccionado. Para modificar o eliminar este evento puede
                                        realizarlo en la sección del menú principal en <span class="modalSuscripcionEnviadaDescripcionNegrita">Eventos Publicados.</span>
                                    </p>
                                    <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar modalEventoPublicadoBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEditarEventoAdmin" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalRechazoSuscriptorAncho">
                            <div class="modal-content modalRechazoSuscriptorContenido">
                                <div class="modal-body modalRechazoSuscriptorBody">
                                    <p class="modalRechazoSuscriptorTitulo">Editar Evento</p>
                                    <p class="modalRechazoSuscriptorDescripcion">
                                        Modifique los datos necesarios del evento y luego guarde los cambios.
                                    </p>

                                    <div id="modalEditarEventoAdminFormHost" class="modalRechazoSuscriptorFormulario"></div>

                                    <div class="modalRechazoSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                        <button type="button" class="btn modalRechazoSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalRechazoSuscriptorBtnAceptar modalEditarEventoAdminBtnGuardar px-4">Guardar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEventoEditadoAdmin" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                            <div class="modal-content modalSuscripcionEnviadaContenido">
                                <div class="modal-body modalSuscripcionEnviadaBody">
                                    <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <p class="modalSuscripcionEnviadaTitulo">Evento Editado</p>
                                    <p class="modalSuscripcionEnviadaDescripcion">
                                        Se editó con éxito el evento seleccionado.
                                    </p>
                                    <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                
            `,
        },
        'eventos-publicados': {
            title: 'Eventos Publicados',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                            href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Eventos Publicados
                        </li>
                    </ol>
                </nav>
                <div class="container-fluid">
                        <div class="row mt-5">
                            <div class="col-12 buscadorEventosTitle mb-2">
                                <p>Buscador de Eventos</p>
                            </div>
                            <div class="col-12 buscadorEventosSubtitle mb-2">
                                Filtrar por:
                            </div>
                            <div class="col-12 mb-4">
                                <div class="row g-2 align-items-center">
                                    <div class="col-12 col-sm-4 col-md-auto">
                                        <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                            eventos</label>
                                        <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                            aria-label="Tipo de filtro">
                                            <option selected>Título del Evento</option>
                                            <option>Fecha del Evento</option>
                                            <option>Nombre del Editor</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-sm">
                                        <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                            buscar</label>
                                        <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                            type="text" placeholder="Ingrese el dato indicado"
                                            aria-label="Ingrese el dato indicado">
                                    </div>

                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button id="eventosPublicadosLimpiarFiltro" class="btn btn-outline-secondary" type="button" aria-label="Limpiar filtros">
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                <div class="iconoAprobacionEventos">
                                    <i class="fa-solid fa-file-circle-check"></i>
                                </div>
                                <p class="txtAprobacionEventos mb-0">Eventos Publicados</p>
                            </div>
                            <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                <p id="eventosPublicadosConteo">Cargando...</p>
                            </div>
                        </div>
                    </div>

                    <div class="cardsEventosPublicados" id="cardsEventosPublicadosAdmin" class="container-fluid mt-3">

                    </div>

                    <div class="modal fade" id="modalEliminarEventoPublicado" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <div class="modalEliminarEventoIcono" aria-hidden="true">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <p class="modalEliminarEventoTitulo">¿Eliminar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al eliminar un evento publicado lo perderá para siempre, ¿está seguro que desea continuar
                                        con este proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar px-4">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEditarEventoAdmin" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalRechazoSuscriptorAncho">
                            <div class="modal-content modalRechazoSuscriptorContenido">
                                <div class="modal-body modalRechazoSuscriptorBody">
                                    <p class="modalRechazoSuscriptorTitulo">Editar Evento</p>
                                    <p class="modalRechazoSuscriptorDescripcion">
                                        Modifique los datos necesarios del evento y luego guarde los cambios.
                                    </p>

                                    <div id="modalEditarEventoAdminFormHost" class="modalRechazoSuscriptorFormulario"></div>

                                    <div class="modalRechazoSuscriptorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                        <button type="button" class="btn modalRechazoSuscriptorBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalRechazoSuscriptorBtnAceptar modalEditarEventoAdminBtnGuardar px-4">Guardar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEventoEditadoAdmin" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                            <div class="modal-content modalSuscripcionEnviadaContenido">
                                <div class="modal-body modalSuscripcionEnviadaBody">
                                    <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <p class="modalSuscripcionEnviadaTitulo">Evento Editado</p>
                                    <p class="modalSuscripcionEnviadaDescripcion">
                                        Se editó con éxito el evento seleccionado.
                                    </p>
                                    <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar" data-bs-dismiss="modal">Continuar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                
            `,
        },
        'aprobacion-difusion': {
            title: 'Aprobacion Lista de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a class="text-decoration-none"
                                    href="../modulo-admin.html">Inicio</a>
                            </li>
                            <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Aprobación de Listas de Difusión
                            </li>
                        </ol>
                    </nav>

                    <div class="container-fluid">
                        <div class="row mt-4">
                            <div class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-3 mb-4 aprobacionEventosTitle">
                                <div class="iconoAprobacionEventos">
                                    <i class="fa-regular fa-file-lines"></i>
                                </div>
                                <p class="txtAprobacionEventos mb-0">Aprobación Listas de Difusión</p>
                            </div>

                            <div class="col-12 buscadorEventosTitle mt-3 mb-2">
                                <p>Buscador de Listas de Difusión</p>
                            </div>
                            <div class="col-12 buscadorEventosSubtitle mb-2">
                                Filtrar por:
                            </div>
                            <div class="col-12 mb-4">
                                <div class="row g-2 align-items-center">
                                    <div class="col-12 col-sm-4 col-md-auto">
                                        <label class="visually-hidden" for="listasDifusionAdminFiltro">Filtro de
                                            eventos</label>
                                        <select id="listasDifusionAdminFiltro" class="form-select gestionEventosSelect"
                                            aria-label="Tipo de filtro">
                                            <option value="nombre" selected>Nombre de la lista</option>
                                            <option value="fecha">Fecha de creación</option>
                                            <option value="autor">Nombre de creador</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-sm">
                                        <label class="visually-hidden" for="listasDifusionAdminBusqueda">Dato a
                                            buscar</label>
                                        <input id="listasDifusionAdminBusqueda" class="form-control gestionEventosInput"
                                            type="text" placeholder="Ingrese el dato indicado"
                                            aria-label="Ingrese el dato indicado">
                                    </div>

                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button id="listasDifusionAdminBuscarBtn" class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                <p id="aprobacionListasConteo">Cargando...</p>
                            </div>
                        </div>
                    </div>


                    <div id="cardsAprobacionListasDifusionAdmin" class="cardsAprobacionListasDifusion container-fluid mt-3">
                    </div>

                    <div class="modal fade" id="modalListaAprobada" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalSuscripcionEnviadaAncho">
                            <div class="modal-content modalSuscripcionEnviadaContenido">
                                <div class="modal-body modalSuscripcionEnviadaBody">
                                    <div class="modalSuscripcionEnviadaIcono" aria-hidden="true">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <p class="modalSuscripcionEnviadaTitulo">Lista Aprobada</p>
                                    <p class="modalSuscripcionEnviadaDescripcion">
                                        Se aprobó con éxito la lista seleccionada. Para modificar o eliminar esta lista puede
                                        realizarlo en la sección del menú principal en <span
                                            class="modalSuscripcionEnviadaDescripcionNegrita">Listas de Difusión.</span>
                                    </p>
                                    <button type="button" class="btn modalSuscripcionEnviadaBtnContinuar"
                                        data-bs-dismiss="modal">Continuar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalConfirmacionRechazoListaAdministrador" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalRechazoListaAdministradorConfirmacionAncho">
                            <div class="modal-content modalRechazoListaAdministradorConfirmacionContenido">
                                <div class="modal-body modalRechazoListaAdministradorConfirmacionBody">
                                    <p class="modalRechazoListaAdministradorConfirmacionTitulo">¿Rechazar?</p>
                                    <p class="modalRechazoListaAdministradorConfirmacionDescripcion">
                                        Al rechazar una lista de difusión, esta no podrá ser utilizada, ¿está seguro que desea continuar
                                        con este proceso?
                                    </p>
                                    <div class="modalRechazoListaAdministradorConfirmacionAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalRechazoListaAdministradorBtnCancelar px-4"
                                            data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalRechazoListaAdministradorBtnPrincipal px-4">Rechazar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalRechazoListaAdministrador" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalRechazoListaAdministradorAncho">
                            <div class="modal-content modalRechazoListaAdministradorContenido">
                                <div class="modal-body modalRechazoListaAdministradorBody">
                                    <p class="modalRechazoListaAdministradorTitulo">Rechazo de Lista de Difusión</p>
                                    <p class="modalRechazoListaAdministradorDescripcion">
                                        Para realizar el rechazo de una lista de difusión, favor indicar el motivo por el cual fue
                                        rechazada en el siguiente recuadro. Este será mensaje será enviado al Editor que la creó.
                                    </p>

                                    <form class="modalRechazoListaAdministradorFormulario" action="#">
                                        <textarea id="modalRechazoListaAdministradorMotivo" class="form-control modalRechazoListaAdministradorTextarea" maxlength="300"
                                            placeholder="introduzca el motivo del rechazo"></textarea>
                                        <p class="modalRechazoListaAdministradorContador">0 / 300 caracteres</p>

                                        <div class="modalRechazoListaAdministradorAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
                                            <button type="button" class="btn modalRechazoListaAdministradorBtnCancelar px-4"
                                                data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn modalRechazoListaAdministradorBtnPrincipal px-4">Aceptar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEliminarListaDifusion" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <p class="modalEliminarEventoTitulo">¿Eliminar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al eliminar una lista de difusión la perderá para siempre, ¿está seguro que desea continuar con
                                        este proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar px-4">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                            href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Listas de Difusión
                        </li>
                    </ol>
                </nav>
                <div class="container-fluid">
                        <div class="row mt-5">
                            <div class="col-12 buscadorEventosTitle mb-2">
                                <p>Buscador de Listas de Difusión</p>
                            </div>
                            <div class="col-12 buscadorEventosSubtitle mb-2">
                                Filtrar por:
                            </div>
                            <div class="col-12 mb-4">
                                <div class="row g-2 align-items-center">
                                    <div class="col-12 col-sm-4 col-md-auto">
                                        <label class="visually-hidden" for="gestionEventosFiltro">Filtro de
                                            eventos</label>
                                        <select id="gestionEventosFiltro" class="form-select gestionEventosSelect"
                                            aria-label="Tipo de filtro">
                                            <option selected>Nombre de la lista</option>
                                            <option>Fecha de creación</option>
                                            <option>Nombre de creador</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-sm">
                                        <label class="visually-hidden" for="gestionEventosBusqueda">Dato a
                                            buscar</label>
                                        <input id="gestionEventosBusqueda" class="form-control gestionEventosInput"
                                            type="text" placeholder="Ingrese el dato indicado"
                                            aria-label="Ingrese el dato indicado">
                                    </div>

                                    <div class="col-12 col-sm-auto d-grid d-sm-inline-flex">
                                        <button class="btn gestionEventosSearchBtn" type="button" aria-label="Buscar">
                                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="col-12 d-flex justify-content-start align-items-center gap-2 gap-sm-3 mt-4 aprobacionEventosTitle">
                                <div class="iconoAprobacionEventos">
                                    <i class="fa-regular fa-file-lines"></i>
                                </div>
                                <p class="txtAprobacionEventos mb-0">Listas de Difusión</p>
                            </div>
                            <div class="col-12 mt-4 fw-bold d-flex justify-content-end">
                                <p id="listasDifusionAprobadasConteo">Cargando...</p>
                            </div>
                        </div>
                    </div>

                    <div id="cardsListasDifusionAdmin" class="cardsListasDifusion container-fluid mt-3">

                    </div>

                    <div class="modal fade" id="modalEliminarListaDifusion" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
                            <div class="modal-content modalEliminarEventoContenido">
                                <div class="modal-body modalEliminarEventoBody">
                                    <p class="modalEliminarEventoTitulo">¿Eliminar?</p>
                                    <p class="modalEliminarEventoDescripcion">
                                        Al eliminar una lista de difusión la perderá para siempre, ¿está seguro que desea continuar con
                                        este proceso?
                                    </p>
                                    <div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
                                        <button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
                                        <button type="button" class="btn modalEliminarEventoBtnEliminar px-4">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
            `,
        },
        'informe-evento': {
            title: 'Informe por Evento',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Evento
                        </li>
                    </ol>
                </nav>
            `,
        },
        'informe-difusion': {
            title: 'Informe por Lista de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Lista de Difusión
                        </li>
                    </ol>
                </nav>
            
            `,
        },
        'informe-editor': {
            title: 'Informe por Editor',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Editor
                        </li>
                    </ol>
                </nav>
            
            `,
        },
    };

    const getSidebarKey = (link) => link.dataset.sidebarKey || link.textContent.trim();

    const defaultPanelHtml = `
        <p class="gestionAdminPanelText">Selecciona una opcion del menu para ver el contenido.</p>
    `;

    const renderSection = (sidebarKey) => {
        if (!contentPanel) {
            return;
        }

        const section = sectionTemplates[sidebarKey];

        if (!section) {
            contentPanel.innerHTML = defaultPanelHtml;
            return;
        }

        contentPanel.innerHTML = section.html;

        if (sidebarKey === 'aprobacion-eventos') {
            globalThis.initAprobacionEventosAdmin?.();
        }

        if (sidebarKey === 'eventos-publicados') {
            globalThis.initEventosAprobadosAdmin?.();
        }

        if (sidebarKey === 'aprobacion-difusion') {
            listasDifusionPreviewById.clear();
            initAprobacionListasDifusionAdmin();
        }

        if (sidebarKey === 'listas-difusion') {
            listasDifusionPreviewById.clear();
            loadListasDifusionAprobadasAdmin();
        }
    };

    const setActiveLink = (activeLink) => {
        sidebarLinks.forEach((link) => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (activeLink) {
            const activeKeyValue = getSidebarKey(activeLink);
            const activeLabel = activeLink.textContent.trim();

            sidebarLinks.forEach((link) => {
                if (getSidebarKey(link) === activeKeyValue) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });

            if (mobileMenuLabel) {
                mobileMenuLabel.textContent = activeLabel;
            }

            renderSection(activeKeyValue);
            return;
        }

        if (mobileMenuLabel) {
            mobileMenuLabel.textContent = 'Opciones de gestión';
        }

        renderSection(null);
    };

    setActiveLink(null);

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (href === '#') {
                event.preventDefault();
            }

            setActiveLink(link);
        });
    });

    contentPanel?.addEventListener('click', async (event) => {
        const rejectConfirmButton = event.target.closest('#modalConfirmacionRechazoListaAdministrador .modalRechazoListaAdministradorBtnPrincipal');
        const rejectAcceptButton = event.target.closest('#modalRechazoListaAdministrador .modalRechazoListaAdministradorBtnPrincipal');
        const rejectCancelButton = event.target.closest('#modalConfirmacionRechazoListaAdministrador .modalRechazoListaAdministradorBtnCancelar, #modalRechazoListaAdministrador .modalRechazoListaAdministradorBtnCancelar');
        const deleteCancelButton = event.target.closest('#modalEliminarListaDifusion .modalEliminarEventoBtnCancelar');
        const deleteConfirmButton = event.target.closest('#modalEliminarListaDifusion .modalEliminarEventoBtnEliminar');
        const searchButton = event.target.closest('#listasDifusionAdminBuscarBtn');
        const editButton = event.target.closest('.btnEditarListaDifusionAdmin');
        const deleteButton = event.target.closest('.btnEliminarListaDifusionAdmin');
        const approveButton = event.target.closest('.btnAprobarListaDifusionAdmin');
        const rejectButton = event.target.closest('.btnRechazarListaDifusionAdmin');

        if (searchButton) {
            applyListasDifusionAdminFilters();
            return;
        }

        if (editButton) {
            const listaId = editButton.dataset.listaId;
            const lista = listasDifusionPreviewById.get(String(listaId));

            if (!lista) {
                globalThis.alert('No se encontró la lista para editar.');
                return;
            }

            openEditListaDifusionModalAdmin(lista);
            return;
        }

        if (deleteButton) {
            const listaId = deleteButton.dataset.listaId;

            if (!listaId) {
                return;
            }

            showModalEliminarListaDifusion(listaId);

            return;
        }

        if (deleteCancelButton) {
            pendingDeleteListaId = null;
            return;
        }

        if (deleteConfirmButton) {
            if (!pendingDeleteListaId) {
                return;
            }

            deleteConfirmButton.disabled = true;

            try {
                await deleteListaDifusionAdmin(pendingDeleteListaId);
                listasDifusionPreviewById.delete(String(pendingDeleteListaId));
                hideModalEliminarListaDifusion();
                pendingDeleteListaId = null;
                await loadAprobacionListasDifusionAdmin();
                await loadListasDifusionAprobadasAdmin();
            } catch (error) {
                globalThis.alert(error.message || 'No se pudo eliminar la lista.');
            } finally {
                deleteConfirmButton.disabled = false;
            }

            return;
        }

        if (rejectCancelButton) {
            const cancelledFromConfirmModal = Boolean(event.target.closest('#modalConfirmacionRechazoListaAdministrador .modalRechazoListaAdministradorBtnCancelar'));

            if (cancelledFromConfirmModal) {
                pendingRejectListaId = null;
            }
            return;
        }

        if (rejectConfirmButton) {
            hideModalConfirmacionRechazoLista();
            showModalMotivoRechazoLista();
            return;
        }

        if (rejectAcceptButton) {
            const motivoTextarea = contentPanel?.querySelector('#modalRechazoListaAdministradorMotivo');
            const motivoRechazo = motivoTextarea instanceof HTMLTextAreaElement ? motivoTextarea.value.trim() : '';

            if (!pendingRejectListaId) {
                return;
            }

            if (!motivoRechazo) {
                if (motivoTextarea instanceof HTMLTextAreaElement) {
                    motivoTextarea.classList.add('is-invalid');
                    motivoTextarea.focus();
                }
                return;
            }

            rejectAcceptButton.disabled = true;

            try {
                await updateListaDifusionStatus(pendingRejectListaId, 'rechazada', motivoRechazo);
                hideModalMotivoRechazoLista();
                pendingRejectListaId = null;
                await loadAprobacionListasDifusionAdmin();
            } catch (error) {
                globalThis.alert(error.message || 'No se pudo rechazar la lista.');
            } finally {
                rejectAcceptButton.disabled = false;
            }

            return;
        }

        if (!approveButton && !rejectButton) {
            return;
        }

        const triggerButton = approveButton || rejectButton;
        const listaId = triggerButton?.dataset?.listaId;

        if (!listaId) {
            return;
        }

        triggerButton.disabled = true;

        try {
            if (approveButton) {
                await updateListaDifusionStatus(listaId, 'aprobada');
                await loadAprobacionListasDifusionAdmin();
                showModalListaAprobada();
            } else {
                showModalConfirmacionRechazoLista(listaId);
            }
        } catch (error) {
            globalThis.alert(error.message || 'No se pudo actualizar la lista.');
        } finally {
            triggerButton.disabled = false;
        }
    });

    document.addEventListener('submit', async (event) => {
        const editForm = event.target;

        if (!(editForm instanceof HTMLFormElement) || editForm.id !== 'formEditarListaDifusionAdmin') {
            return;
        }

        event.preventDefault();

        const idInput = editForm.querySelector('#editarListaAdminId');
        const nombreInput = editForm.querySelector('#editarNombreListaAdmin');
        const descripcionInput = editForm.querySelector('#editarDescripcionListaAdmin');
        const submitButton = editForm.querySelector('button[type="submit"]');

        if (!(idInput instanceof HTMLInputElement)
            || !(nombreInput instanceof HTMLInputElement)
            || !(descripcionInput instanceof HTMLTextAreaElement)
            || !(submitButton instanceof HTMLButtonElement)) {
            return;
        }

        if (!validateEditListaDifusionAdminFields(nombreInput, descripcionInput)) {
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(`/api/lista-difusion/${encodeURIComponent(idInput.value)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreLista: nombreInput.value.trim(),
                    descripcionLista: descripcionInput.value.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(data?.mensaje || 'No fue posible actualizar la lista de difusión.');
            }

            closeEditListaDifusionModalAdmin();
            await loadAprobacionListasDifusionAdmin();
            await loadListasDifusionAprobadasAdmin();
        } catch (error) {
            globalThis.alert(error.message || 'Ocurrió un error al actualizar la lista.');
        } finally {
            submitButton.disabled = false;
        }
    });

    contentPanel?.addEventListener('keydown', (event) => {
        const searchInput = event.target.closest('#listasDifusionAdminBusqueda');

        if (!searchInput || event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        applyListasDifusionAdminFilters();
    });
});