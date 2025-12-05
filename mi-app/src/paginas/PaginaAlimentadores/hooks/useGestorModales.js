import { useState, useCallback } from "react";

/**
 * Gestor simple de modales identificados por una clave.
 * Permite abrir/cerrar y guardar datos asociados al modal.
 */
export const useGestorModales = () => {
	const [estadoModales, setEstadoModales] = useState({});

	const abrirModal = useCallback((idModal, datos = null) => {
		setEstadoModales((prev) => ({
			...prev,
			[idModal]: { abierto: true, datos },
		}));
	}, []);

	const cerrarModal = useCallback((idModal) => {
		setEstadoModales((prev) => ({
			...prev,
			[idModal]: { abierto: false, datos: null },
		}));
	}, []);

	const obtenerEstado = useCallback(
		(idModal) => estadoModales[idModal] || { abierto: false, datos: null },
		[estadoModales]
	);

	return { abrirModal, cerrarModal, obtenerEstado, estadoModales };
};
