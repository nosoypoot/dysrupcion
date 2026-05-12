# Dysrupción — Innovación con Identidad

Sitio y protocolo de gobernanza para **Dysrupción**, la comunidad tech de Yucatán.

Dysrupción nació en 2022 con 4 personas preguntándose por qué la tecnología en Yucatán crece pero los yucatecos no crecen con ella. Hoy somos casi 400. Este repositorio contiene el sitio de la comunidad, el código de conducta, y un protocolo replicable para que cualquier comunidad tech regional pueda forkearlo y adaptarlo.

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
| `/codigo-de-conducta` | Código de conducta — pilares, 6 reglas, conflictos, contacto |
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

El código de conducta define:

- **4 pilares** — nombre real, acceso abierto, fuerza colectiva, sin agendas ocultas
- **6 reglas de convivencia** — colaborar > vender, humanxs antes que bots, temas relevantes, no spam, cero discursos de odio, actitud de ayuda
- **Proceso de conflictos** — resolución directa primero, escalado al equipo de moderación cuando hace falta
- **Consecuencias** — desde advertencia privada hasta expulsión permanente
- **Contacto** — `dysrupcion@gmail.com` para reportar o consultar

Documento completo en [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) y en `/codigo-de-conducta`. Adaptado del [Citizen Code of Conduct](https://github.com/stumpsyn/policies/blob/master/citizen_code_of_conduct.md) (CC BY-SA 3.0).

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

El contenido editorial (manifiesto, protocolo) está bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
El código de conducta está bajo [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) por compatibilidad con el Citizen Code of Conduct del que deriva.
El código fuente está bajo [MIT](LICENSE).

---

**Dysrupción** — Yucatán Tech Community
