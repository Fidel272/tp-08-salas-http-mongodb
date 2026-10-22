# TP 08 — Endpoints persistentes de reservas de salas

## Descripción

Este proyecto corresponde al Trabajo Práctico 08 del curso de Desarrollo Back-end con Node.js. Parte del TP 07 y adapta la aplicación para que las reservas se creen y consulten mediante MongoDB, en lugar de depender de un arreglo en memoria.

La aplicación conserva el sitio web desarrollado anteriormente y agrega una API REST que devuelve recursos en formato JSON. Tanto las páginas HTML como la API utilizan el mismo servicio de MongoDB, el mismo modelo y la misma colección.

## Tecnologías utilizadas

- Node.js: ^22.22.0
- Sistema de módulos: CommonJS
- Express: ^5.2.1
- Mongoose: 9.10.3
- EJS: ^6.0.1
- express-ejs-layouts: ^2.5.1
- Morgan: ^1.12.1
- Prettier: ^3.9.9
- ESLint: ^10.12.0
- Postman para probar la API

Las versiones instaladas de las dependencias se encuentran registradas en `package-lock.json`.

## Requisitos previos

- Node.js instalado.
- Una cuenta y un clúster disponible en MongoDB Atlas.
- Una base de datos de ejercicio llamada `reservas_salas_u8`.
- Un usuario de base de datos autorizado y una dirección IP habilitada en Atlas.
- Las dependencias del proyecto instaladas.

## Instalación y configuración

### 1. Instalar dependencias

Desde la raíz del proyecto, ejecutar:

```bash
npm install
```

### 2. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto con los valores correspondientes al entorno local:

```dot
env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u8?retryWrites=true&w=majority
```

Reemplazar `USUARIO`, `CLAVE` y `HOST` por los datos reales del clúster. La URI debe corresponder a la base de datos del TP 08.

**Importante:** `.env` contiene información sensible y no debe subirse a GitHub. El repositorio debe conservar `.gitignore` y, si se utiliza, una plantilla `.env.example` sin credenciales reales.

Si la conexión falla por DNS, revisar la configuración de red, los resolutores utilizados y el acceso a Atlas. Un ajuste de DNS no corrige credenciales incorrectas ni una dirección IP no autorizada.

### 3. Comprobar la conexión

```bash
npm run comprobardb
```

Este comando ejecuta el script de comprobación de conexión. No reemplaza el inicio del servidor ni debe crear reservas automáticamente.

### 4. Iniciar la aplicación

```bash
npm start
```

El script `start` ejecuta `src/index.js` con `--env-file=.env`. La aplicación establece la conexión con MongoDB antes de comenzar a escuchar en el puerto configurado.

Cuando el servidor esté disponible, se podrá acceder a:

- Sitio web: `http://localhost:3000/`
- Listado de reservas: `http://localhost:3000/reservas`
- Formulario de nueva reserva: `http://localhost:3000/reservas/nueva`
- API de reservas: `http://localhost:3000/api/reservas`
- Estado del servicio: `http://localhost:3000/estado`

Si se configura otro puerto, reemplazar `3000` en las direcciones anteriores.

## Estructura del proyecto

```text
tp-08-salas-http-mongodb/
├── src/
│   ├── index.js
│   ├── app.js
│   ├── config/
│   │   ├── entorno.js
│   │   └── base-datos.js
│   ├── modelos/
│   │   └── reserva.js
│   ├── servicios/
│   │   ├── reservas.js
│   │   └── reservas-mongo.js
│   ├── controladores/
│   │   └── reservas.js
│   ├── rutas/
│   │   ├── reservas.js
│   │   └── reservas-api.js
│   └── middleware/
│       ├── reservas.js
│       ├── solicitudes.js
│       └── errores.js
├── scripts/
├── views/
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

La estructura representa las principales responsabilidades de la aplicación. Los nombres de los archivos auxiliares deben coincidir con los presentes en el repositorio.

### Responsabilidades de las capas

- **Configuración:** lee las variables de entorno y administra la conexión con MongoDB.
- **Modelo:** define los campos, valores predeterminados y validaciones de las reservas.
- **Servicio MongoDB:** ejecuta las consultas y escrituras asíncronas, valida identificadores y transforma los documentos en objetos de respuesta.
- **Controlador:** coordina las operaciones y decide si la respuesta será HTML o JSON.
- **Rutas:** asocian los métodos HTTP con sus controladores, separando el sitio web de la API.
- **Middleware:** valida las entradas, identifica las solicitudes, registra su duración y centraliza los errores.
- **Vistas y archivos públicos:** conservan la interfaz web, las plantillas y los estilos del proyecto anterior.

El servicio en memoria puede conservarse como referencia del TP 07, pero no debe utilizarse en el arranque persistente de esta versión.

## Modelo de reserva

La colección utilizada es `reservas`, dentro de la base `reservas_salas_u8`.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | Texto en la respuesta | Representación textual de `_id` |
| `estudiante` | String | Obligatorio, sin espacios exteriores |
| `email` | String | Obligatorio, sin espacios exteriores y debe contener `@` |
| `sala` | String | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| `fecha` | String | Obligatorio, sin espacios exteriores |
| `turno` | String | `Mañana`, `Tarde` o `Noche` |
| `personas` | Number | Entero entre 1 y 6 |
| `estado` | String | `pendiente` o `confirmada`; predeterminado `pendiente` |

El cliente solo puede proporcionar los seis campos de entrada: `estudiante`, `email`, `sala`, `fecha`, `turno` y `personas`. El estado se establece en el modelo y no puede asignarse desde la creación ordinaria.

MongoDB mantiene el identificador `_id` como `ObjectId`. La aplicación expone su representación textual en el campo `id`, tanto en la API como en las vistas.

## Endpoints HTML

| Método | Ruta | Comportamiento esperado |
|---|---|---|
| GET | `/` | Muestra la página de inicio. |
| GET | `/reservas` | Muestra el listado consultado desde MongoDB. |
| GET | `/reservas/nueva` | Muestra el formulario de creación. |
| POST | `/reservas` | Valida y guarda la reserva; redirige al listado con estado `302`. |
| GET | `/reservas/:id` | Muestra el detalle de una reserva existente. |
| GET | `/estado` | Devuelve información del servicio y el total de reservas. |

Si el formulario contiene datos inválidos, la aplicación debe responder con `400` y volver a mostrar los valores ingresados. Una reserva válida solo debe redirigir después de que la escritura en MongoDB termine correctamente.

## Endpoints de la API

Todas las respuestas de la API se expresan en JSON, incluidos los errores.

| Método | Ruta | Resultado esperado |
|---|---|---|
| GET | `/api/reservas` | `200 OK` y un arreglo de reservas. |
| GET | `/api/reservas/:id` | `200 OK` con la reserva encontrada. |
| POST | `/api/reservas` | `201 Created`, recurso guardado y cabecera `Location`. |
| GET | `/api/reservas?sala=Sala%20Norte` | `200 OK` con coincidencias exactas de sala. |

Si el filtro no encuentra coincidencias, la respuesta es `200 OK` con un arreglo vacío. Un filtro repetido o con formato inválido debe rechazarse con `400 Bad Request`.

La API no implementa operaciones de actualización ni eliminación en este trabajo práctico.

### Ejemplo de creación

Enviar una solicitud `POST` a:

```text
http://localhost:3000/api/reservas
```

Configurar `Body` como `raw` y seleccionar `JSON`. La cabecera debe ser `Content-Type: application/json`.

Cuerpo de ejemplo:

```json
{
  "estudiante": "Ana Pérez",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 4
}
```

Los datos son ilustrativos; deben reemplazarse por los valores que se deseen probar.

La respuesta esperada es `201 Created` y contiene el recurso guardado, con un `id` textual y el estado predeterminado. La cabecera `Location` identifica el recurso creado, por ejemplo:

```text
/api/reservas/6ad91b5698a02147ae65903c
```

Se debe utilizar el identificador real de la respuesta, no el texto de ejemplo.

### Consultar el recurso creado

Enviar un `GET` a la dirección indicada en `Location`, agregando `http://localhost:3000` si la cabecera devuelve una ruta relativa.

La respuesta esperada es `200 OK` y debe contener el mismo `id` y los mismos datos de la reserva creada.

## Validaciones y manejo de errores

La aplicación valida las entradas antes de crear una reserva y conserva las validaciones del modelo Mongoose.

- Cuerpo ausente, campos obligatorios incompletos o valores inválidos: `400 Bad Request`.
- JSON mal formado: `400 Bad Request` con respuesta JSON en la API.
- Identificador con formato inválido: `400 Bad Request`.
- Identificador válido que no corresponde a una reserva existente: `404 Not Found`.
- Ruta API inexistente: `404 Not Found` en JSON.
- Error inesperado durante una operación: `500 Internal Server Error`.

Un error de conexión o de consulta no debe presentarse como una lista vacía ni como una operación exitosa. Los mensajes públicos deben ser genéricos y no deben revelar trazas, contraseñas ni URI de conexión.

## Persistencia y conexión

La aplicación abre una única conexión de Mongoose durante el inicio y la mantiene mientras el servidor atiende solicitudes. No se debe conectar ni desconectar MongoDB en cada petición.

El servidor solo anuncia que está disponible después de completar la conexión. Al recibir `SIGINT` o `SIGTERM`, deja de aceptar nuevas conexiones y cierra la conexión con la base de datos después de completar el cierre del servidor.

No se deben importar datos de ejemplo automáticamente ni insertar reservas al iniciar la aplicación o consultar el listado. La creación se realiza mediante el formulario, la API o los scripts de laboratorio ejecutados expresamente.

## Plan de verificación

Las siguientes pruebas se utilizan para comprobar el funcionamiento de los endpoints, las validaciones y la persistencia de las reservas. Los resultados deben completarse después de ejecutar cada prueba en Postman, el navegador o MongoDB Atlas.

| Prueba | Resultado esperado | Resultado obtenido |
|---|---|---|
| GET del listado sin filtro | `200 OK` y arreglo JSON. | 200 |
| Listado sin documentos | `200 OK` y `[]`, sin inserciones automáticas. | 200 |
| POST con JSON válido | `201 Created`, recurso guardado e `id`. | 201 |
| Cabecera `Location` | Dirección del recurso creado. | /api/reservas/6ad961c40ce2bec7a2ed542b |
| GET del recurso creado | `200 OK` y el mismo `id`. | 200 |
| Persistencia tras reiniciar | El recurso conserva su identificador y sus datos. | 200 OK y conserva los datos intactos |
| Dos consultas consecutivas | La cantidad permanece estable si no hubo escrituras. | 200 OK |
| Identificador mal formado | `400 Bad Request` y JSON de error. | 400 |
| Identificador válido inexistente | `404 Not Found`, si se confirma que no existe. | 404 |
| Sala sin coincidencias | `200 OK` y `[]`. | 200 |
| Parámetro `sala` repetido | `400 Bad Request`. | 400 |
| POST sin cuerpo | `400 Bad Request` y ningún documento nuevo. | 400 |
| JSON mal formado | `400 Bad Request` y ningún documento nuevo. | 400 |
| POST con campos o tipos inválidos | `400 Bad Request` y ningún documento nuevo. | 400 |
| Formulario HTML válido | `302 Found` y reserva visible en el listado. | 302 |
| Formulario HTML inválido | `400 Bad Request` y valores conservados. | 400 |
| Ruta inexistente | `404 Not Found`. | 404 |
| Acceso a `/estado` | Total coherente con MongoDB. | 200 OK |
| Cierre y nuevo inicio | Conexión restablecida sin inserciones automáticas. | Sin problemas |


### Procedimiento de persistencia

1. Consultar `GET /api/reservas` y registrar la cantidad inicial. (200 OK, Cantidad Inicial 13)
2. Crear una sola reserva mediante `POST /api/reservas`. (201)
3. Guardar el `id`, la cabecera `Location` y la respuesta. (ID generado: 6ad966650ce2bec7a2ed542d y /api/reservas/6ad966650ce2bec7a2ed542d)
4. Consultar el recurso mediante `GET` usando el identificador real. (Estado 200)
5. Detener el servidor y volver a iniciarlo con `npm start`. (Estado: Servidor activo y conectado)
6. Repetir el GET del mismo recurso y comprobar que conserva su identidad. (Estado: 200 OK y conserva mismo id)
7. Consultar el listado dos veces y comparar la cantidad. (mantuvo al cantidad de 14)
8. Verificar en MongoDB Atlas la base `reservas_salas_u8`, la colección `reservas` y el documento correspondiente. (¿Coincide el _id con Postman?: Sí)
9. Ejecutar las pruebas negativas y comprobar que la cantidad no aumenta después de cada rechazo. (ID mal formado ("1"): error 400 -> Email sin @: error 400 -> Personas 7: error 400)

## Calidad del código

El proyecto incluye scripts de formato y análisis estático:

```bash
npm run format
npm run check
```

`npm run format` aplica Prettier a `src`. `npm run check` ejecuta la comprobación de formato y ESLint según la configuración del proyecto.

También se puede comprobar la conexión con:

```bash
npm run comprobardb
```

Las pruebas de API se realizan con el servidor iniciado y Postman como cliente HTTP. Los scripts auxiliares de `scripts/` son herramientas independientes y no deben confundirse con el arranque del servidor.

## Diferencias respecto del TP 07

La versión anterior utilizaba un servicio basado en memoria para las operaciones del sitio, mientras que los scripts de laboratorio ya trabajaban con MongoDB.

En esta versión, el sitio HTML y la API utilizan el servicio persistente de MongoDB. Las consultas y escrituras son asíncronas; los controladores esperan sus resultados antes de responder. El identificador deja de ser un número secuencial y pasa a representarse mediante el `ObjectId` generado por MongoDB.

La persistencia permite recuperar las reservas después de reiniciar el servidor y evita que el listado dependa de un arreglo reconstruido en cada ejecución.
