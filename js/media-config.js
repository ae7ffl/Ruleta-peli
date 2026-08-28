// Aquí defines qué vídeos de tu amiga se reproducen en cada momento.
//
// 1. Mete los archivos de vídeo (.mp4 recomendado, también valen .webm o .gif
//    convertido a mp4) dentro de la carpeta /media.
// 2. Escribe aquí sus nombres de archivo en la lista correspondiente.
// 3. Puedes poner varios en cada lista: cada vez se elegirá uno al azar,
//    así no se repite siempre el mismo.
//
// Si dejas una lista vacía, simplemente no se reproducirá ningún vídeo
// en ese momento (la app funciona igual, solo sin el efecto extra).

const MEDIA_CONFIG = {
  // Cuando la ruleta para y sale una película elegida
  ruletaResultado: [
    // "media/reaccion1.mp4",
    // "media/reaccion2.mp4",
  ],

  // Cuando marcáis una película como vista (pasa de "Por ver" a "Vistas")
  peliculaVista: [
    // "media/celebracion1.mp4",
    // "media/baile.mp4",
  ],

  // Cuando la lista de "Por ver" se queda vacía
  listaVacia: [
    // "media/sin-ideas.mp4",
  ],

  // El botón sorpresa (🎲), en cualquier momento
  sorpresa: [
    // "media/sorpresa1.mp4",
    // "media/sorpresa2.mp4",
  ],
};

function reproducirMedia(evento) {
  const opciones = MEDIA_CONFIG[evento];
  if (!opciones || opciones.length === 0) return;
  const elegido = opciones[Math.floor(Math.random() * opciones.length)];

  const overlay = document.getElementById('mediaOverlay');
  const player = document.getElementById('mediaPlayer');
  player.src = elegido;
  overlay.hidden = false;
  player.play().catch(() => {});
}

document.getElementById('mediaClose').addEventListener('click', () => {
  const overlay = document.getElementById('mediaOverlay');
  const player = document.getElementById('mediaPlayer');
  player.pause();
  player.src = '';
  overlay.hidden = true;
});
