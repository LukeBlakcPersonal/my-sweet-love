# My Sweet Love

Sitio Next.js dedicado a una pareja, con Collage, mensajes, musica y un portafolio de comunicaciones.
Usa Tailwind para la interfaz, Cloudinary para subir y servir imagenes, videos y MP3, y Firebase para login y base de datos.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Auth
- Firestore
- Firebase Admin SDK
- Cloudinary

## Lo que hace

- Collage con las ultimas imagenes subidas.
- Mensajes y momentos con opcion de adjuntar foto.
- Reproductor de audio para MP3.
- Seccion de portafolio/comunicaciones para crear, editar y borrar elementos.
- Perfil local para redes sociales y datos de contacto.
- Fallback de demo si faltan variables de entorno.

## Variables de entorno

Crea un archivo `.env.local` con estas claves:

```bash
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=estrellita-lunita
```

## Configuracion en Firebase

1. Crea un proyecto en Firebase.
2. Activa Authentication y habilita Email/Password.
3. Crea Firestore en modo nativo.
4. Genera una service account para el Admin SDK y pega sus datos en las variables de entorno.
5. Copia la configuracion web del proyecto y llenala en las variables `NEXT_PUBLIC_FIREBASE_*`.

## Colecciones de Firestore

El proyecto usa estas colecciones:

- `media_items`
- `love_messages`
- `portfolio_items`

Los endpoints crean y leen documentos con esos nombres. No necesitas crear documentos manualmente para la primera prueba, pero si quieres cargar datos iniciales, usa esos mismos nombres de coleccion.

## Configuracion de Cloudinary

1. Crea una cuenta en Cloudinary.
2. Copia Cloud name, API Key y API Secret desde el Dashboard.
3. Coloca esas claves en `.env.local` con los nombres exactos de arriba.
4. Define `CLOUDINARY_UPLOAD_FOLDER` para agrupar archivos (por ejemplo, `estrellita-lunita`).
5. Verifica que las cargas admitan imagen, video y audio con `resource_type=auto` (ya viene configurado en el endpoint).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Produccion en Vercel

1. Sube el proyecto a GitHub.
2. Conecta el repositorio en Vercel.
3. Agrega todas las variables de entorno de Firebase y Cloudinary.
4. Despliega.

## Notas

- Si faltan variables, la interfaz sigue funcionando con contenido de demo.
- Los iconos y recursos marcados como placeholders deben agregarse manualmente en el proyecto o en el contenido visual.
- La autenticacion se maneja con Firebase y las rutas del servidor validan el ID token antes de escribir en Firestore.
