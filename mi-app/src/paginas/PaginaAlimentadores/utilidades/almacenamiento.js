// src/paginas/PaginaAlimentadores/utilidades/almacenamiento.js

/**
 * Funciones para trabajar con localStorage de forma segura.
 * Manejan errores automáticamente para evitar crashes de la app.
 */

/**
 * Guarda datos en localStorage.
 * Convierte automáticamente a JSON.
 *
 * @param {string} clave - Clave del storage.
 * @param {any} datos - Datos a guardar (se convierten a JSON).
 * @returns {boolean} true si guardó correctamente, false si hubo error.
 */
export const guardarEnStorage = (clave, datos) => {
	try {
		const textoJSON = JSON.stringify(datos);        // serializa el objeto a string JSON
		localStorage.setItem(clave, textoJSON);         // guarda bajo la clave indicada
		return true;
	} catch (error) {
		console.error(`Error al guardar ${clave}:`, error);
		return false;                                   // si algo falla (JSON o localStorage), aviso con false
	}
};

/**
 * Lee datos de localStorage.
 * Si no existe o hay error, devuelve valorPorDefecto.
 *
 * @param {string} clave - Clave del storage.
 * @param {any} valorPorDefecto - Valor si no existe o hay error.
 * @returns {any} Datos leídos o valorPorDefecto.
 */
export const leerDeStorage = (clave, valorPorDefecto = null) => {
	try {
		const textoGuardado = localStorage.getItem(clave); // obtiene el string JSON guardado

		// Si no existe nada para esa clave, devuelvo el valor por defecto
		if (!textoGuardado) return valorPorDefecto;

		// Parseo el JSON y retorno el objeto original
		return JSON.parse(textoGuardado);
	} catch (error) {
		console.error(`Error al leer ${clave}:`, error);
		return valorPorDefecto;                        // ante cualquier error, devuelvo el default
	}
};

/**
 * Elimina un item de localStorage.
 *
 * @param {string} clave - Clave a eliminar.
 */
export const eliminarDeStorage = (clave) => {
	try {
		localStorage.removeItem(clave);               // borra la entrada asociada a la clave
	} catch (error) {
		console.error(`Error al eliminar ${clave}:`, error);
	}
};

{/*---------------------------------------------------------------------------
 NOTA SOBRE ESTE ARCHIVO (almacenamiento.js)

 - Este módulo agrupa helpers básicos para trabajar con `localStorage` sin
   repetir `try/catch` en todos lados.

 - `guardarEnStorage(clave, datos)`:
     * convierte `datos` a JSON,
     * hace `localStorage.setItem`,
     * devuelve true/false según haya salido bien.

 - `leerDeStorage(clave, valorPorDefecto)`:
     * intenta leer y parsear JSON,
     * si no hay nada o falla el parseo, devuelve `valorPorDefecto`.

 - `eliminarDeStorage(clave)`:
     * encapsula el `removeItem` y loguea cualquier error.

 - La idea es usar siempre estas funciones junto con las claves de
   `CLAVES_STORAGE`, para tener un acceso al almacenamiento más ordenado
   y fácil de cambiar en el futuro.
---------------------------------------------------------------------------*/}

/*---------------------------------------------------------------------------
CÓDIGO + EXPLICACIÓN DE CADA PARTE (almacenamiento.js)

0) Visión general del módulo

   Este archivo agrupa funciones auxiliares para trabajar con `localStorage`
   de forma más segura y prolija:

   - Centraliza el manejo de errores en un solo lugar.
   - Serializa y deserializa JSON automáticamente.
   - Evita repetir `try/catch` en todos los puntos donde se usa storage.

   La idea es que el resto de la app sólo llame a:
   `guardarEnStorage`, `leerDeStorage` o `eliminarDeStorage`.


1) guardarEnStorage(clave, datos)

   export const guardarEnStorage = (clave, datos) => {
     try {
       const textoJSON = JSON.stringify(datos);
       localStorage.setItem(clave, textoJSON);
       return true;
     } catch (error) {
       console.error(`Error al guardar ${clave}:`, error);
       return false;
     }
   };

   - Parámetros:
       • `clave`: string que identifica la entrada en `localStorage`.
       • `datos`: cualquier valor serializable a JSON (objetos, arrays, etc.).

   - Flujo:
       1) Convierte `datos` a texto usando `JSON.stringify`.
       2) Llama a `localStorage.setItem(clave, textoJSON)`.
       3) Si todo sale bien, devuelve `true`.

   - Manejo de errores:
       • Si falla la serialización (por ejemplo, estructuras cíclicas) o el
         acceso a `localStorage`, se captura la excepción, se loguea en consola
         y la función devuelve `false` para que el caller pueda reaccionar.


2) leerDeStorage(clave, valorPorDefecto)

   export const leerDeStorage = (clave, valorPorDefecto = null) => {
     try {
       const textoGuardado = localStorage.getItem(clave);
       if (!textoGuardado) return valorPorDefecto;
       return JSON.parse(textoGuardado);
     } catch (error) {
       console.error(`Error al leer ${clave}:`, error);
       return valorPorDefecto;
     }
   };

   - Parámetros:
       • `clave`: string de la entrada a leer.
       • `valorPorDefecto`: valor a devolver si no existe la clave o hay error.

   - Flujo:
       1) Intenta leer el string almacenado con `getItem`.
       2) Si no hay nada (null/undefined), devuelve `valorPorDefecto`.
       3) Si existe, intenta parsear con `JSON.parse` y devuelve el resultado.

   - Manejo de errores:
       • Ante cualquier problema (JSON corrupto, fallo de acceso, etc.),
         se imprime un mensaje de error y se devuelve `valorPorDefecto`.
       • Esto evita que la app se rompa por un dato mal guardado.


3) eliminarDeStorage(clave)

   export const eliminarDeStorage = (clave) => {
     try {
       localStorage.removeItem(clave);
     } catch (error) {
       console.error(`Error al eliminar ${clave}:`, error);
     }
   };

   - Parámetro:
       • `clave`: nombre de la entrada que se quiere borrar.

   - Flujo:
       • Llama a `localStorage.removeItem(clave)` dentro de un `try/catch`
         para capturar cualquier error (por ejemplo, restricciones del navegador).


4) Uso recomendado con claves centralizadas

   - Estas funciones se suelen combinar con un objeto de constantes, por ejemplo:
       • `CLAVES_STORAGE.PUESTOS`
       • `CLAVES_STORAGE.PUESTO_SELECCIONADO`
     para no repetir strings “mágicos” repartidos por la app.

   - Beneficios:
       • Si alguna vez se cambia un nombre de clave o se decide mover el
         almacenamiento a otro mecanismo, sólo hay que tocar este módulo
         (y el de constantes), reduciendo riesgo de errores.

---------------------------------------------------------------------------*/

