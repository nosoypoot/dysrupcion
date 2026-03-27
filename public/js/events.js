(function () {
  'use strict';

  var container = document.getElementById('events-list');
  var scrapeBtn = document.getElementById('scrape-btn');
  var scrapeUrl = document.getElementById('scrape-url');
  var previewSection = document.getElementById('event-preview');
  var manualFields = document.getElementById('manual-fields');

  var MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '--', month: '---' };
    return {
      day: d.getDate(),
      month: MONTHS[d.getMonth()]
    };
  }

  function renderEvents(events) {
    if (!container) return;
    container.innerHTML = '';

    if (!events || events.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay eventos programados.</p>';
      return;
    }

    events.forEach(function (event) {
      var date = formatDate(event.date);
      var card = document.createElement('div');
      card.className = 'card event-card';
      card.innerHTML =
        '<div class="event-date-block">' +
          '<span class="event-day display-sm">' + date.day + '</span>' +
          '<span class="event-month mono label">' + date.month + '</span>' +
        '</div>' +
        '<div class="event-info">' +
          '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>' +
          '<span class="event-location text-muted body-sm">' + escapeHtml(event.location || '') + '</span>' +
        '</div>' +
        '<div class="event-tags">' +
          (event.source
            ? '<span class="tag tag-cyan mono">via ' + escapeHtml(event.source) + '</span>'
            : '') +
          (event.track
            ? '<span class="tag tag-cyan">' + escapeHtml(event.track) + '</span>'
            : '') +
        '</div>';

      container.appendChild(card);
    });
  }

  // Scrape button handler
  if (scrapeBtn && scrapeUrl) {
    scrapeBtn.addEventListener('click', function () {
      var url = scrapeUrl.value.trim();
      if (!url) return;

      scrapeBtn.disabled = true;
      scrapeBtn.textContent = 'Extrayendo...';

      fetch('/api/events/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('No se pudo extraer datos');
          return res.json();
        })
        .then(function (data) {
          // Show preview with scraped data, hide manual fields
          if (previewSection) {
            previewSection.classList.remove('hidden');
            previewSection.innerHTML =
              '<div class="card">' +
                '<h3 class="display-sm">' + escapeHtml(data.title) + '</h3>' +
                '<p class="body-sm text-muted">' + escapeHtml(data.date) + '</p>' +
                '<p class="body-sm text-muted">' + escapeHtml(data.location) + '</p>' +
                '<p class="body-sm">' + escapeHtml(data.description) + '</p>' +
                '<span class="tag tag-cyan mono">via ' + escapeHtml(data.source || url) + '</span>' +
              '</div>';
          }
          if (manualFields) {
            manualFields.classList.add('hidden');
          }
        })
        .catch(function () {
          // Show manual fields on scrape failure
          if (previewSection) {
            previewSection.classList.add('hidden');
          }
          if (manualFields) {
            manualFields.classList.remove('hidden');
          }
        })
        .finally(function () {
          scrapeBtn.disabled = false;
          scrapeBtn.textContent = 'Extraer datos';
        });
    });
  }

  // Fetch events on load
  if (container) {
    fetch('/api/events')
      .then(function (res) {
        if (!res.ok) throw new Error('Error al cargar eventos');
        return res.json();
      })
      .then(function (data) {
        var events = data.events || data || [];
        renderEvents(events);
      })
      .catch(function () {
        container.innerHTML = '<p class="empty-state">No hay eventos programados.</p>';
      });
  }
})();
