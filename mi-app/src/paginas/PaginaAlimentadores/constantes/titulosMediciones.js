// src/paginas/PaginaAlimentadores/constantes/titulosMediciones.js

/**
 * Títulos descriptivos para cada tipo de medición.
 * Aparecen en las tarjetas de alimentadores (parte superior/inferior).
 */
export const TITULOS_MEDICIONES = {
	tension_linea: "Tensión de línea (kV)",
	tension_entre_lineas: "Tensión entre líneas (kV)",
	corriente_132: "Corriente de línea (A) (en 13,2 kV)",
	corriente_33: "Corriente de línea (A) (en 33 kV)",
	potencia_activa: "Potencia activa (kW)",
	potencia_reactiva: "Potencia reactiva (kVAr)",
	potencia_aparente: "Potencia aparente (kVA)",
	factor_potencia: "Factor de Potencia",
	frecuencia: "Frecuencia (Hz)",
	corriente_neutro: "Corriente de Neutro (A)",
};

/**
 * Etiquetas que aparecen en cada medidor (R, S, T, etc.),
 * organizadas por tipo de medición.
 */
export const ETIQUETAS_POR_DEFECTO = {
	corriente_132: ["R", "S", "T", "N"],
	corriente_33: ["R", "S", "T", "N"],
	tension_linea: ["R", "S", "T", "N"],
	tension_entre_lineas: ["L1-L2", "L2-L3", "L1-L3", ""],
	potencia_activa: ["L1", "L2", "L3", "Total"],
	potencia_reactiva: ["L1", "L2", "L3", "Total"],
	potencia_aparente: ["L1", "L2", "L3", "Total"],
	factor_potencia: ["L1", "L2", "L3", ""],
	frecuencia: ["L1", "L2", "L3", ""],
	corriente_neutro: ["N", "", "", ""],
};

/**
 * Diseño por defecto de una tarjeta de alimentador.
 * Define qué se muestra en la parte superior e inferior.
 */
export const DISEÑO_TARJETA_POR_DEFECTO = {
	superior: {
		tituloId: "corriente_132", // arriba se muestran corrientes de línea (13,2 kV)
		tituloCustom: "",
		cantidad: 3,               // por defecto R, S, T
		boxes: [],
	},
	inferior: {
		tituloId: "tension_linea", // abajo se muestran tensiones de línea (kV)
		tituloCustom: "",
		cantidad: 3,
		boxes: [],
	},
};

{/*---------------------------------------------------------------------------
 NOTA SOBRE ESTE ARCHIVO (titulosMediciones.js)

 - `TITULOS_MEDICIONES` traduce ids como `corriente_132` o `tension_linea`
   a textos legibles que aparecen como títulos en los lados de la tarjeta.

 - `ETIQUETAS_POR_DEFECTO` define las etiquetas iniciales de cada box según
   el tipo de magnitud (por ejemplo, R/S/T/N para corrientes y L1/L2/L3/Total
   para potencias).

 - `DISEÑO_TARJETA_POR_DEFECTO` se usa en `calculosMediciones.js` como base
   cuando todavía no hay ningún `cardDesign` configurado por el usuario, de
   modo que siempre exista una estructura razonable para mostrar.
---------------------------------------------------------------------------*/}

