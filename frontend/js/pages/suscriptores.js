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
        correo: suscriptor?.correoElectronico || 'No disponible',
        fecha: formatearFecha(suscriptor?.createdAt),
        motivo: suscriptor?.motivoRechazo || '',
    });

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
