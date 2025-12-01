// src/lib/Alimentadores/NuevoAlimentadorModal.jsx
import React, { useEffect, useState } from "react";
import "./NuevoAlimentadorModal.css";

const COLORES_ALIM = [
   "#22c55e",
   "#0ea5e9",
   "#3b82f6",
   "#a855f7",
   "#ec4899",
   "#f97316",
   "#ef4444",
   "#eab308",
   "#14b8a6",
   "#10b981",
   "#6366f1",
   "#64748b",
];

// 🔁 toggle entre modo real y simulado
const USE_MODBUS_REAL = true; // ⇐ cambiá a true para usar el server real

const NuevoAlimentadorModal = ({
   abierto,
   puestoNombre,
   modo = "crear",
   initialData,
   onCancelar,
   onConfirmar,
   onEliminar,
   // nuevo: estado/control de medición proviene del padre
   isMeasuring = false,
   onToggleMedicion,
}) => {
   const [nombre, setNombre] = useState("");
   const [color, setColor] = useState(COLORES_ALIM[0]);
   const [tab, setTab] = useState("rele");

   // Config RELÉ
   const [rele, setRele] = useState({
      ip: "",
      puerto: "",
      indiceInicial: "",
      cantRegistros: "",
   });

   // Periodo de actualización (s)
   const [periodoSegundos, setPeriodoSegundos] = useState("60");

   // Config ANALIZADOR
   const [analizador, setAnalizador] = useState({
      ip: "",
      puerto: "502",
      indiceInicial: "",
      cantRegistros: "",
      relacionTI: "",
   });

   // Estado del test de conexión (solo informativo)
   const [isTesting, setIsTesting] = useState(false);
   const [testError, setTestError] = useState("");
   const [testRows, setTestRows] = useState([]); // [{index, address, value}]

   // === Cargar datos al abrir ===
   useEffect(() => {
      if (!abierto) return;

      if (initialData) {
         setNombre(initialData.nombre || "");
         setColor(initialData.color || COLORES_ALIM[0]);
         setTab("rele");

         setRele({
            ip: initialData.rele?.ip || "",
            puerto:
               initialData.rele?.puerto != null
                  ? String(initialData.rele.puerto)
                  : "",
            indiceInicial:
               initialData.rele?.indiceInicial != null
                  ? String(initialData.rele.indiceInicial)
                  : "",
            cantRegistros:
               initialData.rele?.cantRegistros != null
                  ? String(initialData.rele.cantRegistros)
                  : "",
         });

         setPeriodoSegundos(
            initialData.periodoSegundos != null
               ? String(initialData.periodoSegundos)
               : "60"
         );

         setAnalizador({
            ip: initialData.analizador?.ip || "",
            puerto:
               initialData.analizador?.puerto != null
                  ? String(initialData.analizador.puerto)
                  : "502",
            indiceInicial:
               initialData.analizador?.indiceInicial != null
                  ? String(initialData.analizador.indiceInicial)
                  : "",
            cantRegistros:
               initialData.analizador?.cantRegistros != null
                  ? String(initialData.analizador.cantRegistros)
                  : "",
            relacionTI:
               initialData.analizador?.relacionTI != null
                  ? String(initialData.analizador.relacionTI)
                  : "",
         });
      } else {
         // Nuevo alimentador
         setNombre("");
         setColor(COLORES_ALIM[0]);
         setTab("rele");
         setRele({
            ip: "",
            puerto: "",
            indiceInicial: "",
            cantRegistros: "",
         });
         setPeriodoSegundos("60");
         setAnalizador({
            ip: "",
            puerto: "502",
            indiceInicial: "",
            cantRegistros: "",
            relacionTI: "",
         });
      }

      // reset de estado del test (la medición periódica la maneja el padre)
      setIsTesting(false);
      setTestError("");
      setTestRows([]);
   }, [abierto, initialData]);

   // si el modal no está abierto, no renderizamos nada
   if (!abierto) return null;

   // función auxiliar para leer registros desde backend o simulado
   async function leerRegistrosBackend({
      ip,
      puerto,
      indiceInicial,
      cantRegistros,
   }) {
      const start = Number(indiceInicial);
      const len = Number(cantRegistros);

      if (!USE_MODBUS_REAL) {
         // 🧪 MODO SIMULADO: mismos datos que antes
         return Array.from({ length: len }, (_, i) => ({
            index: i,
            address: start + i,
            value: Math.floor(Math.random() * 501),
         }));
      }

      // 🌐 MODO REAL: llamamos al servidor Express+Modbus
      const resp = await fetch("http://localhost:5000/api/modbus/test", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            ip,
            puerto,
            indiceInicial: start,
            cantRegistros: len,
         }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
         throw new Error(data.error || "Error en lectura Modbus");
      }

      // data.registros es un array de UInt16
      return data.registros.map((v, i) => ({
         index: i,
         address: start + i,
         value: v,
      }));
   }

   // === TEST CONEXIÓN (simulado / o backend real) ===
   const handleTestConexion = async () => {
      const ip = rele.ip.trim();
      const puerto = Number(rele.puerto);
      const inicio = Number(rele.indiceInicial);
      const cantidad = Number(rele.cantRegistros);

      if (!ip || !puerto || isNaN(inicio) || isNaN(cantidad) || cantidad <= 0) {
         setTestError(
            "Completa IP, puerto, índice inicial y cantidad de registros antes de probar."
         );
         setTestRows([]);
         return;
      }

      setIsTesting(true);
      setTestError("");
      setTestRows([]);

      try {
         const registros = await leerRegistrosBackend({
            ip,
            puerto,
            indiceInicial: inicio,
            cantRegistros: cantidad,
         });

         setTestRows(registros);
      } catch (err) {
         console.error(err);
         setTestError(
            err?.message || "Error de red o al intentar leer los registros."
         );
         setTestRows([]);
      } finally {
         setIsTesting(false);
      }
   };

   // === SUBMIT GENERAL ===
   const handleSubmit = (e) => {
      e.preventDefault();
      const limpioNombre = nombre.trim();
      if (!limpioNombre) return;

      const datos = {
         nombre: limpioNombre,
         color,
         periodoSegundos: periodoSegundos ? Number(periodoSegundos) : null,

         rele: {
            ...rele,
            puerto: rele.puerto ? Number(rele.puerto) : null,
            indiceInicial: rele.indiceInicial
               ? Number(rele.indiceInicial)
               : null,
            cantRegistros: rele.cantRegistros
               ? Number(rele.cantRegistros)
               : null,
         },

         analizador: {
            ...analizador,
            puerto: analizador.puerto ? Number(analizador.puerto) : null,
            indiceInicial: analizador.indiceInicial
               ? Number(analizador.indiceInicial)
               : null,
            cantRegistros: analizador.cantRegistros
               ? Number(analizador.cantRegistros)
               : null,
            relacionTI: analizador.relacionTI
               ? Number(analizador.relacionTI)
               : null,
         },
      };

      onConfirmar(datos);
   };

   const handleEliminarClick = () => {
      if (!onEliminar) return;
      const seguro = window.confirm(
         "¿Seguro que querés eliminar este registrador?"
      );
      if (seguro) {
         onEliminar();
      }
   };

   return (
      <div className="alim-modal-overlay">
         <div className="alim-modal">
            <h2>
               {modo === "editar"
                  ? "EDITAR REGISTRADOR: EN "
                  : "NUEVO REGISTRADOR: EN "}
               {puestoNombre}
            </h2>

            <form onSubmit={handleSubmit}>
               <div className="alim-modal-layout">
                  {/* === COLUMNA IZQUIERDA: CONFIG BÁSICA === */}
                  <div className="alim-modal-left">
                     {/* Nombre */}
                     <label className="alim-modal-label">
                        Nombre
                        <input
                           type="text"
                           className="alim-modal-input"
                           value={nombre}
                           onChange={(e) => setNombre(e.target.value)}
                           placeholder="Ej: ALIMENTADOR 1"
                           autoFocus
                        />
                     </label>

                     {/* Paleta de colores */}
                     <div className="alim-color-picker">
                        <div className="alim-color-grid">
                           {COLORES_ALIM.map((c) => (
                              <button
                                 key={c}
                                 type="button"
                                 className={
                                    "alim-color-swatch" +
                                    (color === c
                                       ? " alim-color-swatch-selected"
                                       : "")
                                 }
                                 style={{ backgroundColor: c }}
                                 onClick={() => setColor(c)}
                              />
                           ))}
                        </div>
                     </div>

                     {/* Tabs RELÉ / ANALIZADOR */}
                     <div className="alim-tabs">
                        <button
                           type="button"
                           className={
                              "alim-tab" +
                              (tab === "rele" ? " alim-tab-active" : "")
                           }
                           onClick={() => setTab("rele")}
                        >
                           RELÉ
                        </button>
                        <button
                           type="button"
                           className={
                              "alim-tab" +
                              (tab === "analizador" ? " alim-tab-active" : "")
                           }
                           onClick={() => setTab("analizador")}
                        >
                           ANALIZADOR
                        </button>
                     </div>

                     {/* === TAB RELÉ === */}
                     {tab === "rele" && (
                        <div className="alim-modal-grid">
                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Dirección IP
                              </span>
                              <input
                                 type="text"
                                 className="alim-field-input"
                                 value={rele.ip}
                                 onChange={(e) =>
                                    setRele({ ...rele, ip: e.target.value })
                                 }
                                 placeholder="Ej: 172.16.0.1"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">Puerto</span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={rele.puerto}
                                 onChange={(e) =>
                                    setRele({ ...rele, puerto: e.target.value })
                                 }
                                 placeholder="Ej: 502"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Índice inicial
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={rele.indiceInicial}
                                 onChange={(e) =>
                                    setRele({
                                       ...rele,
                                       indiceInicial: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 137"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Cant. registros
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={rele.cantRegistros}
                                 onChange={(e) =>
                                    setRele({
                                       ...rele,
                                       cantRegistros: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 20"
                              />
                           </label>

                           {/* Periodo actualización */}
                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Periodo actualización (s)
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={periodoSegundos}
                                 onChange={(e) =>
                                    setPeriodoSegundos(e.target.value)
                                 }
                                 placeholder="Ej: 60"
                                 min={1}
                              />
                           </label>

                           {periodoSegundos &&
                              Number(periodoSegundos) > 0 &&
                              Number(periodoSegundos) < 60 && (
                                 <p className="alim-warning">
                                    ⚠️ Periodos menores a 60&nbsp;s pueden
                                    recargar el sistema y la red de
                                    comunicaciones.
                                 </p>
                              )}
                        </div>
                     )}

                     {/* === TAB ANALIZADOR === */}
                     {tab === "analizador" && (
                        <div className="alim-modal-grid">
                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Dirección IP
                              </span>
                              <input
                                 type="text"
                                 className="alim-field-input"
                                 value={analizador.ip}
                                 onChange={(e) =>
                                    setAnalizador({
                                       ...analizador,
                                       ip: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 172.16.0.5"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">Puerto</span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={analizador.puerto}
                                 onChange={(e) =>
                                    setAnalizador({
                                       ...analizador,
                                       puerto: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 502"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Índice inicial
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={analizador.indiceInicial}
                                 onChange={(e) =>
                                    setAnalizador({
                                       ...analizador,
                                       indiceInicial: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 200"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Cant. registros
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={analizador.cantRegistros}
                                 onChange={(e) =>
                                    setAnalizador({
                                       ...analizador,
                                       cantRegistros: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 10"
                              />
                           </label>

                           <label className="alim-field">
                              <span className="alim-field-label">
                                 Relación T.I
                              </span>
                              <input
                                 type="number"
                                 className="alim-field-input"
                                 value={analizador.relacionTI}
                                 onChange={(e) =>
                                    setAnalizador({
                                       ...analizador,
                                       relacionTI: e.target.value,
                                    })
                                 }
                                 placeholder="Ej: 250"
                              />
                           </label>
                        </div>
                     )}

                     {/* Botones Test conexión + Iniciar/Detener medición */}
                     <div className="alim-test-row">
                        <button
                           type="button"
                           className="alim-test-btn"
                           onClick={handleTestConexion}
                           disabled={isTesting}
                        >
                           {isTesting ? "Probando..." : "Test conexión"}
                        </button>

                        <button
                           type="button"
                           className={
                              "alim-test-btn" +
                              (isMeasuring
                                 ? " alim-test-btn-stop"
                                 : " alim-test-btn-secondary")
                           }
                           onClick={() =>
                              onToggleMedicion && onToggleMedicion()
                           }
                           disabled={isTesting || !onToggleMedicion}
                        >
                           {isMeasuring
                              ? "Detener medición"
                              : "Iniciar medición"}
                        </button>
                     </div>

                     {/* Resultado test / tabla registros */}
                     {testError && (
                        <div className="alim-test-message alim-test-error">
                           {testError}
                        </div>
                     )}

                     {!testError && testRows.length > 0 && (
                        <div className="alim-test-table">
                           <div className="alim-test-message alim-test-ok">
                              Test correcto. Registros leídos: {testRows.length}
                           </div>

                           <table>
                              <thead>
                                 <tr>
                                    <th>#</th>
                                    <th>Dirección</th>
                                    <th>Valor</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {testRows.map((r) => (
                                    <tr key={r.index}>
                                       <td>{r.index}</td>
                                       <td>{r.address}</td>
                                       <td>{r.value}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>

               {/* Botones inferiores */}
               <div className="alim-modal-actions">
                  {modo === "editar" && (
                     <button
                        type="button"
                        className="alim-modal-btn alim-modal-btn-eliminar"
                        onClick={handleEliminarClick}
                     >
                        Eliminar
                     </button>
                  )}

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
                     Aceptar
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default NuevoAlimentadorModal;
