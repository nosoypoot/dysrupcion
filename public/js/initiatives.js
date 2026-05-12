(function () {
  'use strict';

  var container = document.getElementById('initiatives-list');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var allInitiatives = [];
  var currentTrack = 'todas';

  var MAX_DESCRIPTION = 160;

  function truncate(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max).trim() + '…';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function trackTagClass(track) {
    switch (track) {
      case 'Emprendimiento': return 'tag tag-pink';
      case 'Impacto Local': return 'tag tag-yellow';
      default: return 'tag tag-cyan';
    }
  }

  function renderInitiatives(initiatives) {
    container.innerHTML = '';

    if (!initiatives || initiatives.length === 0) {
      container.innerHTML = '<p class="empty-state">Aún no hay iniciativas publicadas en este track.</p>';
      return;
    }

    initiatives.forEach(function (ini) {
      var card = document.createElement('article');
      card.className = 'card initiative-card';

      var titleBlock = ini.website_url
        ? '<a class="initiative-title-link" href="' + escapeHtml(ini.website_url) + '" target="_blank" rel="noopener noreferrer"><h3 class="initiative-title">' + escapeHtml(ini.title) + ' ↗</h3></a>'
        : '<h3 class="initiative-title">' + escapeHtml(ini.title) + '</h3>';

      card.innerHTML =
        '<div class="initiative-header">' +
          titleBlock +
          '<span class="' + trackTagClass(ini.track) + '">' + escapeHtml(ini.track || '') + '</span>' +
        '</div>' +
        '<p class="initiative-tagline body-md">' + escapeHtml(ini.tagline || '') + '</p>' +
        '<p class="initiative-description body-sm text-muted">' + escapeHtml(truncate(ini.description, MAX_DESCRIPTION)) + '</p>' +
        '<p class="initiative-proposer body-sm">por ' + escapeHtml(ini.proposer_name || 'Anónimo') + '</p>' +
        (ini.looking_for
          ? '<p class="initiative-looking-for body-sm"><strong>Buscan:</strong> ' + escapeHtml(ini.looking_for) + '</p>'
          : '') +
        (ini.public_contact
          ? '<p class="initiative-contact body-sm text-muted">Contacto: ' + escapeHtml(ini.public_contact) + '</p>'
          : '');

      container.appendChild(card);
    });
  }

  function filterInitiatives(track) {
    if (track === 'todas') {
      renderInitiatives(allInitiatives);
    } else {
      var filtered = allInitiatives.filter(function (ini) {
        return ini.track === track;
      });
      renderInitiatives(filtered);
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTrack = btn.getAttribute('data-track');
      filterInitiatives(currentTrack);
    });
  });

  fetch('/api/initiatives')
    .then(function (res) {
      if (!res.ok) throw new Error('Error al cargar iniciativas');
      return res.json();
    })
    .then(function (data) {
      allInitiatives = data.initiatives || data || [];
      filterInitiatives(currentTrack);
    })
    .catch(function () {
      container.innerHTML = '<p class="empty-state">No pudimos cargar las iniciativas. Intenta de nuevo en un momento.</p>';
    });
})();
