const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const InputError = require('../exceptions/inputError');

async function postPredictHandler(request, h) {
    try {
        console.log('Request received:', request.payload); // Debug payload

        const { image } = request.payload;
        const { model } = request.server.app;

        if (!image || !(image instanceof Buffer)) {
            throw new InputError('Image file is required', 400);
        }

        console.log('Processing image...');
        const prediction = await predictClassification(model, image);
        console.log('Prediction result:', prediction);

        const responseData = {
            id: crypto.randomUUID(),
            result: prediction.label,
            suggestion: prediction.suggestion,
            createdAt: new Date().toISOString(),
        };

        return h.response({
            status: 'success',
            message: 'Prediction successful',
            data: responseData,
        }).code(201);
    } catch (error) {
        console.error('Error:', error.message);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi',
        }).code(400);
    }
}

module.exports = postPredictHandler;
