const mongoose = require('mongoose');

// Borrador delformulario de evento
const formBorradorSchema = new mongoose.Schema({
    draftKey: { type: String, required: true, unique: true, index: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    estado: {
        type: String,
        enum: ['pendiente_aprobacion', 'aprobado', 'rechazado', 'borrador'],
        default: 'borrador',
    },
    estadoVigencia: {
        type: String,
        enum: ['activo', 'eliminado'],
        default: 'activo',
    },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('FormBorrador', formBorradorSchema);