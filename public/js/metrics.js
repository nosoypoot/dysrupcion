(function () {
  'use strict';

  var dashboard = document.getElementById('metrics-dashboard');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderDashboard(data) {
    dashboard.innerHTML = '';

    // Metric cards
    var cardsSection = document.createElement('div');
    cardsSection.className = 'metrics-cards';

    var cards = [
      { label: 'Miembros', value: data.totalMembers || 0, color: 'pink' },
      { label: 'Iniciativas activas', value: data.activeInitiatives || 0, color: 'cyan' },
      { label: 'Tracks con coordinador', value: data.tracksWithCoordinator || 0, color: 'yellow' },
      { label: 'Eventos este mes', value: data.eventsThisMonth || 0, color: 'white' }
    ];

    cards.forEach(function (card) {
      var el = document.createElement('div');
      el.className = 'card metric-card metric-card-' + card.color;
      el.innerHTML =
        '<span class="metric-value display-md">' + card.value + '</span>' +
        '<span class="metric-label label">' + escapeHtml(card.label) + '</span>';
      cardsSection.appendChild(el);
    });

    dashboard.appendChild(cardsSection);

    // Members by origin bar chart
    if (data.membersByOrigin) {
      var chartSection = document.createElement('div');
      chartSection.className = 'card metrics-chart-section';
      chartSection.innerHTML = '<h2 class="display-sm">Miembros por origen</h2>';

      var origins = data.membersByOrigin;
      var total = (origins.local || 0) + (origins.foraneo || 0) + (origins.extranjero || 0);

      if (total > 0) {
        var bars = [
          { label: 'Local', count: origins.local || 0, color: 'cyan' },
          { label: 'Foraneo', count: origins.foraneo || 0, color: 'pink' },
          { label: 'Extranjero', count: origins.extranjero || 0, color: 'yellow' }
        ];

        var chartEl = document.createElement('div');
        chartEl.className = 'bar-chart';

        bars.forEach(function (bar) {
          var pct = Math.round((bar.count / total) * 100);
          var row = document.createElement('div');
          row.className = 'bar-row';
          row.innerHTML =
            '<span class="bar-label body-sm">' + bar.label + '</span>' +
            '<div class="bar-track">' +
              '<div class="bar-fill bar-fill-' + bar.color + '" style="width: ' + pct + '%"></div>' +
            '</div>' +
            '<span class="bar-pct mono">' + pct + '%</span>';
          chartEl.appendChild(row);
        });

        chartSection.appendChild(chartEl);
      }

      dashboard.appendChild(chartSection);
    }

    // Initiatives by track
    if (data.initiativesByTrack) {
      var trackSection = document.createElement('div');
      trackSection.className = 'card metrics-track-section';
      trackSection.innerHTML = '<h2 class="display-sm">Iniciativas por track</h2>';

      var dotsContainer = document.createElement('div');
      dotsContainer.className = 'track-dots';

      var trackColors = {
        producto: 'pink',
        ingenieria: 'cyan',
        diseno: 'yellow',
        datos: 'cyan',
        devops: 'pink',
        comunidad: 'yellow'
      };

      var tracks = data.initiativesByTrack;
      Object.keys(tracks).forEach(function (track) {
        var count = tracks[track];
        var color = trackColors[track.toLowerCase()] || 'cyan';
        var row = document.createElement('div');
        row.className = 'track-row';

        var dotsHtml = '';
        for (var i = 0; i < count; i++) {
          dotsHtml += '<span class="track-dot dot-' + color + '"></span>';
        }

        row.innerHTML =
          '<span class="track-name mono">' + escapeHtml(track) + '</span>' +
          '<div class="track-dot-group">' + dotsHtml + '</div>' +
          '<span class="track-count mono text-muted">' + count + '</span>';

        dotsContainer.appendChild(row);
      });

      trackSection.appendChild(dotsContainer);
      dashboard.appendChild(trackSection);
    }
  }

  // Fetch metrics on load
  fetch('/api/metrics')
    .then(function (res) {
      if (!res.ok) throw new Error('Error al cargar metricas');
      return res.json();
    })
    .then(function (data) {
      renderDashboard(data);
    })
    .catch(function () {
      dashboard.innerHTML = '<p class="empty-state">Sin datos aun.</p>';
    });
})();
