// src/paginas/PaginaLogin/PaginaLogin.jsx
import React, { useEffect, useState } from "react";      // React y hooks de estado/efectos
import { Link, useNavigate } from "react-router-dom";    // navegación y links entre rutas
import "./PaginaLogin.css";                              // estilos específicos de la pantalla de login

const PaginaLogin = () => {
   // componente de la pantalla de inicio de sesión
   const [usuariosValidos, setUsuariosValidos] = useState([]);        // lista de usuarios traídos del json-server
   const [usuario, setUsuario] = useState("");                        // texto ingresado en el campo "usuario"
   const [contraseña, setContraseña] = useState("");                  // texto ingresado en el campo "contraseña"
   const [recordarme, setRecordarme] = useState(false);               // flag del checkbox "Recordarme"
   const [error, setError] = useState("");                            // mensaje de error general (fallos al cargar usuarios)
   const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });   // alerta visual para feedback de login

   const navigate = useNavigate();                                    // hook para navegar programáticamente

   // ----------------------------------------------------------------
   // 1) Inicializar usuario/contraseña si hay un "usuarioLogueado"
   //    guardado en localStorage con recordarme=true
   // ----------------------------------------------------------------
   useEffect(() => {
      const stored = localStorage.getItem("usuarioLogueado");     // intento leer el último usuario logueado

      if (stored) {
         const parsed = JSON.parse(stored);                       // parseo JSON guardado

         if (parsed.recordarme) {
            // solo si el usuario eligió "recordarme"
            setUsuario(parsed.usuario || "");                     // precargo usuario
            setContraseña(parsed.contraseña || "");               // precargo contraseña
            setRecordarme(true);                                  // dejo el checkbox tildado
         }
      }
   }, []);

   // ----------------------------------------------------------------
   // 2) Autocompletar contraseña si el usuario ya fue recordado antes
   //    usando la lista "usuariosRecordados" en localStorage
   // ----------------------------------------------------------------
   useEffect(() => {
      if (usuario.trim() === "") {
         // si borran el usuario en el input
         setContraseña("");                                       // limpio también la contraseña
         return;
      }

      const lista = JSON.parse(
         localStorage.getItem("usuariosRecordados") || "[]"
      ); // leo la lista de recordados
      const encontrado = lista.find((u) => u.usuario === usuario); // busco por nombre de usuario

      if (encontrado) {
         setContraseña(encontrado.contraseña);                     // autocompleto la contraseña
         setRecordarme(true);                                      // marco automáticamente el checkbox
      }
   }, [usuario]);

   // ----------------------------------------------------------------
   // 3) Cargar lista de usuarios desde json-server (db.json)
   //    en http://localhost:4000/users
   // ----------------------------------------------------------------
   useEffect(() => {
      fetch("http://localhost:4000/users")                         // petición GET al json-server
         .then((response) => {
            if (!response.ok) throw new Error("Error al cargar usuarios");
            return response.json();                                // convierto la respuesta a JSON
         })
         .then((data) => setUsuariosValidos(data))                 // guardo todos los usuarios en estado
         .catch((err) => {
            console.error(err);
            setError("No se pudieron cargar los usuarios.");       // muestro error si falla la carga
         });
   }, []);                                                         // solo una vez al montar el componente

   // ----------------------------------------------------------------
   // 4) Helper para mostrar una alerta temporal en pantalla
   // ----------------------------------------------------------------
   const mostrarAlerta = (mensaje, tipo = "error") => {
      setAlerta({ mensaje, tipo });                                // seteo el texto y tipo de alerta
      setTimeout(() => {
         // luego de 4 segundos la borro sola
         setAlerta({ mensaje: "", tipo: "" });
      }, 4000);
   };

   // ----------------------------------------------------------------
   // 5) Manejo del submit del formulario de login
   // ----------------------------------------------------------------
   const handleSubmit = (event) => {
      event.preventDefault();                                      // evito recarga completa de la página
      setError("");                                                // limpio errores previos de carga

      const usuarioLimpio = usuario.trim().toLowerCase();          // normalizo el nombre de usuario

      // Buscar al usuario en la lista por el campo "Usuario" (del JSON)
      const usuarioEncontrado = usuariosValidos.find(
         (u) => u.Usuario.toLowerCase() === usuarioLimpio
      );

      if (!usuarioEncontrado) {
         mostrarAlerta("El usuario no existe", "error");           // feedback si el usuario no está registrado
         return;
      }

      // Comparar contraseña (la key del JSON usa "Contraseña")
      if (usuarioEncontrado["Contraseña"] !== contraseña) {
         mostrarAlerta("Contraseña incorrecta", "error");         // feedback si la contraseña no coincide
         return;
      }

      mostrarAlerta(`Bienvenido, ${usuarioEncontrado.Nombre}!`, "exito"); // mensaje de bienvenida

      // ----------------------------------------------------------------
      // 5.1) Gestionar "Recordarme" con la lista usuariosRecordados
      // ----------------------------------------------------------------
      if (recordarme) {
         let listaRecordados = JSON.parse(
            localStorage.getItem("usuariosRecordados") || "[]"
         ); // leo lista previa

         listaRecordados = listaRecordados.filter(
            (u) => u.usuario !== usuarioEncontrado.Usuario
         ); // evito duplicados

         listaRecordados.push({
            usuario: usuarioEncontrado.Usuario,
            contraseña: contraseña, // guardo contraseña en texto plano (solo para este TP)
         });

         localStorage.setItem(
            "usuariosRecordados",
            JSON.stringify(listaRecordados)
         ); // guardo lista actualizada
      } else {
         // Si no se marca "Recordarme", quito al usuario de usuariosRecordados
         let listaRecordados = JSON.parse(
            localStorage.getItem("usuariosRecordados") || "[]"
         );
         listaRecordados = listaRecordados.filter(
            (u) => u.usuario !== usuarioEncontrado.Usuario
         );
         localStorage.setItem(
            "usuariosRecordados",
            JSON.stringify(listaRecordados)
         );
      }

      // ----------------------------------------------------------------
      // 5.2) Navegar a la pantalla de alimentadores después de un breve delay
      // ----------------------------------------------------------------
      setTimeout(() => {
         navigate("/alimentadores");      // redirige al panel principal
      }, 1200);
   };

	
   // ----------------------------------------------------------------
   // 6) Render del formulario de login
   // ----------------------------------------------------------------
   return (
      <form onSubmit={handleSubmit} className="login-form">
         <div className="container">
            <div className="izquierda">
               <img
                  src="/src/assets/imagenes/logo 2 rw.png"
                  alt="logoApp"
                  className="logo"
               />
            </div>

            <div className="derecha">
               <div className="login">

                  <h3 className="usuario">USUARIO</h3>

                  <input
                     className="input"
                     type="text"
                     placeholder="Ingrese su usuario"
                     value={usuario}
                     onChange={(e) => setUsuario(e.target.value)}           // actualiza el estado de usuario
                     autoComplete="username"
                     list="lista-usuarios-recordados"                       // lista para autocompletar usuarios recordados
                  />

                  <datalist id="lista-usuarios-recordados">
							{/* Busca en el localStorage del navegador un ítem con la clave "usuariosRecordados"
							Si getItem(...) devolvió algo “falso” (por ejemplo null), se usa "[]" como valor por defecto.*/}
							{JSON.parse(localStorage.getItem("usuariosRecordados") || "[]")
								.map((u) => (
                        <option key={u.usuario} value={u.usuario} />        // cada opción es un usuario recordado
                     ))}
                  </datalist>
						{/* ☝️ Buscá en el almacenamiento del navegador la lista de usuarios recordados; si no hay nada, usá una lista vacía. 
						Después convertí ese texto JSON en un array de JavaScript para poder recorrerlo y generar las opciones del datalist.*/}

                  <h3 className="usuario">CONTRASEÑA</h3>

                  <input
                     className="input"
                     type="password"
                     placeholder="Ingrese su contraseña"
                     value={contraseña}
                     onChange={(e) => setContraseña(e.target.value)}        // actualiza el estado de contraseña
                  />

                  <label className="recordarme">
                     <input
                        type="checkbox"
                        checked={recordarme}
                        onChange={(event) =>
                           setRecordarme(event.target.checked)}              // alterna el flag de "Recordarme"
                     />{" "}
                     Recordarme
                  </label>

                  {error && <p className="error">{error}</p>}{" "}     {/*error && <p>...</p> → renderizado condicional: solo muestra el <p> si error tiene algo.*/}

                  {/* error de carga de usuarios */}

                  <div className="acciones">

                     <button type="submit" className="boton">
                        Iniciar sesión
                     </button>
							{/* ☝️ Muestra el texto “Iniciar sesión”. Al hacer click, como es type="submit" y está dentro del <form>,
							dispara el handleSubmit del formulario, que es donde validás usuario y contraseña, mostrás alertas, 
							y navegás a /alimentadores si todo está bien.*/}

                     <p className="recordarme">¿Olvidaste tu contraseña?</p>

                     <Link to="/registro" className="registrarse">
                        ¿No tienes cuenta? registrate
                     </Link>
							{/* ☝️ Mostrá un enlace con el texto ‘¿No tienes cuenta? registrate’ que, al hacer clic, 
							lleve a la pantalla de registro /registro usando React Router, sin recargar toda la página.*/}

                  </div>
               </div>
            </div>
         </div>

         {alerta.mensaje && (                                     // si hay alerta activa, la muestro flotando
            <div className={`alerta alerta-${alerta.tipo}`}>
               {alerta.mensaje}
            </div>
         )}
      </form>
   );
};

export default PaginaLogin;      // componente exportado para usarlo en App.jsx

// ---------------------------------------------------------------------------
// NOTA PERSONAL SOBRE ESTE ARCHIVO (PaginaLogin.jsx)
// - Pantalla de login con soporte de "recordarme" y autocompletado de usuario
//   y contraseña usando localStorage.
// - Al montar, carga la lista de usuarios desde json-server (db.json) y la
//   guarda en usuariosValidos para validar las credenciales localmente.
// - También revisa si hay un usuario previo en "usuarioLogueado" y, si marcó
//   recordarme, completa usuario/contraseña y deja tildado el checkbox.
// - Al enviar el formulario, busca el usuario en usuariosValidos y compara la
//   contraseña. Si algo falla, muestra una alerta temporal en pantalla.
// - Si el login es correcto, actualiza la lista usuariosRecordados (según si
//   el checkbox está activo) y navega a "/alimentadores" luego de 1,2 segundos.
// - Toda la parte visual (layout, colores, alertas) se maneja en PaginaLogin.css.
// ---------------------------------------------------------------------------
