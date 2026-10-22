const mongoose = require("mongoose"); //permite interactuar con MongoDB
const dns = require("node:dns"); //Modulo nativo de node para gestionar operaciones y servidores
const { leerUriMongo } = require("./entorno");

// Corrección utilizada en el aula para las consultas DNS de Atlas.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

//Función asíncrona para establecer la conexión con MongoDB.
async function conectarBaseDatos() {
  await mongoose.connect(leerUriMongo(), {
    // Establece un tiempo límite de espera de 5 segundos para la selección del servidor
    serverSelectionTimeoutMS: 5000,
  });
}

//Función asíncrona para cerrar la conexión con MongoDB de forma segura.
async function desconectarBaseDatos() {
  await mongoose.disconnect();
}
module.exports = { conectarBaseDatos, desconectarBaseDatos };
