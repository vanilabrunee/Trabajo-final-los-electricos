import React from "react";
import "./Alimentadores.css";
import configIcon from "../../assets/imagenes/Config_Icon.png"; // 

const AlimentadorCard = ({ nombre, color, onConfigClick }) => {
   return (
      <div className="alim-card">
         <div
            className="alim-card-header"
            style={{ backgroundColor: color || "#0ea5e9" }}
         >
            {/* botón de configuración a la IZQUIERDA */}
            <button
               type="button"
               className="alim-card-config-btn"
               onClick={onConfigClick}
               title="Configurar alimentador"
            >
               <img
                  src={configIcon}
                  alt="Configurar"
                  className="alim-card-config-icon"
               />
            </button>

            {/* título centrado */}
            <span className="alim-card-title">{nombre}</span>
         </div>

         <div className="alim-card-body">
            <div className="alim-card-section">
               <h3 className="alim-card-section-title">CONSUMO (A)</h3>
               <div className="alim-card-meters">
                  {["R", "S", "T"].map((fase) => (
                     <div key={fase} className="alim-card-meter">
                        <span className="alim-card-meter-phase">{fase}</span>
                        <span className="alim-card-meter-value">34,21</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="alim-card-section">
               <h3 className="alim-card-section-title">TENSIÓN (kV)</h3>
               <div className="alim-card-meters">
                  {["R", "S", "T"].map((fase) => (
                     <div key={fase} className="alim-card-meter">
                        <span className="alim-card-meter-phase">{fase}</span>
                        <span className="alim-card-meter-value">21,23</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AlimentadorCard;
