const mongoose = require('mongoose');

const formBorradorSchema = new mongoose.Schema({
    draftKey: { type: String, required: true, unique: true, index: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    estado: { type: String, default: 'borrador' },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('FormBorrador', formBorradorSchema);