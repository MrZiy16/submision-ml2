const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const InputError = require('../exceptions/inputError');
const { Firestore } = require('@google-cloud/firestore');
const storeData = require('../services/storeData');

// Inisialisasi Firestore
const db = new Firestore();

async function postPredictHandler(request, h) {
    try {
        console.log('Request received:', request.payload); // Debug payload

        const { image } = request.payload;
        const { model } = request.server.app;

        // Validasi input image
        if (!image || !(image instanceof Buffer)) {
            throw new InputError('Image file is required', 400);
        }

        console.log('Processing image...');
        // Prediksi hasil menggunakan model
        const prediction = await predictClassification(model, image);
        console.log('Prediction result:', prediction);

        // Menyiapkan data yang akan disimpan
        const responseData = {
            id: crypto.randomUUID(), // ID unik untuk riwayat prediksi
            result: prediction.label,
            suggestion: prediction.suggestion,
            createdAt: new Date().toISOString(),
        };

        // Simpan hasil prediksi ke Firestore
        await storeData(responseData.id, responseData);

        // Mengirimkan response sukses
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

async function getPredictionHistoriesHandler(request, h) {
    try {
        // Memastikan db sudah terdefinisi
        if (!db) {
            throw new Error('Firestore database connection is not initialized');
        }

        // Mengambil data riwayat prediksi dari Firestore
        const snapshot = await db.collection('prediction').get();

        if (snapshot.empty) {
            return h.response({
                status: 'success',
                data: [],
            }).code(200);
        }

        // Menyusun riwayat prediksi dari snapshot Firestore
        const histories = [];
        snapshot.forEach((doc) => {
            histories.push({
                id: doc.id,
                history: doc.data(),
            });
        });

        // Mengirimkan response riwayat prediksi
        return h.response({
            status: 'success',
            data: histories,
        }).code(200);
    } catch (error) {
        console.error('Error fetching prediction histories:', error.message);
        return h.response({
            status: 'fail',
            message: 'Gagal mengambil data riwayat prediksi',
        }).code(500);
    }
}

module.exports = { getPredictionHistoriesHandler, postPredictHandler };
