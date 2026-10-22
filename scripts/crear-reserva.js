// Importa las funciones de conexión y desconexión desde la configuración de base de datos
const {
    conectarBaseDatos,
    desconectarBaseDatos,
} = require("../src/config/base-datos");

// Importa directamente el modelo Reserva (sin desestructuración, ya que se exportó con module.exports = Reserva)
const { Reserva } = require("../src/modelos/reserva");

async function main(){
    try {
        
        // Establece la conexión con MongoDB Atlas
        await conectarBaseDatos();
        // Crea e inserta un documento válido en la colección 'reservas' usando el modelo Mongoose
        const reserva = await Reserva.create({
            estudiante: "Fidel Alejandro Castro",
            email: "fidel@gmail.com",
            sala: "Sala Norte",
            fecha: "20/10/2026",
            turno: "Tarde",
            personas: 6,
        });
        // Muestra la confirmación de éxito y convierte el ObjectId a texto tal como pide la consigna
        console.log("Reserva guardada. _id:", reserva._id.toString());
    } finally {
        // El bloque finally asegura que la conexión se cierre siempre, pase lo que pase
        await desconectarBaseDatos();
    }
}
// Ejecuta el script principal y maneja cualquier error de validación o red
main().catch((error) => {
    console.error("No se pudo crear la reserva:", error.name);
    // Si Mongoose rechaza el documento por reglas de validación del esquema, lista los campos problemáticos
    if (error.errors) {
        console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
    }
    console.error("Revisar datos, configuración y disponibilidad de MongoDB.");
    // Asigna un código de salida distinto de cero para indicar fallo en el proceso por terminal
    process.exitCode = 1;
});