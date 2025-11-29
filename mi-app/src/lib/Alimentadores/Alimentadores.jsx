// src/lib/Alimentadores/Alimentadores.jsx
import React, { useState } from "react";
import "./Alimentadores.css";
import AlimentadorCard from "./AlimentadorCard.jsx";

const Alimentadores = () => {
   const COLORES_PUESTO = [
      "#22c55e", // verde
      "#0ea5e9", // celeste
      "#3b82f6", // azul
      "#a855f7", // violeta
      "#ec4899", // rosa
      "#f97316", // naranja
      "#ef4444", // rojo
      "#eab308", // amarillo
      "#14b8a6", // turquesa
      "#10b981", // verde menta
      "#6366f1", // índigo
      "#64748b", // gris azulado
   ];

   const [colorPuesto, setColorPuesto] = useState(COLORES_PUESTO[0]);

   // ===== PUESTOS (barra superior) =====
   const [puestos, setPuestos] = useState([]);

   const [puestoSeleccionadoId, setPuestoSeleccionadoId] = useState(null);

   const [mostrarModalNuevoPuesto, setMostrarModalNuevoPuesto] =
      useState(false);

   const [mostrarModalEditarPuestos, setMostrarModalEditarPuestos] =
      useState(false);

   const [nuevoNombrePuesto, setNuevoNombrePuesto] = useState("");

   const [puestosEditados, setPuestosEditados] = useState([]);

   // ===== TARJETAS DE ALIMENTADORES (asociadas al puesto seleccionado) =====
   const [mostrarModalNuevoAlim, setMostrarModalNuevoAlim] = useState(false);

   const [nuevoNombreAlim, setNuevoNombreAlim] = useState("");

   // Puesto actualmente activo (si el id no existe, toma el primero)
   const puestoSeleccionado =
      puestos.find((p) => p.id === puestoSeleccionadoId) || puestos[0] || null;

   // ---------- AGREGAR PUESTO ----------
   const abrirModalNuevoPuesto = () => {
      setNuevoNombrePuesto("");
      setMostrarModalNuevoPuesto(true);
   };

   const cerrarModalNuevoPuesto = () => {
      setMostrarModalNuevoPuesto(false);
      setNuevoNombrePuesto("");
      setColorPuesto(COLORES_PUESTO[0]); // 👈 vuelve al color por defecto
   };

   const handleCrearPuesto = (e) => {
      e.preventDefault();
      const nombre = nuevoNombrePuesto.trim();
      if (!nombre) return;

      const nuevoPuesto = {
         id: Date.now(),
         nombre,
         color: colorPuesto,
         alimentadores: [], // 👈 importantísimo
      };

      setPuestos((prev) => [...prev, nuevoPuesto]);
      setPuestoSeleccionadoId(nuevoPuesto.id); // seleccionamos el nuevo
      cerrarModalNuevoPuesto();
   };

   // ---------- EDITAR / ELIMINAR PUESTOS ----------
   const abrirModalEditarPuestos = () => {
      // copiamos manteniendo sus alimentadores
      setPuestosEditados(puestos.map((p) => ({ ...p })));
      setMostrarModalEditarPuestos(true);
   };

   const cerrarModalEditarPuestos = () => {
      setMostrarModalEditarPuestos(false);
      setPuestosEditados([]);
   };

   const cambiarNombreEditado = (id, nombreNuevo) => {
      setPuestosEditados((prev) =>
         prev.map((p) => (p.id === id ? { ...p, nombre: nombreNuevo } : p))
      );
   };

   const eliminarEditado = (id) => {
      setPuestosEditados((prev) => prev.filter((p) => p.id !== id));
   };

   const guardarCambiosPuestos = () => {
      const sinVacios = puestosEditados.filter((p) => p.nombre.trim() !== "");
      setPuestos(sinVacios);
      setMostrarModalEditarPuestos(false);
      setPuestosEditados([]);

      // si el puesto seleccionado fue eliminado, dejamos seleccionado el primero
      if (!sinVacios.some((p) => p.id === puestoSeleccionadoId)) {
         setPuestoSeleccionadoId(sinVacios[0]?.id ?? null);
      }
   };

   // ---------- AGREGAR TARJETA DE ALIMENTADOR (AL PUESTO SELECCIONADO) ----------
   const abrirModalNuevoAlim = () => {
      setNuevoNombreAlim("");
      setMostrarModalNuevoAlim(true);
   };

   const cerrarModalNuevoAlim = () => {
      setMostrarModalNuevoAlim(false);
      setNuevoNombreAlim("");
   };

   const handleCrearAlimentador = (e) => {
      e.preventDefault();
      const nombre = nuevoNombreAlim.trim();
      if (!nombre || !puestoSeleccionado) return;

      const nuevoAlim = { id: Date.now(), nombre };

      setPuestos((prev) =>
         prev.map((p) =>
            p.id === puestoSeleccionado.id
               ? {
                    ...p,
                    alimentadores: [...p.alimentadores, nuevoAlim],
                 }
               : p
         )
      );

      cerrarModalNuevoAlim();
   };

   return (
      <div className="alim-page">
         {/* ===== NAV SUPERIOR ===== */}
         <nav className="alim-navbar">
            <div className="alim-navbar-left">
               <h1 className="alim-title">Panel de Alimentadores</h1>

               {puestoSeleccionado && (
                  <div className="alim-current-puesto">
                     {puestoSeleccionado.nombre}
                  </div>
               )}
            </div>

            <div className="alim-nav-buttons">
               {puestos.map((p) => (
                  <button
                     key={p.id}
                     className={
                        "alim-btn" +
                        (puestoSeleccionado && puestoSeleccionado.id === p.id
                           ? " alim-btn-active"
                           : "")
                     }
                     onClick={() => setPuestoSeleccionadoId(p.id)}
                     style={{ backgroundColor: p.color || "#22c55e" }}
                  >
                     {p.nombre}
                  </button>
               ))}

               <button
                  type="button"
                  className="alim-btn alim-btn-add"
                  onClick={abrirModalNuevoPuesto}
               >
                  <span className="alim-btn-add-icon">+</span>
               </button>

               <button
                  type="button"
                  className="alim-btn alim-btn-edit"
                  onClick={abrirModalEditarPuestos}
                  disabled={puestos.length === 0}
               >
                  ✎
               </button>
            </div>
         </nav>

         {/* ===== MAIN ===== */}
         <main className="alim-main">
            {/* Si no hay puestos, mostramos mensaje */}
            {!puestos.length ? (
               <div className="alim-empty">
                  <p>
                     No hay puestos configurados. Crea un <b>puesto</b> con el
                     botón <b>+</b> de la barra superior para empezar a agregar
                     alimentadores.
                  </p>
               </div>
            ) : (
               <>
                  <div className="alim-cards-grid">
                     {/* Cards del puesto seleccionado */}
                     {puestoSeleccionado?.alimentadores.map((a) => (
                        <AlimentadorCard key={a.id} nombre={a.nombre} />
                     ))}

                     {/* Tarjeta con "+" para crear nuevo alimentador en este puesto */}
                     <button
                        type="button"
                        className="alim-card alim-card-add"
                        onClick={abrirModalNuevoAlim}
                     >
                        <span className="alim-card-add-plus">+</span>
                        <span className="alim-card-add-text">
                           Agregar alimentador
                        </span>
                     </button>
                  </div>
               </>
            )}
         </main>

         {/* ===== MODAL NUEVO PUESTO ===== */}
         {mostrarModalNuevoPuesto && (
            <div className="alim-modal-overlay">
               <div className="alim-modal">
                  <h2>Nuevo puesto</h2>
                  <form onSubmit={handleCrearPuesto}>
                     <label className="alim-modal-label">
                        <input
                           type="text"
                           className="alim-modal-input"
                           value={nuevoNombrePuesto}
                           onChange={(e) =>
                              setNuevoNombrePuesto(e.target.value)
                           }
                           placeholder="Ej: PUESTO 1"
                           autoFocus
                        />
                     </label>

                     {/* 👇 NUEVA PALETA DE COLORES */}
                     <div className="alim-color-picker">
                        <div className="alim-color-grid">
                           {COLORES_PUESTO.map((color) => (
                              <button
                                 key={color}
                                 type="button"
                                 className={
                                    "alim-color-swatch" +
                                    (colorPuesto === color
                                       ? " alim-color-swatch-selected"
                                       : "")
                                 }
                                 style={{ backgroundColor: color }}
                                 onClick={() => setColorPuesto(color)}
                              />
                           ))}
                        </div>
                     </div>

                     <div className="alim-modal-actions">
                        <button
                           type="button"
                           className="alim-modal-btn alim-modal-btn-cancelar"
                           onClick={cerrarModalNuevoPuesto}
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
         )}

         {/* ===== MODAL EDITAR PUESTOS ===== */}
         {mostrarModalEditarPuestos && (
            <div className="alim-modal-overlay">
               <div className="alim-modal">
                  <h2>Editar puestos</h2>

                  {puestosEditados.length === 0 ? (
                     <p>No hay puestos para editar.</p>
                  ) : (
                     <div className="alim-edit-list">
                        {puestosEditados.map((p) => (
                           <div key={p.id} className="alim-edit-row">
                              <input
                                 type="text"
                                 className="alim-edit-input"
                                 value={p.nombre}
                                 onChange={(e) =>
                                    cambiarNombreEditado(p.id, e.target.value)
                                 }
                              />
                              <button
                                 type="button"
                                 className="alim-edit-delete"
                                 onClick={() => eliminarEditado(p.id)}
                              >
                                 Eliminar
                              </button>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className="alim-modal-actions">
                     <button
                        type="button"
                        className="alim-modal-btn alim-modal-btn-cancelar"
                        onClick={cerrarModalEditarPuestos}
                     >
                        Cancelar
                     </button>
                     <button
                        type="button"
                        className="alim-modal-btn alim-modal-btn-aceptar"
                        onClick={guardarCambiosPuestos}
                     >
                        Guardar cambios
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ===== MODAL NUEVA TARJETA ALIMENTADOR ===== */}
         {mostrarModalNuevoAlim && puestoSeleccionado && (
            <div className="alim-modal-overlay">
               <div className="alim-modal">
                  <h2>Nuevo alimentador en {puestoSeleccionado.nombre}</h2>
                  <form onSubmit={handleCrearAlimentador}>
                     <label className="alim-modal-label">
                        Nombre del alimentador
                        <input
                           type="text"
                           className="alim-modal-input"
                           value={nuevoNombreAlim}
                           onChange={(e) => setNuevoNombreAlim(e.target.value)}
                           placeholder="Ej: ALIMENTADOR 5"
                           autoFocus
                        />
                     </label>

                     <div className="alim-modal-actions">
                        <button
                           type="button"
                           className="alim-modal-btn alim-modal-btn-cancelar"
                           onClick={cerrarModalNuevoAlim}
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
         )}
      </div>
   );
};

export default Alimentadores;
