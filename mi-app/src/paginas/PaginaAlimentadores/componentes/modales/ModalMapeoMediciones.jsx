// src/paginas/PaginaAlimentadores/componentes/modales/ModalMapeoMediciones.jsx

import React, { useEffect, useState } from "react";              // React + hooks para estado y efectos
import "./ModalMapeoMediciones.css";                             // estilos específicos del modal de mapeo
import FormularioDiseñoTarjeta from "./mapeo/FormularioDiseñoTarjeta.jsx"; // subformulario para configurar cada lado de la tarjeta

// Secciones "clásicas" de mapeo (corriente, tensión, potencias, etc.)
// Aunque ya no se usan directamente en la UI, se preservan para mantener compatibilidad
// con mapeos antiguos y posibles extensiones futuras.
const SECCIONES_MAPEO = [
	{
		id: "tension_linea",
		titulo: "Tensión de línea (kV)",
		items: ["L1", "L2", "L3"],
	},
	{
		id: "tension_entre_lineas",
		titulo: "Tensión entre líneas (kV)",
		items: ["L1-L2", "L2-L3", "L1-L3"],
	},
	{
		id: "corriente_linea",
		titulo: "Corriente de línea (A)",
		items: ["L1", "L2", "L3"],
	},
	{
		id: "potencia_activa",
		titulo: "Potencia activa (kW)",
		items: ["L1", "L2", "L3", "Total"],
	},
	{
		id: "potencia_reactiva",
		titulo: "Potencia reactiva (kVAr)",
		items: ["L1", "L2", "L3", "Total"],
	},
	{
		id: "potencia_aparente",
		titulo: "Potencia aparente (kVA)",
		items: ["L1", "L2", "L3", "Total"],
	},
	{
		id: "factor_potencia",
		titulo: "Factor de Potencia",
		items: ["L1", "L2", "L3"],
	},
	{
		id: "frecuencia",
		titulo: "Frecuencia (Hz)",
		items: ["L1", "L2", "L3"],
	},
	{
		id: "corriente_neutro",
		titulo: "Corriente de Neutro (A)",
		items: ["N"],
	},
];

// ---- helpers para diseño de card ----
function crearSideDesignDefault(tituloIdPorDefecto) {
	return {
		tituloId: tituloIdPorDefecto, // id de magnitud (corriente_132, tension_linea, etc.)
		tituloCustom: "",             // texto libre si se elige "custom"
		cantidad: 3,                  // por defecto mostramos 3 boxes
		boxes: [
			// 4 boxes potenciales, aunque `cantidad` puede ser 1..4
			{
				enabled: false,
				label: "",
				registro: "",
				origen: "",
				formula: "",
			},
			{
				enabled: false,
				label: "",
				registro: "",
				origen: "",
				formula: "",
			},
			{
				enabled: false,
				label: "",
				registro: "",
				origen: "",
				formula: "",
			},
			{
				enabled: false,
				label: "",
				registro: "",
				origen: "",
				formula: "",
			},
		],
	};
}

function crearCardDesignDefault() {
	return {
		superior: crearSideDesignDefault("corriente_132"), // por defecto parecido a "CONSUMO (A)"
		inferior: crearSideDesignDefault("tension_linea"), // por defecto parecido a "TENSIÓN (kV)"
	};
}

// ---- mapeo vacío: secciones clásicas + diseño de tarjeta ----
function crearMapeoVacio() {
	const base = {};
	SECCIONES_MAPEO.forEach((sec) => {
		base[sec.id] = {};
		sec.items.forEach((item) => {
			base[sec.id][item] = {
				enabled: false,
				registro: "",
				formula: "",
				origen: "",
			};
		});
	});

	base.cardDesign = crearCardDesignDefault();
	return base;
}

const ModalMapeoMediciones = ({ abierto, alimentador, onCerrar, onGuardar }) => {
	const nombreAlimentador = alimentador?.nombre || "";          // solo para mostrar en el título
	const initialMapeo = alimentador?.mapeoMediciones;            // mapeo previamente guardado (si existe)
	const [mapeo, setMapeo] = useState(crearMapeoVacio);          // estado completo del mapeo

	// Al abrir el modal, mezclamos el mapeo anterior con la estructura base
	useEffect(() => {
		if (!abierto) return;

		const base = crearMapeoVacio();

		if (!initialMapeo) {
			setMapeo(base);
			return;
		}

		// Mezcla mapeo guardado (viejo) con el esqueleto vacío
		const combinado = { ...base };

		// 1) secciones clásicas (las preservamos para compatibilidad)
		SECCIONES_MAPEO.forEach((sec) => {
			sec.items.forEach((item) => {
				const guardado = initialMapeo[sec.id]?.[item] || {};
				combinado[sec.id][item] = {
					...base[sec.id][item],
					...guardado,
					origen: guardado.origen || "rele", // por defecto, datos del relé
				};
			});
		});

		// 2) diseño de tarjeta (cardDesign)
		if (initialMapeo.cardDesign) {
			const defCD = base.cardDesign;
			const guardCD = initialMapeo.cardDesign;

			const mergeSide = (sideName) => {
				const defSide = defCD[sideName];
				const guardSide = guardCD[sideName] || {};

				const boxesDef = defSide.boxes || [];
				const boxesGuard = guardSide.boxes || [];

				const mergedBoxes = boxesDef.map((bDef, idx) => {
					const bGuard = boxesGuard[idx] || {};
					return {
						...bDef,
						...bGuard,
						origen: bGuard.origen || bDef.origen || "rele",
					};
				});

				const cantGuard = guardSide.cantidad;
				const cantidad =
					typeof cantGuard === "number" &&
					cantGuard >= 1 &&
					cantGuard <= 4
						? cantGuard
						: defSide.cantidad;

				return {
					...defSide,
					...guardSide,
					boxes: mergedBoxes,
					cantidad,
					tituloId: guardSide.tituloId || defSide.tituloId,
					tituloCustom: guardSide.tituloCustom || "",
				};
			};

			combinado.cardDesign = {
				superior: mergeSide("superior"),
				inferior: mergeSide("inferior"),
			};
		} else {
			combinado.cardDesign = base.cardDesign;
		}

		setMapeo(combinado);
	}, [abierto, initialMapeo]);

	if (!abierto) return null;

	// --- helpers actualización cardDesign ---
	const asegurarCardDesign = (prev) => {
		if (!prev.cardDesign) {
			return crearCardDesignDefault();
		}
		const cd = { ...prev.cardDesign };
		if (!cd.superior)
			cd.superior = crearSideDesignDefault("corriente_132");
		if (!cd.inferior)
			cd.inferior = crearSideDesignDefault("tension_linea");
		return cd;
	};

	const actualizarCantidadBoxes = (zona, nuevaCant) => {
		const cant = Math.min(4, Math.max(1, nuevaCant || 1));    // limita a [1,4]
		setMapeo((prev) => {
			const cd = asegurarCardDesign(prev);
			return {
				...prev,
				cardDesign: {
					...cd,
					[zona]: {
						...cd[zona],
						cantidad: cant,
					},
				},
			};
		});
	};

	const actualizarTituloSeleccionado = (zona, tituloId) => {
		setMapeo((prev) => {
			const cd = asegurarCardDesign(prev);
			const side = cd[zona];
			return {
				...prev,
				cardDesign: {
					...cd,
					[zona]: {
						...side,
						tituloId,
					},
				},
			};
		});
	};

	const actualizarTituloCustom = (zona, texto) => {
		setMapeo((prev) => {
			const cd = asegurarCardDesign(prev);
			const side = cd[zona];
			return {
				...prev,
				cardDesign: {
					...cd,
					[zona]: {
						...side,
						tituloId: "custom",
						tituloCustom: texto,
					},
				},
			};
		});
	};

	const actualizarCardDesignCaja = (zona, index, campo, valor) => {
		setMapeo((prev) => {
			const cd = asegurarCardDesign(prev);
			const side = cd[zona];
			const boxes = side.boxes ? [...side.boxes] : [];
			// aseguramos tener siempre 4 posiciones
			while (boxes.length < 4) {
				boxes.push({
					enabled: false,
					label: "",
					registro: "",
					origen: "rele",
					formula: "",
				});
			}
			boxes[index] = {
				...boxes[index],
				[campo]: valor,
			};

			return {
				...prev,
				cardDesign: {
					...cd,
					[zona]: {
						...side,
						boxes,
					},
				},
			};
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onGuardar(mapeo);                                           // devuelve todo el mapeo al componente padre
	};

	const cardDesign = mapeo.cardDesign || crearCardDesignDefault();

	return (
		<div className="alim-modal-overlay">
			<div className="map-modal">
				<h2 className="map-modal__title">
					Mapeo de mediciones – {nombreAlimentador}
				</h2>

				<form onSubmit={handleSubmit} className="map-form">
					<div className="map-design">
						<h3 className="map-design__title">Diseño de la tarjeta</h3>
						<p className="map-design__help">
							Eligí qué magnitudes se muestran en la parte superior e
							inferior de la tarjeta y cómo se alimentan los boxes de
							medición. Podés preparar boxes deshabilitados para usarlos
							más adelante.
						</p>

						<FormularioDiseñoTarjeta
							zona="superior"
							tituloBloque="Parte superior"
							placeholderTitulo="CONSUMO (A)"
							design={cardDesign.superior}
							onChangeTitulo={(tituloId) =>
								actualizarTituloSeleccionado("superior", tituloId)
							}
							onChangeTituloCustom={(texto) =>
								actualizarTituloCustom("superior", texto)
							}
							onChangeCantidad={(cant) =>
								actualizarCantidadBoxes("superior", cant)
							}
							onChangeBox={(index, campo, valor) =>
								actualizarCardDesignCaja("superior", index, campo, valor)
							}
						/>

						<FormularioDiseñoTarjeta
							zona="inferior"
							tituloBloque="Parte inferior"
							placeholderTitulo="TENSIÓN (kV)"
							design={cardDesign.inferior}
							onChangeTitulo={(tituloId) =>
								actualizarTituloSeleccionado("inferior", tituloId)
							}
							onChangeTituloCustom={(texto) =>
								actualizarTituloCustom("inferior", texto)
							}
							onChangeCantidad={(cant) =>
								actualizarCantidadBoxes("inferior", cant)
							}
							onChangeBox={(index, campo, valor) =>
								actualizarCardDesignCaja("inferior", index, campo, valor)
							}
						/>
					</div>

					<div className="alim-modal-actions">
						<button
							type="button"
							className="alim-modal-btn alim-modal-btn-cancelar"
							onClick={onCerrar}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="alim-modal-btn alim-modal-btn-aceptar"
						>
							Guardar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ModalMapeoMediciones;
export { crearMapeoVacio };

{/*---------------------------------------------------------------------------
 NOTA PERSONAL SOBRE ESTE ARCHIVO (ModalMapeoMediciones.jsx)

 - Este modal permite configurar "qué" se muestra en cada lado de la tarjeta de
   un alimentador y "de dónde" salen esos valores (registro Modbus, origen,
   fórmula, etc.).

 - `crearMapeoVacio` genera una estructura completa de mapeo con todas las
   secciones clásicas + un `cardDesign` por defecto. Se usa tanto para iniciar
   un mapeo nuevo como para rellenar huecos de uno viejo.

 - Cuando se abre el modal, el efecto mezcla `initialMapeo` (si existe) con el
   esqueleto vacío para asegurar que siempre haya campos coherentes, incluso si
   el formato evolucionó.

 - Las funciones `actualizarCantidadBoxes`, `actualizarTituloSeleccionado`,
   `actualizarTituloCustom` y `actualizarCardDesignCaja` se encargan de modificar
   solo la parte correspondiente del `cardDesign` sin romper el resto.

 - Al guardar, se devuelve el objeto `mapeo` completo al padre, que luego lo
   persiste dentro del alimentador para usarlo al calcular las lecturas de la
   tarjeta.
---------------------------------------------------------------------------*/}

/*---------------------------------------------------------------------------
CÓDIGO + EXPLICACIÓN DE CADA PARTE (ModalMapeoMediciones.jsx)

0) Visión general del componente

   `ModalMapeoMediciones` es el modal donde se define el “diseño lógico” de una
   tarjeta de alimentador:

   - Qué título tiene cada lado (superior / inferior).

   - Cuántos boxes se muestran en cada lado (1 a 4).
	
   - Para cada box:
       • si está habilitado,
       • qué etiqueta muestra,
       • qué registro alimenta el valor,
       • de qué origen viene (relé / analizador),
       • qué fórmula se aplica (si aplica).

   El resultado es un objeto `mapeo` que el contexto guarda dentro del
   alimentador y que luego se usa para calcular `lecturasTarjetas`.


1) Constante SECCIONES_MAPEO: compatibilidad con mapeos “clásicos”

   const SECCIONES_MAPEO = [ ... ];

   - Representa secciones antiguas / tradicionales de mapeo:
       • tensiones, corrientes, potencias, factor de potencia, frecuencia, etc.

   - Hoy la UI trabaja principalmente con `cardDesign`, pero estas secciones se
     mantienen para:
       • no romper mapeos ya guardados en versiones anteriores,
       • tener un andamiaje si más adelante se quiere usar una vista avanzada de
         mapeo por secciones.

   - Cada sección tiene:
       • `id`: clave interna,
       • `titulo`: descripción legible,
       • `items`: subcampos (L1, L2, Total, etc.) que pueden mapearse.


2) Helpers de diseño base: crearSideDesignDefault / crearCardDesignDefault

   2.1) crearSideDesignDefault(tituloIdPorDefecto)

   - Construye un “molde” para un lado de la tarjeta (sup/inf) con:

       • `tituloId`: identifica qué magnitud representa
         (corriente_132, tension_linea, etc.).
       • `tituloCustom`: texto libre para el caso “custom”.
       • `cantidad`: cuántos boxes mostrar por defecto (3).
       • `boxes`: array de 4 posiciones posibles, todas deshabilitadas.

   - La idea es tener siempre una estructura conocida, aunque el usuario no
     haya configurado nada todavía.

   2.2) crearCardDesignDefault()

   - Devuelve un “cardDesign” inicial:

       • `superior`: configurado con “corriente_132”
         (equivalente a un “CONSUMO (A)”).
       • `inferior`: configurado con “tension_linea”
         (equivalente a una “TENSIÓN (kV)”).

   - Es lo que se usa si nunca hubo mapeo guardado para ese alimentador.


3) crearMapeoVacio: esqueleto completo de mapeo

   function crearMapeoVacio() { ... }

   - Crea un objeto con dos partes:

       1) Secciones clásicas (SECCIONES_MAPEO):
            • para cada sección (corriente, tensión, etc.),
            • para cada item (L1, L2, Total, etc.),
            • crea una celda:
                { enabled: false, registro: "", formula: "", origen: "" }

       2) `cardDesign`:
            • usando `crearCardDesignDefault()`.

   - Este objeto se usa:
       • como estado inicial,
       • y como “base” sobre la que se mezclan mapeos antiguos guardados.


4) Estado y efecto principal al abrir el modal

   const [mapeo, setMapeo] = useState(crearMapeoVacio);

   - `mapeo` representa la configuración completa de mapeo que se está
     editando en el modal.

   useEffect(() => { ... }, [abierto, initialMapeo]);

   - Se dispara cuando:
       • el modal se abre (`abierto` pasa a true),
       • o cambia `initialMapeo` (nuevo alimentador o recarga).

   Pasos dentro del efecto:

   4.1) Si el modal no está abierto → no hace nada.

   4.2) Crea `base = crearMapeoVacio()`:
        • esqueleto con todas las secciones + cardDesign por defecto.

   4.3) Si NO hay `initialMapeo`:
        • simplemente usa la base (es un mapeo nuevo).

   4.4) Si hay `initialMapeo`:
        a) Clona `base` en `combinado`.
        b) Recorre todas las secciones e items:
           - toma lo guardado en `initialMapeo[sec.id][item]` si existe,
           - lo mezcla sobre la celda de base,
           - asegura `origen: guardado.origen || "rele"` (default: relé).
        c) Si existe `initialMapeo.cardDesign`:
           - combina lado por lado (`superior` / `inferior`) con `mergeSide`:
               • mezcla cajas por índice,
               • conserva defaults,
               • asegura `origen` y `cantidad` válidos (1..4),
               • decide `tituloId` / `tituloCustom`.
           - si no existiera, se queda con `base.cardDesign`.

        d) Finalmente hace `setMapeo(combinado)`.

   - Resultado:
       • siempre se trabaja con un `mapeo` que tiene todas las llaves necesarias,
       • aunque el formato haya evolucionado entre versiones.


5) Helpers de actualización del cardDesign

   5.1) asegurarCardDesign(prev)

   - Recibe un estado previo y garantiza que:

       • exista `prev.cardDesign`,
       • exista `cardDesign.superior`,
       • exista `cardDesign.inferior`.

   - Si algo falta, lo rellena con los defaults apropiados.

   - Se usa en todos los setters para no tener que validar nulls cada vez.

   5.2) actualizarCantidadBoxes(zona, nuevaCant)

   - `zona` es "superior" o "inferior".
   - `nuevaCant` es lo que el usuario eligió en el formulario.

   - Normaliza `nuevaCant` a un rango seguro [1, 4] y actualiza solo
     `cardDesign[zona].cantidad`, sin tocar el resto del estado.

   5.3) actualizarTituloSeleccionado(zona, tituloId)

   - Cambia `cardDesign[zona].tituloId` al valor elegido en un select
     (por ejemplo, corriente_132, tension_linea, etc.).

   5.4) actualizarTituloCustom(zona, texto)

   - Se usa cuando el usuario selecciona un título “custom” y escribe texto
     libre.

   - Fuerza:
       • `tituloId: "custom"`,
       • `tituloCustom: texto`.

   5.5) actualizarCardDesignCaja(zona, index, campo, valor)

   - Modifica un campo puntual de una de las cajas del lado indicado:

       • `zona`: "superior" / "inferior".
       • `index`: índice de la caja (0 a 3).
       • `campo`: nombre de la propiedad a cambiar (enabled, label, registro,
         origen, formula).
       • `valor`: nuevo valor.

   - Asegura siempre tener al menos 4 posiciones en `boxes` (rellena con
     objetos por defecto si falta alguna).

   - Luego:
       • clona `boxes`,
       • modifica `boxes[index][campo]`,
       • vuelve a guardar el array dentro de `cardDesign[zona]`.

   - De este modo se evita mutar directamente el estado y se conserva
     inmutabilidad.


6) handleSubmit y guardado

   const handleSubmit = (e) => {
     e.preventDefault();
     onGuardar(mapeo);
   };

   - Evita el submit tradicional del `<form>`.

   - Entrega al padre el `mapeo` completo tal como quedó en el estado.

   - El padre (VistaAlimentadores) lo usa para actualizar el alimentador:

       • `actualizarAlimentador(..., { mapeoMediciones: mapeo })`.


7) Estructura JSX del modal

   - El componente solo se dibuja si `abierto` es true.

   - Usa:
       • `<div className="alim-modal-overlay">` como overlay,
       • `<div className="map-modal">` como contenedor del contenido.

   - Dentro del `<form>`:

       7.1) Encabezado:
           • título “Mapeo de mediciones – {nombreAlimentador}”.

       7.2) Bloque de diseño de tarjeta (`map-design`):
           • texto de ayuda explicando el propósito,
           • dos `FormularioDiseñoTarjeta`:
               - uno para la parte superior,
               - otro para la parte inferior.

           • A cada subformulario se le pasan:
               - `design={cardDesign.superior/inferior}`,
               - callbacks para título, título custom, cantidad y cada box,
               - placeholders para títulos por defecto.

       7.3) Acciones:
           • botón “Cancelar” → llama a `onCerrar` (no guarda cambios),
           • botón “Guardar” → submit del formulario → `handleSubmit` →
             `onGuardar(mapeo)`.


8) Export

   export default ModalMapeoMediciones;
   export { crearMapeoVacio };

   - `ModalMapeoMediciones`: se usa en `VistaAlimentadores` como uno de los
     modales principales.

   - `crearMapeoVacio` se exporta también para:
       • reutilizar la misma estructura base desde otros módulos,
       • tests, inicialización externa, etc.

---------------------------------------------------------------------------*/