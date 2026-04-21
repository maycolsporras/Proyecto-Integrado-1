const express = require('express');
const mongoose = require('mongoose');
const ConsultaEventos = require('../models/consulta-eventos.model.js');
const FormEvento = require('../models/form-evento.model.js');

const router = express.Router();
const estadosPermitidos = new Set(['pendiente_respuesta', 'consulta_respondida']);

// Convierte el estado de la consulta al valor interno
const mapearEstadoConsulta = (estado) => {
    const valor = normalizarTexto(estado).toLowerCase().replaceAll(' ', '_');

    if (!valor) {
        return '';
    }

    if (valor === 'pendientes' || valor === 'pendiente') {
        return 'pendiente_respuesta';
    }

    if (valor === 'resueltas' || valor === 'resuelta' || valor === 'respondidas' || valor === 'respondida') {
        return 'consulta_respondida';
    }

    return valor;
};

// Limpia textos simples del formulario
const normalizarTexto = (valor) => {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
};

// Guarda una consulta solo si el evento está aprobado
router.post('/', async (req, res) => {
    try {
        const eventoId = normalizarTexto(req.body?.eventoId);
        const correoElectronico = normalizarTexto(req.body?.correoElectronico).toLowerCase();
        const consulta = normalizarTexto(req.body?.consulta);

        if (!eventoId || !mongoose.Types.ObjectId.isValid(eventoId)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe seleccionar un evento valido para realizar la consulta.',
            });
        }

        if (!correoElectronico || !consulta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los campos obligatorios deben completarse.',
            });
        }

        const evento = await FormEvento.findById(eventoId).select('_id estado');

        if (!evento || evento.estado !== 'aprobado') {
            return res.status(400).json({
                ok: false,
                mensaje: 'El evento seleccionado no esta disponible para consultas.',
            });
        }

        const consultaCreada = await ConsultaEventos.create({
            eventoId,
            correoElectronico,
            consulta,
            estado: 'pendiente_respuesta',
        });

        return res.status(201).json({
            ok: true,
            mensaje: 'Consulta enviada correctamente.',
            consulta: consultaCreada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo guardar la consulta del evento.',
            detalle: error.message,
        });
    }
});

// Lista consultas filtradas por estado o evento
router.get('/', async (req, res) => {
    try {
        const filtros = {};
        const estado = mapearEstadoConsulta(req.query?.estado);
        const eventoId = normalizarTexto(req.query?.eventoId);

        if (estado && estadosPermitidos.has(estado)) {
            filtros.estado = estado;
        }

        if (eventoId && mongoose.Types.ObjectId.isValid(eventoId)) {
            filtros.eventoId = eventoId;
        }

        const consultas = await ConsultaEventos.find(filtros)
            .populate('eventoId', 'nombreEvento contacto fechasEvento fechaPublicacion')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            consultas,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudieron consultar las consultas de eventos.',
            detalle: error.message,
        });
    }
});

// Registra la respuesta de una consulta
router.patch('/:id/respuesta', async (req, res) => {
    try {
        const respuesta = normalizarTexto(req.body?.respuesta);

        if (!respuesta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debe enviar una respuesta para resolver la consulta.',
            });
        }

        const consultaActualizada = await ConsultaEventos.findByIdAndUpdate(
            req.params.id,
            {
                respuesta,
                estado: 'consulta_respondida',
                fechaRespuesta: new Date(),
            },
            { new: true, runValidators: true },
        ).populate('eventoId', 'nombreEvento contacto fechasEvento fechaPublicacion');

        if (!consultaActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro la consulta solicitada.',
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Consulta respondida correctamente.',
            consulta: consultaActualizada,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo actualizar la consulta.',
            detalle: error.message,
        });
    }
});

module.exports = router;
