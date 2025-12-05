import React from "react";

/**
 * Renderiza un grupo de cajas de medición (parte superior o inferior).
 */
const GrupoMedidores = ({ titulo, boxes, zona, renderizarCaja }) => {
	return (
		<div className="alim-card-section">
			<h3 className="alim-card-section-title">{titulo}</h3>
			<div className="alim-card-meters">
				{boxes.map((box, idx) => renderizarCaja(box, idx, zona))}
			</div>
		</div>
	);
};

export default GrupoMedidores;
