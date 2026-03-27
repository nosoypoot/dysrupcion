/**
 * Shared layout: nav + footer for all pages.
 * Each page only needs <div id="site-nav"></div> and <div id="site-footer"></div>
 */

(function () {
  const currentPath = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  function isActive(href) {
    const clean = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    return clean === currentPath ? 'active' : '';
  }

  // Nav
  const nav = document.getElementById('site-nav');
  if (nav) {
    nav.innerHTML = `
    <header class="site-header">
      <nav class="site-nav" role="navigation" aria-label="Navegación principal">
        <a href="/" class="site-nav__logo">
          <img src="/img/logo-white.png" alt="Dysrupción" class="logo-dark" height="36">
          <img src="/img/logo-navy.png" alt="Dysrupción" class="logo-light" height="36">
        </a>

        <button class="site-nav__toggle" aria-label="Abrir menú" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <ul class="site-nav__links">
          <li><a href="/" class="${isActive('/')}">Manifiesto</a></li>
          <li><a href="/playbook" class="${isActive('/playbook')}">Playbook</a></li>
          <li><a href="/iniciativas" class="${isActive('/iniciativas')}">Iniciativas</a></li>
          <li><a href="/eventos" class="${isActive('/eventos')}">Eventos</a></li>
          <li><a href="/directorio" class="${isActive('/directorio')}">Directorio</a></li>
          <li><a href="/metricas" class="${isActive('/metricas')}">Métricas</a></li>
          <li>
            <button class="site-nav__theme" id="theme-toggle" aria-label="Cambiar tema">
              <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </li>
          <li><a href="/registro" class="site-nav__cta">Únete</a></li>
        </ul>
      </nav>
    </header>`;

    // Mobile toggle
    const toggle = nav.querySelector('.site-nav__toggle');
    const links = nav.querySelector('.site-nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
    }
  }

  // Footer
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span class="site-footer__brand">Dysrupción — Yucatán Tech Community</span>
        <ul class="site-footer__links">
          <li><a href="/">Manifiesto</a></li>
          <li><a href="/playbook">Playbook</a></li>
          <li><a href="/iniciativas">Iniciativas</a></li>
          <li><a href="/eventos">Eventos</a></li>
          <li><a href="/directorio">Directorio</a></li>
          <li><a href="/protocolo">Protocolo</a></li>
        </ul>
      </div>
    </footer>`;
  }

  // Theme toggle logic (works with theme-toggle.js or standalone)
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dysrupcion-theme', theme);
    var sun = document.querySelector('#theme-toggle .icon-sun');
    var moon = document.querySelector('#theme-toggle .icon-moon');
    if (sun && moon) {
      sun.style.display = theme === 'dark' ? 'block' : 'none';
      moon.style.display = theme === 'dark' ? 'none' : 'block';
    }
  }

  var saved = localStorage.getItem('dysrupcion-theme');
  if (!saved) {
    saved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  applyTheme(saved);

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
})();
