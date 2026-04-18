const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario.model.js');

router.post('/login', async (req, res) => {
    const { identificador, password } = req.body;

    try {
        const usuarioEncontrado = await Usuario.findOne({
            $or: [
                { nombreUsuario: identificador },
                { correoElectronico: identificador }
            ]
        });

        if (usuarioEncontrado && usuarioEncontrado.contrasena === password) {
            //URL de destino según el rol
            let urlDestino = '/index.html';
            if (usuarioEncontrado.rol === 'admin') urlDestino = '/modulo-admin.html';
            if (usuarioEncontrado.rol === 'editor') urlDestino = '/modulo-editor.html';

            return res.status(200).json({ éxito: true, url: urlDestino });
        } else {
            return res.status(401).json({ éxito: false, mensaje: 'Credenciales incorrectas' });
        }
    } catch (error) {
        res.status(500).json({ éxito: false, mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;