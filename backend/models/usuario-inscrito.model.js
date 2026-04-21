const mongoose = require('mongoose');

// Registro de inscripción a un evento
const usuarioInscritoSchema = new mongoose.Schema({
    eventoId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormEvento', required: true },
    nombreCompleto: { type: String, required: true, trim: true },
    tipoIdentificacion: { type: String, trim: true },
    numeroIdentificacion: { type: String, trim: true },
    provincia: { type: String, trim: true },
    canton: { type: String, trim: true },
    distrito: { type: String, trim: true },
    otrasSenas: { type: String, trim: true },
    correoElectronico: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, trim: true },
    profesion: { type: String, trim: true },
    entidadTrabajo: { type: String, trim: true },
    tipoDeficiencia: { type: String, trim: true },
    requiereTransporte: { type: String, enum: ['si', 'no'], trim: true },
    montoTransporte: { type: String, trim: true },
    requiereHospedaje: { type: String, enum: ['si', 'no'], trim: true },
    montoHospedaje: { type: String, trim: true },
    requerimientosAlimentacion: { type: String, trim: true },
    alergiasMedicamentos: { type: String, enum: ['si', 'no'], trim: true },
    detalleAlergias: { type: String, trim: true },
    requiereInterprete: { type: String, enum: ['si', 'no'], trim: true },
    otrosApoyos: { type: String, trim: true },
    descripcionImagenAdjunta: { type: String, trim: true },
    imagenesAdjuntas: [{ type: String }],
    videoAdjunto: [{ type: String }],
    autorizaNotificaciones: { type: Boolean, default: false },
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

module.exports = mongoose.model('UsuarioInscrito', usuarioInscritoSchema);
