// Usa jsonbin.io como "base de datos": lee y escribe la lista de
// películas en un único bin (un archivo JSON en la nube).
//
// No hay sincronización instantánea como con una base de datos en tiempo
// real, pero la app comprueba el bin cada pocos segundos, así que en la
// práctica los cambios de tu amiga aparecen casi al momento.

const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.binId}`;

async function fetchPeliculas() {
  const res = await fetch(`${API_URL}/latest?meta=false`, {
    headers: { 'X-Master-Key': JSONBIN_CONFIG.masterKey }
  });
  if (!res.ok) throw new Error('No se pudo leer la lista (¿revisaste el binId en jsonbin-config.js?)');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function savePeliculas(lista) {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_CONFIG.masterKey
    },
    body: JSON.stringify(lista)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('No se pudo guardar: ' + (err.message || res.status));
  }
}

// Vuelve a comprobar el bin cada 6 segundos y avisa si algo cambió
function iniciarPolling(onUpdate, intervaloMs = 6000) {
  let anterior = null;
  async function tick() {
    try {
      const lista = await fetchPeliculas();
      const actual = JSON.stringify(lista);
      if (actual !== anterior) {
        anterior = actual;
        onUpdate(lista);
      }
    } catch (e) {
      console.error(e);
    }
  }
  tick();
  setInterval(tick, intervaloMs);
}
