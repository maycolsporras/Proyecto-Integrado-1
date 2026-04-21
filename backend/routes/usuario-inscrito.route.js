const express = require('express');
const mongoose = require('mongoose');
const UsuarioInscrito = require('../models/usuario-inscrito.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado']);

// Limpia los campos de texto recibidos
const normalizarTexto = (valor) => {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
};

// Guarda la inscripción de un evento
router.post('/', async (req, res) => {
    try {
        const eventoId = normalizarTexto(req.body?.eventoId);
        const nombreCompleto = normalizarTexto(req.body?.nombreCompleto);
        const correoElectronico = normalizarTexto(req.body?.correoElectronico).toLowerCase();

        if (!eventoId || !nombreCompleto || !correoElectronico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del evento, nombre completo y correo electrónico son obligatorios.',
            });
        }

        // Verifica que el evento exista en Mongo
        if (!mongoose.Types.ObjectId.isValid(eventoId)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del evento no es válido.',
            });
        }

        const inscripcionCreada = await UsuarioInscrito.create({
            eventoId,
            nombreCompleto,
            tipoIdentificacion: normalizarTexto(req.body?.tipoIdentificacion),
            numeroIdentificacion: normalizarTexto(req.body?.numeroIdentificacion),
            provincia: normalizarTexto(req.body?.provincia),
            canton: normalizarTexto(req.body?.canton),
            distrito: normalizarTexto(req.body?.distrito),
            otrasSenas: normalizarTexto(req.body?.otrasSenas),
            correoElectronico,
            telefono: normalizarTexto(req.body?.telefono),
            profesion: normalizarTexto(req.body?.profesion),
            entidadTrabajo: normalizarTexto(req.body?.entidadTrabajo),
            tipoDeficiencia: normalizarTexto(req.body?.tipoDeficiencia),
            requiereTransporte: req.body?.requiereTransporte || undefined,
            montoTransporte: normalizarTexto(req.body?.montoTransporte),
            requiereHospedaje: req.body?.requiereHospedaje || undefined,
            montoHospedaje: normalizarTexto(req.body?.montoHospedaje),
            requerimientosAlimentacion: normalizarTexto(req.body?.requerimientosAlimentacion),
            alergiasMedicamentos: req.body?.alergiasMedicamentos || undefined,
            detalleAlergias: normalizarTexto(req.body?.detalleAlergias),
            requiereInterprete: req.body?.requiereInterprete || undefined,
            otrosApoyos: normalizarTexto(req.body?.otrosApoyos),
            descripcionImagenAdjunta: normalizarTexto(req.body?.descripcionImagenAdjunta),
            imagenesAdjuntas: Array.isArray(req.body?.imagenesAdjuntas) ? req.body.imagenesAdjuntas : [],
            videoAdjunto: Array.isArray(req.body?.videoAdjunto) ? req.body.videoAdjunto : [],
            autorizaNotificaciones: Boolean(req.body?.autorizaNotificaciones),
            estado: 'pendiente_aprobacion',
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Inscripción guardada correctamente.',
            inscripcion: inscripcionCreada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo guardar la inscripción.',
            detalle: error.message,
        });
    }
});

// Lista inscripciones por evento o estado
router.get('/', async (req, res) => {
    try {
        const filtros = {};

        if (req.query.eventoId && mongoose.Types.ObjectId.isValid(req.query.eventoId)) {
            filtros.eventoId = req.query.eventoId;
        }

        if (req.query.estado && estadosPermitidos.has(req.query.estado)) {
            filtros.estado = req.query.estado;
        }

        const inscripciones = await UsuarioInscrito.find(filtros)
            .populate('eventoId', 'nombreEvento')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            inscripciones,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar las inscripciones.',
            detalle: error.message,
        });
    }
});

// Trae una inscripción por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID de la inscripción no es válido.',
            });
        }

        const inscripcion = await UsuarioInscrito.findById(id).populate('eventoId', 'nombreEvento');

        if (!inscripcion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Inscripción no encontrada.',
            });
        }

        return res.status(200).json({
            ok: true,
            inscripcion,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo consultar la inscripción.',
            detalle: error.message,
        });
    }
});

// Cambia el estado de la inscripción
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const estado = normalizarTexto(req.body?.estado);
        const motivoRechazo = normalizarTexto(req.body?.motivoRechazo);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID de la inscripción no es válido.',
            });
        }

        if (!estadosPermitidos.has(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado enviado no es válido.',
            });
        }

        const actualizaciones = { estado };

        if (estado === 'rechazado' && motivoRechazo) {
            actualizaciones.motivoRechazo = motivoRechazo;
            actualizaciones.fechaRechazo = new Date();
        }

        const inscripcionActualizada = await UsuarioInscrito.findByIdAndUpdate(
            id,
            actualizaciones,
            { new: true }
        ).populate('eventoId', 'nombreEvento');

        if (!inscripcionActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Inscripción no encontrada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: `Inscripción actualizada a estado ${estado}.`,
            inscripcion: inscripcionActualizada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar el estado de la inscripción.',
            detalle: error.message,
        });
    }
});

// Elimina una inscripción
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID de la inscripción no es válido.',
            });
        }

        const inscripcionEliminada = await UsuarioInscrito.findByIdAndDelete(id);

        if (!inscripcionEliminada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Inscripción no encontrada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Inscripción eliminada correctamente.',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo eliminar la inscripción.',
            detalle: error.message,
        });
    }
});

module.exports = router;
