const mongoose = require('mongoose');

const fechaSchema = new mongoose.Schema({
    anio: { type: String, default: '' },
    mes: { type: String, default: '' },
    dia: { type: String, default: '' },
    iso: { type: String, default: '' },
}, { _id: false });

const archivoSchema = new mongoose.Schema({
    nombreOriginal: { type: String, default: '' },
    nombreArchivo: { type: String, default: '' },
    ruta: { type: String, default: '' },
    mimetype: { type: String, default: '' },
    tamano: { type: Number, default: 0 },
}, { _id: false });

const referenciaSchema = new mongoose.Schema({
    texto: { type: String, default: '' },
    link: { type: String, default: '' },
}, { _id: false });

const formEventoSchema = new mongoose.Schema({
    nombreEvento: { type: String, required: true, trim: true },
    fechaPublicacion: { type: fechaSchema, required: true },
    fechasEvento: { type: [fechaSchema], default: [] },
    horario: {
        horaInicio: { type: String, default: '' },
        horaFin: { type: String, default: '' },
    },
    lugarEvento: { type: String, required: true, trim: true },
    linkCalendar: { type: String, required: true, trim: true },
    descripcionEvento: { type: String, required: true, default: '' },
    objetivosEvento: { type: String, required: true, default: '' },
    agendaEvento: { type: String, required: true, default: '' },
    agendaLecturaFacil: { type: String, required: true, default: '' },
    contacto: {
        nombreCompleto: { type: String, required: true, trim: true },
        correoElectronico: { type: String, required: true, trim: true },
    },
    descripcionImagen: { type: String, required: true, trim: true },
    imagenes: { type: [archivoSchema], default: [] },
    videos: { type: [archivoSchema], default: [] },
    publicoMeta: { type: String, required: true, trim: true },
    cupoEvento: { type: String, required: true, trim: true },
    infoAdicional: { type: String, required: true, default: '' },
    referencias: { type: [referenciaSchema], default: [] },
    palabrasClave: { type: [String], default: [] },
    formularioInteresados: {
        tipo: { type: String, required: true, trim: true },
        aspectosSeleccionados: { type: [String], default: [] },
    },
    fijarImportante: { type: Boolean, default: false },
    listaDifusion: { type: String, default: '' },
    fechaFinVisualizacion: { type: fechaSchema, required: true },
    redesSociales: { type: [String], default: [] },
    estado: {
        type: String,
        enum: ['pendiente_aprobacion', 'aprobado', 'rechazado', 'borrador'],
        default: 'pendiente_aprobacion',
    },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('FormEvento', formEventoSchema);
