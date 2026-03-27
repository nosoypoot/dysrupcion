# Dysrupción — Innovación con Identidad

Sitio y protocolo de gobernanza para **Dysrupción**, la comunidad tech de Yucatán.

Dysrupción nació en 2022 con 4 personas preguntándose por qué la tecnología en Yucatán crece pero los yucatecos no crecen con ella. Hoy somos casi 400. Este repositorio contiene el sitio de la comunidad, el playbook de gobernanza, y un protocolo replicable para que cualquier comunidad tech regional pueda forkearlo y adaptarlo.

> **Nota:** Todo lo que ves aquí es una **propuesta inicial de gobernanza**. No es definitivo. El manifiesto, las reglas, los roles, los tracks y los procesos son un punto de partida para que el grupo piloto los discuta, ajuste y valide. La comunidad decide qué se queda, qué cambia y qué se descarta. Este repositorio es la herramienta para hacer ese proceso visible y colaborativo.

## Stack

- **Cloudflare Workers** — frontend estático + API routes
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **TypeScript** — API routes tipadas
- **Vanilla HTML/CSS/JS** — sin frameworks, mobile-first
- **Cloudflare Turnstile** — protección anti-bot en formularios

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Manifiesto — la tesis de "innovación con identidad" |
| `/playbook` | Playbook operativo — reglas, conflictos, roles, tracks |
| `/registro` | Formulario de registro para nuevos miembros |
| `/proponer` | Proponer una iniciativa con beneficio local obligatorio |
| `/directorio` | Directorio público de miembros (con consentimiento) |
| `/iniciativas` | Board de iniciativas activas por track |
| `/eventos` | Calendario unificado (agrega eventos de Luma, Meetup, Partiful, etc.) |
| `/metricas` | Dashboard de salud de la comunidad |
| `/protocolo` | Fork kit — despliega tu propia comunidad en 30 minutos |

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx wrangler dev

# El sitio estará en http://localhost:8787
```

## Estructura del proyecto

```
dysrupcion/
├── src/
│   ├── index.ts              # Worker entry point, router
│   ├── routes/               # API routes (register, initiatives, events, etc.)
│   └── lib/
│       ├── mock-data.ts      # Datos de prueba (reemplazar con Supabase)
│       ├── og-scraper.ts     # Extractor de metadata OpenGraph para eventos
│       └── validation.ts     # Validación de formularios
├── public/
│   ├── *.html                # 9 páginas del sitio
│   ├── css/design-system.css # Sistema de diseño completo (dark/light mode)
│   ├── js/
│   │   ├── layout.js         # Nav y footer compartidos
│   │   ├── forms.js          # Manejo de formularios
│   │   ├── directory.js      # Directorio de miembros
│   │   ├── initiatives.js    # Board de iniciativas
│   │   ├── events.js         # Eventos + scraper
│   │   └── metrics.js        # Dashboard de métricas
│   └── img/                  # Logos de la marca
├── supabase/
│   └── migrations/           # Schema de base de datos
├── docs/
│   └── identidad_dysrupcion/ # Assets de identidad de marca
├── DESIGN.md                 # Sistema de diseño documentado
├── CLAUDE.md                 # Instrucciones para desarrollo con IA
└── wrangler.toml             # Configuración de Cloudflare Workers
```

## Gobernanza

El playbook operativo define:

- **5 reglas de convivencia** — respeto, no spam, conflictos por proceso, beneficio local, participación activa
- **Proceso de conflictos** — Tier 1 (leve: advertencia progresiva) y Tier 2 (grave: círculo de resolución)
- **Roles rotativos** — Guardianes de convivencia (3 meses), Coordinadores de track (6 meses), Facilitador de admisión
- **5 tracks de iniciativa** — Eventos, Educación, Emprendimiento, Impacto Local, Puente
- **Template de iniciativa** — toda propuesta declara beneficiario en Yucatán y co-líder local

Todo está documentado en `/playbook`.

## Protocolo — Forkea tu comunidad

Dysrupción es también un **protocolo replicable**. Si tienes una comunidad tech regional, puedes forkearlo:

1. Fork este repositorio
2. Edita las variables de configuración (nombre, misión, colores, tracks)
3. Configura tu Supabase
4. Despliega en Cloudflare Workers
5. Listo. Tu comunidad tiene sitio, gobernanza y herramientas.

Instrucciones completas en `/protocolo`.

## Sistema de diseño

El sitio usa un sistema de diseño propio basado en la identidad de marca de Dysrupción:

- **Estética:** Retro-Futurista Constructivista
- **Colores:** Pink (#FF1654) = acción, Cyan (#2EECC7) = información, Yellow (#FFD100) = atención
- **Tipografía:** Clash Grotesk (display), DM Sans (body), Geist Mono (datos)
- **Modos:** Dark (default) + Light, con toggle y respeto a `prefers-color-scheme`

Documentación completa en `DESIGN.md`.

## Deploy

```bash
# Deploy a producción
npx wrangler deploy
```

Para configurar Supabase y las variables de entorno, consulta `/protocolo`.

## Licencia

El contenido del playbook y protocolo está bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
El código está bajo [MIT](LICENSE).

---

**Dysrupción** — Yucatán Tech Community
