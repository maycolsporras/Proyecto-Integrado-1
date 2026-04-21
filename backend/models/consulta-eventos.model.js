const mongoose = require('mongoose');

// Mensaje enviado desde la sección de consultas
const consultaEventoSchema = new mongoose.Schema({
    eventoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormEvento',
        required: true,
    },
    correoElectronico: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    consulta: {
        type: String,
        required: true,
        trim: true,
    },
    respuesta: {
        type: String,
        default: '',
        trim: true,
    },
    estado: {
        type: String,
        enum: ['pendiente_respuesta', 'consulta_respondida'],
        default: 'pendiente_respuesta',
    },
    fechaRespuesta: {
        type: Date,
        default: null,
    },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('ConsultaEventos', consultaEventoSchema);
