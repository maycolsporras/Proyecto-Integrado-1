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
                <h1 class="gestionAdminPanelTitle">Aprobacion de Eventos</h1>
                <p class="gestionAdminPanelText">Revisa y aprueba los eventos enviados por los editores antes de su publicacion.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Pendientes de revision</h2>
                        <p>12 eventos esperando aprobacion.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Acciones rapidas</h2>
                        <p>Filtra por fecha, categoria o editor para agilizar el proceso.</p>
                    </article>
                </div>
            `,
        },
        'eventos-publicados': {
            title: 'Eventos Publicados',
            html: `
                <h1 class="gestionAdminPanelTitle">Eventos Publicados</h1>
                <p class="gestionAdminPanelText">Consulta los eventos activos y valida su informacion visible al publico.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Publicados hoy</h2>
                        <p>5 eventos nuevos visibles en el portal.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Vencen esta semana</h2>
                        <p>8 eventos requieren actualizacion o cierre.</p>
                    </article>
                </div>
            `,
        },
        'aprobacion-difusion': {
            title: 'Aprobacion Lista de Difusion',
            html: `
                <h1 class="gestionAdminPanelTitle">Aprobacion Lista de Difusion</h1>
                <p class="gestionAdminPanelText">Aprueba solicitudes de suscripcion y nuevas listas de difusion.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Solicitudes nuevas</h2>
                        <p>18 registros pendientes por validar.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Listas por revisar</h2>
                        <p>3 listas necesitan actualizacion de permisos.</p>
                    </article>
                </div>
            `,
        },
        'listas-difusion': {
            title: 'Listas de Difusion',
            html: `
                <h1 class="gestionAdminPanelTitle">Listas de Difusion</h1>
                <p class="gestionAdminPanelText">Gestiona listas activas, segmentacion y estado de envio.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Listas activas</h2>
                        <p>14 listas configuradas para comunicaciones institucionales.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Ultimo envio</h2>
                        <p>Hace 2 horas a 1.240 suscriptores.</p>
                    </article>
                </div>
            `,
        },
        'informe-evento': {
            title: 'Informe por Evento',
            html: `
                <h1 class="gestionAdminPanelTitle">Informe por Evento</h1>
                <p class="gestionAdminPanelText">Visualiza metricas individuales de participacion y alcance por cada evento.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Mas visitado</h2>
                        <p>Foro de Inclusion Digital con 980 visitas.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Conversion promedio</h2>
                        <p>42% de registros sobre visualizaciones.</p>
                    </article>
                </div>
            `,
        },
        'informe-difusion': {
            title: 'Informe por Lista de Difusion',
            html: `
                <h1 class="gestionAdminPanelTitle">Informe por Lista de Difusion</h1>
                <p class="gestionAdminPanelText">Revisa aperturas, clics y bajas por cada lista de difusion.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Tasa de apertura</h2>
                        <p>Promedio mensual del 67%.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Tasa de clics</h2>
                        <p>18% de interaccion en el ultimo boletin.</p>
                    </article>
                </div>
            `,
        },
        'informe-editor': {
            title: 'Informe por Editor',
            html: `
                <h1 class="gestionAdminPanelTitle">Informe por Editor</h1>
                <p class="gestionAdminPanelText">Consulta productividad y calidad de contenido por editor asignado.</p>
                <div class="gestionAdminPanelCards">
                    <article class="gestionAdminPanelCard">
                        <h2>Editor destacado</h2>
                        <p>Maria Rojas: 24 publicaciones aprobadas.</p>
                    </article>
                    <article class="gestionAdminPanelCard">
                        <h2>Tiempo de aprobacion</h2>
                        <p>Promedio de revision: 1.7 dias por evento.</p>
                    </article>
                </div>
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