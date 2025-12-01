// src/lib/Alimentadores/AlimentadorCard.jsx
import React from "react";
import "./AlimentadorCard.css";
import configIcon from "../../assets/imagenes/Config_Icon.png";
import mapIcon from "../../assets/imagenes/Mapeo_icon.png";

const AlimentadorCard = ({
   nombre,
   color,
   onConfigClick,
   onMapClick,
   consumo,
   tensionLinea,
   draggable = false,
   isDragging = false,
   onDragStart,
   onDragOver,
   onDrop,
   onDragEnd,
}) => {
   // Valores por defecto cuando todavía no hay lecturas
   const defaultDisplay = { R: "--,--", S: "--,--", T: "--,--" };

   // Si el padre aún no pasó lecturas, usamos los defaults
   const consumoSafe = consumo || defaultDisplay;
   const tensionSafe = tensionLinea || defaultDisplay;

   return (
      <div
         className={"alim-card" + (isDragging ? " alim-card-dragging" : "")}
         style={{ cursor: draggable ? "grab" : "default" }}
         draggable={draggable}
         onDragStart={onDragStart}
         onDragOver={onDragOver}
         onDrop={onDrop}
         onDragEnd={onDragEnd}
      >
         <div
            className="alim-card-header"
            style={{ backgroundColor: color || "#0ea5e9" }}
         >
            {/* Iconos de configuración y mapeo */}
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

         <div className="alim-card-body">
            {/* ===== CONSUMO (A) ===== */}
            <div className="alim-card-section">
               <h3 className="alim-card-section-title">CONSUMO (A)</h3>
               <div className="alim-card-meters">
                  {["R", "S", "T"].map((fase) => (
                     <div key={fase} className="alim-card-meter">
                        <span className="alim-card-meter-phase">{fase}</span>
                        <span className="alim-card-meter-value">
                           {consumoSafe[fase] ?? "--,--"}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* ===== TENSIÓN (kV) ===== */}
            <div className="alim-card-section">
               <h3 className="alim-card-section-title">TENSIÓN (kV)</h3>
               <div className="alim-card-meters">
                  {["R", "S", "T"].map((fase) => (
                     <div key={fase} className="alim-card-meter">
                        <span className="alim-card-meter-phase">{fase}</span>
                        <span className="alim-card-meter-value">
                           {tensionSafe[fase] ?? "--,--"}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AlimentadorCard;
