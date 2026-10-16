// 1. Credenciales desde variables de entorno
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno.");
  process.exit(1);
}

// 2. Parámetros personalizados (Coordenadas de Bucaramanga)
const LAT = 7.1254;
const LON = -73.1198;
const MI_DIGITO = "9"; // <-- Cambia esto por el último número de tu placa

//------------------------------------------------------------------------------------
function verificarPicoYPlaca() {
  // Forzar zona horaria de Colombia sin importar dónde corra el servidor
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const diaSemana = ahora.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb

  // Domingo libre
  if (diaSemana === 0) {
    return "🟢 *Pico y Placa:* Domingo sin restricción.";
  }

  // Rotación de Lunes a Viernes (Ajustar según el trimestre vigente)
  const rotacionSemana = {
    1: ["5", "6"], // Lunes
    2: ["7", "8"], // Martes
    3: ["9", "0"], // Miércoles
    4: ["1", "2"], // Jueves
    5: ["3", "4"], // Viernes
  };

  let digitosHoy = [];

  if (diaSemana >= 1 && diaSemana <= 5) {
    digitosHoy = rotacionSemana[diaSemana];
  } else if (diaSemana === 6) {
    // Lógica para Sábados rotativos:
    // Define un sábado de referencia y con qué índice del arreglo empezó (0 a 4)
    const parejasSabado = [["1", "2"], ["3", "4"], ["5", "6"], ["7", "8"], ["9", "0"]];
    const sabadoBase = new Date("2026-10-03T00:00:00-05:00"); // Ejemplo: Sáb 3 de Oct tocó 1 y 2 (índice 0)
    
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const semanasTranscurridas = Math.floor((ahora - sabadoBase) / msPorSemana);
    const indiceActual = ((semanasTranscurridas % 5) + 5) % 5;
    
    digitosHoy = parejasSabado[indiceActual];
  }

  const tengoRestriccion = digitosHoy.includes(MI_DIGITO);

  return tengoRestriccion
    ? `🔴 *¡ALERTA PICO Y PLACA!* Hoy restringen *${digitosHoy.join(" y ")}* (Tu placa termina en ${MI_DIGITO}).`
    : `🟢 *Pico y Placa libre:* Hoy aplica para placas terminadas en *${digitosHoy.join(" y ")}*.`;
}

async function obtenerClima() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=precipitation_probability&timezone=America%2FBogota&forecast_days=1`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al consultar clima: ${res.statusText}`);
  const data = await res.json();

  const tempMax = data.daily.temperature_2m_max[0];
  const tempMin = data.daily.temperature_2m_min[0];
  const probMax = data.daily.precipitation_probability_max[0];

  // Índices del arreglo horario: 7 = 7:00 AM, 12 = 12:00 PM, 18 = 6:00 PM
  const lluvia7am = data.hourly.precipitation_probability[7];
  const lluvia12pm = data.hourly.precipitation_probability[12];
    const lluvia4pm = data.hourly.precipitation_probability[16];
  const lluvia6pm = data.hourly.precipitation_probability[18];

  let recomendacion = "☀️ *Ruta seca:* Baja probabilidad de lluvia, buen clima para rodar.";
  if (probMax >= 60 || lluvia7am >= 50 || lluvia6pm >= 50) {
    recomendacion = "☔ *¡Alista el impermeable!* Alta probabilidad de lluvia en tus horas de ruta.";
  } else if (probMax >= 35) {
    recomendacion = "🌦️ *Clima cambiante:* No sobra llevar el impermeable en el maletero/morral.";
  }

  return [
    `🌡️ *Temperatura:* ${tempMin}°C mín / ${tempMax}°C máx`,
    `💧 *Lluvia hoy (Máx ${probMax}%):*`,
    `   • 07:00 AM: *${lluvia7am}%*`,
    `   • 12:00 PM: *${lluvia12pm}%*`,
    `   • 04:00 PM: *${lluvia4pm}%*`,
    `   • 06:00 PM: *${lluvia6pm}%*`,
    "",
    recomendacion
  ].join("\n");
}

async function enviarReporte() {
  try {
    const infoVial = verificarPicoYPlaca();
    const infoClima = await obtenerClima();

    const mensaje = [
      "🏍️ *Reporte Matutino de Ruta*",
      "──────────────────",
      infoVial,
      "",
      infoClima
    ].join("\n");

    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensaje,
        parse_mode: "Markdown"
      })
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    console.log("✅ Reporte enviado a Telegram correctamente.");
  } catch (error) {
    console.error("❌ Falló el envío del reporte:", error.message);
    process.exit(1);
  }
}

enviarReporte();