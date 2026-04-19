const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('node:path');
require('dotenv').config();

// Importaciones de modelos y rutas
const Usuario = require('./models/usuario.model.js');
const FormEvento = require('./models/form-evento.model.js');
const usuarioRoutes = require('./routes/usuario.route.js');
const formEventoRoutes = require('./routes/form-evento.route.js');
const formBorradorRoutes = require('./routes/form-borrador.route.js');
const listaDifusionRoutes = require('./routes/lista-difusion.route.js');

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

const construirFechaEvento = (fecha) => ({
    anio: String(fecha.getFullYear()),
    mes: String(fecha.getMonth() + 1).padStart(2, '0'),
    dia: String(fecha.getDate()).padStart(2, '0'),
    iso: fecha.toISOString(),
});

const construirFechaSemilla = (anio, mes, dia) => {
    const fecha = new Date(anio, mes - 1, dia, 12, 0, 0, 0);
    return construirFechaEvento(fecha);
};

const crearEventoFinalizadoInicial = async () => {
    try {
        const semillasEventosFinalizados = [
            {
                nombreEvento: 'Evento Finalizado de Prueba',
                fechaCreacion: construirFechaSemilla(2025, 6, 25),
                fechaPublicacion: construirFechaSemilla(2025, 7, 3),
                fechasEvento: [
                    construirFechaSemilla(2025, 7, 20),
                    construirFechaSemilla(2025, 7, 22),
                ],
                fechaFinVisualizacion: construirFechaSemilla(2025, 8, 30),
            },
            {
                nombreEvento: 'Evento Finalizado de Prueba 2',
                fechaCreacion: construirFechaSemilla(2025, 8, 28),
                fechaPublicacion: construirFechaSemilla(2025, 9, 5),
                fechasEvento: [
                    construirFechaSemilla(2025, 9, 18),
                    construirFechaSemilla(2025, 9, 19),
                ],
                fechaFinVisualizacion: construirFechaSemilla(2025, 10, 25),
            },
            {
                nombreEvento: 'Evento Finalizado de Prueba 3',
                fechaCreacion: construirFechaSemilla(2025, 10, 24),
                fechaPublicacion: construirFechaSemilla(2025, 11, 2),
                fechasEvento: [
                    construirFechaSemilla(2025, 11, 15),
                    construirFechaSemilla(2025, 11, 17),
                ],
                fechaFinVisualizacion: construirFechaSemilla(2025, 12, 20),
            },
        ];

        let sincronizados = 0;

        for (const semilla of semillasEventosFinalizados) {
            const payloadEvento = {
                nombreEvento: semilla.nombreEvento,
                fechaPublicacion: semilla.fechaPublicacion,
                fechasEvento: semilla.fechasEvento,
                horario: {
                    horaInicio: '08:00',
                    horaFin: '10:00',
                },
                lugarEvento: 'https://maps.google.com/?q=San+Jose+Costa+Rica',
                linkCalendar: 'https://calendar.google.com/',
                descripcionEvento: 'Evento de prueba para validar la vista de eventos finalizados.',
                objetivosEvento: 'Mostrar un evento finalizado con fechas historicas en el modulo de eventos finalizados.',
                agendaEvento: '08:00 Apertura | 09:00 Presentacion | 10:00 Cierre del evento',
                agendaLecturaFacil: 'Apertura, presentacion y cierre del evento.',
                contacto: {
                    nombreCompleto: 'Editor de Eventos',
                    correoElectronico: 'editorEventos@conapdis.com',
                },
                descripcionImagen: 'Imagen de referencia del evento finalizado.',
                imagenes: [],
                videos: [],
                publicoMeta: 'Publico general',
                cupoEvento: '100',
                infoAdicional: 'Este registro se crea automaticamente al iniciar el servidor.',
                referencias: [],
                palabrasClave: ['finalizado', 'demo', 'seed'],
                formularioInteresados: {
                    tipo: 'ninguno',
                    aspectosSeleccionados: [],
                },
                fijarImportante: false,
                listaDifusion: 'Lista General',
                fechaFinVisualizacion: semilla.fechaFinVisualizacion,
                redesSociales: [],
                estado: 'aprobado',
            };

            const eventoSincronizado = await FormEvento.findOneAndUpdate(
                { nombreEvento: semilla.nombreEvento },
                { $set: payloadEvento },
                { upsert: true, new: true },
            );

            // Fuerza una fecha de creacion historica para que se muestre coherente con la fecha final.
            const fechaCreacionHistorica = semilla.fechaCreacion?.iso ? new Date(semilla.fechaCreacion.iso) : null;
            if (eventoSincronizado?._id && fechaCreacionHistorica && !Number.isNaN(fechaCreacionHistorica.getTime())) {
                await FormEvento.collection.updateOne(
                    { _id: eventoSincronizado._id },
                    {
                        $set: {
                            createdAt: fechaCreacionHistorica,
                            updatedAt: fechaCreacionHistorica,
                        },
                    },
                );
            }

            sincronizados += 1;
        }

        console.log(`Se sincronizaron ${sincronizados} evento(s) finalizado(s) de prueba con fechas historicas`);
    } catch (error) {
        console.error('Error al crear el evento finalizado inicial:', error);
    }
};


// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Atlas conectado');
        await crearUsuariosIniciales();
        await crearEventoFinalizadoInicial();
    })
    .catch(error => console.log('Ocurrió un error al conectarse con MongoDB: ', error));

// Rutas
app.use('/api/auth', usuarioRoutes);
app.use('/api/form-evento', formEventoRoutes);
app.use('/api/form-borrador', formBorradorRoutes);
app.use('/api/lista-difusion', listaDifusionRoutes);

app.get('/', (req, res) => {
    res.send('Servidor en funcionamiento');
});

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        detalle: err.message || 'Se produjo un error inesperado.',
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});