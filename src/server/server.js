require('dotenv').config();
 
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/inputError');

(async () => {
    try {
        // Inisialisasi server Hapi
        const server = Hapi.server({
            port: process.env.PORT || 8000,
            host: 'localhost', // Ubah ke 'localhost' saat debugging lokal
            routes: {
                cors: {
                    origin: ['*'], // Izinkan semua domain
                },
            },
        });

        // Memuat model machine learning
        console.log('Loading machine learning model...');
        const model = await loadModel();
        server.app.model = model; // Menyimpan model ke properti `server.app`
        console.log('Model loaded successfully.');

        // Menambahkan routes ke server
        server.route(routes);

        // Middleware untuk menangani error
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;

            // Menangani error input khusus
            if (response instanceof InputError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: `${response.message} Silakan gunakan foto lain.`,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            // Menangani error lainnya (Boom errors)
            if (response.isBoom) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.output.payload.message,
                });
                newResponse.code(response.output.statusCode);
                return newResponse;
            }

            // Lanjutkan response jika tidak ada error
            return h.continue;
        });

        // Memulai server
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();
