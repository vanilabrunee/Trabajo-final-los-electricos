// src/lib/Alimentadores/MapeoMedicionesModal.jsx
import React, { useEffect, useState } from "react";
import "./MapeoMedicionesModal.css";

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

// Ahora cada item tiene también `origen` ("rele" | "analizador")
function crearMapeoVacio() {
   const base = {};
   SECCIONES_MAPEO.forEach((sec) => {
      base[sec.id] = {};
      sec.items.forEach((item) => {
         base[sec.id][item] = {
            enabled: false,
            registro: "",
            formula: "",
            origen: "rele", // valor por defecto
         };
      });
   });
   return base;
}

const MapeoMedicionesModal = ({
   abierto,
   nombreAlimentador,
   initialMapeo,
   onCancelar,
   onGuardar,
}) => {
   const [mapeo, setMapeo] = useState(crearMapeoVacio);

   useEffect(() => {
      if (!abierto) return;

      const base = crearMapeoVacio();

      if (!initialMapeo) {
         setMapeo(base);
         return;
      }

      // Mezcla mapeo guardado con el esqueleto vacío
      const combinado = { ...base };
      SECCIONES_MAPEO.forEach((sec) => {
         sec.items.forEach((item) => {
            const guardado = initialMapeo[sec.id]?.[item] || {};
            combinado[sec.id][item] = {
               ...base[sec.id][item],
               ...guardado,
               // si el mapeo viejo no tenía origen, lo dejamos en "rele"
               origen: guardado.origen || "rele",
            };
         });
      });
      setMapeo(combinado);
   }, [abierto, initialMapeo]);

   if (!abierto) return null;

   const actualizarMapeo = (secId, itemId, campo, valor) => {
      setMapeo((prev) => ({
         ...prev,
         [secId]: {
            ...prev[secId],
            [itemId]: {
               ...prev[secId][itemId],
               [campo]: valor,
            },
         },
      }));
   };

   const toggleItemMapeo = (secId, itemId, enabled) => {
      actualizarMapeo(secId, itemId, "enabled", enabled);
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onGuardar(mapeo);
   };

   return (
      <div className="alim-modal-overlay">
         <div className="alim-map-modal">
            <h2>Mapeo de mediciones – {nombreAlimentador}</h2>

            <form onSubmit={handleSubmit} className="alim-map-modal-form">
               <div className="alim-map-modal-body">
                  {SECCIONES_MAPEO.map((sec) => (
                     <div key={sec.id} className="alim-map-section">
                        <h4 className="alim-map-section-title">
                           {sec.titulo}
                        </h4>

                        {sec.items.map((itemId) => {
                           const cfg = mapeo[sec.id][itemId];
                           return (
                              <div key={itemId} className="alim-map-row">
                                 <label className="alim-map-check">
                                    <input
                                       type="checkbox"
                                       checked={cfg.enabled}
                                       onChange={(e) =>
                                          toggleItemMapeo(
                                             sec.id,
                                             itemId,
                                             e.target.checked
                                          )
                                       }
                                    />
                                    <span>{itemId}</span>
                                 </label>

                                 {/* Registro */}
                                 <input
                                    type="number"
                                    className="alim-map-input"
                                    placeholder="Registro"
                                    disabled={!cfg.enabled}
                                    value={cfg.registro}
                                    onChange={(e) =>
                                       actualizarMapeo(
                                          sec.id,
                                          itemId,
                                          "registro",
                                          e.target.value
                                       )
                                    }
                                 />

                                 {/* Origen: Relé / Analizador */}
                                 <select
                                    className="alim-map-input alim-map-origen"
                                    disabled={!cfg.enabled}
                                    value={cfg.origen || "rele"}
                                    onChange={(e) =>
                                       actualizarMapeo(
                                          sec.id,
                                          itemId,
                                          "origen",
                                          e.target.value
                                       )
                                    }
                                 >
                                    <option value="rele">Relé</option>
                                    <option value="analizador">
                                       Analizador
                                    </option>
                                 </select>

                                 {/* Fórmula */}
                                 <input
                                    type="text"
                                    className="alim-map-input alim-map-formula"
                                    placeholder="Fórmula (ej: x * 500 / 1000)"
                                    disabled={!cfg.enabled}
                                    value={cfg.formula}
                                    onChange={(e) =>
                                       actualizarMapeo(
                                          sec.id,
                                          itemId,
                                          "formula",
                                          e.target.value
                                       )
                                    }
                                 />
                              </div>
                           );
                        })}
                     </div>
                  ))}
               </div>

               <div className="alim-modal-actions">
                  <button
                     type="button"
                     className="alim-modal-btn alim-modal-btn-cancelar"
                     onClick={onCancelar}
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

export default MapeoMedicionesModal;
export { crearMapeoVacio };
