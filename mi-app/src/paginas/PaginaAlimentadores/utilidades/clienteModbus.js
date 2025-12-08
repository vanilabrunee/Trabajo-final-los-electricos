// src/paginas/PaginaAlimentadores/utilidades/clienteModbus.js

/**
 * Cliente para comunicación con Modbus.
 * Puede trabajar en modo simulado (para desarrollo) o real (con hardware).
 */

/**
 * Modo de operación: "simulado" o "real".
 * En modo simulado genera datos aleatorios para pruebas.
 */
export const MODO_MODBUS = "simulado";

/**
 * Indica si se debe usar Modbus real.
 */
export const USAR_MODBUS_REAL = MODO_MODBUS === "real"; // true => llama al backend; false => datos simulados

/**
 * URL del servidor Modbus (Express backend).
 * Sólo se usa cuando `USAR_MODBUS_REAL` es true.
 */
const URL_BASE = "http://localhost:5000/api/modbus/test";

/**
 * Lee registros desde un dispositivo Modbus.
 * Puede trabajar en modo simulado o real.
 *
 * @param {Object} config - Configuración de lectura.
 * @param {string} config.ip - Dirección IP del dispositivo.
 * @param {number} config.puerto - Puerto Modbus (usualmente 502).
 * @param {number} config.indiceInicial - Primer registro a leer.
 * @param {number} config.cantRegistros - Cantidad de registros a leer.
 * @returns {Promise<Array|null>} Lista de registros [{index, address, value}, ...] o null si los parámetros son inválidos.
 */
export async function leerRegistrosModbus({
	ip,
	puerto,
	indiceInicial,
	cantRegistros,
}) {
	const inicio = Number(indiceInicial);                 // primer address a leer
	const cantidad = Number(cantRegistros);              // cuántos registros seguidos
	const puertoNum = Number(puerto);                    // puerto como número

	// Validación básica de parámetros
	if (
		!ip ||
		!puertoNum ||
		Number.isNaN(inicio) ||
		Number.isNaN(cantidad) ||
		cantidad <= 0
	) {
		return null;
	}

	// === MODO SIMULADO: generar datos falsos para pruebas ===
	if (!USAR_MODBUS_REAL) {
		return Array.from({ length: cantidad }, (_, i) => ({
			index: i,                                     // posición en el array
			address: inicio + i,                          // dirección Modbus simulada
			value: Math.floor(Math.random() * 501),       // valores entre 0 y 500
		}));
	}

	// === MODO REAL: llamar al servidor Express que se comunica con Modbus ===
	const respuesta = await fetch(URL_BASE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			ip,
			puerto: puertoNum,
			indiceInicial: inicio,
			cantRegistros: cantidad,
		}),
	});

	const datos = await respuesta.json();

	if (!respuesta.ok || !datos.ok) {
		throw new Error(datos.error || "Error en lectura Modbus");
	}

	// Convertir registros del servidor a nuestro formato interno
	return datos.registros.map((valorRegistro, indice) => ({
		index: indice,
		address: inicio + indice,
		value: valorRegistro,
	}));
}

{/*---------------------------------------------------------------------------
 NOTA SOBRE ESTE ARCHIVO (clienteModbus.js)

 - Este módulo es el puente entre la app React y el mundo Modbus. Por ahora,
   está pensado para dos modos:

   1) `MODO_MODBUS = "simulado"` (el actual):
      - `USAR_MODBUS_REAL` es false.
      - `leerRegistrosModbus` ignora la URL y genera valores aleatorios para
        cada address, ideal para probar la UI sin hardware conectado.

   2) `MODO_MODBUS = "real"`:
      - `USAR_MODBUS_REAL` pasa a true.
      - Las lecturas se hacen vía `fetch` a `URL_BASE`, donde un backend
        Express se encarga de hablar con el equipo Modbus real.

 - El formato de salida siempre es el mismo:
     `{ index, address, value }`, donde:
       * `index` es la posición en la lista,
       * `address` es la dirección del registro,
       * `value` es el valor crudo que luego se pasa por fórmulas y formatos.

 - Si alguna vez quiero cambiar el origen (por ejemplo, otro backend o una
   librería directa en el cliente), lo hago sólo acá mientras mantenga el
   mismo formato de retorno.
---------------------------------------------------------------------------*/}

/*---------------------------------------------------------------------------
CÓDIGO + EXPLICACIÓN DE CADA PARTE (clienteModbus.js)

0) Visión general del módulo

   Este archivo es el puente entre la app React y el mundo Modbus. Centraliza
   la lógica para leer registros tanto en ambiente simulado como en ambiente real,
   devolviendo siempre el mismo formato de datos a la interfaz.


1) MODO_MODBUS y USAR_MODBUS_REAL

   export const MODO_MODBUS = "simulado";
   export const USAR_MODBUS_REAL = MODO_MODBUS === "real";

   - `MODO_MODBUS` define cómo se comporta el cliente:
       • "simulado" → genera datos aleatorios, sin hardware real.
       • "real"     → llama a un backend Express que efectivamente habla Modbus.

   - `USAR_MODBUS_REAL` es un flag derivado:
       • true  si `MODO_MODBUS` es "real".
       • false en cualquier otro caso.

   - El resto del código se apoya en este flag para decidir si
     usa datos simulados o hace llamadas HTTP al backend.


2) URL_BASE del backend Modbus

   const URL_BASE = "http://localhost:5000/api/modbus/test";

   - Es la URL del endpoint Express que se encarga de:
       • abrir la conexión Modbus con el dispositivo real,
       • leer el rango de registros solicitado,
       • devolver los valores al frontend.

   - Sólo se usa cuando `USAR_MODBUS_REAL` es true; en modo simulado
     se ignora completamente.


3) leerRegistrosModbus({ ip, puerto, indiceInicial, cantRegistros })

   export async function leerRegistrosModbus({ ip, puerto, indiceInicial, cantRegistros }) { ... }

   3.1) Normalización y validación básica

       const inicio = Number(indiceInicial);
       const cantidad = Number(cantRegistros);
       const puertoNum = Number(puerto);

       - Convierte todo a número para evitar problemas con strings.
       - Valida:
           • que haya IP,
           • que haya puerto numérico,
           • que `indiceInicial` y `cantRegistros` sean números válidos,
           • que `cantRegistros > 0`.

       - Si la validación falla, devuelve `null` directamente sin intentar leer.


   3.2) Modo simulado (sin hardware)

       if (!USAR_MODBUS_REAL) {
         return Array.from({ length: cantidad }, (_, i) => ({
           index: i,
           address: inicio + i,
           value: Math.floor(Math.random() * 501),
         }));
       }

       - Genera un array de `cantidad` elementos.
       - Para cada elemento:
           • `index` es la posición en el array (0, 1, 2, ...).
           • `address` es la dirección Modbus simulada (inicio + i).
           • `value` es un entero aleatorio entre 0 y 500.

       - Útil para:
           • probar la UI de tarjetas, mapeos y fórmulas,
           • simular lecturas sin necesidad de estar conectado al
             tablero real.


   3.3) Modo real (llamando al backend Express)

       const respuesta = await fetch(URL_BASE, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           ip,
           puerto: puertoNum,
           indiceInicial: inicio,
           cantRegistros: cantidad,
         }),
       });

       const datos = await respuesta.json();

       if (!respuesta.ok || !datos.ok) {
         throw new Error(datos.error || "Error en lectura Modbus");
       }

       - Envía un POST al backend con:
           • `ip` del equipo,
           • `puerto` Modbus,
           • `indiceInicial` (primer registro),
           • `cantRegistros` (cuántos leer).

       - El backend responde con un JSON que debe tener:
           • `ok: true` si todo salió bien,
           • `registros: [...]` con los valores de los registros,
           • o `error` con un mensaje si algo falló.

       - Si hay error HTTP o `datos.ok` es false, lanza un Error
         para que el caller pueda manejarlo (mostrar mensaje, etc.).


   3.4) Normalización del formato de salida

       return datos.registros.map((valorRegistro, indice) => ({
         index: indice,
         address: inicio + indice,
         value: valorRegistro,
       }));

       - Convierte el array simple (`[valor0, valor1, ...]`) que
         viene del backend en el formato estándar que usa la app:

           { index, address, value }

       - Así la UI (mapeos, cálculos, tarjetas) no tiene que preocuparse
         por cómo viene exactamente la respuesta del servidor.


4) Integración con el resto de la aplicación

   - `ModalConfiguracionAlimentador` y las tabs `TabConfiguracionRele` /
     `TabConfiguracionAnalizador` llaman a `leerRegistrosModbus` para:

       • pruebas puntuales de conexión ("Test conexión"),
       • mediciones periódicas cuando se arranca el monitoreo continuo.

   - Los registros devueltos (`{ index, address, value }`) luego se
     pasan a:

       • `calculosMediciones.js` para aplicar fórmulas y formateo,
       • las tarjetas de alimentador para mostrar los valores finales.

   - Si en el futuro se reemplaza el backend o se conecta a otro tipo
     de fuente de datos, basta con ajustar este módulo y mantener el
     mismo formato de retorno.

---------------------------------------------------------------------------*/