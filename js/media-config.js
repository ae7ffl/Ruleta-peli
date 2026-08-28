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
    "media/random1.png",
    "media/random2.png",
  ],

  // Cuando marcáis una película como vista (pasa de "Por ver" a "Vistas")
  peliculaVista: [
    "media/random1.png",
    "media/random2.png",
  ],

  // Cuando la lista de "Por ver" se queda vacía
  listaVacia: [
    "media/random1.png",
  ],

  // El botón sorpresa (🎲), en cualquier momento
  sorpresa: [
    "media/random1.png",
    "media/random2.png",
  ],
};

const EXTENSIONES_IMAGEN = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function esImagen(ruta) {
  return EXTENSIONES_IMAGEN.some(ext => ruta.toLowerCase().endsWith(ext));
}

function reproducirMedia(evento) {
  const opciones = MEDIA_CONFIG[evento];
  if (!opciones || opciones.length === 0) return;
  const elegido = opciones[Math.floor(Math.random() * opciones.length)];

  const overlay = document.getElementById('mediaOverlay');
  const player = document.getElementById('mediaPlayer');
  const image = document.getElementById('mediaImage');

  overlay.hidden = false;

  if (esImagen(elegido)) {
    player.pause();
    player.hidden = true;
    player.removeAttribute('src');
    image.src = elegido;
    image.hidden = false;
  } else {
    image.hidden = true;
    image.removeAttribute('src');
    player.hidden = false;
    player.src = elegido;
    player.play().catch(() => {});
  }
}

document.getElementById('mediaClose').addEventListener('click', () => {
  const overlay = document.getElementById('mediaOverlay');
  const player = document.getElementById('mediaPlayer');
  const image = document.getElementById('mediaImage');
  player.pause();
  player.removeAttribute('src');
  player.hidden = true;
  image.removeAttribute('src');
  image.hidden = true;
  overlay.hidden = true;
});