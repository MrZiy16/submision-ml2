const tf = require('@tensorflow/tfjs-node');
const crypto = require('crypto');
const InputError = require('../exceptions/inputError');

async function predictClassification(model, image) {
    try {
        if (image.length > 1000000) {
            throw new InputError('Payload content length greater than maximum allowed: 1000000', 413);
        }

        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();

        const classes = ['Melanocytic nevus', 'Squamous cell carcinoma', 'Vascular lesion'];

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        const confidenceScore = Math.max(...score) * 100;

        const classResult = tf.argMax(prediction, 1).dataSync()[0];
        const label = classes[classResult];

        let result, suggestion;

        // Set result and suggestion based on label
        if (label === 'Squamous cell carcinoma' || label === 'Vascular lesion') {
            result = "Cancer";
            suggestion = "Segera periksa ke dokter!";
        } else {
            result = "Non-cancer";
            suggestion = "Penyakit kanker tidak terdeteksi.";
        }

        // Return the response data in the desired structure
        return {
            result,  // "Cancer" or "Non-cancer"
            suggestion,  // corresponding suggestion
            createdAt: new Date().toISOString()  // timestamp
        };

    } catch (error) {
        if (error.statusCode === 413) {
            throw new InputError(error.message, 413);
        }
        throw new InputError(`Terjadi kesalahan input: ${error.message}`);
    }
}


module.exports = predictClassification;
