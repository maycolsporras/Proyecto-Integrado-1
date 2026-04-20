function initConsultasEditor() {
    const contentPanel = document.getElementById('gestionEditorContentPanel');
    const statusButtons = contentPanel?.querySelectorAll('.consultasTabs .btnListasDifusionEdit[data-status]');
    const cardsContainer = contentPanel?.querySelector('#cardsConsultasEditor');
    const filtroSelect = contentPanel?.querySelector('#gestionEventosFiltro');
    const busquedaInput = contentPanel?.querySelector('#gestionEventosBusqueda');
    const searchButton = contentPanel?.querySelector('.gestionEventosSearchBtn');
    const conteo = contentPanel?.querySelector('#consultasEditorConteo');
    const modalRespuestaConsultaElement = document.getElementById('modalRespuestaConsulta');
    const modalRespuestaEnviadaElement = document.getElementById('modalRespuestaEnviada');
    const modalRespuestaTextarea = modalRespuestaConsultaElement?.querySelector('.modalRespuestaConsultaTextarea');
    const modalRespuestaDescripcion = modalRespuestaConsultaElement?.querySelector('.modalRespuestaConsultaDescripcion');
    const modalRespuestaBtnAceptar = modalRespuestaConsultaElement?.querySelector('.modalRespuestaConsultaBtnAceptar');

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

    let consultaPendienteSeleccionada = null;

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

    const getAutorConsulta = (consulta) => {
        const correo = String(consulta?.correoElectronico || '').trim();

        if (!correo || !correo.includes('@')) {
            return 'Usuario';
        }

        const alias = correo.split('@')[0] || '';
        const aliasLimpio = alias.replaceAll(/[._-]+/g, ' ').trim();

        if (!aliasLimpio) {
            return correo;
        }

        return aliasLimpio
            .split(' ')
            .filter(Boolean)
            .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
            .join(' ');
    };

    const agruparConsultasPorEvento = (consultas) => {
        const grupos = new Map();

        consultas.forEach((consulta) => {
            const key = consulta.idEvento || `sin-evento-${consulta.id}`;

            if (!grupos.has(key)) {
                grupos.set(key, {
                    idEvento: key,
                    tituloEvento: consulta.tituloEvento,
                    organizador: consulta.organizador,
                    fechaEventoTexto: consulta.fechaEventoTexto,
                    consultas: [],
                });
            }

            grupos.get(key).consultas.push(consulta);
        });

        return [...grupos.values()];
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

        const grupos = agruparConsultasPorEvento(consultasFiltradas);

        cardsContainer.innerHTML = grupos.map((grupo) => {
            const titulo = escapeHtml(grupo.tituloEvento || 'Evento sin titulo');
            const organizador = escapeHtml(grupo.organizador || 'Sin organizador');
            const fechaEvento = escapeHtml(grupo.fechaEventoTexto || 'N/A');

            const filasConsultas = grupo.consultas.map((consulta) => {
                const id = escapeHtml(consulta.id);
                const fechaConsulta = escapeHtml(consulta.fechaConsulta || 'N/A');
                const fechaRespuesta = escapeHtml(consulta.fechaRespuesta || 'N/A');
                const autorConsulta = escapeHtml(getAutorConsulta(consulta));
                const pregunta = escapeHtml(consulta.pregunta || 'Sin consulta registrada.');
                const respuesta = escapeHtml(consulta.respuesta || 'Pendiente de respuesta.');

                if (consultasState.statusActual === 'resueltas') {
                    return `
                        <tr class="consultasEventoConsultaRow consultasEventoConsultaResueltaRow">
                            <td colspan="2">
                                <p class="mb-1"><strong>Fecha de la consulta:</strong> ${fechaConsulta}</p>
                                <p class="mb-1"><strong>Autor:</strong> ${autorConsulta}</p>
                                <p class="mb-1"><strong>Consulta:</strong></p>
                                <p class="mb-0">${pregunta}</p>

                                <div class="consultasRespuestaBloque">
                                    <p class="mb-1"><strong>Respuesta enviada:</strong></p>
                                    <p class="mb-1"><strong>Fecha de envío de la respuesta:</strong> ${fechaRespuesta}</p>
                                    <p class="mb-0">${respuesta || 'Sin respuesta registrada.'}</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }

                return `
                    <tr class="consultasEventoConsultaRow">
                        <td>
                            <p class="mb-1"><strong>Fecha de la consulta:</strong> ${fechaConsulta}</p>
                            <p class="mb-1"><strong>Autor:</strong> ${autorConsulta}</p>
                            <p class="mb-1"><strong>Consulta:</strong></p>
                            <p class="mb-0">${pregunta}</p>
                        </td>
                        <td class="consultasEventoAccionCell">
                            <button class="btn consultasResponderBtn" type="button" data-consulta-accion="responder" data-consulta-id="${id}">
                                <i class="fa-regular fa-paper-plane me-1" aria-hidden="true"></i>Responder
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            return `
                <section class="consultasEventoGrupo" aria-label="Consultas del evento ${titulo}">
                    <table class="table consultasEventoTabla mb-0">
                        <tbody>
                            <tr class="consultasEventoInfoRow">
                                <td colspan="2">
                                    <p class="consultasEventoTitulo mb-1">Evento: ${titulo}</p>
                                    <p class="consultasEventoMeta mb-1"><strong>Fecha del Evento:</strong> ${fechaEvento}</p>
                                    <p class="consultasEventoMeta mb-0"><strong>Organizador:</strong> ${organizador}</p>
                                </td>
                            </tr>
                            ${filasConsultas}
                        </tbody>
                    </table>
                </section>
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
            idEvento: String(evento?._id || ''),
            tituloEvento: String(evento?.nombreEvento || 'Evento sin título'),
            organizador: String(evento?.contacto?.nombreCompleto || 'Editor de eventos'),
            fechaEventoTexto: formatFecha(fechaEvento),
            pregunta: String(consulta?.consulta || ''),
            respuesta: String(consulta?.respuesta || ''),
            fechaRespuesta: formatFecha(consulta?.fechaRespuesta),
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

        if (action === 'responder') {
            const consulta = consultasByStatus.pendientes
                .find((item) => String(item.id) === String(consultaId));

            if (!consulta || !modalRespuestaConsultaElement || !modalRespuestaTextarea) {
                return;
            }

            consultaPendienteSeleccionada = consulta;
            modalRespuestaTextarea.value = '';

            if (modalRespuestaDescripcion) {
                modalRespuestaDescripcion.textContent = `Para resolver la consulta del usuario, favor escriba en el siguiente recuadro. Este mensaje sera enviado al autor de la consulta. Evento: ${consulta.tituloEvento}. Autor: ${getAutorConsulta(consulta)}.`;
            }

            const modalRespuestaConsulta = bootstrap.Modal.getOrCreateInstance(modalRespuestaConsultaElement);
            modalRespuestaConsulta.show();
        }
    });

    modalRespuestaBtnAceptar?.addEventListener('click', async () => {
        const consulta = consultaPendienteSeleccionada;
        const respuesta = modalRespuestaTextarea?.value?.trim() || '';

        if (!consulta?.id) {
            return;
        }

        if (!respuesta) {
            globalThis.alert('Debe escribir una respuesta antes de enviar.');
            modalRespuestaTextarea?.focus();
            return;
        }

        modalRespuestaBtnAceptar.disabled = true;

        try {
            const response = await fetch(`/api/consulta-eventos/${encodeURIComponent(consulta.id)}/respuesta`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ respuesta }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload?.ok) {
                throw new Error(payload?.mensaje || 'No se pudo responder la consulta.');
            }

            const modalRespuestaConsulta = bootstrap.Modal.getOrCreateInstance(modalRespuestaConsultaElement);
            modalRespuestaConsulta.hide();

            if (modalRespuestaEnviadaElement) {
                const modalRespuestaEnviada = bootstrap.Modal.getOrCreateInstance(modalRespuestaEnviadaElement);
                modalRespuestaEnviada.show();
            }

            await cargarConsultas();
            consultasState.statusActual = 'pendientes';
            statusButtons.forEach((btn) => {
                btn.classList.toggle('is-active', btn.dataset.status === 'pendientes');
            });
            renderConsultas();

            consultaPendienteSeleccionada = null;
        } catch (error) {
            globalThis.alert(error.message || 'No se pudo responder la consulta.');
        } finally {
            modalRespuestaBtnAceptar.disabled = false;
        }
    });

    modalRespuestaConsultaElement?.addEventListener('hidden.bs.modal', () => {
        if (modalRespuestaTextarea) {
            modalRespuestaTextarea.value = '';
        }

        consultaPendienteSeleccionada = null;
    });

    cargarConsultas();
}

globalThis.initConsultasEditor = initConsultasEditor;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsultasEditor);
} else {
    initConsultasEditor();
}
