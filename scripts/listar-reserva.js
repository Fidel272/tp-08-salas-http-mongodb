// Importa las funciones de conexión y desconexión desde la configuración de base de datos
const { conectarBaseDatos,
    desconectarBaseDatos
} = require("../src/config/base-datos");

// Importa directamente el modelo Reserva (sin desestructuración)
const { Reserva } = require("../src/modelos/reserva");


//Función principal asíncrona para conectar, consultar y listar todas las reservas persistidas.
async function main() {
    try {
        // Establece la conexión con MongoDB Atlas
        await conectarBaseDatos();
        // Consulta todos los documentos existentes en la colección 'reservas'
        const reservas = await Reserva.find();
        // Muestra un listado legible y ordenado en formato de tabla por consola
        console.table(
            reservas.map((reserva) => ({
                // Convierte el ObjectId interno de MongoDB a un formato de texto legible tal como exige la consigna
                id: reserva._id.toString(),
                estudiante: reserva.estudiante,
                email: reserva.email,
                sala: reserva.sala,
                email: reserva.email,
                fecha: reserva.fecha,
                turno: reserva.turno,
                personas: reserva.personas,
            })),
        );
        console.log("Total de reservas: ", reservas.length);
    } finally {
        // El bloque finally garantiza que la conexión se cierre de forma segura pase lo que pase
        await desconectarBaseDatos();
    }
}

// Ejecuta el script principal y maneja cualquier error inesperado de red o consulta
main().catch((error) => {
    console.error("No se pudo consultar las reservas: ", error.name);
    console.error("Revisar configuración y disponibilidad de MongoDB.");
    process.exitCode = 1;
});