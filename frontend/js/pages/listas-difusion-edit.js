function initListaDifusionEdit() {
	const statusButtons = document.querySelectorAll('.btnListasDifusionEdit[data-status]');
	const cardsContainer = document.getElementById('cardsEventosBorrador');

	if (!statusButtons.length || !cardsContainer) {
		return;
	}

	if (cardsContainer.dataset.eventoBorradorInitialized === 'true') {
		return;
	}

	cardsContainer.dataset.eventoBorradorInitialized = 'true';

	const templatesByStatus = {
		'Aprobada': [
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

	const initialButton = document.querySelector('.btnListasDifusionEdit.is-active[data-status]') || statusButtons[0];
	setActiveButton(initialButton);
	renderStatusCards(initialButton.dataset.status);
}

globalThis.initListaDifusionEdit = initListaDifusionEdit;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initListaDifusionEdit);
} else {
	initListaDifusionEdit();
}
