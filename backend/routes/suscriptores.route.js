const express = require('express');
const mongoose = require('mongoose');
const Suscriptores = require('../models/suscriptores.model.js');
const ListaDifusion = require('../models/lista-difusion.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado']);

// Limpia los datos que llegan del formulario
const normalizarTexto = (valor) => {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
};

// Registra un suscriptor nuevo
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

// Lista suscriptores por estado
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

// Cambia el estado del suscriptor
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

// Asigna listas de difusión aprobadas
router.patch('/:id/listas-difusion', async (req, res) => {
    try {
        const listaIdsRecibidas = Array.isArray(req.body?.listaIds) ? req.body.listaIds : [];
        const listaIdsNormalizadas = [...new Set(
            listaIdsRecibidas
                .map((id) => String(id || '').trim())
                .filter((id) => mongoose.Types.ObjectId.isValid(id)),
        )];

        if (!listaIdsNormalizadas.length) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe seleccionar al menos una lista de difusion valida.',
            });
        }

        const suscriptor = await Suscriptores.findById(req.params.id);

        if (!suscriptor) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro el suscriptor solicitado.',
            });
        }

        const listasAprobadas = await ListaDifusion.find({
            _id: { $in: listaIdsNormalizadas },
            estado: 'aprobada',
        }).select('_id nombreLista numeroSuscriptores');

        if (listasAprobadas.length !== listaIdsNormalizadas.length) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Una o varias listas seleccionadas no estan aprobadas o no existen.',
            });
        }

        const idsPrevios = new Set((suscriptor.listasDifusionIds || []).map(String));
        const idsNuevos = new Set(listasAprobadas.map((lista) => String(lista._id)));

        const idsADecrementar = [...idsPrevios].filter((id) => !idsNuevos.has(id));
        const idsAIncrementar = [...idsNuevos].filter((id) => !idsPrevios.has(id));

        for (const listaId of idsADecrementar) {
            const lista = await ListaDifusion.findById(listaId);
            if (!lista) {
                continue;
            }

            lista.numeroSuscriptores = Math.max(0, (lista.numeroSuscriptores || 0) - 1);
            await lista.save();
        }

        for (const listaId of idsAIncrementar) {
            await ListaDifusion.findByIdAndUpdate(listaId, { $inc: { numeroSuscriptores: 1 } });
        }

        suscriptor.listasDifusionIds = listasAprobadas.map((lista) => lista._id);
        suscriptor.listasDifusion = listasAprobadas.map((lista) => lista.nombreLista);
        await suscriptor.save();

        return res.status(200).json({
            ok: true,
            mensaje: 'Listas de difusion asignadas correctamente.',
            suscriptor,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron asignar las listas de difusion al suscriptor.',
            detalle: error.message,
        });
    }
});

// Elimina el suscriptor y ajusta contadores
router.delete('/:id', async (req, res) => {
    try {
        const suscriptorEliminado = await Suscriptores.findById(req.params.id);

        if (!suscriptorEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro el suscriptor solicitado.',
            });
        }

        const listasAsignadasIds = Array.isArray(suscriptorEliminado.listasDifusionIds)
            ? suscriptorEliminado.listasDifusionIds.map(String)
            : [];

        for (const listaId of listasAsignadasIds) {
            const lista = await ListaDifusion.findById(listaId);
            if (!lista) {
                continue;
            }

            lista.numeroSuscriptores = Math.max(0, (lista.numeroSuscriptores || 0) - 1);
            await lista.save();
        }

        await Suscriptores.findByIdAndDelete(req.params.id);

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