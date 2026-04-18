const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('node:path');
require('dotenv').config();

// Importaciones de modelos y rutas
const Usuario = require('./models/usuario.model.js');
const usuarioRoutes = require('./routes/usuario.route.js');
const formEventoRoutes = require('./routes/form-evento.route.js');
const formBorradorRoutes = require('./routes/form-borrador.route.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Servir archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

// Función para crear usuarios iniciales
const crearUsuariosIniciales = async () => {
    try {
        const conteo = await Usuario.countDocuments();
        if (conteo === 0) {
            await Usuario.create([
                {
                    nombreUsuario: 'admin123',
                    correoElectronico: 'administradorEventos@conapdis.com',
                    contrasena: 'qwe123',
                    rol: 'admin'
                },
                {
                    nombreUsuario: 'editor123',
                    correoElectronico: 'editorEventos@conapdis.com',
                    contrasena: 'asd123',
                    rol: 'editor'
                },
                {
                    nombreUsuario: 'cliente123',
                    correoElectronico: 'consultanteEventos@gmail.net',
                    contrasena: 'zxc123',
                    rol: 'cliente'
                }
            ]);
            console.log('Usuarios de prueba creados en MongoDB Atlas');
        } else {
            console.log('ℹLa base de datos ya tiene usuarios, no se crearon duplicados.');
        }
    } catch (error) {
        console.error('Error al crear usuarios iniciales:', error);
    }
};


// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Atlas conectado');
        crearUsuariosIniciales();
    })
    .catch(error => console.log('Ocurrió un error al conectarse con MongoDB: ', error));

// Rutas
app.use('/api/auth', usuarioRoutes);
app.use('/api/form-evento', formEventoRoutes);
app.use('/api/form-borrador', formBorradorRoutes);

app.get('/', (req, res) => {
    res.send('Servidor en funcionamiento');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});