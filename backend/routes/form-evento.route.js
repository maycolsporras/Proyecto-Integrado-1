const express = require('express');
const multer = require('multer');
const path = require('node:path');
const mongoose = require('mongoose');
const FormEvento = require('../models/form-evento.model.js');
const ListaDifusion = require('../models/lista-difusion.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado', 'borrador']);
const estadosVigenciaPermitidos = new Set(['activo', 'eliminado']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replaceAll(' ', '-');
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

const parseJsonField = (rawValue, fallback) => {
    if (!rawValue) {
        return fallback;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        return fallback;
    }
};

const buildArchivoMetadata = (files = []) => {
    return files.map((file) => ({
        nombreOriginal: file.originalname || '',
        nombreArchivo: file.filename || '',
        ruta: file.path || '',
        mimetype: file.mimetype || '',
        tamano: file.size || 0,
    }));
};

const toDateOnly = (dateValue) => {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
        return null;
    }

    return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
};

const parseFechaIso = (fecha) => {
    const anio = Number.parseInt(fecha?.anio, 10);
    const mes = Number.parseInt(fecha?.mes, 10);
    const dia = Number.parseInt(fecha?.dia, 10);

    if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
        return toDateOnly(new Date(anio, mes - 1, dia));
    }

    const isoValue = fecha?.iso;

    if (!isoValue) {
        return null;
    }

    const parsedDate = new Date(isoValue);
    return toDateOnly(parsedDate);
};

const getFechaFinEvento = (evento) => {
    const fechasEvento = Array.isArray(evento.fechasEvento) ? evento.fechasEvento : [];
    const fechasValidas = fechasEvento
        .map((fecha) => parseFechaIso(fecha))
        .filter(Boolean)
        .sort((a, b) => a - b);

    if (fechasValidas.length > 0) {
        return fechasValidas[fechasValidas.length - 1];
    }

    return parseFechaIso(evento.fechaFinVisualizacion) || parseFechaIso(evento.fechaPublicacion);
};

const getEstadoVigenciaEvento = (evento) => {
    const fechaFinEvento = getFechaFinEvento(evento);

    if (!fechaFinEvento) {
        return 'activo';
    }

    const hoy = toDateOnly(new Date());
    return fechaFinEvento < hoy ? 'eliminado' : 'activo';
};

const buildEventoResponse = (evento) => {
    const eventoPlano = evento.toObject();
    return {
        ...eventoPlano,
        estadoVigencia: getEstadoVigenciaEvento(eventoPlano),
    };
};

const resolverListaDifusionAprobada = async ({ listaDifusionId, listaDifusionNombre }) => {
    const idNormalizado = typeof listaDifusionId === 'string' ? listaDifusionId.trim() : '';
    const nombreNormalizado = typeof listaDifusionNombre === 'string' ? listaDifusionNombre.trim() : '';

    let lista = null;

    if (idNormalizado && mongoose.Types.ObjectId.isValid(idNormalizado)) {
        lista = await ListaDifusion.findOne({ _id: idNormalizado, estado: 'aprobada' });
    }

    if (!lista && nombreNormalizado) {
        lista = await ListaDifusion.findOne({ nombreLista: nombreNormalizado, estado: 'aprobada' });
    }

    if (!lista) {
        return null;
    }

    return {
        listaDifusionId: String(lista._id),
        listaDifusionNombre: lista.nombreLista,
        listaDifusion: lista.nombreLista,
    };
};

// Guarda un evento con archivos y lista aprobada
router.post('/', upload.fields([
    { name: 'imagenes', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
]), async (req, res) => {
    try {
        const fechaPublicacion = parseJsonField(req.body.fechaPublicacion, {});
        const fechasEvento = parseJsonField(req.body.fechasEvento, []);
        const horario = parseJsonField(req.body.horario, {});
        const contacto = parseJsonField(req.body.contacto, {});
        const referencias = parseJsonField(req.body.referencias, []);
        const palabrasClave = parseJsonField(req.body.palabrasClave, []);
        const formularioInteresados = parseJsonField(req.body.formularioInteresados, {});
        const fechaFinVisualizacion = parseJsonField(req.body.fechaFinVisualizacion, {});
        const redesSociales = parseJsonField(req.body.redesSociales, []);
        const listaDifusionSeleccionada = await resolverListaDifusionAprobada({
            listaDifusionId: req.body.listaDifusionId,
            listaDifusionNombre: req.body.listaDifusionNombre || req.body.listaDifusion,
        });

        if (!listaDifusionSeleccionada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe seleccionar una lista de difusion aprobada valida.',
            });
        }

        const imagenes = buildArchivoMetadata(req.files?.imagenes || []);
        const videos = buildArchivoMetadata(req.files?.videos || []);

        const nuevoFormularioEvento = new FormEvento({
            nombreEvento: req.body.nombreEvento,
            fechaPublicacion,
            fechasEvento,
            horario,
            lugarEvento: req.body.lugarEvento,
            linkCalendar: req.body.linkCalendar,
            descripcionEvento: req.body.descripcionEvento,
            objetivosEvento: req.body.objetivosEvento,
            agendaEvento: req.body.agendaEvento,
            agendaLecturaFacil: req.body.agendaLecturaFacil,
            contacto,
            descripcionImagen: req.body.descripcionImagen,
            imagenes,
            videos,
            publicoMeta: req.body.publicoMeta,
            cupoEvento: req.body.cupoEvento,
            infoAdicional: req.body.infoAdicional,
            referencias,
            palabrasClave,
            formularioInteresados,
            fijarImportante: req.body.fijarImportante === 'true',
            ...listaDifusionSeleccionada,
            fechaFinVisualizacion,
            redesSociales,
            estado: req.body.estado || 'pendiente_aprobacion',
        });

        const guardado = await nuevoFormularioEvento.save();

        return res.status(201).json({
            ok: true,
            mensaje: 'Formulario de evento guardado correctamente',
            id: guardado._id,
        });
    } catch (error) {
        console.error('Error en POST /api/form-evento:', error);

        const responsePayload = {
            ok: false,
            mensaje: 'No se pudo guardar el formulario del evento',
            detalle: error.message,
        };

        if (error.name === 'ValidationError') {
            responsePayload.mensaje = 'Datos inválidos en el formulario de evento';
            responsePayload.errores = error.errors;
        }

        return res.status(error.name === 'ValidationError' ? 400 : 500).json(responsePayload);
    }
});

// Lista eventos con su vigencia
router.get('/', async (req, res) => {
    try {
        const filtros = {};

        if (req.query.estado && estadosPermitidos.has(req.query.estado)) {
            filtros.estado = req.query.estado;
        }

        const eventos = await FormEvento.find(filtros).sort({ createdAt: -1 });
        const eventosConVigencia = eventos.map((evento) => buildEventoResponse(evento));

        let resultado = eventosConVigencia;
        if (req.query.estadoVigencia && estadosVigenciaPermitidos.has(req.query.estadoVigencia)) {
            resultado = eventosConVigencia.filter((evento) => evento.estadoVigencia === req.query.estadoVigencia);
        }

        return res.status(200).json({
            ok: true,
            eventos: resultado,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar los eventos.',
            detalle: error.message,
        });
    }
});

// Trae un evento por id
router.get('/:id', async (req, res) => {
    try {
        const evento = await FormEvento.findById(req.params.id);

        if (!evento) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el evento solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            evento: buildEventoResponse(evento),
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo consultar el evento.',
            detalle: error.message,
        });
    }
});

// Actualiza un evento con archivos nuevos
router.patch('/:id', upload.fields([
    { name: 'imagenes', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
]), async (req, res) => {
    try {
        const eventoExistente = await FormEvento.findById(req.params.id);

        if (!eventoExistente) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el evento solicitado.',
            });
        }

        const fechaPublicacion = parseJsonField(req.body.fechaPublicacion, eventoExistente.fechaPublicacion);
        const fechasEvento = parseJsonField(req.body.fechasEvento, eventoExistente.fechasEvento);
        const horario = parseJsonField(req.body.horario, eventoExistente.horario);
        const contacto = parseJsonField(req.body.contacto, eventoExistente.contacto);
        const referencias = parseJsonField(req.body.referencias, eventoExistente.referencias);
        const palabrasClave = parseJsonField(req.body.palabrasClave, eventoExistente.palabrasClave);
        const formularioInteresados = parseJsonField(req.body.formularioInteresados, eventoExistente.formularioInteresados);
        const fechaFinVisualizacion = parseJsonField(req.body.fechaFinVisualizacion, eventoExistente.fechaFinVisualizacion);
        const redesSociales = parseJsonField(req.body.redesSociales, eventoExistente.redesSociales);
        const listaDifusionSeleccionada = await resolverListaDifusionAprobada({
            listaDifusionId: req.body.listaDifusionId,
            listaDifusionNombre: req.body.listaDifusionNombre || req.body.listaDifusion,
        });

        if (!listaDifusionSeleccionada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe seleccionar una lista de difusion aprobada valida.',
            });
        }

        const estadoRecibido = req.body.estado;
        if (estadoRecibido && !estadosPermitidos.has(estadoRecibido)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado enviado no es válido.',
            });
        }

        const estadoFinal = estadoRecibido || eventoExistente.estado;

        const actualizaciones = {
            nombreEvento: req.body.nombreEvento,
            fechaPublicacion,
            fechasEvento,
            horario,
            lugarEvento: req.body.lugarEvento,
            linkCalendar: req.body.linkCalendar,
            descripcionEvento: req.body.descripcionEvento,
            objetivosEvento: req.body.objetivosEvento,
            agendaEvento: req.body.agendaEvento,
            agendaLecturaFacil: req.body.agendaLecturaFacil,
            contacto,
            descripcionImagen: req.body.descripcionImagen,
            publicoMeta: req.body.publicoMeta,
            cupoEvento: req.body.cupoEvento,
            infoAdicional: req.body.infoAdicional,
            referencias,
            palabrasClave,
            formularioInteresados,
            fijarImportante: req.body.fijarImportante === 'true',
            ...listaDifusionSeleccionada,
            fechaFinVisualizacion,
            redesSociales,
            estado: estadoFinal,
        };

        const imagenes = buildArchivoMetadata(req.files?.imagenes || []);
        if (imagenes.length > 0) {
            actualizaciones.imagenes = imagenes;
        }

        const videos = buildArchivoMetadata(req.files?.videos || []);
        if (videos.length > 0) {
            actualizaciones.videos = videos;
        }

        if (estadoFinal !== 'rechazado') {
            actualizaciones.motivoRechazo = '';
            actualizaciones.fechaRechazo = null;
        }

        const eventoActualizado = await FormEvento.findByIdAndUpdate(
            req.params.id,
            actualizaciones,
            { returnDocument: 'after', runValidators: true },
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Evento actualizado correctamente.',
            evento: buildEventoResponse(eventoActualizado),
        });
    } catch (error) {
        const responsePayload = {
            ok: false,
            mensaje: 'No se pudo actualizar el evento.',
            detalle: error.message,
        };

        if (error.name === 'ValidationError') {
            responsePayload.mensaje = 'Datos inválidos al actualizar el evento';
            responsePayload.errores = error.errors;
        }

        return res.status(error.name === 'ValidationError' ? 400 : 500).json(responsePayload);
    }
});

// Cambia solo el estado del evento
router.patch('/:id/estado', async (req, res) => {
    try {
        const estado = req.body?.estado;
        const motivoRechazo = req.body?.motivoRechazo;

        if (!estado || !estadosPermitidos.has(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado enviado no es válido.',
            });
        }

        const actualizaciones = { estado };

        if (estado === 'rechazado') {
            const motivoNormalizado = typeof motivoRechazo === 'string' ? motivoRechazo.trim() : '';

            if (!motivoNormalizado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe incluir un motivo para rechazar el evento.',
                });
            }

            actualizaciones.motivoRechazo = motivoNormalizado;
            actualizaciones.fechaRechazo = new Date();
        } else {
            actualizaciones.motivoRechazo = '';
            actualizaciones.fechaRechazo = null;
        }

        const eventoActualizado = await FormEvento.findByIdAndUpdate(
            req.params.id,
            actualizaciones,
            { returnDocument: 'after' },
        );

        if (!eventoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el evento solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Estado del evento actualizado correctamente.',
            evento: buildEventoResponse(eventoActualizado),
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar el estado del evento.',
            detalle: error.message,
        });
    }
});

// Borra el evento seleccionado
router.delete('/:id', async (req, res) => {
    try {
        const eventoEliminado = await FormEvento.findByIdAndDelete(req.params.id);

        if (!eventoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el evento solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Evento eliminado correctamente.',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo eliminar el evento.',
            detalle: error.message,
        });
    }
});

// Manejo de errores de subida y validación
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('MulterError en /api/form-evento:', err);

        const mensaje = err.code === 'LIMIT_FILE_SIZE'
            ? 'El tamaño de alguno de los archivos excede el límite permitido.'
            : `Error de subida de archivos: ${err.message}`;

        return res.status(400).json({
            ok: false,
            mensaje,
            detalle: err.message,
            codigo: err.code,
        });
    }

    console.error('Error no manejado en /api/form-evento:', err);
    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        ok: false,
        mensaje: 'Error interno en /api/form-evento',
        detalle: err.message || 'Ocurrió un error inesperado.',
    });
});

module.exports = router;
