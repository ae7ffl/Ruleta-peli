// ---------- Pestañas ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------- Estado local ----------
// Cada película: { id, titulo, estado: 'por_ver' | 'vista' }
let peliculas = [];

function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function actualizarUI() {
  renderPorVer();
  renderVistas();
  renderWheel();
}

// Carga inicial + comprobación periódica de cambios (hechos por tu amiga)
iniciarPolling((lista) => {
  peliculas = lista;
  actualizarUI();
});

async function persistir() {
  try {
    await savePeliculas(peliculas);
  } catch (e) {
    alert('No se pudo guardar el cambio: ' + e.message);
  }
}

// ---------- Añadir película ----------
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('movieTitle');
  const errorEl = document.getElementById('addError');
  const titulo = input.value.trim();

  if (!titulo) {
    errorEl.textContent = 'Escribe un título antes de añadir.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  peliculas.push({ id: nuevoId(), titulo, estado: 'por_ver' });
  input.value = '';
  actualizarUI();
  await persistir();
});

// ---------- Lista "Por ver" ----------
function renderPorVer() {
  const ul = document.getElementById('porVerList');
  const emptyMsg = document.getElementById('porVerEmpty');
  const porVer = peliculas.filter(p => p.estado === 'por_ver');

  ul.innerHTML = '';
  emptyMsg.hidden = porVer.length > 0;

  porVer.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="movie-title">${escapeHtml(p.titulo)}</span>
      <span class="movie-actions">
        <button title="Marcar como vista" data-id="${p.id}" class="marcarVistaBtn">✅</button>
        <button title="Eliminar" data-id="${p.id}" class="eliminarBtn">🗑️</button>
      </span>`;
    ul.appendChild(li);
  });

  document.querySelectorAll('.marcarVistaBtn').forEach(btn => {
    btn.addEventListener('click', () => marcarComoVista(btn.dataset.id));
  });
  document.querySelectorAll('.eliminarBtn').forEach(btn => {
    btn.addEventListener('click', () => eliminarPelicula(btn.dataset.id));
  });
}

async function marcarComoVista(id) {
  const pelicula = peliculas.find(p => p.id === id);
  if (!pelicula) return;
  pelicula.estado = 'vista';
  actualizarUI();
  reproducirMedia('peliculaVista');

  const quedan = peliculas.filter(p => p.estado === 'por_ver');
  if (quedan.length === 0) {
    setTimeout(() => reproducirMedia('listaVacia'), 1200);
  }

  await persistir();
}

async function eliminarPelicula(id) {
  peliculas = peliculas.filter(p => p.id !== id);
  actualizarUI();
  await persistir();
}

// ---------- Lista "Vistas" ----------
function renderVistas() {
  const ul = document.getElementById('vistasList');
  const emptyMsg = document.getElementById('vistasEmpty');
  const vistas = peliculas.filter(p => p.estado === 'vista');

  ul.innerHTML = '';
  emptyMsg.hidden = vistas.length > 0;

  vistas.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="movie-title">${escapeHtml(p.titulo)}</span>
      <span class="movie-actions">
        <button title="Volver a 'Por ver'" data-id="${p.id}" class="volverBtn">↩️</button>
      </span>`;
    ul.appendChild(li);
  });

  document.querySelectorAll('.volverBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pelicula = peliculas.find(p => p.id === btn.dataset.id);
      if (!pelicula) return;
      pelicula.estado = 'por_ver';
      actualizarUI();
      await persistir();
    });
  });
}

// ---------- Ruleta ----------
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const COLORS = ['#d4537e', '#1D9E75', '#D85A30', '#378ADD', '#7F77DD', '#639922', '#EF9F27'];
let rotation = 0;
let spinning = false;

function renderWheel() {
  const porVer = peliculas.filter(p => p.estado === 'por_ver');
  const n = porVer.length;
  const R = 165, CX = 170, CY = 170;

  ctx.clearRect(0, 0, 340, 340);

  if (n === 0) {
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = '#eee';
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Añade pelis en "Por ver"', CX, CY + 4);
    return;
  }

  const slice = (Math.PI * 2) / n;
  porVer.forEach((p, i) => {
    const start = rotation + i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();

    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = '600 13px sans-serif';
    const label = p.titulo.length > 18 ? p.titulo.slice(0, 17) + '…' : p.titulo;
    ctx.fillText(label, R - 15, 5);
    ctx.restore();
  });
}

document.getElementById('spinBtn').addEventListener('click', () => {
  const porVer = peliculas.filter(p => p.estado === 'por_ver');
  const resultEl = document.getElementById('spinResult');

  if (spinning) return;
  if (porVer.length === 0) {
    resultEl.textContent = 'Añade al menos una película en "Por ver" primero.';
    return;
  }

  spinning = true;
  resultEl.textContent = '';

  const n = porVer.length;
  const slice = (Math.PI * 2) / n;
  const winnerIdx = Math.floor(Math.random() * n);
  const targetAngle = Math.PI * 2 * 6 + (Math.PI * 1.5 - (winnerIdx * slice + slice / 2));
  const startRot = rotation;
  const duration = 3200;
  let startTime = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / duration, 1);
    rotation = startRot + targetAngle * easeOut(t);
    renderWheel();
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      spinning = false;
      resultEl.textContent = '🎉 Toca: ' + porVer[winnerIdx].titulo;
      reproducirMedia('ruletaResultado');
    }
  }
  requestAnimationFrame(frame);
});

// ---------- Botón sorpresa ----------
document.getElementById('sorpresaBtn').addEventListener('click', () => {
  reproducirMedia('sorpresa');
});

// ---------- Utilidad ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
