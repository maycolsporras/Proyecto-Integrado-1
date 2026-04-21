// Administra los eventos guardados como borrador
function initEventoBorrador() {
	const statusButtons = document.querySelectorAll('.btnEventosBorrador[data-status]');
	const cardsContainer = document.getElementById('cardsEventosBorradorEditor');

	if (!statusButtons.length || !cardsContainer) {
		return;
	}

	if (cardsContainer.dataset.eventoBorradorInitialized === 'true') {
		return;
	}

	cardsContainer.dataset.eventoBorradorInitialized = 'true';

	const dataByStatus = {
		edicion: [],
		pendiente: [],
		rechazado: [],
	};

	let activeStatus = 'edicion';
	let pendingEditItem = null;
	let pendingEditEventData = null;
	let editorEditFormTemplateCache = '';

	const getModalInstanceById = (modalId) => {
		const modalElement = document.getElementById(modalId);

		if (!modalElement || !globalThis.bootstrap?.Modal) {
			return null;
		}

		return globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);
	};

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

	const parseValidDate = (rawDate) => {
		const date = new Date(rawDate);
		return Number.isNaN(date.getTime()) ? null : date;
	};

	const parseFechaFromParts = (fecha) => {
		const anio = Number.parseInt(fecha?.anio, 10);
		const mes = Number.parseInt(fecha?.mes, 10);
		const dia = Number.parseInt(fecha?.dia, 10);

		if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) {
			return null;
		}

		return parseValidDate(new Date(anio, mes - 1, dia));
	};

	const parseFecha = (fecha) => {
		if (!fecha) {
			return null;
		}

		if (typeof fecha === 'string') {
			return parseValidDate(fecha);
		}

		if (typeof fecha !== 'object') {
			return null;
		}

		return parseFechaFromParts(fecha) || parseValidDate(fecha.iso);
	};

	const formatFecha = (fecha) => {
		const parsedDate = parseFecha(fecha);

		if (!parsedDate) {
			return 'N/A';
		}

		return parsedDate.toLocaleDateString('es-CR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	const extractDraftTitle = (snapshot) => {
		if (!Array.isArray(snapshot)) {
			return 'Nombre no proporcionado';
		}

		const fieldByIndex = snapshot[3];
		if (fieldByIndex?.kind === 'value') {
			const directName = String(fieldByIndex.value || '').trim();
			if (directName) {
				return directName;
			}
		}

		const candidate = snapshot.find((item) => {
			if (item?.kind !== 'value') {
				return false;
			}

			const value = String(item.value || '').trim();
			if (!value) {
				return false;
			}

			if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value)) {
				return false;
			}

			if (value.includes('://') || value.includes('@')) {
				return false;
			}

			return true;
		});

		return candidate?.value?.trim() || 'Nombre no proporcionado';
	};

	const mapDraftToCard = (draft) => {
		return {
			id: draft?.draftKey || draft?._id || '',
			source: 'borrador',
			titulo: extractDraftTitle(draft?.snapshot),
			fechaCreacion: draft?.createdAt,
			fechaPublicacion: draft?.updatedAt,
		};
	};

	const mapEventoToCard = (evento) => {
		return {
			id: evento?._id || '',
			source: 'evento',
			titulo: evento?.nombreEvento || 'Sin título',
			fechaCreacion: evento?.createdAt,
			fechaPublicacion: evento?.fechaPublicacion || evento?.updatedAt,
			motivoRechazo: evento?.motivoRechazo || '',
		};
	};

	const renderStatusCards = (status) => {
		const cards = dataByStatus[status] || [];

		if (!cards.length) {
			cardsContainer.innerHTML = `
				<div class="row mt-3">
					<div class="col-12">
						<p class="text-muted">No hay eventos para esta categoría.</p>
					</div>
				</div>
			`;
			return;
		}

		cardsContainer.innerHTML = cards.map((card) => {
			const titulo = escapeHtml(card.titulo);
			const fechaCreacion = formatFecha(card.fechaCreacion);
			const fechaPublicacion = formatFecha(card.fechaPublicacion);
			const id = escapeHtml(card.id);
			const source = escapeHtml(card.source);
			const showAnotacionesBtn = status === 'rechazado'
				? `<button class="btn btn-outline-secondary btn-sm me-2" type="button" aria-label="Ver anotaciones" data-accion="ver-anotaciones" data-id="${id}" data-source="${source}">Ver anotaciones</button>`
				: '';

			return `
				<div class="row border-bottom border-1 border-secondary-subtle">
					<div class="col-12">
						<div class="eventoCardPublicada d-flex justify-content-between p-3" aria-label="Evento editor">
							<div class="eventoCardPublicadaHeader ms-5">
								<p class="eventoCardPublicadaTitulo fw-bold">${titulo}</p>
								<p class="eventoCardPublicadaMeta"><span>Fecha de creación:</span> ${fechaCreacion}</p>
								<p class="eventoCardPublicadaMeta"><span>Fecha de publicación:</span> ${fechaPublicacion}</p>
							</div>

							<div class="eventoCardPublicadaAcciones mt-3" aria-label="Acciones del evento">
								${showAnotacionesBtn}
								<button class="btn eventoCardBtnIcon" type="button" aria-label="Ver evento" data-accion="ver" data-id="${id}" data-source="${source}">
									<i class="fa-regular fa-eye" aria-hidden="true"></i>
								</button>
								<button class="btn eventoCardBtnIcon" type="button" aria-label="Editar evento" data-accion="editar" data-id="${id}" data-source="${source}">
									<i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
								</button>
								<button class="btn eventoCardBtnIcon" type="button" aria-label="Eliminar evento" data-accion="eliminar" data-id="${id}" data-source="${source}">
									<i class="fa-regular fa-trash-can" aria-hidden="true"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			`;
		}).join('');
	};

	const setActiveButton = (button) => {
		statusButtons.forEach((btn) => {
			btn.classList.remove('is-active');
		});

		button.classList.add('is-active');
	};

	const loadBorradoresEdicion = async () => {
		const response = await fetch('/api/form-borrador?estado=borrador&estadoVigencia=activo');
		if (!response.ok) {
			throw new Error('No se pudieron cargar los borradores en edición.');
		}

		const data = await response.json();
		const borradores = Array.isArray(data?.borradores) ? data.borradores : [];
		return borradores.map(mapDraftToCard);
	};

	const loadEventosPendientes = async () => {
		const response = await fetch('/api/form-evento?estado=pendiente_aprobacion');
		if (!response.ok) {
			throw new Error('No se pudieron cargar los eventos pendientes.');
		}

		const data = await response.json();
		const eventos = Array.isArray(data?.eventos) ? data.eventos : [];
		return eventos.map(mapEventoToCard);
	};

	const loadEventosRechazados = async () => {
		const response = await fetch('/api/form-evento?estado=rechazado');
		if (!response.ok) {
			throw new Error('No se pudieron cargar los eventos rechazados.');
		}

		const data = await response.json();
		const eventos = Array.isArray(data?.eventos) ? data.eventos : [];
		return eventos.map(mapEventoToCard);
	};

	const loadAllStatusData = async () => {
		cardsContainer.innerHTML = `
			<div class="row mt-3">
				<div class="col-12">
					<p class="text-muted">Cargando eventos...</p>
				</div>
			</div>
		`;

		const [edicion, pendiente, rechazado] = await Promise.all([
			loadBorradoresEdicion(),
			loadEventosPendientes(),
			loadEventosRechazados(),
		]);

		dataByStatus.edicion = edicion;
		dataByStatus.pendiente = pendiente;
		dataByStatus.rechazado = rechazado;
	};

	const removeCardFromCurrentStatus = (id) => {
		dataByStatus[activeStatus] = (dataByStatus[activeStatus] || []).filter((item) => item.id !== id);
		renderStatusCards(activeStatus);
	};

	const openRechazoAnotacionesModal = (id) => {
		const motivoElement = document.getElementById('modalRechazoEventoMotivo');
		const modalInstance = getModalInstanceById('modalRechazoEventoAnotaciones');

		if (!motivoElement || !modalInstance) {
			return;
		}

		const rejectedCard = (dataByStatus.rechazado || []).find((item) => item.id === id);
		const motivo = rejectedCard?.motivoRechazo?.trim() || 'No se incluyeron anotaciones para este rechazo.';

		motivoElement.textContent = motivo;
		modalInstance.show();
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

	const applySnapshotToEditorField = (field, fieldSnapshot) => {
		if (!field || !fieldSnapshot) {
			return;
		}

		if (fieldSnapshot.kind === 'contenteditable' && field.getAttribute('contenteditable') === 'true') {
			field.innerHTML = fieldSnapshot.html || '';
			return;
		}

		if (fieldSnapshot.kind === 'checkable' && (field.type === 'checkbox' || field.type === 'radio')) {
			field.checked = Boolean(fieldSnapshot.checked);
			return;
		}

		if (fieldSnapshot.kind === 'file' && field.type === 'file') {
			const fileNameEl = field.closest('.ceFileInput')?.querySelector('.ceFileName');
			if (fileNameEl) {
				fileNameEl.textContent = fieldSnapshot.fileName || 'Adjuntar Documento';
			}
			return;
		}

		if ('value' in field && fieldSnapshot.kind === 'value') {
			field.value = fieldSnapshot.value || '';
		}
	};

	const applySnapshotToEditorForm = (formRoot, snapshot) => {
		if (!formRoot || !Array.isArray(snapshot) || !snapshot.length) {
			return;
		}

		const fields = formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"]');
		const restoreLength = Math.min(fields.length, snapshot.length);

		for (let i = 0; i < restoreLength; i++) {
			const field = fields[i];
			const fieldSnapshot = snapshot[i];
			applySnapshotToEditorField(field, fieldSnapshot);
		}
	};

	const serializeEditorFormSnapshot = (formRoot) => {
		if (!formRoot) {
			return [];
		}

		const fields = formRoot.querySelectorAll('input, textarea, select, [contenteditable="true"]');
		return Array.from(fields, (field) => {
			if (field.getAttribute('contenteditable') === 'true') {
				return {
					kind: 'contenteditable',
					html: field.innerHTML,
				};
			}

			if (field.type === 'checkbox' || field.type === 'radio') {
				return {
					kind: 'checkable',
					checked: Boolean(field.checked),
				};
			}

			if (field.type === 'file') {
				return {
					kind: 'file',
					fileName: field.files?.[0]?.name || '',
				};
			}

			return {
				kind: 'value',
				value: field.value || '',
			};
		});
	};

	const fetchDraftByKey = async (draftKey) => {
		const response = await fetch(`/api/form-borrador/${encodeURIComponent(draftKey)}`);
		if (!response.ok) {
			throw new Error('No se pudo cargar el borrador para editar.');
		}

		const data = await response.json();
		return data?.borrador || null;
	};

	const fetchEventoById = async (eventoId) => {
		const response = await fetch(`/api/form-evento/${encodeURIComponent(eventoId)}`);
		if (!response.ok) {
			throw new Error('No se pudo cargar el evento para editar.');
		}

		const data = await response.json();
		return data?.evento || null;
	};

	const populateEditorEventFields = (evento, modalRoot) => {
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
		formData.append('estado', eventoBase?.estado || 'pendiente_aprobacion');

		return formData;
	};

	const saveEditorDraftEdition = async (draftKey, modalRoot) => {
		const snapshot = serializeEditorFormSnapshot(modalRoot);
		const response = await fetch('/api/form-borrador', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				draftKey,
				snapshot,
				estado: 'borrador',
				estadoVigencia: 'activo',
			}),
		});

		if (!response.ok) {
			throw new Error('No se pudo guardar la edición del borrador.');
		}
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

	const openEditModal = async (id, source) => {
		const modalInstance = getModalInstanceById('modalEditarEventoEditor');
		if (!modalInstance) {
			return;
		}

		const modalRoot = await renderEditorEditFormInModal();
		pendingEditItem = { id, source };
		pendingEditEventData = null;

		if (source === 'borrador') {
			const borrador = await fetchDraftByKey(id);
			applySnapshotToEditorForm(modalRoot, borrador?.snapshot);
		} else {
			const evento = await fetchEventoById(id);
			pendingEditEventData = evento;
			populateEditorEventFields(evento, modalRoot);
		}

		modalInstance.show();
	};

	const bindEditarEventoModalActions = () => {
		const modalElement = document.getElementById('modalEditarEventoEditor');
		if (!modalElement || modalElement.dataset.eventoBorradorEditBound === 'true') {
			return;
		}

		const guardarBtn = modalElement.querySelector('.modalEditarEventoEditorBtnGuardar');
		const getEditField = (selector) => modalElement.querySelector(`#modalEditarEventoEditorFormHost ${selector}`);

		guardarBtn?.addEventListener('click', async () => {
			if (!pendingEditItem?.id || !pendingEditItem?.source) {
				return;
			}

			guardarBtn.disabled = true;

			try {
				if (pendingEditItem.source === 'borrador') {
					const modalRoot = document.getElementById('modalEditarEventoEditorFormHost');
					await saveEditorDraftEdition(pendingEditItem.id, modalRoot);
				} else {
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

					await saveEditorEventEdition(pendingEditItem.id, pendingEditEventData, edits);
				}

				getModalInstanceById('modalEditarEventoEditor')?.hide();
				getModalInstanceById('modalEventoEditadoEditor')?.show();
				await loadAllStatusData();
				renderStatusCards(activeStatus);
			} catch (error) {
				console.error(error);
				globalThis.alert('No se pudo guardar la edición del evento.');
			} finally {
				guardarBtn.disabled = false;
			}
		});

		modalElement.addEventListener('hidden.bs.modal', () => {
			pendingEditItem = null;
			pendingEditEventData = null;
		});

		modalElement.dataset.eventoBorradorEditBound = 'true';
	};

	const handleEditAction = async (id, source) => {
		try {
			await openEditModal(id, source);
		} catch (error) {
			console.error(error);
			globalThis.alert('No se pudo preparar el evento para edición.');
		}
	};

	const deleteBySource = async (id, source) => {
		if (source === 'borrador') {
			const response = await fetch(`/api/form-borrador/${encodeURIComponent(id)}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('No se pudo eliminar el borrador.');
			}
			return;
		}

		const response = await fetch(`/api/form-evento/${encodeURIComponent(id)}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('No se pudo eliminar el evento.');
		}
	};

	const getDeleteModalMessageByStatus = (status) => {
		if (status === 'rechazado') {
			return 'Al eliminar un evento rechazado lo perderá para siempre, ¿está seguro que desea continuar con este proceso?';
		}

		return 'Al eliminar un evento en desarrollo lo perderá para siempre, ¿está seguro que desea continuar con este proceso?';
	};

	const confirmDeleteWithModal = (status) => {
		const modalElement = document.getElementById('modalEliminarEvento');
		const deleteButton = modalElement?.querySelector('.modalEliminarEventoBtnEliminar');
		const descriptionElement = modalElement?.querySelector('.modalEliminarEventoDescripcion');

		if (!modalElement || !deleteButton || !globalThis.bootstrap?.Modal) {
			return Promise.resolve(globalThis.confirm('¿Desea eliminar este registro?'));
		}

		if (descriptionElement) {
			descriptionElement.textContent = getDeleteModalMessageByStatus(status);
		}

		const modalInstance = globalThis.bootstrap.Modal.getOrCreateInstance(modalElement);

		return new Promise((resolve) => {
			let confirmed = false;

			const onDeleteClick = () => {
				confirmed = true;
				modalInstance.hide();
			};

			const onModalHidden = () => {
				deleteButton.removeEventListener('click', onDeleteClick);
				modalElement.removeEventListener('hidden.bs.modal', onModalHidden);
				resolve(confirmed);
			};

			deleteButton.addEventListener('click', onDeleteClick);
			modalElement.addEventListener('hidden.bs.modal', onModalHidden);
			modalInstance.show();
		});
	};

	const handleDeleteAction = async (id, source) => {
		if (!id || !source) {
			return;
		}

		const confirmed = await confirmDeleteWithModal(activeStatus);
		if (!confirmed) {
			return;
		}

		try {
			await deleteBySource(id, source);
			removeCardFromCurrentStatus(id);
		} catch (error) {
			console.error(error);
			globalThis.alert('No se pudo eliminar el registro seleccionado.');
		}
	};

	const handleCardAction = async (accion, id, source) => {
		if (accion === 'ver-anotaciones') {
			openRechazoAnotacionesModal(id);
			return;
		}

		if (accion === 'ver') {
			await ensureCreateEventoScriptLoaded();
			await globalThis.mostrarVistaPreviaEventoPorId(id, source === 'borrador' ? 'borrador' : 'evento');
			return;
		}

		if (accion === 'editar') {
			await handleEditAction(id, source);
			return;
		}

		if (accion === 'eliminar') {
			await handleDeleteAction(id, source);
		}
	};

	cardsContainer.addEventListener('click', async (event) => {
		const button = event.target.closest('[data-accion][data-id][data-source]');
		if (!button) {
			return;
		}

		const accion = button.dataset.accion;
		const id = button.dataset.id;
		const source = button.dataset.source;

		await handleCardAction(accion, id, source);
	});

	statusButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const status = button.dataset.status;
			activeStatus = status;
			setActiveButton(button);
			renderStatusCards(status);
		});
	});

	const initialButton = document.querySelector('.btnEventosBorrador.is-active[data-status]') || statusButtons[0];
	activeStatus = initialButton.dataset.status;
	setActiveButton(initialButton);
	bindEditarEventoModalActions();

	loadAllStatusData()
		.then(() => {
			renderStatusCards(activeStatus);
		})
		.catch((error) => {
			console.error(error);
			cardsContainer.innerHTML = `
				<div class="row mt-3">
					<div class="col-12">
						<p class="text-danger">No se pudieron cargar los eventos.</p>
					</div>
				</div>
			`;
		});
}

globalThis.initEventoBorrador = initEventoBorrador;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initEventoBorrador);
} else {
	initEventoBorrador();
}
