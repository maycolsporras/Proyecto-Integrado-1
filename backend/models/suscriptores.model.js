const mongoose = require('mongoose');

// Persona suscrita a las listas de difusión
const suscriptoresSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true, trim: true },
    correoElectronico: { type: String, required: true, trim: true, lowercase: true },
    profesionOficio: { type: String, required: true, trim: true },
    entidadVinculada: { type: String, required: true, trim: true },
    razonNotificacion: { type: String, required: true, trim: true },
    aceptaNotificaciones: { type: Boolean, required: true, default: true },
    listasDifusion: [{ type: String, trim: true }],
    listasDifusionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ListaDifusion' }],
    estado: {
        type: String,
        enum: ['pendiente_aprobacion', 'aprobado', 'rechazado'],
        default: 'pendiente_aprobacion',
    },
    motivoRechazo: { type: String, default: '' },
    fechaRechazo: { type: Date, default: null },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('Suscriptores', suscriptoresSchema);