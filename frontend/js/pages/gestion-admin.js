document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.gestionAdminMenuOption');
    const mobileMenuLabel = document.getElementById('gestionAdminMobileMenuLabel');
    const contentPanel = document.getElementById('gestionAdminContentPanel');

    if (!sidebarLinks.length) {
        return;
    }



    const sectionTemplates = {
        'aprobacion-eventos': {
            title: 'Aprobacion de Eventos',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Aprobación de Eventos
                        </li>
                    </ol>
                </nav>
                
            `,
        },
        'eventos-publicados': {
            title: 'Eventos Publicados',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Eventos Publicados
                        </li>
                    </ol>
                </nav>
                
            `,
        },
        'aprobacion-difusion': {
            title: 'Aprobacion Lista de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Aprobación Lista de Difusión
                        </li>
                    </ol>
                </nav>
            
            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Listas de Difusión
                        </li>
                    </ol>
                </nav>
            
            `,
        },
        'informe-evento': {
            title: 'Informe por Evento',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Evento
                        </li>
                    </ol>
                </nav>
            
            `,
        },
        'informe-difusion': {
            title: 'Informe por Lista de Difusion',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Lista de Difusión
                        </li>
                    </ol>
                </nav>
            
            `,
        },
        'informe-editor': {
            title: 'Informe por Editor',
            html: `
                <nav class="breadcrumbEventos" aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a class="text-decoration-none" href="../modulo-admin.html">Inicio</a>
                        </li>
                        <li class="breadcrumb-item"><a class="text-decoration-none"
                                href="#">Eventos</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Informe por Editor
                        </li>
                    </ol>
                </nav>
            
            `,
        },
    };

    const getSidebarKey = (link) => link.dataset.sidebarKey || link.textContent.trim();

    const defaultPanelHtml = `
        <p class="gestionAdminPanelText">Selecciona una opcion del menu para ver el contenido.</p>
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