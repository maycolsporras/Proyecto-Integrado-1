document.addEventListener('DOMContentLoaded', () => {
	// Maneja el modal de suscripcion
	const modalSuscripcion = document.getElementById('modalSuscripcionEventos');

	if (!modalSuscripcion) {
		return;
	}

	const form = modalSuscripcion.querySelector('form');
	const submitButton = modalSuscripcion.querySelector('.modalSuscripcionEventosBtnInscribirme');
	const successModal = document.getElementById('suscripcionEnviada');

	if (!form || !submitButton) {
		return;
	}

	const correoInput = form.querySelector('input[type="email"]');
	const textoInputs = Array.from(form.querySelectorAll('input[type="text"]'));
	const checkbox = form.querySelector('#notificaciones');
	const [nombreCompletoInput, profesionOficioInput, entidadVinculadaInput, razonNotificacionInput] = textoInputs;

	// Cambia el texto mientras se envia el formulario
	const setButtonLoading = (isLoading) => {
		if (!submitButton) {
			return;
		}

		submitButton.disabled = isLoading;
		submitButton.textContent = isLoading ? 'Enviando...' : 'Inscribirme';
	};

	// Evita mensajes repetidos de error
	const ensureFeedback = (container, feedbackId, className = 'invalid-feedback') => {
		if (!container) {
			return null;
		}

		let feedback = container.querySelector(`[data-feedback-id="${feedbackId}"]`);

		if (!feedback) {
			feedback = document.createElement('div');
			feedback.className = className;
			feedback.dataset.feedbackId = feedbackId;
			container.appendChild(feedback);
		}

		const duplicates = container.querySelectorAll(`[data-feedback-id="${feedbackId}"]`);
		if (duplicates.length > 1) {
			duplicates.forEach((node, index) => {
				if (index > 0) {
					node.remove();
				}
			});
		}

		return feedback;
	};

	const clearInputError = (input) => {
		if (!input) {
			return;
		}

		input.classList.remove('is-invalid');
		input.removeAttribute('aria-invalid');
	};

	const setInputError = (input, message) => {
		if (!input) {
			return;
		}

		input.classList.add('is-invalid');
		input.setAttribute('aria-invalid', 'true');
		const feedback = ensureFeedback(input.parentElement, 'field-error');
		if (!feedback) {
			return;
		}
		feedback.textContent = message;
	};

	const validateRequiredText = (input) => {
		if (!input || input.value.trim()) {
			clearInputError(input);
			return true;
		}

		setInputError(input, 'Este campo es obligatorio.');
		return false;
	};

	const validateEmail = (input) => {
		if (!input) {
			return true;
		}

		const emailValue = input.value.trim();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailValue) {
			setInputError(input, 'El correo electronico es obligatorio.');
			return false;
		}

		if (!emailRegex.test(emailValue)) {
			setInputError(input, 'Ingrese un correo electronico valido.');
			return false;
		}

		clearInputError(input);
		return true;
	};

	const clearCheckboxError = (input) => {
		if (!input) {
			return;
		}

		input.classList.remove('is-invalid');
		input.removeAttribute('aria-invalid');
	};

	const setCheckboxError = (input, message) => {
		if (!input) {
			return;
		}

		input.classList.add('is-invalid');
		input.setAttribute('aria-invalid', 'true');
		const feedback = ensureFeedback(input.closest('.form-check'), 'checkbox-error', 'text-danger small mt-1');
		if (!feedback) {
			return;
		}
		feedback.textContent = message;
	};

	const validateCheckbox = (input) => {
		if (!input || input.checked) {
			clearCheckboxError(input);
			return true;
		}

		setCheckboxError(input, 'Debe aceptar recibir notificaciones para continuar.');
		return false;
	};

	const validateForm = () => {
		const textInputsValid = textoInputs.every((input) => validateRequiredText(input));
		const emailValid = validateEmail(correoInput);
		const checkboxValid = validateCheckbox(checkbox);

		return textInputsValid && emailValid && checkboxValid;
	};

	textoInputs.forEach((input) => {
		input.addEventListener('input', () => {
			validateRequiredText(input);
		});
	});

	correoInput?.addEventListener('input', () => {
		validateEmail(correoInput);
	});

	checkbox?.addEventListener('change', () => {
		validateCheckbox(checkbox);
	});

	// Envía la suscripcion al backend
	submitButton.addEventListener('click', async (event) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		const payload = {
			nombreCompleto: nombreCompletoInput?.value.trim() || '',
			correoElectronico: correoInput?.value.trim() || '',
			profesionOficio: profesionOficioInput?.value.trim() || '',
			entidadVinculada: entidadVinculadaInput?.value.trim() || '',
			razonNotificacion: razonNotificacionInput?.value.trim() || '',
			aceptaNotificaciones: Boolean(checkbox?.checked),
		};

		setButtonLoading(true);

		try {
			const response = await fetch('/api/suscriptores', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				const mensaje = body?.mensaje || 'No se pudo registrar la suscripcion.';
				globalThis.alert(mensaje);
				return;
			}
		} catch (error) {
			globalThis.alert('No se pudo conectar con el servidor. Intente nuevamente.');
			return;
		} finally {
			setButtonLoading(false);
		}

		const modalInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalSuscripcion);
		const successModalInstance = successModal
			? globalThis.bootstrap?.Modal.getOrCreateInstance(successModal)
			: null;

		if (!modalInstance || !successModalInstance) {
			return;
		}

		const onHidden = () => {
			modalSuscripcion.removeEventListener('hidden.bs.modal', onHidden);
			successModalInstance.show();
		};

		modalSuscripcion.addEventListener('hidden.bs.modal', onHidden);
		modalInstance.hide();
	});

	// Limpia el modal al cerrarlo
	modalSuscripcion.addEventListener('hidden.bs.modal', () => {
		form.reset();
		textoInputs.forEach((input) => clearInputError(input));
		clearInputError(correoInput);
		clearCheckboxError(checkbox);
	});
});
