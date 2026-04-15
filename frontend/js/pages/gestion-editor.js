document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.gestionEditorMenuOption');
    const mobileMenuLabel = document.getElementById('gestionEditorMobileMenuLabel');
    const contentPanel = document.getElementById('gestionEditorContentPanel');

    if (!sidebarLinks.length) {
        return;
    }



    const sectionTemplates = {
        'crear-evento': {
            title: 'Crear Evento',
            html: `
                
                
            `,
        },
        'eventos-publicados': {
            title: 'Eventos Publicados',
            html: `
                
                
            `,
        },
        'eventos-borrador': {
            title: 'Eventos en Borrador',
            html: `
                
            
            `,
        },
        'crear-lista-difusion': {
            title: 'Crear lista de difusión',
            html: `
                
            
            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                
            
            `,
        },
        'suscriptores': {
            title: 'Suscriptores',
            html: `
                
            `,
        },
        'consultas': {
            title: 'Consultas',
            html: `
                
            
            `,
        },
        'aprobacion-inscripciones': {
            title: 'Aprobación de Inscripciones',
            html: `
            
            `,
        },
        'inscritos-eventos': {
            title: 'Inscritos a eventos',
            html: `
            
            `,
        },
    };

    const getSidebarKey = (link) => link.dataset.sidebarKey || link.textContent.trim();

    const defaultPanelHtml = `
        <p class="gestionEditorPanelText">Selecciona una opcion del menu para ver el contenido.</p>
    `;

    const renderSection = (sidebarKey) => {
        if (!contentPanel) {
            return;
        }

        const section = sectionTemplates[sidebarKey];

        if (!section) {
            contentPanel.innerHTML = defaultPanelHtml;
            return;
        }

        contentPanel.innerHTML = section.html;
    };

    const setActiveLink = (activeLink) => {
        sidebarLinks.forEach((link) => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (activeLink) {
            const activeKeyValue = getSidebarKey(activeLink);
            const activeLabel = activeLink.textContent.trim();

            sidebarLinks.forEach((link) => {
                if (getSidebarKey(link) === activeKeyValue) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });

            if (mobileMenuLabel) {
                mobileMenuLabel.textContent = activeLabel;
            }

            renderSection(activeKeyValue);
            return;
        }

        if (mobileMenuLabel) {
            mobileMenuLabel.textContent = 'Opciones de gestión';
        }

        renderSection(null);
    };

    setActiveLink(null);

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (href === '#') {
                event.preventDefault();
            }

            setActiveLink(link);
        });
    });
});