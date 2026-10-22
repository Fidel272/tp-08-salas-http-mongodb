# Trabajo práctico 08: Endpoints persistentes de reservas de salas

Trabajo Práctico correspondiente al Módulo 3 de Desarrollo Full-Stack (Nodo Tecnológico). Evolución arquitectónica del proyecto de reservas de salas, migrando los scripts de consola del TP-07 hacia una arquitectura web full-stack y API REST completa basada en HTTP, Express y persistencia asíncrona con Mongoose.

---
## 1. Origen del Proyecto y Versiones

- **Punto de partida**: Copia funcional del TP-07: `tp-06-salas-mongodb`, conservando el repositorio individual de GitHub y la estructura previa.
- **Nombre de la copia**: `tp-08-salas-http-mongodb`.
- **Entorno de ejecución:** Node.js (con soporte nativo `--env-file=.env`)
- * **Dependencias principales:** 
  * `express` 
  * `mongoose` 
  * `ejs` y `express-ejs-layouts`
  * `morgan` (registro de solicitudes HTTP)
  * `postman` (Comparativa con el TP 07 y Servicio en Memoria)

## 2. Estructura por Capas (Arquitectura Modular)

### Árbol de archivos principales
La aplicación desacopla sus responsabilidades en directorios especializados:
```
tp-08-salas-http-mongodb/
├── public/               # Recursos estáticos (estilos CSS, imágenes)
├── src/
│   ├── controladores/    # Lógica de manejo de solicitudes HTTP (Web y API JSON)
│   ├── middleware/       # Validadores de datos, sanitización y manejo de errores
│   ├── modelos/          # Esquemas Mongoose y definición de la estructura en MongoDB
│   ├── rutas/            # Enrutadores modulares (router de vistas y router REST API)
│   ├── servicios/        # Capa de negocio asíncrona conectada a la base de datos
│   ├── app.js            # Configuración de Express, middlewares globales y montaje de rutas
│   └── index.js          # Punto de entrada y establecimiento de la conexión con Atlas
├── views/                # Plantillas de interfaz de usuario en EJS
├── .env                  # Variables de entorno secretas (excluido de Git)
├── package.json          # Metadatos, dependencias y scripts de ejecución
└── README.md             # Documentación técnica del proyecto
```

## 3. Comparativa con el TP 07 y Servicio en Memoria

- **¿Qué cambió respecto al TP 07?** Mientras que el TP anterior se enfocaba en scripts de consola (CLI) y operaciones básicas de Mongoose de forma aislada, el TP 08 introduce un servidor HTTP operativo en tiempo real. Ahora los usuarios finales interactúan a través de un panel web con vistas EJS y los sistemas externos consumen una API REST robusta.

- **Estado del servicio en memoria**: El arreglo volátil o servicio en memoria utilizado en etapas tempranas de práctica dejó de importarse y utilizarse por completo. Toda la persistencia de datos descansa exclusivamente en la capa de servicios asíncronos vinculada a MongoDB mediante Mongoos (`Reserva.find`, `Reserva.create`, etc.), eliminando cualquier fuente de datos dual.

## 4. Configuración, Preparación de Atlas y Entorno

1. **Configuración de MongoDB Atlas**: Se configuró un cluster remoto en MongoDB Atlas, ajustando las reglas de red (IP Access List) y el usuario con privilegios de lectura/escritura sobre la base de datos.

2. **Variables de Entorno (`.env`)** Crea un archivo .env en la raíz del proyecto basándote en la siguiente estructura (nunca subas este archivo al repositorio):
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://NOMBRE_db_user:CLAVE@cluster0.iqnjoef.mongodb.net/reservas_salas_u8?appName=Cluster0
```

3. **Instala las dependencias:**:
```bash
npm install
```

4. **Comando de Inicio**:
Inicia la aplicación utilizando el cargador nativo de variables de entorno de Node.js:
```bash
npm run start
```
(Equivalente interno a: `node --env-file=.env src/index.js`)

## 5. Tabla de Endpoints y Rutas de la API

| Método | Ruta | Descripción | Código de Respuesta Exitoso |
| :--- | :--- | :--- | :--- |
| GET | /api/reservas | Obtiene el listado completo. Soporta filtro exacto con query param ?sala=.... | 200 OK |
| POST | /api/reservas | Valida y persiste una nueva reserva en la BD. | 201 Created (+ Header Location) |
| GET | /api/reservas/:id | Devuelve el detalle de una reserva específica por su ID de MongoDB. | 201 Created 200 OK |
| GET | /estado | Verifica el estado del servidor y el conteo de registros actuales en la BD. | 200 OK |

## 6. Límites de Validación y Casos Negativos
El middleware de validación aplica estrictamente las siguientes reglas antes de permitir cualquier operación de escritura:

- **Estudiante / Email / Sala / Fecha / Turno**: Cadenas de texto obligatorias que se limpian con .trim(). El correo electrónico debe incluir obligatoriamente el carácter @.
- **Personas**: Debe ser un valor numérico entero validado mediante Number.isInteger(personas) dentro del rango estricto de 1 a 6 personas inclusive.
- **Casos Negativos**
- Enviar un número de personas fuera de rango (0, 7, decimales) o texto no numérico responde con un código 400 Bad Request y frena la ejecución sin tocar la base de datos
- Consultar un ID mal formado en la API (/api/reservas/123) responde con 400 Bad Request.
- Consultar un ID sintácticamente correcto pero inexistente responde con 404 Not Found.

## 7. Instrucciones para Reproducir Solicitudes en Postman
**A. Crear una Reserva** (`POST /api/reservas`)
- **Método**: POST
- **URL**: `http://localhost:3000/api/reservas`
- **Cabecera necesaria**: `Content-Type: application/json`
- **Body (raw - JSON):**
```
{
  "estudiante": "Fidel Castro",
  "email": "fidel@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 4
}
```
- **Respuesta esperada**: Código 201 Created, el objeto JSON creado con su propiedad id generada a partir del _id de Mongo, y el encabezado de respuesta Location apuntando a /api/reservas/<id>.

**B. Consultar el Listado y Filtrar** (`GET /api/reservas`)
- **Método**: GET
- **URL**: `http://localhost:3000/api/reservas` (Opcional con filtro: `http://localhost:3000/api/reservas?sala=Sala%20Norte`)
- **Body**: `none`
- **Respuesta esperada**: Código `200 OK` con un arreglo JSON de registros.

**C. Consultar por ID** (`GET /api/reservas/:id`)
- **Método**: GET
- **URL**: `http://localhost:3000/api/reservas/6ad91b5698a02147ae65903c`
- **Body**: `none`
- **Respuesta esperada**: Código `200 OK` con el detalle plano de la reserva.

## 8. Matriz de Resultados y Prueba de Reinicio (Persistencia)
1. **Prueba N (Inserción)**: Se ejecuta un `POST` exitoso en Postman. El sistema responde con el registro creado y un `_id` único (ej. `671a...`).
2. **Prueba de Conteo Estable**: Se consulta `/estado` obteniendo un número total de registros $N$.
3. **Reinicio del Servidor**: Se detiene el proceso de Node.js en la terminal (`Ctrl + C`) y se vuelve a iniciar (`npm run start`).
4. **Prueba N+1 (Recuperación y Mismo ID)**: Se realiza un GET `/api/reservas/<id>` utilizando exactamente el mismo `_id` obtenido antes de reiniciar. El servidor responde con un código `200 OK`, devolviendo los datos intactos y confirmando que la cantidad total de registros en la segunda consulta se mantiene estable sin pérdida de información.