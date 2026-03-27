(function () {
  'use strict';

  var STORAGE_KEY = 'dysrupcion-theme';
  var html = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateIcon(theme);
  }

  function updateIcon(theme) {
    if (!toggle) return;
    // Moon for dark, sun for light
    var icon = toggle.querySelector('.theme-toggle-icon');
    if (!icon) return;
    if (theme === 'dark') {
      icon.textContent = '\u263D'; // moon
    } else {
      icon.textContent = '\u2600'; // sun
    }
  }

  // Initialize
  apply(getPreferred());

  // Toggle on click
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') || 'dark';
      apply(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  }
})();
