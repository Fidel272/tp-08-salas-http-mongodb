const { Reserva } = require("../src/modelos/reserva");
async function main() {
    const reserva = new Reserva({
        "estudiante": "Fidel Ejemplo",
        "email": "fidel@example.com",
        "sala": "Sala Norte",
        "fecha": "2026-10-20",
        "turno": "Mañana",
        "personas": 2
    });
    await reserva.validate();
    console.log("Datos válidos; todavía no guardamos en MongoDB.");
}
main().catch((error) => {
    console.error("Validación rechazada:", error.name);
    if (error.errors) {
        console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
    }
    process.exitCode = 1;
});
