# Plataforma Web – Sección de Eventos
## Política Nacional en Discapacidad

### Descripción del Proyecto
Este proyecto consiste en la ampliación de la plataforma web de la Política Nacional en Discapacidad, incorporando una nueva sección de eventos.

El objetivo principal es permitir a los usuarios descubrir, compartir y promover eventos relacionados con la temática de discapacidad, fortaleciendo la interacción comunitaria y la difusión de actividades.

### Instalación y configuración

#### Requisitos previos
- Node.js instalado en el equipo.
- MongoDB Atlas o una instancia de MongoDB disponible.

#### Configuración del backend
1. Abrir una terminal dentro de la carpeta `backend`.
2. Instalar las dependencias.

### Dependencias y cómo instalarlas

Dependencias principales:
- `express`: servidor web y rutas.
- `mongoose`: conexión y modelado con MongoDB.
- `cors`: habilitar acceso entre frontend y backend.
- `dotenv`: cargar variables de entorno.
- `body-parser`: procesar datos enviados por formularios.
- `multer`: manejo de archivos subidos.

El proyecto usa dependencias de Node.js en el backend. Para instalarlas, ejecuta esta línea en la terminal integrada de la carpeta
del backend:

```bash
npm i -y
```

### Comandos para ejecutar el proyecto

#### Ejecutar el backend
Desde la carpeta `backend`, ejecuta:

```bash
node index.js
```

El servidor quedará disponible en `http://localhost:3000` si no cambias el puerto en el archivo `.env`.

#### Abrir el frontend
El frontend es estático y se sirve desde el backend. Una vez levantado el servidor, abre en el navegador:

### Notas del proyecto
- El backend sirve los archivos del frontend desde la carpeta `frontend`.
- Al iniciar, el servidor crea usuarios y eventos de prueba si la base de datos está vacía.
- Para efectos de pruebas y entrega al cliente, están registrados los siguientes usuarios con sus respectivos permisos:
	- Editor: `editorEventos@conapdis.com` / Contraseña: `asd123`
	- Administrador: `administradorEventos@conapdis.com` / Contraseña: `qwe123`

---

## Información adicional

## Convenciones de Nomenclatura y Formato de Código

### Nomenclatura
- Variables y funciones: camelCase  
	Ejemplo: obtenerEventos(), fechaInicioEvento
- Clases: camelCase   
	Ejemplo: eventoController, eventoService
- Archivos: kebab-case  
	Ejemplo: eventos-list.component.js
- Carpetas: minúsculas  
	Ejemplo: components, services, requirements

### Formato de Código
- Indentación: 2 o 4 espacios (según estándar del lenguaje utilizado).
- Código limpio y comentado.
- Evitar código duplicado.
- Seguir principios de Clean Code.

---

## Estrategia de Branches

Se utilizará la siguiente estrategia basada en Git Flow simplificado:

- main → Rama de producción.
- develop → Rama de integración.
- feature-nombre-feature → Nuevas funcionalidades.
- fix-nombre-fix → Corrección de errores.
- docs-nombre-doc → Cambios en documentación.

---

## Convención de Commits

Los mensajes de commit siguen la convención:

tipo: descripción breve en gerundio.

Ejemplo:
[feat]: agregando listado de eventos
[fix]: corregiendo validación de formulario
[docs]: actualizando requerimientos funcionales

---

## Tipos de Commit

- [new] → Creación inicial de archivos, módulos o estructuras.
- [feat] → Nueva funcionalidad
- [fix] → Corrección de errores
- [docs] → Cambios en documentación
- [style] → Cambios de formato (sin alterar lógica)
- [refactor] → Mejora interna del código
- [test] → Pruebas
- [chore] → Tareas de mantenimiento

---

## Objetivo del Proyecto

Implementar una sección de eventos que:
- Permita visualizar eventos.
- Permita registrar nuevos eventos.
- Permita compartir eventos.
- Mejore la interacción comunitaria.

---


