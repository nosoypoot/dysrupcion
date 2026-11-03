(function () {
  'use strict';
  var container = document.getElementById('landing-events');
  if (!container) return;

  function emptyState(failed) {
    container.replaceChildren();
    var panel = document.createElement('div');
    panel.className = 'events-empty';
    var icon = document.createElement('span');
    icon.className = 'empty-calendar';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '↗';
    var copy = document.createElement('div');
    var title = document.createElement('h3');
    title.textContent = failed ? 'La agenda no está disponible por ahora.' : 'El próximo encuentro se está cocinando.';
    var description = document.createElement('p');
    description.textContent = failed ? 'Intenta de nuevo para consultar los próximos encuentros.' : 'Aún no hay fechas anunciadas. Súmate a la comunidad para enterarte de lo que sigue.';
    copy.append(title, description);
    var action = document.createElement(failed ? 'button' : 'a');
    action.className = 'inline-link';
    action.textContent = failed ? 'Reintentar ↻' : 'Quiero enterarme ↗';
    if (failed) {
      action.type = 'button';
      action.addEventListener('click', loadEvents);
    } else {
      action.href = '/registro';
    }
    panel.append(icon, copy, action);
    container.append(panel);
  }

  function renderEvent(event) {
    var date = new Date(event.date);
    var href;
    try {
      var url = new URL(event.source_url);
      if (url.protocol === 'https:' || url.protocol === 'http:') href = url.href;
    } catch (_) { /* Events without a valid source remain readable. */ }
    var card = document.createElement(href ? 'a' : 'article');
    card.className = 'landing-event';
    if (href) {
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    var time = document.createElement('time');
    time.dateTime = date.toISOString();
    time.textContent = new Intl.DateTimeFormat('es-MX', { day: '2-digit', timeZone: 'America/Merida' }).format(date);
    var month = document.createElement('span');
    month.textContent = new Intl.DateTimeFormat('es-MX', { month: 'short', timeZone: 'America/Merida' }).format(date).replace('.', '').toUpperCase();
    time.append(month);
    var copy = document.createElement('div');
    var title = document.createElement('h3');
    title.textContent = event.title;
    var meta = document.createElement('p');
    meta.textContent = [event.location, new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Merida' }).format(date) + ' h · Yucatán'].filter(Boolean).join(' · ');
    copy.append(title, meta);
    card.append(time, copy);
    if (href) {
      var link = document.createElement('span');
      link.className = 'event-link-label';
      link.textContent = 'Ver encuentro ↗';
      card.append(link);
    }
    return card;
  }

  async function loadEvents() {
    container.setAttribute('aria-busy', 'true');
    try {
      var response = await fetch('/api/events');
      if (!response.ok) throw new Error('Events unavailable');
      var data = await response.json();
      if (!Array.isArray(data.events)) throw new Error('Invalid events response');
      var events = data.events.filter(function (event) {
        return event && typeof event.title === 'string' && new Date(event.date).getTime() > Date.now();
      }).sort(function (a, b) { return new Date(a.date) - new Date(b.date); }).slice(0, 3);
      if (events.length) container.replaceChildren.apply(container, events.map(renderEvent));
      else emptyState(false);
    } catch (_) {
      emptyState(true);
    } finally {
      container.setAttribute('aria-busy', 'false');
    }
  }
  loadEvents();
})();
