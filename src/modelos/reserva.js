//Importa el módulo mongoose para interactuar con MongoDB
const mongoose = require("mongoose");

//Define el esquema del modelo de reserva
const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      required: true,
      type: String,
      trim: true,
    },
    email: {
      required: true,
      type: String,
      trim: true,
      match: /@/,
    },
    sala: {
      required: true,
      enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
      type: String,
    },
    fecha: {
      required: true,
      type: String,
      trim: true,
    },
    turno: {
      required: true,
      type: String,
      enum: ["Mañana", "Tarde", "Noche"],
    },
    personas: {
      required: true,
      type: Number,
      min: 1,
      max: 6,
    },
    estado: {
      required: true,
      type: String,
      enum: ["Pendiente", "Confirmada"],
      default: "Pendiente",
    },
  },
  //Se especifica el nombre de la colección en la db donde se almacenarán los documentos de este modelo
  {
    collection: "reservas",
  },
);

//Define el nombre que se le asignará al modelo de Reserva basado en el esquema reservaSchema
const Reserva = mongoose.model("Reserva", reservaSchema);
module.exports = { Reserva };
