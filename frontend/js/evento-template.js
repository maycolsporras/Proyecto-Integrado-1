document.addEventListener('DOMContentLoaded', () => {
	// Activa la lectura facil del evento
	configurarLecturaFacilEvento();
});

function configurarLecturaFacilEvento() {
	// Muestra u oculta el resumen del evento
	const botonLecturaFacil = document.getElementById('btnLecturaFacilEvento');
	const ventanaLectura = document.getElementById('lecturaFacilVentana');
	const tituloLectura = document.getElementById('lecturaFacilTitulo');
	const contenidoLectura = document.getElementById('lecturaFacilContenido');

	if (!botonLecturaFacil || !ventanaLectura || !tituloLectura || !contenidoLectura) {
		return;
	}

	botonLecturaFacil.addEventListener('click', () => {
		const estaVisible = !ventanaLectura.classList.contains('d-none');
		if (estaVisible) {
			ventanaLectura.classList.add('d-none');
			botonLecturaFacil.classList.remove('is-active');
			botonLecturaFacil.setAttribute('aria-expanded', 'false');
			return;
		}

		const resumen = generarResumenLecturaFacil();
		tituloLectura.textContent = resumen.titulo;
		contenidoLectura.innerHTML = resumen.parrafos
			.map((parrafo) => `<p>${escapeHtml(parrafo)}</p>`)
			.join('');

		ventanaLectura.classList.remove('d-none');
		botonLecturaFacil.classList.add('is-active');
		botonLecturaFacil.setAttribute('aria-expanded', 'true');
		ventanaLectura.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
}

function generarResumenLecturaFacil() {
	// Arma el texto corto para lectura facil
	const tituloEvento = obtenerTexto('#titulo-evento-politica', 'Publicacion de Politica Nacional de Discapacidad 2020 - 2030');

	const descripcion = Array.from(document.querySelectorAll('.eventoPoliticaBloqueContenido p'))
		.map((elemento) => elemento.textContent.trim())
		.filter(Boolean);

	const objetivos = Array.from(document.querySelectorAll('.eventoPoliticaListaObjetivos li'))
		.map((elemento) => elemento.textContent.trim())
		.filter(Boolean);

	const agenda = Array.from(document.querySelectorAll('.eventoPoliticaAgendaFila'))
		.map((fila) => {
			const hora = fila.querySelector('.eventoPoliticaAgendaHora')?.textContent.trim();
			const detalle = fila.querySelector('.eventoPoliticaAgendaDetalle')?.textContent.trim();
			if (!hora || !detalle) {
				return null;
			}
			return `${hora}: ${detalle}`;
		})
		.filter(Boolean);

	const datosEvento = Array.from(document.querySelectorAll('.eventoPoliticaListaInfo li'))
		.map((elemento) => elemento.textContent.replace(/\s+/g, ' ').trim())
		.filter(Boolean);

	const cupos = obtenerTexto('.eventoPoliticaCupos', 'Cupos no especificados');

	const parrafos = [];
	parrafos.push(`Este evento se llama ${tituloEvento}.`);

	if (datosEvento.length > 0) {
		parrafos.push(`Datos clave: ${datosEvento.join('. ')}.`);
	}

	if (descripcion.length > 0) {
		parrafos.push(`Resumen rapido: ${descripcion.slice(0, 2).join(' ')}`);
	}

	if (objetivos.length > 0) {
		parrafos.push(`Objetivos principales: ${objetivos.slice(0, 2).join(' ')}`);
	}

	if (agenda.length > 0) {
		parrafos.push(`Agenda del evento: ${agenda.slice(0, 3).join(' / ')}.`);
	}

	parrafos.push(`Disponibilidad: ${cupos}.`);

	return {
		titulo: tituloEvento,
		parrafos,
	};
}

function obtenerTexto(selector, respaldo) {
	const elemento = document.querySelector(selector);
	const texto = elemento?.textContent.trim();
	return texto || respaldo;
}

function escapeHtml(texto) {
	return String(texto)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
