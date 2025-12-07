import React from "react";
import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RecuperarContraseña.css";

const RecuperarContrasena = () => {
    const [email, setEmail] = useState("");
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

const navigate = useNavigate();

const mostrarAlerta = (mensaje, tipo = "exito") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 5000);                        
};

const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
    mostrarAlerta("Por favor escribí tu email", "error");
    return;
    }
    if (!email.includes("@") || !email.includes(".")) {
    mostrarAlerta("El email no parece válido", "error");
    return;
    }
    mostrarAlerta(`Listo! Te enviamos un enlace a ${email}`, "exito");
    setTimeout(() => {
    navigate("/");
    }, 3000);
};
return (
    <div className="recuperar-fondo">
    <div className="recuperar-caja">
        <button className="btn-volver" onClick={() => navigate("/")}>
            ←
        </button>

        <img
            src="/src/assets/imagenes/logo 2 rw.png"
            alt="Logo"
            className="logo-recuperar"
        />

        <h2>Recuperar contraseña</h2>
        <p className="texto-ayuda">
            Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña
        </p>

        <form onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-recuperar"
        />

        <button type="submit" className="btn-enviar">
            Enviar enlace
        </button>
        </form>

        <Link to="/" className="link-volver-login">
            ← Volver al inicio de sesión
        </Link>

        {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>
            {alerta.mensaje}
        </div>
        )}
    </div>
    </div>
);
};

export default RecuperarContrasena;