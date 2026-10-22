const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const { crearManejadorErrores } = require("./middleware/errores");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearRouterReservas } = require("./rutas/reservas");
const { crearRouterReservasApi } = require("./rutas/reservas-api"); // <-- 1. Importas el router de la API
function crearApp({ servicioReservas, formatoRegistro }) {
  const app = express();
  const controlador = crearControladorReservas(servicioReservas);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");
  app.use(morgan(formatoRegistro));
  app.use(identificarSolicitud);
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Reservas de salas de estudio" });
  });

  app.get("/api/reservas", controlador.listarApi);
  app.use("/reservas", crearRouterReservas(controlador));
  app.use("/api/reservas", crearRouterReservasApi(controlador));

  //  Devuelve si el servicio está activo, cuántas reservas hay y el ID de la solicitud.
  app.get("/estado", async (req, res) => {
    const totalReservas = await servicioReservas.contar();
    res.status(200).json({
      servicio: "activo",
      reservas: totalReservas,
      solicitudId: res.locals.solicitudId,
    });
  });

  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Ruta no encontrada." });
    }
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  app.use(
    crearManejadorErrores({
      vistaFormulario: "reservas/nueva",
      tituloFormulario: "Nueva Reserva",
    }),
  );
  return app;
}
module.exports = { crearApp };
