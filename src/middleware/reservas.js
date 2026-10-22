function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de Salas";
  res.locals.salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
  res.locals.turnosPermitidos = ["Mañana", "Tarde", "Noche"];
  next();
}
function validarReserva(req, res, next) {
  const valores = req.body ?? {};
  const estudiante =
    typeof valores.estudiante === "string" ? valores.estudiante.trim() : "";
  const email = typeof valores.email === "string" ? valores.email.trim() : "";
  const sala = typeof valores.sala === "string" ? valores.sala.trim() : "";
  const fecha = typeof valores.fecha === "string" ? valores.fecha.trim() : "";
  const turno = typeof valores.turno === "string" ? valores.turno.trim() : "";
  const personasRecibido = valores.personas;
  const tipoPersonasValido =
    typeof personasRecibido === "number" ||
    (typeof personasRecibido === "string" && personasRecibido.trim() !== "");
  const personas = tipoPersonasValido ? Number(personasRecibido) : NaN;
  const esEmailValido = email.includes("@");
  const esPersonasValidas =
    Number.isInteger(personas) && personas >= 1 && personas <= 6;
  if (
    !estudiante ||
    !email ||
    !esEmailValido ||
    !sala ||
    !fecha ||
    !turno ||
    !esPersonasValidas
  ) {
    if (req.baseUrl === "/api/reservas") {
      return res.status(400).json({
        error: "Completá todos los campos correctamente con valores válidos.",
      });
    }
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "Completá todos los campos correctamente con valores válidos.",
      valores,
    });
  }

  // Si la validación es exitosa, empaqueta el objeto sanitizado en la solicitud (req)
  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}
module.exports = { prepararAreaReservas, validarReserva };
