# 🏍️🌦️ Bot Matutino de Ruta: Pico y Placa + Clima

Asistente automatizado en **Node.js** (*zero-dependencies*) que envía cada mañana un reporte directo a **Telegram** con el estado del **Pico y Placa en Bucaramanga** (incluyendo cálculo automático de rotaciones trimestrales y sábados) y el pronóstico de lluvia en horas clave de desplazamiento.

---

## ✨ Características Principales

- **Cálculo Automático de Pico y Placa:**
  - **Lunes a Viernes (6:00 a.m. – 8:00 p.m.):** Calcula automáticamente el desplazamiento de dígitos cada cambio de trimestre sin necesidad de modificar el código manualmente.
  - **Sábados Rotativos (9:00 a.m. – 1:00 p.m.):** Determina la pareja de dígitos restringida según la secuencia semanal continua.
  - **Zona Horaria Fija:** Forzado a `America/Bogota` (UTC-5) para garantizar precisión sin importar la ubicación del servidor.
- **Pronóstico Meteorológico para Motociclistas:**
  - Conecta con la API gratuita de **Open-Meteo** (sin necesidad de API Keys).
  - Evalúa temperaturas mínimas/máximas y probabilidad de precipitación a las **7:00 AM**, **12:00 PM** y **6:00 PM**.
  - Genera una recomendación inteligente indicando si es necesario alistar el impermeable.
- **100% Serverless y Sin Costo:**
  - Ejecución automatizada de lunes a sábado a las 6:00 AM mediante un Cron Job en **GitHub Actions**.
  - Construido con `fetch` nativo de Node.js, sin dependencias externas ni `node_modules`.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Entorno de Ejecución** | Node.js (ES Modules `.mjs` + `fetch` nativo) |
| **Datos Climáticos** | [Open-Meteo Forecast API](https://open-meteo.com/) |
| **Mensajería** | Telegram Bot API |
| **Automatización (CI/CD)** | GitHub Actions (`schedule` & `workflow_dispatch`) |

---

## 🚀 Instalación y Prueba Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/BrahiamM/bot-ruta-diaria.git](https://github.com/BrahiamM/bot-ruta-diaria.git)
   cd bot-ruta-diaria
