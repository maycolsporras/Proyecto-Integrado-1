document.addEventListener('DOMContentLoaded', () => {
    const formularioLogin = document.querySelector('.needs-validation');
    const contenedorMensaje = document.getElementById('mensaje-error');

    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            if (!formularioLogin.checkValidity()) {
                evento.stopPropagation();
                formularioLogin.classList.add('was-validated');
                ejecutarEfectoError(formularioLogin);
                return;
            }

            // Preparacion de datos para enviar
            const datos = new URLSearchParams(new FormData(formularioLogin));

            try {
                const respuesta = await fetch('/api/auth/login', {
                    method: 'POST',
                    body: datos
                });

                const resultado = await respuesta.json();

                if (respuesta.ok && resultado.éxito) {
                    window.location.href = resultado.url;
                } else {
                    contenedorMensaje.textContent = resultado.mensaje;
                    contenedorMensaje.style.display = 'block';
                    ejecutarEfectoError(formularioLogin);
                }
            } catch (error) {
                console.error('Error en la comunicación con el servidor');
            }
        });
    }
});

function ejecutarEfectoError(elemento) {
    elemento.classList.add('animacion-sacudida');
    setTimeout(() => elemento.classList.remove('animacion-sacudida'), 500);
}