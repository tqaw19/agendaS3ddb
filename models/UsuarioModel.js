const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let modelSchema = new Schema({
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    email: { type: String, required: true },
    nacimiento: { type: Date, required: true },
    foto: { type: String, required: true },
})

model = mongoose.model('usuario', modelSchema, 'usuario');
module.exports = model;