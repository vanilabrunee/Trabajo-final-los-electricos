import React from "react";
import { ProveedorAlimentadores } from "./contexto/ContextoAlimentadores";
import VistaAlimentadores from "./componentes/layout/VistaAlimentadores.jsx";

/**
 * Página principal de alimentadores.
 * Solo monta el provider de datos y la vista dividida en componentes.
 */
const PaginaAlimentadores = () => {
	return (
		<ProveedorAlimentadores>
			<VistaAlimentadores />
		</ProveedorAlimentadores>
	);
};

export default PaginaAlimentadores;
