# Requerimientos No Funcionales  
## Plataforma Web – Sección de Eventos  
### Política Nacional en Discapacidad  

---

## RNF-01
El sistema debe cumplir con el estándar WCAG 2.1 Nivel AA, garantizando navegación completa mediante teclado y lectores de pantalla.

---

## RNF-02
El tiempo de carga de la página principal de eventos no debe superar los 2.0 segundos con una concurrencia de 100 usuarios.

---

## RNF-03
El sistema debe gestionar la autenticación mediante JSON Web Tokens (JWT) con una duración de sesión de 120 minutos.

---

## RNF-04
El módulo de eventos debe garantizar un Uptime del 99.9% (disponibilidad de servicio anual).

---

## RNF-05
El sistema debe usar transacciones de base de datos para asegurar que no se exceda el cupo máximo en inscripciones simultáneas (Manejo de concurrencia).

---

## RNF-06
Toda la comunicación entre cliente y servidor debe estar cifrada bajo protocolo HTTPS con TLS 1.3.

---

## RNF-07
La interfaz debe adaptarse automáticamente a resoluciones desde 360px hasta 1920px de ancho sin pérdida de funcionalidad.

---

## RNF-08
El código fuente debe estar documentado y alcanzar una cobertura mínima de pruebas unitarias del 85%.

---

## RNF-09
El flujo de inscripción desde el catálogo hasta la confirmación debe completarse en un máximo de 4 clics.

---

## RNF-10
El sistema debe soportar una base de datos de hasta 100 eventos sin degradar el tiempo de búsqueda por encima de 1.5 segundos.

---

## RNF-11
El sistema debe realizar respaldos automáticos cada 6 horas con un tiempo de recuperación (RTO) menor a 1 hora.

---

## RNF-12
Los datos personales (email, RUT/ID) deben almacenarse cifrados en la base de datos utilizando el algoritmo AES-256.