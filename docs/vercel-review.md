# Revisión en Vercel, producción en Cloudflare

Vercel sirve una copia de revisión del sitio. Cloudflare Workers + D1 conserva el
flujo real de registro. Ambos usan el mismo frontend en `public/`.

## Probar antes de subir

```bash
npm ci
npm run typecheck
npm test
npm run preview:review
```

Abre `http://127.0.0.1:8788`. Este servidor local usa el mismo resultado estático y
la misma función de revisión que Vercel. No reproduce el runtime ni el CDN de Vercel.

## Configuración de Vercel

Importa el fork [`crismxiex/dysrupcion`](https://github.com/crismxiex/dysrupcion)
en un proyecto **separado**, por ejemplo
`dysrupcion-review`, con estos ajustes (declarados en `vercel.json`):

| Ajuste | Valor |
| --- | --- |
| Framework preset | Other |
| Root directory | Raíz del repositorio |
| Build command | `npm run build:review` |
| Output directory | `dist/review` |

No configures credenciales de Cloudflare, D1, Resend ni administración. La función
`api/review.ts` es siempre una simulación y no lee variables de entorno ni conecta
con el Worker de producción. No hay que configurar una base de datos para revisar.

La CLI puede subir los cambios locales sin hacer push al repositorio:

```bash
npx vercel login
npx vercel deploy --target=preview
```

Selecciona el proyecto de revisión, no un proyecto de producción existente.
**La primera implementación de un proyecto nuevo se clasifica como Production en
Vercel, incluso con `--target=preview`.** En este repositorio eso sigue ejecutando
únicamente la simulación, sin afectar Cloudflare. Si el requisito es no crear
ninguna implementación con la etiqueta Production, conserva la revisión local.

Para implementaciones posteriores, usa una rama de revisión o `--target=preview`.
No conectes el dominio de la comunidad al proyecto de revisión. Si necesitas
restringir quién puede abrir el enlace, configura Deployment Protection en Vercel;
`noindex` por sí solo no restringe el acceso.

## Qué pueden revisar

- Landing, navegación, temas y adaptación a móvil.
- Eventos, iniciativas, directorio y métricas con datos de ejemplo.
- Registro con la misma validación que Cloudflare y confirmación explícita de prueba.
- Formularios de eventos e iniciativas con confirmaciones simuladas.

Usa datos ficticios: los formularios transmiten la petición a la función de Vercel
para validarla, pero no guardan solicitudes, publican contenidos ni envían correos.
La simulación no prueba persistencia, duplicados, moderación o entrega de emails.
El panel de administración se excluye y la extracción de enlaces externos está
desactivada; los datos de eventos se pueden introducir manualmente.

Cada página generada lleva un aviso de revisión. Se añaden `robots.txt`, meta
`noindex` y la cabecera `X-Robots-Tag`. El build escribe sólo en `dist/review` y no
modifica los HTML originales ni `wrangler.toml`.

## Después de aprobar la revisión

El despliegue real sigue usando `npm run deploy`, que ejecuta `wrangler deploy`.
Esa operación publica en Cloudflare y se ejecuta sólo cuando se autorice el lanzamiento.
Cloudflare sirve `public/`, sin el aviso ni los datos simulados de Vercel, y usa
las rutas reales de `src/index.ts` con D1. La validación de registro se comparte en
`src/lib/registration.ts` para evitar diferencias entre ambas plataformas.

Antes del lanzamiento, verifica las migraciones y el registro en un entorno de
Cloudflare de pruebas, configura los secretos necesarios y reemplaza los eventos
de ejemplo de `src/lib/mock-data.ts` por encuentros confirmados.

Referencias: [funciones Node.js](https://vercel.com/docs/functions/runtimes/node-js),
[configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json),
[primera implementación](https://vercel.com/docs/deployments/environments#first-deployment).
