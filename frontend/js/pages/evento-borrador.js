function initEventoBorrador() {
	const statusButtons = document.querySelectorAll('.btnEventosBorrador[data-status]');
	const cardsContainer = document.getElementById('cardsEventosBorrador');

	if (!statusButtons.length || !cardsContainer) {
		return;
	}

	if (cardsContainer.dataset.eventoBorradorInitialized === 'true') {
		return;
	}

	cardsContainer.dataset.eventoBorradorInitialized = 'true';

	const templatesByStatus = {
		'edicion': [
			`

            `,
		],
		'pendiente': [
			`
            
            `,
		],
		'rechazado': [
			`
            
            `,
			`

            `,
		],
	};

	const renderStatusCards = (status) => {
		const cards = templatesByStatus[status] || [];
		cardsContainer.innerHTML = cards.join('');
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
			setActiveButton(button);
			renderStatusCards(status);
		});
	});

	const initialButton = document.querySelector('.btnEventosBorrador.is-active[data-status]') || statusButtons[0];
	setActiveButton(initialButton);
	renderStatusCards(initialButton.dataset.status);
}

globalThis.initEventoBorrador = initEventoBorrador;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initEventoBorrador);
} else {
	initEventoBorrador();
}
