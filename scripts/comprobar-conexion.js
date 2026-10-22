// Importa las funciones de gestión de conexión desde la capa de configuración
const { conectarBaseDatos,
    desconectarBaseDatos
} = require("../src/config/base-datos");


//Función principal asíncrona para probar la conectividad con la base de datos.
async function main() {
    try {
        await conectarBaseDatos();
        console.log("Conexión a MongoDb Atlas exitosa !!");
    } finally {
        // El bloque finally garantiza que los recursos se cierren 
        // tanto en caso de éxito como si ocurre un error inesperado
        await desconectarBaseDatos();
    }
}

// Ejecuta la función principal y captura cualquier error de conexión o red
main().catch((error) => {
    console.error("No se pudo completar la conexión: ", error.name);
    // Lista de códigos de error comunes relacionados con fallos de DNS y red
    const codigosDns = [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEOUT",
        "ESERVFAIL",
        "EAI_AGAIN",
    ];

    // Si el error coincide con un código DNS/red conocido, lo detalla
    if (codigosDns.includes(error.code)) {
        console.error("Código DNS/red:", error.code);
    }

    // Identifica si el fallo ocurrió durante una consulta SRV o TXT de DNS (típico de Atlas)
    if (error.syscall === "querySrv" || error.syscall === "queryTxt") {
        console.error("Consulta DNS:", error.syscall);
    }

    console.error("Revisar MongoDB:URI, servidor, red y permisos");
    // Asigna un código de salida distinto de cero para indicar que el proceso falló
    process.exitCode = 1;
});
