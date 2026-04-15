document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.gestionAdminMenuOption');
    const mobileMenuLabel = document.getElementById('gestionAdminMobileMenuLabel');

    if (!sidebarLinks.length) {
        return;
    }

    const activeKey = 'gestionAdminActiveSidebarLink';

    const getSidebarKey = (link) => link.dataset.sidebarKey || link.textContent.trim();

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

            localStorage.setItem(activeKey, activeKeyValue);
            return;
        }

        if (mobileMenuLabel) {
            mobileMenuLabel.textContent = 'Opciones de gestión';
        }
    };

    localStorage.removeItem(activeKey);
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