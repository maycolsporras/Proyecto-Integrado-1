const express = require('express');
const multer = require('multer');
const path = require('node:path');
const FormEvento = require('../models/form-evento.model.js');

const router = express.Router();

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
            listaDifusion: req.body.listaDifusion,
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
        return res.status(400).json({
            ok: false,
            mensaje: 'No se pudo guardar el formulario del evento',
            detalle: error.message,
        });
    }
});

module.exports = router;
