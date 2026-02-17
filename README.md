# Plataforma Web – Sección de Eventos
## Política Nacional en Discapacidad

### Descripción del Proyecto
Este proyecto consiste en la ampliación de la plataforma web de la Política Nacional en Discapacidad, incorporando una nueva sección de eventos.

El objetivo principal es permitir a los usuarios descubrir, compartir y promover eventos relacionados con la temática de discapacidad, fortaleciendo la interacción comunitaria y la difusión de actividades.

---

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
- feature/nombre-feature → Nuevas funcionalidades.
- fix/nombre-fix → Corrección de errores.
- docs/nombre-doc → Cambios en documentación.

---

## Convención de Commits

Los mensajes de commit siguen la convención:

tipo: descripción breve en infinitivo

Ejemplo:
feat: agregar listado de eventos
fix: corregir validación de formulario
docs: actualizar requerimientos funcionales

---

## Tipos de Commit

- new → Creación inicial de archivos, módulos o estructuras.
- feat → Nueva funcionalidad
- fix → Corrección de errores
- docs → Cambios en documentación
- style → Cambios de formato (sin alterar lógica)
- refactor → Mejora interna del código
- test → Pruebas
- chore → Tareas de mantenimiento

---

## Objetivo del Proyecto

Implementar una sección de eventos que:
- Permita visualizar eventos.
- Permita registrar nuevos eventos.
- Permita compartir eventos.
- Mejore la interacción comunitaria.
