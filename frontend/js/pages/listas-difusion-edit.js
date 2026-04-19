function initListaDifusionEdit() {
	const statusButtons = document.querySelectorAll('.btnListasDifusionEdit[data-status]');
	const cardsContainer = document.getElementById('cardsEventosBorrador');
	const listasById = new Map();
	let currentStatusKey = 'edicion';
	let pendingDeleteListaId = '';

	if (!statusButtons.length || !cardsContainer) {
		return;
	}

	if (cardsContainer.dataset.eventoBorradorInitialized === 'true') {
		return;
	}

	cardsContainer.dataset.eventoBorradorInitialized = 'true';

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

		const parsedDate = new Date(dateString);
		if (Number.isNaN(parsedDate.getTime())) {
			return 'No disponible';
		}

		const day = String(parsedDate.getDate()).padStart(2, '0');
		const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
		const year = parsedDate.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const statusMap = {
		edicion: 'aprobada',
		pendiente: 'pendiente_aprobacion',
		rechazado: 'rechazada',
	};

	const statusTitleMap = {
		edicion: 'aprobadas',
		pendiente: 'pendientes de aprobación',
		rechazado: 'rechazadas',
	};

	const renderCards = (listas = [], statusKey) => {
		listasById.clear();
		listas.forEach((lista) => {
			if (lista?._id) {
				listasById.set(String(lista._id), lista);
			}
		});

		if (!listas.length) {
			cardsContainer.innerHTML = `
				<div class="row mt-4">
					<div class="col-12">
						<p class="text-muted mb-0">No hay listas ${escapeHtml(statusTitleMap[statusKey] || 'disponibles')}.</p>
					</div>
				</div>
			`;
			return;
		}

		cardsContainer.innerHTML = listas.map((lista) => `
			<div class="row border-bottom border-1 border-secondary-subtle ">
				<div class="col-12">
					<div class="eventoCardPublicada d-flex justify-content-between p-3" aria-label="Evento publicado" data-lista-id="${escapeHtml(lista._id || '')}">
						<div class="eventoCardPublicadaHeader ms-5">
							<p class="eventoCardPublicadaTitulo fw-bold">${escapeHtml(lista.nombreLista || 'Nombre de la Lista')}</p>
							<p class="eventoCardPublicadaMeta"><span>Fecha de creación:</span> ${escapeHtml(formatDate(lista.createdAt))}
							</p>
							<p class="eventoCardPublicadaMeta"><span>Autor:</span> ${escapeHtml(lista.autorCorreo || 'Nombre Apellido Apellido')}
							</p>
							<p class="eventoCardPublicadaMeta"><span>Número de suscriptores:</span> ${escapeHtml(lista.numeroSuscriptores ?? 0)}
							</p>
						</div>

						<div class="eventoCardPublicadaAcciones mt-3 d-flex align-items-center gap-2 flex-wrap" aria-label="Acciones del evento publicado">
							${statusKey === 'rechazado' ? `
								<button class="btn btn-outline-secondary btn-sm btnVerAnotacionesListaDifusionEditor" type="button" data-lista-id="${escapeHtml(lista._id || '')}" aria-label="Ver anotaciones de rechazo">
									Ver anotaciones
								</button>
							` : ''}
							<button class="btn eventoCardBtnIcon btnEditarListaDifusionEditor" type="button" data-lista-id="${escapeHtml(lista._id || '')}" aria-label="Editar evento">
								<i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
							</button>
							<button class="btn eventoCardBtnIcon btnEliminarListaDifusionEditor" type="button" data-lista-id="${escapeHtml(lista._id || '')}" aria-label="Eliminar evento">
								<i class="fa-regular fa-trash-can" aria-hidden="true"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		`).join('');
	};

	const ensureAnotacionesModal = () => {
		let modalElement = document.getElementById('modalAnotacionesListaDifusionEditor');

		if (modalElement) {
			return modalElement;
		}

		const modalWrapper = document.createElement('div');
		modalWrapper.innerHTML = `
			<div class="modal fade" id="modalAnotacionesListaDifusionEditor" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered modalRechazoListaDifusionAncho">
					<div class="modal-content modalRechazoListaDifusionContenido">
						<div class="modal-body modalRechazoListaDifusionBody">
							<p class="modalRechazoListaDifusionTitulo">Anotaciones del Administrador</p>
							<p class="modalRechazoListaDifusionDescripcion">
								La lista fue rechazada. A continuación se muestra el motivo indicado por el administrador:
							</p>
							<div id="anotacionesRechazoListaDifusionEditor" class="modalRechazoListaDifusionCajaMotivo"></div>
							<div class="modalRechazoListaDifusionAcciones d-grid gap-3 d-md-flex justify-content-center my-4">
								<button type="button" class="btn modalRechazoListaDifusionBtnAceptar px-4" data-bs-dismiss="modal">Cerrar</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		document.body.append(modalWrapper.firstElementChild);
		modalElement = document.getElementById('modalAnotacionesListaDifusionEditor');
		return modalElement;
	};

	const openAnotacionesModal = (lista) => {
		const modalElement = ensureAnotacionesModal();

		if (!modalElement || !globalThis.bootstrap?.Modal || !lista) {
			return;
		}

		const motivoElement = modalElement.querySelector('#anotacionesRechazoListaDifusionEditor');
		if (motivoElement) {
			motivoElement.textContent = lista.motivoRechazo || 'No hay anotaciones registradas por el administrador.';
		}

		globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
	};

	const ensureEditModal = () => {
		let modalElement = document.getElementById('modalEditarListaDifusionEditor');

		if (modalElement) {
			return modalElement;
		}

		const modalWrapper = document.createElement('div');
		modalWrapper.innerHTML = `
			<div class="modal fade" id="modalEditarListaDifusionEditor" tabindex="-1" aria-hidden="true">
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
									<form id="formEditarListaDifusionEditor" class="w-100" style="max-width: 800px;" novalidate>
										<input type="hidden" id="editarListaId">
										<div class="mb-4">
											<div class="row align-items-center">
												<label for="editarNombreLista" class="col-12 col-lg-3 form-label">*Nombre de la lista</label>
												<div class="col-12 col-lg-9">
													<input type="text" class="form-control" id="editarNombreLista" placeholder="Introduzca el dato solicitado" required>
												</div>
											</div>
										</div>
										<div class="mb-4">
											<div class="row align-items-start">
												<label for="editarDescripcionLista" class="col-12 col-lg-3 form-label">*Descripción de la lista de difusión</label>
												<div class="col-12 col-lg-9">
													<textarea class="form-control" id="editarDescripcionLista" rows="5" placeholder="Introduzca el dato solicitado" required></textarea>
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
		modalElement = document.getElementById('modalEditarListaDifusionEditor');
		return modalElement;
	};

	const openEditModal = (lista) => {
		const modalElement = ensureEditModal();

		if (!modalElement || !globalThis.bootstrap?.Modal) {
			return;
		}

		const idInput = modalElement.querySelector('#editarListaId');
		const nombreInput = modalElement.querySelector('#editarNombreLista');
		const descripcionInput = modalElement.querySelector('#editarDescripcionLista');

		if (!(idInput instanceof HTMLInputElement)
			|| !(nombreInput instanceof HTMLInputElement)
			|| !(descripcionInput instanceof HTMLTextAreaElement)) {
			return;
		}

		idInput.value = lista?._id || '';
		nombreInput.value = lista?.nombreLista || '';
		descripcionInput.value = lista?.descripcionLista || '';

		nombreInput.classList.remove('is-invalid');
		descripcionInput.classList.remove('is-invalid');

		globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
	};

	const closeEditModal = () => {
		const modalElement = document.getElementById('modalEditarListaDifusionEditor');

		if (!modalElement || !globalThis.bootstrap?.Modal) {
			return;
		}

		globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
	};

	const validateEditFields = (nombreInput, descripcionInput) => {
		const nombreValido = nombreInput.value.trim().length > 0;
		const descripcionValida = descripcionInput.value.trim().length > 0;

		nombreInput.classList.toggle('is-invalid', !nombreValido);
		descripcionInput.classList.toggle('is-invalid', !descripcionValida);

		return nombreValido && descripcionValida;
	};

	const ensureDeleteModal = () => {
		let modalElement = document.getElementById('modalEliminarListaDifusionEditor');

		if (modalElement) {
			return modalElement;
		}

		const modalWrapper = document.createElement('div');
		modalWrapper.innerHTML = `
			<div class="modal fade" id="modalEliminarListaDifusionEditor" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered modalEliminarEventoAncho">
					<div class="modal-content modalEliminarEventoContenido">
						<div class="modal-body modalEliminarEventoBody">
							<p class="modalEliminarEventoTitulo">¿Eliminar?</p>
							<p class="modalEliminarEventoDescripcion">
								Al eliminar una lista de difusión la perderá para siempre, ¿está seguro que desea continuar con este proceso?
							</p>
							<div class="modalEliminarEventoAcciones d-grid gap-3 d-md-flex justify-content-center my-3">
								<button type="button" class="btn modalEliminarEventoBtnCancelar px-4" data-bs-dismiss="modal">Cancelar</button>
								<button type="button" class="btn modalEliminarEventoBtnEliminar btnConfirmarEliminarListaDifusionEditor px-4">Eliminar</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		document.body.append(modalWrapper.firstElementChild);
		modalElement = document.getElementById('modalEliminarListaDifusionEditor');
		return modalElement;
	};

	const openDeleteModal = (listaId) => {
		const modalElement = ensureDeleteModal();

		if (!modalElement || !globalThis.bootstrap?.Modal) {
			return;
		}

		pendingDeleteListaId = listaId;
		globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).show();
	};

	const closeDeleteModal = () => {
		const modalElement = document.getElementById('modalEliminarListaDifusionEditor');

		if (!modalElement || !globalThis.bootstrap?.Modal) {
			return;
		}

		globalThis.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
	};

	const loadCardsByStatus = async (statusKey) => {
		const estado = statusMap[statusKey] || 'aprobada';
		cardsContainer.innerHTML = '<p class="text-muted mb-0">Cargando listas...</p>';

		try {
			const response = await fetch(`/api/lista-difusion?estado=${encodeURIComponent(estado)}`);
			const data = await response.json().catch(() => ({}));

			if (!response.ok || !data?.ok) {
				throw new Error(data?.mensaje || 'No fue posible cargar las listas de difusión.');
			}

			renderCards(Array.isArray(data.listas) ? data.listas : [], statusKey);
		} catch (error) {
			cardsContainer.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Ocurrió un error al cargar las listas.')}</p>`;
		}
	};

	const setActiveButton = (button) => {
		statusButtons.forEach((btn) => {
			btn.classList.remove('is-active');
		});

		button.classList.add('is-active');
	};

	statusButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const status = button.dataset.status;
			currentStatusKey = status;
			setActiveButton(button);
			loadCardsByStatus(status);
		});
	});

	cardsContainer.addEventListener('click', (event) => {
		const anotacionesButton = event.target.closest('.btnVerAnotacionesListaDifusionEditor');
		const editButton = event.target.closest('.btnEditarListaDifusionEditor');
		const deleteButton = event.target.closest('.btnEliminarListaDifusionEditor');

		if (anotacionesButton) {
			const listaId = anotacionesButton.dataset.listaId || '';
			const lista = listasById.get(String(listaId));

			if (!lista) {
				globalThis.alert('No se pudieron cargar las anotaciones de la lista seleccionada.');
				return;
			}

			openAnotacionesModal(lista);
			return;
		}

		if (deleteButton) {
			const listaId = deleteButton.dataset.listaId || '';

			if (!listasById.has(String(listaId))) {
				globalThis.alert('No se pudo cargar la lista seleccionada para eliminar.');
				return;
			}

			openDeleteModal(listaId);
			return;
		}

		if (!editButton) {
			return;
		}

		const listaId = editButton.dataset.listaId || '';
		const lista = listasById.get(String(listaId));

		if (!lista) {
			globalThis.alert('No se pudo cargar la lista seleccionada para editar.');
			return;
		}

		openEditModal(lista);
	});

	document.addEventListener('click', async (event) => {
		const deleteConfirmButton = event.target.closest('.btnConfirmarEliminarListaDifusionEditor');

		if (!deleteConfirmButton) {
			return;
		}

		if (!pendingDeleteListaId) {
			return;
		}

		deleteConfirmButton.disabled = true;

		try {
			const response = await fetch(`/api/lista-difusion/${encodeURIComponent(pendingDeleteListaId)}`, {
				method: 'DELETE',
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok || !data?.ok) {
				throw new Error(data?.mensaje || 'No fue posible eliminar la lista de difusión.');
			}

			pendingDeleteListaId = '';
			closeDeleteModal();
			await loadCardsByStatus(currentStatusKey);
		} catch (error) {
			globalThis.alert(error.message || 'Ocurrió un error al eliminar la lista.');
		} finally {
			deleteConfirmButton.disabled = false;
		}
	});

	document.addEventListener('submit', async (event) => {
		const editForm = event.target;

		if (!(editForm instanceof HTMLFormElement) || editForm.id !== 'formEditarListaDifusionEditor') {
			return;
		}

		event.preventDefault();

		const idInput = editForm.querySelector('#editarListaId');
		const nombreInput = editForm.querySelector('#editarNombreLista');
		const descripcionInput = editForm.querySelector('#editarDescripcionLista');
		const submitButton = editForm.querySelector('button[type="submit"]');

		if (!(idInput instanceof HTMLInputElement)
			|| !(nombreInput instanceof HTMLInputElement)
			|| !(descripcionInput instanceof HTMLTextAreaElement)
			|| !(submitButton instanceof HTMLButtonElement)) {
			return;
		}

		if (!validateEditFields(nombreInput, descripcionInput)) {
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

			closeEditModal();
			await loadCardsByStatus(currentStatusKey);
		} catch (error) {
			globalThis.alert(error.message || 'Ocurrió un error al actualizar la lista.');
		} finally {
			submitButton.disabled = false;
		}
	});

	const initialButton = document.querySelector('.btnListasDifusionEdit.is-active[data-status]') || statusButtons[0];
	currentStatusKey = initialButton.dataset.status;
	setActiveButton(initialButton);
	loadCardsByStatus(initialButton.dataset.status);
}

globalThis.initListaDifusionEdit = initListaDifusionEdit;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initListaDifusionEdit);
} else {
	initListaDifusionEdit();
}
