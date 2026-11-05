import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public');
const output = path.join(root, 'dist', 'review');

// Only replace this known, generated directory; never modify public/ or Wrangler.
if (path.relative(root, output) !== path.join('dist', 'review')) throw new Error('Unexpected review output path');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, {
  recursive: true,
  filter: file => file !== path.join(source, 'admin') && !file.startsWith(path.join(source, 'admin') + path.sep),
});

const banner = `<aside class="review-banner" role="note"><strong>Vista de revisión</strong><span>Datos de ejemplo. Usa información ficticia: los formularios son pruebas, no guardan datos ni envían correos.</span></aside>`;
const style = `<meta name="robots" content="noindex, nofollow, noarchive"><style>.review-banner{display:flex;justify-content:center;align-items:center;gap:8px 20px;flex-wrap:wrap;padding:12px 20px;background:#FFD100;color:#0B1120;font:12px/1.5 system-ui,sans-serif;text-align:center}.review-banner strong{font-weight:700;white-space:nowrap}</style>`;

async function labelPages(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await labelPages(file);
    else if (entry.name.endsWith('.html')) {
      let html = await readFile(file, 'utf8');
      html = html.replace(/<html\b/, '<html data-review="true"')
        .replace('</head>', style + '\n</head>')
        .replace(/(<body\b[^>]*>)/, '$1\n' + banner);
      if (entry.name === 'registro.html') {
        html = html.replace(/(<p class="form-footer"[^>]*>)[\s\S]*?<\/p>/,
          '$1Formulario de prueba: usa datos ficticios. No se guardan solicitudes ni se envían correos.</p>');
      }
      await writeFile(file, html);
    }
  }
}
await labelPages(output);
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('Vercel review built in dist/review (sample data, simulated forms, admin excluded).');
