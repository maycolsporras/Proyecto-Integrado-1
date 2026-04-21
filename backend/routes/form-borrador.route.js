const express = require('express');
const mongoose = require('mongoose');
const FormBorrador = require('../models/form-borrador.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobado', 'rechazado', 'borrador']);
const estadosVigenciaPermitidos = new Set(['activo', 'eliminado']);

// Convierte el snapshot del borrador a objeto real
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

// Normaliza el estado del borrador
const normalizeEstado = (estado) => {
    if (!estado || !estadosPermitidos.has(estado)) {
        return 'borrador';
    }

    return estado;
};

// Normaliza la vigencia del borrador
const normalizeEstadoVigencia = (estadoVigencia) => {
    if (!estadoVigencia || !estadosVigenciaPermitidos.has(estadoVigencia)) {
        return 'activo';
    }

    return estadoVigencia;
};

const buildBorradorLookupQuery = (draftParam) => {
    const idNormalizado = String(draftParam || '').trim();

    if (!idNormalizado) {
        return null;
    }

    const filtros = [{ draftKey: idNormalizado }];

    if (mongoose.Types.ObjectId.isValid(idNormalizado)) {
        filtros.push({ _id: idNormalizado });
    }

    return { $or: filtros };
};

// Guarda o actualiza un borrador del evento
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
                returnDocument: 'after',
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

// Lista los borradores guardados
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

// Trae un borrador por su clave
router.get('/:draftKey', async (req, res) => {
    try {
        const query = buildBorradorLookupQuery(req.params.draftKey);
        const borrador = query ? await FormBorrador.findOne(query) : null;

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

// Elimina el borrador seleccionado
router.delete('/:draftKey', async (req, res) => {
    try {
        const query = buildBorradorLookupQuery(req.params.draftKey);

        if (!query) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La clave del borrador es obligatoria.',
            });
        }

        await FormBorrador.deleteOne(query);

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

// Cambia el estado o la vigencia del borrador
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

        const query = buildBorradorLookupQuery(req.params.draftKey);

        if (!query) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La clave del borrador es obligatoria.',
            });
        }

        const borradorActualizado = await FormBorrador.findOneAndUpdate(
            query,
            actualizaciones,
            { returnDocument: 'after' },
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