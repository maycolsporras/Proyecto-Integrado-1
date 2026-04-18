const express = require('express');
const FormBorrador = require('../models/form-borrador.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado', 'borrador']);
const estadosVigenciaPermitidos = new Set(['activo', 'eliminado']);

const parseSnapshot = (snapshot) => {
    if (!snapshot) {
        return null;
    }

    if (typeof snapshot === 'string') {
        try {
            return JSON.parse(snapshot);
        } catch {
            return null;
        }
    }

    return snapshot;
};

const normalizeEstado = (estado) => {
    if (!estado || !estadosPermitidos.has(estado)) {
        return 'borrador';
    }

    return estado;
};

const normalizeEstadoVigencia = (estadoVigencia) => {
    if (!estadoVigencia || !estadosVigenciaPermitidos.has(estadoVigencia)) {
        return 'activo';
    }

    return estadoVigencia;
};

router.post('/', async (req, res) => {
    try {
        const {
            draftKey,
            snapshot,
            estado,
            estadoVigencia,
        } = req.body;
        const parsedSnapshot = parseSnapshot(snapshot);

        if (!draftKey || !parsedSnapshot) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Faltan datos para guardar el borrador.',
            });
        }

        const borradorGuardado = await FormBorrador.findOneAndUpdate(
            { draftKey },
            {
                draftKey,
                snapshot: parsedSnapshot,
                estado: normalizeEstado(estado),
                estadoVigencia: normalizeEstadoVigencia(estadoVigencia),
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            },
        );

        return res.status(200).json({
            ok: true,
            mensaje: 'Borrador guardado correctamente.',
            id: borradorGuardado._id,
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se pudo guardar el borrador.',
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

        if (req.query.estadoVigencia && estadosVigenciaPermitidos.has(req.query.estadoVigencia)) {
            filtros.estadoVigencia = req.query.estadoVigencia;
        }

        const borradores = await FormBorrador.find(filtros).sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            borradores,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar los borradores.',
            detalle: error.message,
        });
    }
});

router.get('/:draftKey', async (req, res) => {
    try {
        const borrador = await FormBorrador.findOne({ draftKey: req.params.draftKey });

        if (!borrador) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el borrador solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            borrador,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo consultar el borrador.',
            detalle: error.message,
        });
    }
});

router.delete('/:draftKey', async (req, res) => {
    try {
        await FormBorrador.deleteOne({ draftKey: req.params.draftKey });

        return res.status(200).json({
            ok: true,
            mensaje: 'Borrador eliminado correctamente.',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo eliminar el borrador.',
            detalle: error.message,
        });
    }
});

router.patch('/:draftKey/estado', async (req, res) => {
    try {
        const estado = req.body?.estado;
        const estadoVigencia = req.body?.estadoVigencia;

        if (!estado && !estadoVigencia) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes enviar estado o estadoVigencia.',
            });
        }

        if (estado && !estadosPermitidos.has(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado enviado no es válido.',
            });
        }

        if (estadoVigencia && !estadosVigenciaPermitidos.has(estadoVigencia)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado de vigencia enviado no es válido.',
            });
        }

        const actualizaciones = {};

        if (estado) {
            actualizaciones.estado = estado;
        }

        if (estadoVigencia) {
            actualizaciones.estadoVigencia = estadoVigencia;
        }

        const borradorActualizado = await FormBorrador.findOneAndUpdate(
            { draftKey: req.params.draftKey },
            actualizaciones,
            { new: true },
        );

        if (!borradorActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró el borrador solicitado.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Estado del borrador actualizado correctamente.',
            borrador: borradorActualizado,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar el estado del borrador.',
            detalle: error.message,
        });
    }
});

module.exports = router;