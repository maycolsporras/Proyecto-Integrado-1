const express = require('express');
const FormBorrador = require('../models/form-borrador.model.js');

const router = express.Router();

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

router.post('/', async (req, res) => {
    try {
        const { draftKey, snapshot } = req.body;
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
                estado: 'borrador',
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

module.exports = router;