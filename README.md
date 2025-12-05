# ⚡️ RelayWatch – Monitor educativo de alimentadores

> Aplicación web en React + Vite para visualizar alimentadores eléctricos, gestionar puestos y simular lecturas de relé/analizador con animación de progreso en los bordes de cada medición. Proyecto educativo (sin backend real) del tercer cuatrimestre.

---

## 👥 Equipo de desarrollo

- **Santiago Casal** (@santysnk)  
- **Vanina Labrunee** (@VaninaL)

---

## 📋 Índice

1. [Descripción](#-descripción)  
2. [Características](#-características)  
3. [Tecnologías](#-tecnologías)  
4. [Estructura del proyecto](#-estructura-del-proyecto)  
5. [Instalación](#-instalación)  
6. [Uso](#-uso)  
7. [Scripts disponibles](#-scripts-disponibles)  
8. [Recursos del proyecto](#-recursos-del-proyecto)  
9. [Notas técnicas](#-notas-técnicas)  
10. [Próximos pasos sugeridos](#-próximos-pasos-sugeridos)

---

## 📌 Descripción

- Página de **Alimentadores** con puestos, tarjetas arrastrables y boxes de medición.  
- Simula lecturas periódicas de **relé** y **analizador**, configurables por IP/puerto/periodo.  
- El borde amarillo de cada box se anima según el tiempo de actualización; se reinicia al llegar un nuevo dato.  
- Mapeo de registros a boxes personalizable por modal (parte superior/inferior).  
- Estado persistido en `localStorage` (puestos, selección, configuraciones).  
- **No hay backend real**: las lecturas se stubbean, ideal para prácticas y demos.

---

## ✨ Características

- Gestión de puestos (crear, editar, reordenar).  
- Configuración de alimentadores (color, IP/puerto, periodo de relé y analizador).  
- Mapeo de mediciones por modal, con vista previa y persistencia local.  
- Drag & drop de tarjetas con placeholder de “soltar al final”.  
- Animación de borde sincronizada con el contador de lecturas (reinicia al recibir dato nuevo, aunque el valor se repita).  
- UI responsive con menú lateral en modo compacto.

---

## 🛠 Tecnologías

- **React** + **Vite**  
- **JavaScript** (hooks y contexto)  
- CSS modular por componentes  
- Almacenamiento local (`localStorage`)  
- Stubs para cliente Modbus (sin servidor real)

---

## 📁 Estructura del proyecto

```
mi-app/
├─ src/
│  ├─ App.jsx              # Rutas: login, registro, alimentadores
│  ├─ paginas/PaginaAlimentadores/
│  │  ├─ PaginaAlimentadores.jsx   # Wrapper del proveedor + vista
│  │  ├─ contexto/ContextoAlimentadores.jsx  # Estado central de puestos/mediciones
│  │  ├─ componentes/
│  │  │  ├─ layout/VistaAlimentadores.jsx     # Orquesta UI, modales, drag-drop
│  │  │  ├─ tarjetas/ (TarjetaAlimentador, GrupoMedidores, CajaMedicion)
│  │  │  ├─ modales/ (Configuración, Mapeo, Puestos)
│  │  │  └─ navegacion/ (barra superior y menú lateral)
│  │  ├─ hooks/ (usarPuestos, usarMediciones, usarArrastrarSoltar, useGestorModales)
│  │  ├─ utilidades/ (calculosMediciones, almacenamiento, clienteModbus stub)
│  │  └─ constantes/ (colores, títulos)
│  └─ assets/ (iconos e imágenes)
└─ package.json
```

---

## 🚀 Instalación

1) Clona el repositorio.  
2) Instala dependencias en `mi-app/`:
```bash
npm install
```

---

## ▶️ Uso

Arranca el entorno de desarrollo:
```bash
npm run dev
```
Abre la URL que muestra la consola (por defecto `http://localhost:5173`).  
Crea un puesto, agrega alimentadores, configura relé/analizador y empieza las mediciones. El borde de los boxes se animará según el periodo configurado.

---

## 🧩 Scripts disponibles

| Comando            | Descripción                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Arranca Vite con hot reload.             |
| `npm run build`    | Compila para producción.                 |
| `npm run preview`  | Sirve el build local para revisar.       |

---

## 📋 Recursos del proyecto

- Presentación (Gamma): https://gamma.app/docs/RelayWatch-aa48ymgzh3rok4s  
- Tablero Trello: https://trello.com/invite/b/68faa899637e581fd429a624/ATTI948066650eec58b8e1d97b2fa25a0093E3901CC3/trabajo-final-de-programacion  
- Diseño en Figma: https://www.figma.com/design/5CbvjUrKUlVxgt7EZERuJc/Proyecto-RelayWatch?t=PZSK0fnncGCoZbFc-0

---

## 🧠 Notas técnicas

- El contexto `ContextoAlimentadores` expone nombres en español para facilitar lectura: `alternarMedicion`, `reordenarAlimentadores`, `lecturasTarjetas`, etc.  
- La animación de borde se reinicia con un contador de lecturas incluido en la key del `<span>` de cada box. Si cambias de puesto o detienes la medición, el borde vuelve a 0 y se reanima en la próxima lectura.  
- `obtenerDisenoTarjeta` arma el layout de boxes desde el mapeo; `calcularValoresLadoTarjeta` toma los registros y produce los valores mostrados.  
- Sin backend: el cliente Modbus es un stub; ideal para practicar sin depender de red.

---

## 📈 Próximos pasos sugeridos

- Agregar seeds/datos de ejemplo para probar sin configurar IPs.  
- Pequeñas validaciones en modales (rangos de puerto, periodos mínimos).  
- Documentar rápidamente cada modal con tips de uso.  
- (Opcional) Tests ligeros para hooks de cálculo si el proyecto escala.

