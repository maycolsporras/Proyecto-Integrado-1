const express = require('express');
const Suscriptores = require('../models/suscriptores.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado']);

const normalizarTexto = (valor) => {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
};

router.post('/', async (req, res) => {
    try {
        const nombreCompleto = normalizarTexto(req.body?.nombreCompleto);
        const correoElectronico = normalizarTexto(req.body?.correoElectronico).toLowerCase();
        const profesionOficio = normalizarTexto(req.body?.profesionOficio);
        const entidadVinculada = normalizarTexto(req.body?.entidadVinculada);
        const razonNotificacion = normalizarTexto(req.body?.razonNotificacion);
        const aceptaNotificaciones = Boolean(req.body?.aceptaNotificaciones);

        if (!nombreCompleto || !correoElectronico || !profesionOficio || !entidadVinculada || !razonNotificacion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los campos obligatorios deben completarse.',
            });
        }

        if (!aceptaNotificaciones) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe aceptar recibir notificaciones para registrarse.',
            });
        }

        const suscriptorCreado = await Suscriptores.create({
            nombreCompleto,
            correoElectronico,
            profesionOficio,
            entidadVinculada,
            razonNotificacion,
            aceptaNotificaciones,
            estado: 'pendiente_aprobacion',
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Suscriptor guardado correctamente.',
            suscriptor: suscriptorCreado,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo guardar el suscriptor.',
            detalle: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const filtros = {};

        if (req.query.estado && estadosPermitidos.has(req.query.estado)) {
            filtros.estado = req.query.estado;
        }

        const suscriptores = await Suscriptores.find(filtros).sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            suscriptores,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar los suscriptores.',
            detalle: error.message,
        });
    }
});

router.patch('/:id/estado', async (req, res) => {
    try {
        const estado = normalizarTexto(req.body?.estado);
        const motivoRechazo = normalizarTexto(req.body?.motivoRechazo);

        if (!estadosPermitidos.has(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado enviado no es valido.',
            });
        }

        const actualizaciones = { estado };

        if (estado === 'rechazado') {
            if (!motivoRechazo) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe incluir un motivo para rechazar el suscriptor.',
                });
            }

            actualizaciones.motivoRechazo = motivoRechazo;
            actualizaciones.fechaRechazo = new Date();
        } else {
            actualizaciones.motivoRechazo = '';
            actualizaciones.fechaRechazo = null;
        }

        const suscriptorActualizado = await Suscriptores.findByIdAndUpdate(
            req.params.id,
            actualizaciones,
            { new: true, runValidators: true },
        );

        if (!suscriptorActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro el suscriptor solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Estado del suscriptor actualizado correctamente.',
            suscriptor: suscriptorActualizado,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar el estado del suscriptor.',
            detalle: error.message,
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const suscriptorEliminado = await Suscriptores.findByIdAndDelete(req.params.id);

        if (!suscriptorEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro el suscriptor solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Suscriptor eliminado correctamente.',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo eliminar el suscriptor.',
            detalle: error.message,
        });
    }
});

module.exports = router;