(function () {
  'use strict';

  var container = document.getElementById('initiatives-list');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var allInitiatives = [];
  var currentTrack = 'todas';

  var MAX_DESCRIPTION = 120;

  function truncate(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max).trim() + '...';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderInitiatives(initiatives) {
    container.innerHTML = '';

    if (!initiatives || initiatives.length === 0) {
      container.innerHTML = '<p class="empty-state">Aun no hay iniciativas en este track.</p>';
      return;
    }

    initiatives.forEach(function (ini) {
      var card = document.createElement('div');
      card.className = 'card initiative-card';
      card.innerHTML =
        '<div class="initiative-header">' +
          '<h3 class="initiative-title">' + escapeHtml(ini.title) + '</h3>' +
          '<span class="tag tag-cyan">' + escapeHtml(ini.track || '') + '</span>' +
        '</div>' +
        '<p class="initiative-proposer text-muted body-sm">por ' + escapeHtml(ini.proposer || 'Anonimo') + '</p>' +
        '<p class="initiative-description body-sm">' + escapeHtml(truncate(ini.problem, MAX_DESCRIPTION)) + '</p>' +
        (ini.beneficiary
          ? '<span class="tag tag-yellow initiative-beneficiary">' + escapeHtml(ini.beneficiary) + '</span>'
          : '');

      container.appendChild(card);
    });
  }

  function filterInitiatives(track) {
    if (track === 'todas') {
      renderInitiatives(allInitiatives);
    } else {
      var filtered = allInitiatives.filter(function (ini) {
        return ini.track && ini.track.toLowerCase() === track.toLowerCase();
      });
      renderInitiatives(filtered);
    }
  }

  // Filter button clicks
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTrack = btn.getAttribute('data-track');
      filterInitiatives(currentTrack);
    });
  });

  // Fetch initiatives on load
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
      container.innerHTML = '<p class="empty-state">Aun no hay iniciativas en este track.</p>';
    });
})();
