function crearControladorReservas(servicioReservas) {
  /**
   * Handler para GET /reservas (Vista HTML)
   * Obtiene el listado completo desde el servicio y renderiza la vista correspondiente.
   */
  async function listar(req, res) {
    const reservas = await servicioReservas.listar();
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas,
    });
  }

  /**
   * Handler para GET /reservas/nueva (Vista HTML)
   * Renderiza el formulario de alta vacío.
   */
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva Reserva",
      error: null,
      valores: {},
    });
  }

  /**
   * Handler para GET /reservas/:id (Vista HTML de detalle)
   */
  async function mostrarDetalle(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: `No existe una reserva registrada con el identificador #${req.params.id}.`,
      });
    }
    res.render("reservas/detalle", {
      titulo: `Reserva #${reserva.id}`,
      reserva,
    });
  }

  /**
   * Handler para POST /reservas (Formulario Web)
   * Persiste la reserva validada y redirige al listado principal (302).
   */
  async function crear(req, res) {
    await servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  /**
   * Handler para GET /api/reservas (API JSON)
   * Soporta filtro exacto por sala y rechaza parámetros repetidos con 400.
   */
  async function listarApi(req, res) {
    // Opcional: Validación si repiten el parámetro sala en la query
    if (Array.isArray(req.query.sala)) {
      const error = new Error("El parámetro sala no puede repetirse.");
      error.codigo = "FILTRO_INVALIDO";
      throw error;
    }

    const reservas = await servicioReservas.listar(req.query.sala);
    res.json(reservas);
  }

  /**
   * Handler para GET /api/reservas/:id (API JSON - Detalle)
   */
  async function obtenerApi(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(reserva);
  }

  /**
   * Handler para POST /api/reservas (API JSON - Creación)
   * Responde con 201, el recurso guardado y la cabecera Location.
   */
  async function crearApi(req, res) {
    const reservaGuardada = await servicioReservas.crear(req.reservaValidada);
    res
      .status(201)
      .location(`/api/reservas/${reservaGuardada.id}`)
      .json(reservaGuardada);
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
    obtenerApi, // <-- Añadido para que coincida con reservas-api.js
    crearApi, // <-- Añadido para que coincida con reservas-api.js
  };
}

// Exportación del constructor de controlador en formato CommonJS
module.exports = {
  crearControladorReservas,
};
