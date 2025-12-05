import React from "react";

/**
 * Caja individual de medición con su animación de borde y valor.
 */
const CajaMedicion = ({
	box,
	indice,
	zona,
	mideRele,
	mideAnalizador,
	mostrarProgresoRele,
	mostrarProgresoAnalizador,
	periodoRele,
	periodoAnalizador,
	contadorRele,
	contadorAnalizador,
}) => {
	const esDelRele = box.origen === "rele" || !box.origen;
	const esDelAnalizador = box.origen === "analizador";

	const medicionActiva =
		box.enabled &&
		((esDelRele && mideRele) || (esDelAnalizador && mideAnalizador));

	const progresoHabilitado =
		(esDelRele && mostrarProgresoRele) ||
		(esDelAnalizador && mostrarProgresoAnalizador);

	const equipo = esDelAnalizador ? "analizador" : "rele";
	const duracionAnimacion = esDelAnalizador ? periodoAnalizador : periodoRele;
	const contadorLecturas = esDelAnalizador ? contadorAnalizador : contadorRele;

	let clasesValor = "alim-card-meter-value";

	if (medicionActiva && progresoHabilitado) {
		if (esDelRele) {
			clasesValor += " alim-meter-progress-rele";
		} else if (esDelAnalizador) {
			clasesValor += " alim-meter-progress-analizador";
		}
	}

	// Key que incluye el contador de lecturas para reiniciar animación
	const claveValor = `${zona}-${indice}-${equipo}-c${contadorLecturas}`;
	const propiedadDuracion = esDelRele
		? "--rw-progress-duration-rele"
		: "--rw-progress-duration-analizador";

	return (
		<div key={`${zona}-${indice}`} className="alim-card-meter">
			<span className="alim-card-meter-phase">{box.etiqueta}</span>
			<span
				key={claveValor}
				className={clasesValor}
				style={
					medicionActiva && progresoHabilitado
						? {
							[propiedadDuracion]: `${duracionAnimacion}s`,
						}
						: undefined
				}
			>
				{box.valor ?? "--,--"}
			</span>
		</div>
	);
};

export default CajaMedicion;
