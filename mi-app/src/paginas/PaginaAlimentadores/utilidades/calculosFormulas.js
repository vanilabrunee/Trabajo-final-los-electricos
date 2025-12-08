// src/paginas/PaginaAlimentadores/utilidades/calculosFormulas.js

/**
 * Aplica una fórmula matemática a un valor 'x'.
 * Ejemplo: aplicarFormula("x * 2 + 10", 5) => 20.
 *
 * NOTA EDUCATIVA: Usamos new Function() solo para ambiente de aprendizaje.
 * En producción se usaría una librería como mathjs para mayor seguridad.
 *
 * @param {string} textoFormula - Fórmula en texto, ej: "x / 100".
 * @param {number} x - Valor al que aplicar la fórmula.
 * @returns {number|null} Resultado o null si hay error.
 */
export const aplicarFormula = (textoFormula, x) => {
	const formulaLimpia = (textoFormula || "").trim(); // quita espacios y maneja null/undefined

	// Si no hay fórmula, devolver el valor sin cambios
	if (!formulaLimpia) return x;

	try {
		// Crear función dinámica (solo para ambiente educativo)
		const funcionCalcular = new Function("x", `return ${formulaLimpia};`);
		const resultado = funcionCalcular(x);          // evalúa la fórmula con el valor x

		// Verificar que sea número válido
		return typeof resultado === "number" && !Number.isNaN(resultado)
			 ? resultado
		 : null;
	} catch (error) {
		console.error("Error al aplicar fórmula:", error);
		return null;                                   // ante error sintáctico o ejecución, devolvemos null
	}
};

/**
 * Formatea un número para mostrarlo en la interfaz.
 * Ejemplos:
 *   - 123.456 => "123,46"
 *   - null => "ERROR"
 *   - NaN => "ERROR"
 *
 * @param {number} valor - Número a formatear.
 * @returns {string} Valor formateado con 2 decimales y coma.
 */
export const formatearValor = (valor) => {
	// Si es inválido, mostrar ERROR
	if (valor == null || Number.isNaN(valor)) {
		return "ERROR";
	}

	// Convertir a 2 decimales y cambiar punto por coma
	return valor.toFixed(2).replace(".", ",");
};

{/*---------------------------------------------------------------------------
 NOTA SOBRE ESTE ARCHIVO (calculosFormulas.js)

 - `aplicarFormula(textoFormula, x)` permite que cada box de medición tenga una
   fórmula configurable en texto (por ejemplo, "x * 500 / 1000") que se evalúa
   sobre el valor crudo leído del registro Modbus.

 - Para mantenerlo simple se usa `new Function("x", "return ...")`, lo que es
   suficiente en este proyecto educativo pero no sería adecuado en un entorno
   productivo sin sandboxing.

 - `formatearValor(valor)` toma el número ya calculado y lo convierte a un
   string con 2 decimales y coma como separador, o "ERROR" si el valor no es
   válido. Es la salida final que se ve en cada caja de la tarjeta.
---------------------------------------------------------------------------*/}

/*---------------------------------------------------------------------------
CÓDIGO + EXPLICACIÓN DE CADA PARTE (calculosFormulas.js)

0) Visión general del módulo

   Este archivo concentra dos utilidades relacionadas con el cálculo y
   presentación de valores numéricos en las tarjetas de medición:

   - `aplicarFormula`: toma un valor crudo (x) y le aplica una fórmula
     configurable en texto.

   - `formatearValor`: toma el número ya calculado y lo convierte a un string
     listo para mostrar en pantalla.


1) aplicarFormula(textoFormula, x)

   export const aplicarFormula = (textoFormula, x) => {
     const formulaLimpia = (textoFormula || "").trim();
     if (!formulaLimpia) return x;

     try {
       const funcionCalcular = new Function("x", `return ${formulaLimpia};`);
       const resultado = funcionCalcular(x);

       return typeof resultado === "number" && !Number.isNaN(resultado)
         ? resultado
         : null;
     } catch (error) {
       console.error("Error al aplicar fórmula:", error);
       return null;
     }
   };

   - Parámetros:
       • `textoFormula`: string con la expresión matemática, por ejemplo
         "x * 500 / 1000" o "x / 100".
       • `x`: valor numérico crudo que viene del registro Modbus.

   - Flujo:
       1) Limpia el texto con `trim()` y maneja null/undefined.
       2) Si la fórmula queda vacía, devuelve directamente `x` sin cambios
          (equivale a "no hay fórmula").
       3) Construye dinámicamente una función con `new Function("x", ...)` que
          devuelve el resultado de la expresión.
       4) Llama a esa función pasando `x` y guarda el resultado.
       5) Si el resultado es un número válido, lo devuelve; si no, devuelve null.

   - Seguridad / contexto educativo:
       • `new Function` y cualquier ejecución de código dinámico deben evitarse
         en producción (riesgo de inyección de código).
       • En este proyecto se usa con fines didácticos; en un sistema real sería
         preferible usar una librería como mathjs o un parser de expresiones
         controlado.


2) formatearValor(valor)

   export const formatearValor = (valor) => {
     if (valor == null || Number.isNaN(valor)) {
       return "ERROR";
     }
     return valor.toFixed(2).replace(".", ",");
   };

   - Parámetro:
       • `valor`: número ya procesado (por ejemplo, después de aplicar la
         fórmula), que se quiere mostrar en la UI.

   - Flujo:
       1) Si `valor` es null, undefined o NaN, devuelve el string "ERROR".
          Esto permite a la interfaz diferenciar claramente un problema de
          cálculo de un dato válido.

       2) Si es un número válido, usa `toFixed(2)` para dejarlo con dos
          decimales.

       3) Cambia el punto decimal por coma para seguir el formato
          habitual "123,45".

   - Resultado típico:
       • 123.456  → "123,46"
       • 7        → "7,00"
       • null     → "ERROR"


3) Uso dentro del flujo de mediciones

   - Normalmente, el pipeline es:
       1) Leer registro Modbus → valor crudo.

       2) Aplicar `aplicarFormula` con la fórmula definida en el mapeo
          (si falla o devuelve null, se considera error).
			 
       3) Pasar el resultado numérico por `formatearValor` para obtener el
          texto final que se mostrará en la `CajaMedicion`.

   - Al centralizar estas operaciones en un módulo, se garantiza un criterio
     uniforme de cálculo y de formato a lo largo de toda la app.

---------------------------------------------------------------------------*/