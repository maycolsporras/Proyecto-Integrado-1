const mongoose = require('mongoose');

// Lista de difusión con estado de aprobación
const listaDifusionSchema = new mongoose.Schema({
    nombreLista: { type: String, required: true, trim: true },
    descripcionLista: { type: String, required: true, trim: true },
    autorCorreo: { type: String, required: true, trim: true, default: 'editorEventos@conapdis.com' },
    numeroSuscriptores: { type: Number, default: 0, min: 0 },
    estado: {
        type: String,
        enum: ['pendiente_aprobacion', 'aprobada', 'rechazada'],
        default: 'pendiente_aprobacion',
    },
    motivoRechazo: { type: String, default: '' },
    fechaRechazo: { type: Date, default: null },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('ListaDifusion', listaDifusionSchema);