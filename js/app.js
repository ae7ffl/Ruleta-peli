// ---------- Pestañas ----------
function activarTab(nombre) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === nombre);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === 'tab-' + nombre);
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activarTab(btn.dataset.tab));
});

document.querySelectorAll('[data-goto-tab]').forEach(btn => {
  btn.addEventListener('click', () => activarTab(btn.dataset.gotoTab));
});

document.getElementById('quickSorpresaBtn').addEventListener('click', () => {
  reproducirMedia('sorpresa');
});

// ---------- "¿Quién eres?" ----------
function preguntarQuienEres() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('quienEresOverlay');
    overlay.hidden = false;

    function limpiar() {
      overlay.hidden = true;
      overlay.querySelectorAll('.quien-btn').forEach(b => b.removeEventListener('click', onElegir));
      document.getElementById('quienCancel').removeEventListener('click', onCancelar);
    }
    function onElegir(e) {
      const persona = e.currentTarget.dataset.persona;
      limpiar();
      resolve(persona);
    }
    function onCancelar() {
      limpiar();
      resolve(null);
    }

    overlay.querySelectorAll('.quien-btn').forEach(b => b.addEventListener('click', onElegir));
    document.getElementById('quienCancel').addEventListener('click', onCancelar);
  });
}

// ---------- Estado local ----------
// Cada película:
// { id, titulo, genero, estado: 'por_ver' | 'vista',
//   añadidoPor, nota, puntuaciones: { Andrea: n|null, Lucía: n|null } }
let peliculas = [];

function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function actualizarUI() {
  renderPorVer();
  renderVistas();
  renderResumen();
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
  const inputTitulo = document.getElementById('movieTitle');
  const inputGenero = document.getElementById('movieGenre');
  const errorEl = document.getElementById('addError');
  const titulo = inputTitulo.value.trim();
  const genero = inputGenero.value.trim();

  if (!titulo) {
    errorEl.textContent = 'Escribe un título antes de añadir.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const persona = await preguntarQuienEres();
  if (!persona) return; // canceló

  peliculas.push({
    id: nuevoId(),
    titulo,
    genero,
    estado: 'por_ver',
    añadidoPor: persona,
    nota: '',
    puntuaciones: { Andrea: null, 'Lucía': null }
  });
  inputTitulo.value = '';
  inputGenero.value = '';
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
    const subtitulo = [p.genero, p.añadidoPor ? `añadida por ${p.añadidoPor}` : null]
      .filter(Boolean).join(' · ');
    li.innerHTML = `
      <div>
        <div class="movie-title">${escapeHtml(p.titulo)}</div>
        ${subtitulo ? `<div class="movie-subtitle">${escapeHtml(subtitulo)}</div>` : ''}
      </div>
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
function estrellasHTML(id, valorActual) {
  let html = '<span class="star-row" data-id="' + id + '">';
  for (let i = 1; i <= 5; i++) {
    html += `<button class="star-btn" data-id="${id}" data-star="${i}">${i <= (valorActual || 0) ? '★' : '☆'}</button>`;
  }
  html += '</span>';
  return html;
}

function renderVistas() {
  const ul = document.getElementById('vistasList');
  const emptyMsg = document.getElementById('vistasEmpty');
  const vistas = peliculas.filter(p => p.estado === 'vista');

  ul.innerHTML = '';
  emptyMsg.hidden = vistas.length > 0;

  vistas.forEach(p => {
    const puntuaciones = p.puntuaciones || { Andrea: null, 'Lucía': null };
    const li = document.createElement('li');
    li.className = 'movie-list-item-vista';
    li.innerHTML = `
      <div class="vista-header">
        <span class="movie-title">${escapeHtml(p.titulo)}</span>
        <button title="Volver a 'Por ver'" data-id="${p.id}" class="volverBtn">↩️</button>
      </div>
      <div class="ratings-summary">
        Andrea: ${puntuaciones.Andrea ? '★'.repeat(puntuaciones.Andrea) + '☆'.repeat(5 - puntuaciones.Andrea) : 'sin puntuar'}
        &nbsp;·&nbsp;
        Lucía: ${puntuaciones['Lucía'] ? '★'.repeat(puntuaciones['Lucía']) + '☆'.repeat(5 - puntuaciones['Lucía']) : 'sin puntuar'}
      </div>
      <div class="rate-row">
        <span class="rate-label">Puntuar:</span>
        ${estrellasHTML(p.id, 0)}
      </div>
      <input type="text" class="nota-input" data-id="${p.id}" placeholder="Nota sobre la peli (compartida)" value="${escapeAttr(p.nota || '')}">
    `;
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

  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const persona = await preguntarQuienEres();
      if (!persona) return;
      const pelicula = peliculas.find(p => p.id === btn.dataset.id);
      if (!pelicula) return;
      if (!pelicula.puntuaciones) pelicula.puntuaciones = { Andrea: null, 'Lucía': null };
      pelicula.puntuaciones[persona] = parseInt(btn.dataset.star, 10);
      actualizarUI();
      await persistir();
    });
  });

  document.querySelectorAll('.nota-input').forEach(input => {
    input.addEventListener('change', async () => {
      const pelicula = peliculas.find(p => p.id === input.dataset.id);
      if (!pelicula) return;
      pelicula.nota = input.value;
      await persistir();
    });
  });
}

// ---------- Resumen ----------
function renderResumen() {
  const cont = document.getElementById('resumenList');
  const emptyMsg = document.getElementById('resumenEmpty');

  cont.innerHTML = '';
  emptyMsg.hidden = peliculas.length > 0;

  peliculas.forEach(p => {
    const puntuaciones = p.puntuaciones || { Andrea: null, 'Lucía': null };
    const card = document.createElement('div');
    card.className = 'resumen-card';
    card.innerHTML = `
      <div class="resumen-card-header">
        <span class="movie-title">${escapeHtml(p.titulo)}</span>
        <span class="estado-badge ${p.estado === 'vista' ? 'estado-vista' : 'estado-por-ver'}">
          ${p.estado === 'vista' ? 'Vista' : 'Por ver'}
        </span>
      </div>
      <div class="resumen-detail">Género: ${p.genero ? escapeHtml(p.genero) : '—'}</div>
      <div class="resumen-detail">Añadida por: ${p.añadidoPor ? escapeHtml(p.añadidoPor) : '—'}</div>
      <div class="resumen-detail">Andrea: ${puntuaciones.Andrea ? '★'.repeat(puntuaciones.Andrea) + '☆'.repeat(5 - puntuaciones.Andrea) : '—'}</div>
      <div class="resumen-detail">Lucía: ${puntuaciones['Lucía'] ? '★'.repeat(puntuaciones['Lucía']) + '☆'.repeat(5 - puntuaciones['Lucía']) : '—'}</div>
      ${p.nota ? `<div class="resumen-nota">📝 ${escapeHtml(p.nota)}</div>` : ''}
    `;
    cont.appendChild(card);
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

// ---------- Botón sorpresa (cabecera) ----------
document.getElementById('sorpresaBtn').addEventListener('click', () => {
  reproducirMedia('sorpresa');
});

// ---------- Utilidad ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}