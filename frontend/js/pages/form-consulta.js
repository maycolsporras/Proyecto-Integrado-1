// Formulario para enviar consultas sobre eventos
document.addEventListener('DOMContentLoaded', () => {
    const modalConsultaEl = document.getElementById('modalConsultaEvento');
    const modalExitoEl = document.getElementById('modalConsultaEnviada');
    const formConsulta = document.getElementById('formConsultaEvento');
    const eventoIdInput = document.getElementById('consultaEventoId');
    const correoInput = document.getElementById('consultaEventoCorreo');
    const consultaInput = document.getElementById('consultaEventoTexto');
    const enviarBtn = document.getElementById('consultaEventoEnviarBtn');

    if (!modalConsultaEl || !formConsulta || !eventoIdInput || !correoInput || !consultaInput) {
        return;
    }

    const esCorreoValido = (correo) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
    };

    const limpiarValidaciones = () => {
        correoInput.classList.remove('is-invalid');
        consultaInput.classList.remove('is-invalid');
    };

    const validarFormulario = () => {
        const correo = String(correoInput.value || '').trim();
        const consulta = String(consultaInput.value || '').trim();

        let esValido = true;

        if (!esCorreoValido(correo)) {
            correoInput.classList.add('is-invalid');
            esValido = false;
        } else {
            correoInput.classList.remove('is-invalid');
        }

        if (!consulta) {
            consultaInput.classList.add('is-invalid');
            esValido = false;
        } else {
            consultaInput.classList.remove('is-invalid');
        }

        if (!eventoIdInput.value) {
            esValido = false;
            globalThis.alert('Debe seleccionar un evento válido para realizar la consulta.');
        }

        return esValido;
    };

    modalConsultaEl.addEventListener('show.bs.modal', (event) => {
        const triggerButton = event.relatedTarget;
        const eventoId = triggerButton?.getAttribute('data-evento-id') || '';
        eventoIdInput.value = eventoId;
        limpiarValidaciones();
    });

    modalConsultaEl.addEventListener('hidden.bs.modal', () => {
        formConsulta.reset();
        eventoIdInput.value = '';
        limpiarValidaciones();
        enviarBtn.disabled = false;
    });

    correoInput.addEventListener('input', () => {
        correoInput.classList.remove('is-invalid');
    });

    consultaInput.addEventListener('input', () => {
        consultaInput.classList.remove('is-invalid');
    });

    formConsulta.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        enviarBtn.disabled = true;

        try {
            const payload = {
                eventoId: eventoIdInput.value,
                correoElectronico: correoInput.value.trim(),
                consulta: consultaInput.value.trim(),
            };

            const response = await fetch('/api/consulta-eventos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(data?.mensaje || 'No se pudo enviar la consulta del evento.');
            }

            const modalConsultaInstance = globalThis.bootstrap?.Modal.getOrCreateInstance(modalConsultaEl);
            const modalExitoInstance = modalExitoEl
                ? globalThis.bootstrap?.Modal.getOrCreateInstance(modalExitoEl)
                : null;

            const onHidden = () => {
                modalConsultaEl.removeEventListener('hidden.bs.modal', onHidden);
                modalExitoInstance?.show();
            };

            modalConsultaEl.addEventListener('hidden.bs.modal', onHidden);
            modalConsultaInstance?.hide();
        } catch (error) {
            globalThis.alert(error.message || 'No se pudo enviar la consulta del evento.');
            enviarBtn.disabled = false;
        }
    });
});
