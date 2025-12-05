import React, { useEffect, useRef, useState } from "react";
import "./TarjetaAlimentador.css";
import configIcon from "../../../../assets/imagenes/Config_Icon.png";
import mapIcon from "../../../../assets/imagenes/Mapeo_icon.png";

const TarjetaAlimentador = ({
	nombre,
	color,
	onConfigClick,
	onMapClick,
	topSide,
	bottomSide,
	draggable = false,
	isDragging = false,
	onDragStart,
	onDragOver,
	onDrop,
	onDragEnd,

	// NUEVO: info de mediciones y períodos
	mideRele = false,
	mideAnalizador = false,
	periodoRele = 60,
	periodoAnalizador = 60,
	timestampInicioRele = null,
	timestampInicioAnalizador = null,
	contadorRele = 0,
	contadorAnalizador = 0,
}) => {
	// Control local de animaciones de borde: solo se activan tras recibir una lectura
	const [mostrarProgresoRele, setMostrarProgresoRele] = useState(false);
	const [mostrarProgresoAnalizador, setMostrarProgresoAnalizador] = useState(false);
	const ultimoContadorReleRef = useRef(contadorRele);
	const ultimoContadorAnalizadorRef = useRef(contadorAnalizador);

	// Si se cambia de puesto o se detiene la medición, reseteamos y esperamos una nueva lectura
	useEffect(() => {
		if (!mideRele) {
			setMostrarProgresoRele(false);
			ultimoContadorReleRef.current = contadorRele;
			return;
		}

		if (contadorRele !== ultimoContadorReleRef.current) {
			ultimoContadorReleRef.current = contadorRele;
			setMostrarProgresoRele(contadorRele > 0);
		}
	}, [contadorRele, mideRele]);

	useEffect(() => {
		if (!mideAnalizador) {
			setMostrarProgresoAnalizador(false);
			ultimoContadorAnalizadorRef.current = contadorAnalizador;
			return;
		}

		if (contadorAnalizador !== ultimoContadorAnalizadorRef.current) {
			ultimoContadorAnalizadorRef.current = contadorAnalizador;
			setMostrarProgresoAnalizador(contadorAnalizador > 0);
		}
	}, [contadorAnalizador, mideAnalizador]);

	// ===== Helpers para armar cada lado de la tarjeta =====
	const buildSideDisplay = (side, tituloDefault) => {
		const defaultBoxes = ["R", "S", "T"].map((label) => ({
			etiqueta: label,
			valor: "--,--",
			enabled: false,
			origen: null,
		}));

		if (!side) {
			return {
				titulo: tituloDefault,
				boxes: defaultBoxes,
			};
		}

		const titulo =
			(side.titulo && String(side.titulo).trim()) || tituloDefault;

		let boxes = Array.isArray(side.boxes) ? side.boxes : [];
		boxes = boxes.slice(0, 4);

		if (boxes.length === 0) {
			boxes = defaultBoxes;
		} else {
			boxes = boxes.map((b, idx) => ({
				etiqueta:
					(b?.etiqueta && String(b.etiqueta).trim()) || `Box ${idx + 1}`,
				valor:
					b?.valor == null || b.valor === "" ? "--,--" : String(b.valor),
				enabled: !!b?.enabled,
				origen: b?.origen || null,
			}));
		}

		return { titulo, boxes };
	};

	const sup = buildSideDisplay(topSide, "CONSUMO (A)");
	const inf = buildSideDisplay(bottomSide, "TENSIÓN (kV)");

	// detectar si algún lado tiene 4 boxes
	const maxBoxes = Math.max(sup.boxes.length, inf.boxes.length);
	const isWide = maxBoxes >= 4;

	// armar clases de la card
	const clasesCard = ["alim-card"];
	if (isWide) clasesCard.push("alim-card-wide");
	if (isDragging) clasesCard.push("alim-card-dragging");

	// Renderizar un box de medición
	const renderBox = (box, idx, zona) => {
		const isFromRele = box.origen === "rele" || !box.origen;
		const isFromAnalizador = box.origen === "analizador";

		const medicionActiva =
			box.enabled &&
			((isFromRele && mideRele) || (isFromAnalizador && mideAnalizador));

		const progresoHabilitado =
			(isFromRele && mostrarProgresoRele) ||
			(isFromAnalizador && mostrarProgresoAnalizador);

		const equipo = isFromAnalizador ? 'analizador' : 'rele';
		const dur = isFromAnalizador ? periodoAnalizador : periodoRele;
		const contador = isFromAnalizador ? contadorAnalizador : contadorRele;

		let valueClass = "alim-card-meter-value";

		if (medicionActiva && progresoHabilitado) {
			if (isFromRele) {
				valueClass += " alim-meter-progress-rele";
			} else if (isFromAnalizador) {
				valueClass += " alim-meter-progress-analizador";
			}
		}

		// Key que incluye el contador de lecturas
		// Esto hace que React destruya y recree el elemento cada vez que llega un dato nuevo
		// independientemente de si el valor cambió o no
		const valueKey = `${zona}-${idx}-${equipo}-c${contador}`;

		return (
			<div key={idx} className="alim-card-meter">
				<span className="alim-card-meter-phase">{box.etiqueta}</span>
				<span
					key={valueKey}
					className={valueClass}
					style={medicionActiva && progresoHabilitado ? {
						[isFromRele ? "--rw-progress-duration-rele" : "--rw-progress-duration-analizador"]: `${dur}s`
					} : undefined}
				>
					{box.valor ?? "--,--"}
				</span>
			</div>
		);
	};

	return (
		<div
			className={clasesCard.join(" ")}
			style={{ cursor: draggable ? "grab" : "default" }}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragEnd={onDragEnd}
		>
			{/* Header con nombre y botones */}
			<div
				className="alim-card-header"
				style={{ backgroundColor: color || "#0ea5e9" }}
			>
				<div className="alim-card-icons">
					<button
						type="button"
						className="alim-card-icon-btn"
						onClick={onConfigClick}
						title="Configurar registrador"
					>
						<img
							src={configIcon}
							alt="Configurar"
							className="alim-card-icon"
						/>
					</button>

					<button
						type="button"
						className="alim-card-icon-btn alim-card-map-btn"
						onClick={onMapClick}
						title="Mapeo"
					>
						<img src={mapIcon} alt="Mapeo" className="alim-card-icon" />
					</button>
				</div>

				<span className="alim-card-title">{nombre}</span>
			</div>

			{/* Cuerpo con los 2 bloques (superior / inferior) */}
			<div className="alim-card-body">
				{/* ===== PARTE SUPERIOR ===== */}
				<div className="alim-card-section">
					<h3 className="alim-card-section-title">{sup.titulo}</h3>
					<div className="alim-card-meters">
						{sup.boxes.map((box, idx) => renderBox(box, idx, 'sup'))}
					</div>
				</div>

				{/* ===== PARTE INFERIOR ===== */}
				<div className="alim-card-section">
					<h3 className="alim-card-section-title">{inf.titulo}</h3>
					<div className="alim-card-meters">
						{inf.boxes.map((box, idx) => renderBox(box, idx, 'inf'))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TarjetaAlimentador;
