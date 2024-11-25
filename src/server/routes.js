const {postPredictHandler,getPredictionHistoriesHandler} = require('./handler'); // Sesuaikan path import

const routes = [
  {
    method: 'POST', // Urutan method biasanya diletakkan sebelum path
    path: '/predict',
    handler: postPredictHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes: 1000 * 1000 * 1// Tambahkan batasan ukuran file (misalnya 5MB)
      }
    }
  },
  {
    method: 'GET',
    path: '/predict/histories',
    handler: getPredictionHistoriesHandler,
}
];

module.exports = routes;