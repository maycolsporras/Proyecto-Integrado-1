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
        edicion: [
            {
                id: 'sus-ap-1',
                nombre: 'María Fernanda Rojas',
                oficio: 'Docente',
                lista: 'Accesibilidad Cultural',
                correo: 'maria.rojas@example.com',
                fecha: '12/03/2026',
            },
            {
                id: 'sus-ap-2',
                nombre: 'Carlos Méndez',
                oficio: 'Psicólogo',
                lista: 'Apoyo Comunitario',
                correo: 'carlos.mendez@example.com',
                fecha: '19/03/2026',
            },
            {
                id: 'sus-ap-3',
                nombre: 'Andrea Solano',
                oficio: 'Terapeuta ocupacional',
                lista: 'Salud y Bienestar',
                correo: 'andrea.solano@example.com',
                fecha: '24/03/2026',
            },
        ],
        pendiente: [
            {
                id: 'sus-pe-1',
                nombre: 'José Luis Vargas',
                oficio: 'Estudiante',
                lista: 'Voluntariado Juvenil',
                correo: 'jose.vargas@example.com',
                fecha: '27/03/2026',
            },
            {
                id: 'sus-pe-2',
                nombre: 'Patricia Herrera',
                oficio: 'Trabajadora social',
                lista: 'Inclusión Laboral',
                correo: 'patricia.herrera@example.com',
                fecha: '29/03/2026',
            },
        ],
        rechazado: [
            {
                id: 'sus-re-1',
                nombre: 'Luis Alberto Chaves',
                oficio: 'Empresario',
                lista: 'Accesibilidad Cultural',
                correo: 'luis.chaves@example.com',
                fecha: '01/04/2026',
                motivo: 'No completó los datos mínimos requeridos para validar la suscripción.',
            },
            {
                id: 'sus-re-2',
                nombre: 'Diana Salas',
                oficio: 'Asistente administrativa',
                lista: 'Apoyo Comunitario',
                correo: 'diana.salas@example.com',
                fecha: '03/04/2026',
                motivo: 'La información enviada no coincide con el perfil registrado en la lista.',
            },
        ],
    };

    const suscriptoresState = {
        filtroSeleccionado: 'Nombre del Suscriptor',
        filtroTexto: '',
        statusActual: 'edicion',
    };

    const statusLabelMap = {
        edicion: 'aprobados',
        pendiente: 'pendientes de aprobación',
        rechazado: 'rechazados',
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
                                <span class="badge text-bg-secondary text-uppercase">${escapeHtml(suscriptoresState.statusActual)}</span>
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
            renderSuscriptores();
        });

        button.dataset.suscriptoresBound = 'true';
    });

    const initialButton = contentPanel.querySelector('.btnListasDifusionEdit.is-active[data-status]') || statusButtons[0];

    if (!initialButton) {
        return;
    }

    suscriptoresState.statusActual = initialButton.dataset.status || 'edicion';
    setActiveButton(initialButton);
    renderSuscriptores();
}

globalThis.initSuscriptoresEditor = initSuscriptoresEditor;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuscriptoresEditor);
} else {
    initSuscriptoresEditor();
}
