function initConsultasEditor() {
    const contentPanel = document.getElementById('gestionEditorContentPanel');
    const statusButtons = contentPanel?.querySelectorAll('.consultasTabs .btnListasDifusionEdit[data-status]');
    const cardsContainer = contentPanel?.querySelector('#cardsConsultasEditor');
    const filtroSelect = contentPanel?.querySelector('#gestionEventosFiltro');
    const busquedaInput = contentPanel?.querySelector('#gestionEventosBusqueda');
    const searchButton = contentPanel?.querySelector('.gestionEventosSearchBtn');
    const conteo = contentPanel?.querySelector('#consultasEditorConteo');

    if (!statusButtons?.length || !cardsContainer) {
        return;
    }

    if (cardsContainer.dataset.consultasInitialized === 'true') {
        return;
    }

    cardsContainer.dataset.consultasInitialized = 'true';

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

    const parseFechaEvento = (fecha) => {
        if (!fecha) {
            return null;
        }

        if (typeof fecha === 'string') {
            const parsed = new Date(fecha);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const anio = Number.parseInt(fecha.anio, 10);
        const mes = Number.parseInt(fecha.mes, 10);
        const dia = Number.parseInt(fecha.dia, 10);

        if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
            const parsed = new Date(anio, mes - 1, dia);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        if (fecha.iso) {
            const parsed = new Date(fecha.iso);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        return null;
    };

    const formatFecha = (fecha) => {
        const parsed = parseFechaEvento(fecha);

        if (!parsed) {
            return 'N/A';
        }

        return parsed.toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const consultasState = {
        filtroSeleccionado: 'Título de Eventos',
        filtroTexto: '',
        statusActual: 'resueltas',
        loading: false,
    };

    const consultasByStatus = {
        resueltas: [],
        pendientes: [],
    };

    const statusLabelMap = {
        resueltas: 'consultas resueltas',
        pendientes: 'consultas pendientes',
    };

    const normalizarEstadoConsulta = (estadoRaw) => {
        const estado = normalizarTexto(estadoRaw).replaceAll('_', ' ');

        if (
            estado === 'consulta respondida'
            || estado === 'consulta respondidas'
            || estado === 'consulta respondido'
            || estado === 'resuelta'
            || estado === 'resueltas'
            || estado === 'respondida'
            || estado === 'respondidas'
        ) {
            return 'resueltas';
        }

        return 'pendientes';
    };

    const getFilterValue = (consulta, filtroSeleccionado) => {
        if (filtroSeleccionado === 'Organizador') {
            return consulta.organizador;
        }

        if (filtroSeleccionado === 'Fecha del Evento') {
            return consulta.fechaEventoTexto;
        }

        return consulta.tituloEvento;
    };

    const getResumenConteo = (total) => {
        if (!Number.isFinite(total) || total <= 0) {
            return '0-0 de 0';
        }

        return `1-${Math.min(total, 20)} de ${total}`;
    };

    const aplicarFiltrosConsultas = (consultas) => {
        const filtroSeleccionado = filtroSelect?.value || consultasState.filtroSeleccionado || 'Título de Eventos';
        consultasState.filtroSeleccionado = filtroSeleccionado;

        const termino = normalizarTexto(consultasState.filtroTexto);

        const ordenadas = [...consultas].sort((a, b) => {
            const valorA = normalizarTexto(getFilterValue(a, filtroSeleccionado));
            const valorB = normalizarTexto(getFilterValue(b, filtroSeleccionado));
            return valorA.localeCompare(valorB, 'es', { sensitivity: 'base' });
        });

        if (!termino) {
            return ordenadas;
        }

        return ordenadas.filter((consulta) => {
            const valor = normalizarTexto(getFilterValue(consulta, filtroSeleccionado));
            return valor.includes(termino);
        });
    };

    const renderConsultas = () => {
        const consultasEstado = consultasByStatus[consultasState.statusActual] || [];
        const consultasFiltradas = aplicarFiltrosConsultas(consultasEstado);

        if (conteo) {
            conteo.textContent = getResumenConteo(consultasFiltradas.length);
        }

        if (!consultasFiltradas.length) {
            cardsContainer.innerHTML = `
                <div class="row mt-3">
                    <div class="col-12">
                        <p class="text-muted mb-0">No hay ${statusLabelMap[consultasState.statusActual] || 'consultas'} para mostrar.</p>
                    </div>
                </div>
            `;
            return;
        }

        cardsContainer.innerHTML = consultasFiltradas.map((consulta) => {
            const id = escapeHtml(consulta.id);
            const titulo = escapeHtml(consulta.tituloEvento);
            const organizador = escapeHtml(consulta.organizador || 'Sin organizador');
            const fechaEvento = escapeHtml(consulta.fechaEventoTexto || 'N/A');
            const pregunta = escapeHtml(consulta.pregunta || 'Sin consulta registrada.');
            const respuesta = escapeHtml(consulta.respuesta || 'Pendiente de respuesta.');

            return `
                <div class="row border-bottom border-1 border-secondary-subtle py-3">
                    <div class="col-12">
                        <div class="eventoCardPublicada d-flex flex-column gap-2 p-3" aria-label="Consulta de evento">
                            <div>
                                <p class="eventoCardPublicadaTitulo fw-bold mb-1">${titulo}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Organizador:</span> ${organizador}</p>
                                <p class="eventoCardPublicadaMeta mb-1"><span>Fecha del evento:</span> ${fechaEvento}</p>
                            </div>

                            <div>
                                <p class="mb-1"><strong>Consulta:</strong> ${pregunta}</p>
                                <p class="mb-0"><strong>Respuesta:</strong> ${respuesta}</p>
                            </div>

                            <div class="d-flex flex-wrap gap-2 justify-content-end mt-2">
                                <button class="btn btn-sm btn-outline-secondary" type="button" data-consulta-accion="ver" data-consulta-id="${id}">
                                    Ver detalle
                                </button>
                                ${consulta.status === 'pendientes' ? `
                                    <button class="btn btn-sm btn-primary" type="button" data-consulta-accion="resolver" data-consulta-id="${id}">
                                        Marcar como resuelta
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const mapConsultaBackend = (consulta) => {
        const evento = consulta?.eventoId || {};
        const fechaEvento = Array.isArray(evento?.fechasEvento) && evento.fechasEvento.length
            ? evento.fechasEvento[0]
            : evento?.fechaPublicacion;

        return {
            id: String(consulta?._id || ''),
            tituloEvento: String(evento?.nombreEvento || 'Evento sin título'),
            organizador: String(evento?.contacto?.nombreCompleto || 'Editor de eventos'),
            fechaEventoTexto: formatFecha(fechaEvento),
            pregunta: String(consulta?.consulta || ''),
            respuesta: String(consulta?.respuesta || ''),
            correoElectronico: String(consulta?.correoElectronico || ''),
            fechaConsulta: formatFecha(consulta?.createdAt),
            status: normalizarEstadoConsulta(consulta?.estado),
        };
    };

    const hydrateConsultasByStatus = (consultas) => {
        consultasByStatus.resueltas = consultas.filter((consulta) => consulta.status === 'resueltas');
        consultasByStatus.pendientes = consultas.filter((consulta) => consulta.status === 'pendientes');
    };

    const cargarConsultas = async () => {
        if (consultasState.loading) {
            return;
        }

        consultasState.loading = true;
        cardsContainer.innerHTML = '<p class="text-muted">Cargando consultas...</p>';

        try {
            const response = await fetch('/api/consulta-eventos');

            if (!response.ok) {
                throw new Error('No se pudieron cargar las consultas.');
            }

            const data = await response.json();
            const consultas = Array.isArray(data?.consultas)
                ? data.consultas.map(mapConsultaBackend)
                : [];

            hydrateConsultasByStatus(consultas);

            renderConsultas();
        } catch (error) {
            console.error('Error al cargar consultas:', error);
            hydrateConsultasByStatus([]);
            renderConsultas();
        } finally {
            consultasState.loading = false;
        }
    };

    statusButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const nuevoStatus = button.dataset.status;

            if (!nuevoStatus || nuevoStatus === consultasState.statusActual) {
                return;
            }

            consultasState.statusActual = nuevoStatus;

            statusButtons.forEach((btn) => {
                btn.classList.remove('is-active');
            });

            button.classList.add('is-active');
            renderConsultas();
        });
    });

    filtroSelect?.addEventListener('change', () => {
        consultasState.filtroSeleccionado = filtroSelect.value || 'Título de Eventos';
        renderConsultas();
    });

    busquedaInput?.addEventListener('input', () => {
        consultasState.filtroTexto = busquedaInput.value || '';
        renderConsultas();
    });

    searchButton?.addEventListener('click', () => {
        consultasState.filtroTexto = busquedaInput?.value || '';
        renderConsultas();
    });

    cardsContainer.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-consulta-accion]');

        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.consultaAccion;
        const consultaId = actionButton.dataset.consultaId;

        if (!consultaId) {
            return;
        }

        if (action === 'ver') {
            const consulta = [...consultasByStatus.resueltas, ...consultasByStatus.pendientes]
                .find((item) => String(item.id) === String(consultaId));

            if (!consulta) {
                return;
            }

            const detalle = [
                `Evento: ${consulta.tituloEvento}`,
                `Organizador: ${consulta.organizador}`,
                `Fecha: ${consulta.fechaEventoTexto}`,
                `Correo: ${consulta.correoElectronico || 'No disponible'}`,
                `Fecha de consulta: ${consulta.fechaConsulta || 'N/A'}`,
                `Consulta: ${consulta.pregunta}`,
                `Respuesta: ${consulta.respuesta || 'Pendiente de respuesta.'}`,
            ].join('\n');

            globalThis.alert(detalle);
            return;
        }

        if (action === 'resolver') {
            const indexPendiente = consultasByStatus.pendientes
                .findIndex((item) => String(item.id) === String(consultaId));

            if (indexPendiente < 0) {
                return;
            }

            const respuesta = globalThis.prompt('Ingrese la respuesta para esta consulta:');

            if (!respuesta || !respuesta.trim()) {
                return;
            }

            actionButton.disabled = true;

            fetch(`/api/consulta-eventos/${encodeURIComponent(consultaId)}/respuesta`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ respuesta: respuesta.trim() }),
            })
                .then((response) => response.json().catch(() => ({})).then((payload) => ({ response, payload })))
                .then(({ response, payload }) => {
                    if (!response.ok || !payload?.ok) {
                        throw new Error(payload?.mensaje || 'No se pudo responder la consulta.');
                    }

                    return cargarConsultas();
                })
                .then(() => {
                    consultasState.statusActual = 'resueltas';
                    statusButtons.forEach((btn) => {
                        btn.classList.toggle('is-active', btn.dataset.status === 'resueltas');
                    });
                })
                .catch((error) => {
                    globalThis.alert(error.message || 'No se pudo responder la consulta.');
                })
                .finally(() => {
                    actionButton.disabled = false;
                });
        }
    });

    cargarConsultas();
}

globalThis.initConsultasEditor = initConsultasEditor;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsultasEditor);
} else {
    initConsultasEditor();
}
