const mongoose = require('mongoose');

// Usuario base del sistema
const usuarioSchema = new mongoose.Schema({
    nombreUsuario: { type: String, 
        required: true, 
        unique: true 
    },
    correoElectronico: { type: String, 
        required: true, 
        unique: true 
    },
    contrasena: { type: String, 
        required: true 
    },
    rol: { 
        type: String, 
        required: true, 
        enum: ['admin', 'cliente', 'editor'] 
    }
}, { versionKey: false });

module.exports = mongoose.model('Usuario', usuarioSchema);