# 🎬 Noche de pelis

Una app web para llevar entre dos personas la lista de películas pendientes,
girar una ruleta para elegir cuál ver, y mover las películas a "Vistas"
cuando ya las hayáis visto — con vídeos de tu amiga reaccionando en
distintos momentos.

Los datos (la lista de películas) se guardan en un "bin" de
[jsonbin.io](https://jsonbin.io), un servicio gratuito pensado exactamente
para esto: un archivo JSON en la nube al que tu web puede leer y escribir.

## 1. Configurar jsonbin.io (una sola vez, 2 minutos)

1. Ve a https://jsonbin.io y crea una cuenta gratis (puedes registrarte con
   Google o GitHub, es más rápido).
2. Una vez dentro, en el Dashboard pulsa **"Create Bin"**.
3. En el editor que aparece, borra el contenido de ejemplo y escribe
   simplemente: `[]`
4. Pulsa **"Create"**. Verás la URL del bin — el trozo de letras y números
   al final de esa URL (o en el propio dashboard, junto al nombre del bin)
   es tu **Bin ID**. Cópialo.
5. Ahora ve a tu cuenta (icono de arriba a la derecha → **"API Keys"**).
   Ahí verás tu **X-Master-Key** — cópiala también.
6. Pega ambos datos en el archivo **`js/jsonbin-config.js`** de este
   proyecto.

> ⚠️ **Nota sobre seguridad**: al igual que con cualquier app sin servidor
> propio, esta clave queda visible en el código de la página. A diferencia
> de un token de GitHub, jsonbin.io no la revoca automáticamente por
> aparecer en un repositorio público. El límite de lo que alguien podría
> hacer con ella es leer o modificar el contenido de este bin en concreto
> — nada más grave que eso.

## 2. Añadir los vídeos de tu amiga

1. Graba o recopila los clips (recomendado: formato `.mp4`, cortos — de 2 a 6
   segundos funciona genial).
2. Mételos dentro de la carpeta `/media` de este proyecto.
3. Abre `js/media-config.js` y escribe el nombre de cada archivo en la lista
   que corresponda (verás las 4 categorías ya preparadas, con ejemplos
   comentados). Puedes poner varios vídeos por categoría — se elegirá uno al
   azar cada vez.

Si no añades ningún vídeo, la app funciona igual de bien, simplemente sin ese
efecto extra — puedes ir añadiéndolos cuando quieras.

## 3. Subir el proyecto a GitHub

1. Crea un repositorio nuevo en https://github.com (tiene que ser
   **público** para que GitHub Pages funcione gratis).
2. Sube todos los archivos de esta carpeta (incluida la carpeta `media` con
   tus vídeos ya dentro).

## 4. Publicarlo con GitHub Pages (gratis)

1. En tu repositorio, ve a **Settings → Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Pulsa **Save**. En un par de minutos, GitHub te dará una URL del tipo
   `https://tu-usuario.github.io/tu-repositorio/` — esa es la app ya
   funcionando, lista para compartir con tu amiga.

## Estructura del proyecto

```
├── index.html               # Estructura de la página (pestañas, ruleta, listas)
├── css/
│   └── style.css            # Estilos visuales
├── js/
│   ├── jsonbin-config.js    # Tu Bin ID y Master Key (rellenar en el paso 1)
│   ├── data-store.js        # Lee y guarda la lista en jsonbin.io
│   ├── media-config.js      # Qué vídeo se reproduce en cada momento
│   └── app.js                # Toda la lógica: pestañas, ruleta, listas
└── media/                   # Aquí van los vídeos de tu amiga
```

## Ideas para ampliarlo más adelante

- Añadir pósters automáticamente al escribir el título (usando la API
  gratuita de [OMDb](https://www.omdbapi.com/apikey.aspx)).
- Un historial con la fecha en la que visteis cada película.
- Puntuarlas del 1 al 5 al marcarlas como vistas.

## Coste

jsonbin.io (plan gratuito) y GitHub Pages son completamente gratuitos para
este uso.
