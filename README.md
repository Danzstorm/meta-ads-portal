# Meta Ads Portal

Portal web para crear y gestionar campañas publicitarias en Meta (Facebook e Instagram) usando la Marketing API. Construido con Next.js, TypeScript y Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## ¿Qué hace?

- Crear campañas publicitarias en Meta paso a paso (Campaña → Audiencia → Anuncio)
- Subir imágenes directamente a Meta desde la app
- Gestionar múltiples cuentas publicitarias
- Biblioteca de assets (imágenes reutilizables)
- Previsualización del anuncio antes de publicar
- Interfaz completamente en español

---

## Requisitos previos

Antes de empezar necesitas:

1. **Cuenta de Facebook** con una página de empresa creada
2. **Cuenta publicitaria de Meta** activa (en [business.facebook.com](https://business.facebook.com))
3. **App en Meta for Developers** configurada (ver sección de configuración abajo)
4. **Node.js 18+** instalado en tu computadora

---

## Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/meta-ads-portal.git
cd meta-ads-portal

# 2. Instala las dependencias
npm install

# 3. Copia el archivo de variables de entorno
cp .env.example .env.local

# 4. Edita .env.local con tus datos (ver sección siguiente)

# 5. Levanta el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Configuración de variables de entorno

Edita el archivo `.env.local` con tus valores:

```env
# ID de tu app en Meta for Developers
NEXT_PUBLIC_META_APP_ID=TU_APP_ID_AQUI

# Opcional: token de acceso para desarrollo local
# Si lo dejas vacío, usa el botón "Log in with Facebook" en la app
NEXT_PUBLIC_META_ACCESS_TOKEN=
```

> ⚠️ **Nunca subas `.env.local` a GitHub.** Ya está incluido en `.gitignore`.

---

## Configuración de Meta for Developers

### 1. Crear la app

1. Ve a [developers.facebook.com](https://developers.facebook.com) → **Mis apps** → **Crear app**
2. Tipo de app: **Negocios**
3. Anota el **ID de la app** — lo necesitarás en `.env.local`

### 2. Agregar productos

En el panel de tu app, agrega estos dos productos:

**Marketing API:**
- Panel izquierdo → **Agregar producto** → **Marketing API** → Configurar
- Ve a **Marketing API → Herramientas**
- Marca los permisos: `ads_management`, `ads_read`, `pages_read_engagement`, `pages_show_list`

**Facebook Login:**
- Panel izquierdo → **Agregar producto** → **Facebook Login** → **Web**
- En **Facebook Login → Configuración**, agrega en "URI de redireccionamiento OAuth válidos":
  ```
  https://localhost:3000
  http://localhost:3000
  ```

### 3. Obtener el token de acceso

**Opción A — Graph API Explorer (recomendado para empezar):**
1. Ve a [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Selecciona tu app en el dropdown superior
3. Clic en **Generate Access Token**
4. Marca estos permisos: `ads_management`, `ads_read`, `pages_read_engagement`, `pages_show_list`
5. Acepta el popup de Facebook
6. Copia el token y pégalo en la app en **Configuración → Access Token**

**Opción B — Login directo desde la app:**
1. Abre la app → ve a **Configuración**
2. Clic en **Log in with Facebook** (requiere HTTPS, usa `npm run dev`)

> Los tokens del Explorer duran ~1 hora. Para extenderlos: [developers.facebook.com/tools/debug_token](https://developers.facebook.com/tools/debug_token) → **Extend Access Token** (~60 días).

---

## Primer uso — Configuración inicial

1. Abre la app → ve a **Configuración**
2. Pega tu token o usa el botón **Log in with Facebook**
3. Selecciona tu **Cuenta publicitaria** en el dropdown que aparece
4. En la sección **Página de Facebook predeterminada**, ingresa tu Page ID y guárdalo

**¿Cómo encontrar tu Page ID?**
Abre tu página en Facebook desde el navegador → mira la URL:
- Si es `facebook.com/profile.php?id=123456789` → tu ID es `123456789`
- Si es `facebook.com/mipagina` → ve a **Acerca de** → baja hasta encontrar "ID de página"

---

## Crear una campaña

1. Ve a **Campañas** → **Nueva campaña**
2. Sigue los 4 pasos del asistente:

| Paso | Qué completas |
|---|---|
| 1 — Campaña | Objetivo, nombre y presupuesto |
| 2 — Audiencia | País, edad, género e intereses |
| 3 — Anuncio | Imagen, texto, título y URL de destino |
| 4 — Revisión | Confirmas y lanzas |

### Ejemplo — Campaña de Reconocimiento (Awareness)

El objetivo **Awareness** es ideal para dar a conocer tu marca o conseguir seguidores. No requiere pixel de Meta.

| Campo | Valor de ejemplo |
|---|---|
| Objetivo | Awareness (Reconocimiento) |
| Nombre de campaña | `Conoce mi marca` |
| Presupuesto | $5/día |
| País | El tuyo |
| Edad | 18–45 |
| Intereses | Emprendimiento, Tecnología |
| Texto principal | `¿Quieres aprender sobre [tu tema]? Síguenos y accede a contenido gratuito.` |
| Título | `Aprende con nosotros` |
| URL de destino | `https://www.instagram.com/TU_USUARIO` |
| Imagen | 1080x1080px (cuadrada) o 1200x628px (horizontal), JPG o PNG |

---

## Permisos necesarios en Meta

| Permiso | Para qué se usa |
|---|---|
| `ads_management` | Crear y gestionar campañas |
| `ads_read` | Leer campañas existentes |
| `pages_read_engagement` | Asociar una página a los anuncios |
| `pages_show_list` | Cargar tus páginas en el dropdown |

> En **modo Development**, estos permisos funcionan sin aprobación de Meta siempre que tu cuenta sea administrador de la app.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── campaigns/         # Lista y creación de campañas
│   ├── ad-accounts/       # Gestión de cuentas publicitarias
│   ├── assets/            # Biblioteca de imágenes
│   ├── settings/          # Configuración del token y página
│   └── privacy/           # Política de privacidad
├── components/
│   ├── campaigns/         # Formularios del wizard de campaña
│   ├── auth/              # Botón de login con Facebook
│   └── ui/                # Componentes de interfaz (shadcn/ui)
├── context/
│   └── meta-context.tsx   # Estado global: token, cuenta, páginas
└── lib/
    └── meta-api.ts        # Cliente de la Marketing API de Meta
```

---

## Scripts disponibles

```bash
npm run dev        # Desarrollo con HTTPS (recomendado para Facebook Login)
npm run dev:http   # Desarrollo sin HTTPS (el token manual funciona igual)
npm run build      # Build de producción
npm run start      # Servidor de producción
```

---

## Preguntas frecuentes

**¿Por qué falla el botón "Log in with Facebook"?**
Requiere HTTPS. Usa `npm run dev` (incluye `--experimental-https`) o usa el token manual en Configuración.

**¿El token expira?**
Sí. Los tokens del Explorer duran ~1 hora. Extiéndelos desde el Token Debugger o haz login de nuevo con el botón de Facebook.

**¿Por qué aparece el error "Falta la página de Facebook"?**
El token no tiene permisos de páginas. Genera un nuevo token en el Graph API Explorer marcando `pages_read_engagement` y `pages_show_list`.

**¿Se puede desplegar en producción?**
Sí, es compatible con Vercel. Agrega `NEXT_PUBLIC_META_APP_ID` en las variables de entorno de Vercel y actualiza las URIs de OAuth en Meta Developers a tu dominio real.

---

## Seguridad

- ⚠️ Nunca compartas tu token de acceso ni lo subas a GitHub
- `.env.local` está en `.gitignore` y no se incluye en el repositorio
- Los tokens tienen vida útil limitada, lo que reduce el riesgo si se filtran
- En producción, genera tokens de sistema desde Business Manager

---

## Tecnologías

- [Next.js 16](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Meta Marketing API v19](https://developers.facebook.com/docs/marketing-apis/)
