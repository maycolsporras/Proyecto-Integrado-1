const express = require('express');
const ListaDifusion = require('../models/lista-difusion.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_aprobacion', 'aprobada', 'rechazada']);

const normalizarTexto = (valor) => {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
};

router.post('/', async (req, res) => {
    try {
        const nombreLista = normalizarTexto(req.body?.nombreLista);
        const descripcionLista = normalizarTexto(req.body?.descripcionLista);
        const autorCorreo = normalizarTexto(req.body?.autorCorreo) || 'editorEventos@conapdis.com';

        if (!nombreLista || !descripcionLista) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nombre y la descripción de la lista son obligatorios.',
            });
        }

        const listaCreada = await ListaDifusion.create({
            nombreLista,
            descripcionLista,
            autorCorreo,
            numeroSuscriptores: 0,
            estado: 'pendiente_aprobacion',
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Lista de difusión guardada correctamente.',
            lista: listaCreada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo guardar la lista de difusión.',
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

        const listas = await ListaDifusion.find(filtros).sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            listas,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar las listas de difusión.',
            detalle: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const lista = await ListaDifusion.findById(req.params.id);

        if (!lista) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró la lista solicitada.',
            });
        }

        return res.status(200).json({
            ok: true,
            lista,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo consultar la lista de difusión.',
            detalle: error.message,
        });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const nombreLista = normalizarTexto(req.body?.nombreLista);
        const descripcionLista = normalizarTexto(req.body?.descripcionLista);

        if (!nombreLista || !descripcionLista) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nombre y la descripción de la lista son obligatorios.',
            });
        }

        const listaActualizada = await ListaDifusion.findByIdAndUpdate(
            req.params.id,
            {
                nombreLista,
                descripcionLista,
            },
            { new: true, runValidators: true },
        );

        if (!listaActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró la lista solicitada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Lista de difusión actualizada correctamente.',
            lista: listaActualizada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar la lista de difusión.',
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
                mensaje: 'El estado enviado no es válido.',
            });
        }

        const actualizaciones = { estado };

        if (estado === 'rechazada') {
            if (!motivoRechazo) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe incluir un motivo para rechazar la lista.',
                });
            }

            actualizaciones.motivoRechazo = motivoRechazo;
            actualizaciones.fechaRechazo = new Date();
        } else {
            actualizaciones.motivoRechazo = '';
            actualizaciones.fechaRechazo = null;
        }

        const listaActualizada = await ListaDifusion.findByIdAndUpdate(
            req.params.id,
            actualizaciones,
            { new: true, runValidators: true },
        );

        if (!listaActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró la lista solicitada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Estado de la lista actualizado correctamente.',
            lista: listaActualizada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar el estado de la lista.',
            detalle: error.message,
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const listaEliminada = await ListaDifusion.findByIdAndDelete(req.params.id);

        if (!listaEliminada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontró la lista solicitada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Lista de difusión eliminada correctamente.',
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo eliminar la lista de difusión.',
            detalle: error.message,
        });
    }
});

module.exports = router;