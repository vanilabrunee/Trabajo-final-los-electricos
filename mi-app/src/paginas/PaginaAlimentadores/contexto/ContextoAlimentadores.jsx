import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usarPuestos } from "../hooks/usarPuestos";
import { usarMediciones } from "../hooks/usarMediciones";
import {
	obtenerDisenoTarjeta,
	calcularValoresLadoTarjeta,
} from "../utilidades/calculosMediciones";

const ContextoAlimentadores = createContext(null);

export const ProveedorAlimentadores = ({ children }) => {
	const puestosHook = usarPuestos();
	const medicionesHook = usarMediciones();
	const { registrosEnVivo } = medicionesHook;
	const { puestoSeleccionado } = puestosHook;

	const [lecturasTarjetas, setLecturasTarjetas] = useState({});

	// Recalcula los valores a mostrar en cada tarjeta cuando cambian registros o mapeos
	useEffect(() => {
		if (!puestoSeleccionado) {
			setLecturasTarjetas({});
			return;
		}

		setLecturasTarjetas(() => {
			const nuevo = {};

			puestoSeleccionado.alimentadores.forEach((alim) => {
				const regsDelAlim = registrosEnVivo[alim.id] || null;
				const diseno = obtenerDisenoTarjeta(alim.mapeoMediciones);

				const parteSuperior = calcularValoresLadoTarjeta(
					regsDelAlim,
					diseno.superior
				);
				const parteInferior = calcularValoresLadoTarjeta(
					regsDelAlim,
					diseno.inferior
				);

				nuevo[alim.id] = { parteSuperior, parteInferior };
			});

			return nuevo;
		});
	}, [puestoSeleccionado, registrosEnVivo]);

	// Helper: arranca una medicion con los calculos que ya hace el hook
	const iniciarMedicionConCalculo = async (alimentador, equipo, override) => {
		await medicionesHook.iniciarMedicion(alimentador, equipo, override);
	};

	// Helper: alterna una medicion sin repetir logica en la vista
	const alternarMedicion = (alimentador, equipo, override) => {
		if (medicionesHook.estaMidiendo(alimentador.id, equipo)) {
			medicionesHook.detenerMedicion(alimentador.id, equipo);
		} else {
			iniciarMedicionConCalculo(alimentador, equipo, override);
		}
	};

	const valorContexto = useMemo(
		() => ({
			// Datos de puestos
			puestos: puestosHook.puestos,
			puestoSeleccionado: puestosHook.puestoSeleccionado,
			puestoSeleccionadoId: puestosHook.puestoSeleccionadoId,
			agregarPuesto: puestosHook.agregarPuesto,
			eliminarPuesto: puestosHook.eliminarPuesto,
			seleccionarPuesto: puestosHook.seleccionarPuesto,
			actualizarPuestos: puestosHook.actualizarPuestos,
			setPuestos: puestosHook.setPuestos,

			// Alimentadores
			agregarAlimentador: puestosHook.agregarAlimentador,
			actualizarAlimentador: puestosHook.actualizarAlimentador,
			eliminarAlimentador: puestosHook.eliminarAlimentador,
			reordenarAlimentadores: puestosHook.reordenarAlimentadores,

			// Mediciones y lecturas
			lecturasTarjetas,
			registrosEnVivo: medicionesHook.registrosEnVivo,
			iniciarMedicion: medicionesHook.iniciarMedicion,
			detenerMedicion: medicionesHook.detenerMedicion,
			iniciarMedicionConCalculo,
			alternarMedicion,
			obtenerRegistros: medicionesHook.obtenerRegistros,
			estaMidiendo: medicionesHook.estaMidiendo,
			obtenerTimestampInicio: medicionesHook.obtenerTimestampInicio,
			obtenerContadorLecturas: medicionesHook.obtenerContadorLecturas,
		}),
		[puestosHook, medicionesHook, lecturasTarjetas]
	);

	return (
		<ContextoAlimentadores.Provider value={valorContexto}>
			{children}
		</ContextoAlimentadores.Provider>
	);
};

export const usarContextoAlimentadores = () => {
	const contexto = useContext(ContextoAlimentadores);
	if (!contexto) {
		throw new Error(
			"usarContextoAlimentadores debe usarse dentro de ProveedorAlimentadores"
		);
	}
	return contexto;
};
