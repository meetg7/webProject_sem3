const mongoose = require('mongoose');

const shipwreckSchema = new mongoose.Schema({
  recrd: String,
  vesslterms: String,
  feature_type: String,
  chart: String,
  latdec: Number,
  londec: Number,
  gp_quality: String,
  depth: Number,
  sounding_type: String,
  history: String,
  quasou: String,
  watlev: String,
  coordinates: [Number],
});

const Shipwreck = mongoose.model('Shipwreck', shipwreckSchema);

module.exports = Shipwreck;
