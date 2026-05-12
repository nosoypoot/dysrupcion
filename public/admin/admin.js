(function () {
  'use strict';

  var state = {
    applicationsStatus: 'pending',
    initiativesStatus: 'pending',
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function fmtDate(s) {
    if (!s) return '—';
    return s.replace('T', ' ').slice(0, 16);
  }

  function toast(message, type) {
    var el = document.createElement('div');
    el.className = 'admin-toast ' + (type || 'success');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }

  async function apiGet(path) {
    var res = await fetch(path, { credentials: 'include' });
    if (!res.ok) {
      var body = await res.json().catch(function () { return {}; });
      throw new Error(body.error || ('HTTP ' + res.status));
    }
    return res.json();
  }

  async function apiPost(path) {
    var res = await fetch(path, { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      var body = await res.json().catch(function () { return {}; });
      throw new Error(body.error || ('HTTP ' + res.status));
    }
    return res.json();
  }

  // ── Applications ───────────────────────────────────────────────────────

  function renderApplication(app) {
    var contratoTag = app.directorio_publico ? ' · acepta directorio público' : '';
    var actions = state.applicationsStatus === 'pending'
      ? '<div class="admin-actions">' +
          '<button class="btn-approve" data-action="approve" data-id="' + app.id + '">Aprobar</button>' +
          '<button class="btn-reject" data-action="reject" data-id="' + app.id + '">Rechazar</button>' +
        '</div>'
      : '<div class="admin-card-meta">Revisado por ' + escapeHtml(app.reviewed_by || '—') + ' el ' + fmtDate(app.reviewed_at) + '</div>';

    return '' +
      '<article class="admin-card" data-id="' + app.id + '">' +
        '<div class="admin-card-header">' +
          '<h3 class="admin-card-title">' + escapeHtml(app.nombre) + '</h3>' +
          '<span class="admin-card-meta">#' + app.id + ' · ' + fmtDate(app.created_at) + contratoTag + '</span>' +
        '</div>' +
        '<dl class="admin-fields">' +
          '<dt>Email</dt><dd><a href="mailto:' + escapeHtml(app.email) + '">' + escapeHtml(app.email) + '</a></dd>' +
          '<dt>WhatsApp</dt><dd>' + escapeHtml(app.whatsapp) + '</dd>' +
          '<dt>LinkedIn</dt><dd><a href="' + escapeHtml(app.linkedin) + '" target="_blank" rel="noopener">' + escapeHtml(app.linkedin) + '</a></dd>' +
          (app.github ? '<dt>GitHub</dt><dd><a href="' + escapeHtml(app.github) + '" target="_blank" rel="noopener">' + escapeHtml(app.github) + '</a></dd>' : '') +
          (app.origen ? '<dt>Origen</dt><dd>' + escapeHtml(app.origen) + '</dd>' : '') +
          (app.expertise ? '<dt>Rol</dt><dd>' + escapeHtml(app.expertise) + '</dd>' : '') +
          (app.referred_by ? '<dt>Referido por</dt><dd>' + escapeHtml(app.referred_by) + '</dd>' : '') +
        '</dl>' +
        '<dt class="admin-card-meta" style="margin-bottom: 0.25rem;">Motivación</dt>' +
        '<p class="admin-motivacion">' + escapeHtml(app.motivacion) + '</p>' +
        '<div style="margin-top: 1rem;">' + actions + '</div>' +
      '</article>';
  }

  async function loadApplications() {
    var container = document.getElementById('applications-list');
    container.innerHTML = '<p class="admin-empty">Cargando…</p>';
    try {
      var data = await apiGet('/api/admin/applications?status=' + encodeURIComponent(state.applicationsStatus));
      var apps = data.applications || [];
      if (apps.length === 0) {
        container.innerHTML = '<p class="admin-empty">No hay solicitudes ' + state.applicationsStatus + '.</p>';
        return;
      }
      container.innerHTML = apps.map(renderApplication).join('');
    } catch (err) {
      container.innerHTML = '<p class="admin-empty">Error: ' + escapeHtml(err.message) + '</p>';
    }
  }

  // ── Initiatives ────────────────────────────────────────────────────────

  function renderInitiative(ini) {
    var actions = state.initiativesStatus === 'pending'
      ? '<div class="admin-actions">' +
          '<button class="btn-approve" data-action="approve" data-id="' + ini.id + '">Aprobar y publicar</button>' +
          '<button class="btn-reject" data-action="reject" data-id="' + ini.id + '">Rechazar</button>' +
        '</div>'
      : '<div class="admin-card-meta">Revisado por ' + escapeHtml(ini.reviewed_by || '—') + ' el ' + fmtDate(ini.reviewed_at) + (ini.published_at ? ' · publicada ' + fmtDate(ini.published_at) : '') + '</div>';

    return '' +
      '<article class="admin-card" data-id="' + ini.id + '">' +
        '<div class="admin-card-header">' +
          '<h3 class="admin-card-title">' + escapeHtml(ini.title) + '</h3>' +
          '<span class="admin-card-meta">#' + ini.id + ' · ' + escapeHtml(ini.track) + ' · ' + fmtDate(ini.submitted_at) + '</span>' +
        '</div>' +
        '<p style="margin: 0 0 0.75rem; font-style: italic;">' + escapeHtml(ini.tagline) + '</p>' +
        '<p class="admin-motivacion" style="border-left-color: var(--accent-yellow, #ff0);">' + escapeHtml(ini.description) + '</p>' +
        '<dl class="admin-fields" style="margin-top: 1rem;">' +
          '<dt>Propuesto por</dt><dd>' + escapeHtml(ini.proposer_name) + ' &lt;<a href="mailto:' + escapeHtml(ini.proposer_email) + '">' + escapeHtml(ini.proposer_email) + '</a>&gt;</dd>' +
          (ini.website_url ? '<dt>Website</dt><dd><a href="' + escapeHtml(ini.website_url) + '" target="_blank" rel="noopener">' + escapeHtml(ini.website_url) + '</a></dd>' : '') +
          (ini.public_contact ? '<dt>Contacto público</dt><dd>' + escapeHtml(ini.public_contact) + '</dd>' : '') +
          (ini.looking_for ? '<dt>Buscan</dt><dd>' + escapeHtml(ini.looking_for) + '</dd>' : '') +
          (ini.launched_at ? '<dt>Lanzamiento</dt><dd>' + escapeHtml(ini.launched_at) + '</dd>' : '') +
          (ini.logo_url ? '<dt>Logo</dt><dd><a href="' + escapeHtml(ini.logo_url) + '" target="_blank" rel="noopener">' + escapeHtml(ini.logo_url) + '</a></dd>' : '') +
        '</dl>' +
        '<div style="margin-top: 1rem;">' + actions + '</div>' +
      '</article>';
  }

  async function loadInitiatives() {
    var container = document.getElementById('initiatives-list');
    container.innerHTML = '<p class="admin-empty">Cargando…</p>';
    try {
      var data = await apiGet('/api/admin/initiatives?review_status=' + encodeURIComponent(state.initiativesStatus));
      var inis = data.initiatives || [];
      if (inis.length === 0) {
        container.innerHTML = '<p class="admin-empty">No hay iniciativas ' + state.initiativesStatus + '.</p>';
        return;
      }
      container.innerHTML = inis.map(renderInitiative).join('');
    } catch (err) {
      container.innerHTML = '<p class="admin-empty">Error: ' + escapeHtml(err.message) + '</p>';
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────

  async function handleApplicationAction(id, action, button) {
    button.disabled = true;
    try {
      await apiPost('/api/admin/applications/' + id + '/' + action);
      toast(action === 'approve' ? 'Solicitud aprobada' : 'Solicitud rechazada', 'success');
      await loadApplications();
    } catch (err) {
      toast('Error: ' + err.message, 'error');
      button.disabled = false;
    }
  }

  async function handleInitiativeAction(id, action, button) {
    button.disabled = true;
    try {
      await apiPost('/api/admin/initiatives/' + id + '/' + action);
      toast(action === 'approve' ? 'Iniciativa publicada' : 'Iniciativa rechazada', 'success');
      await loadInitiatives();
    } catch (err) {
      toast('Error: ' + err.message, 'error');
      button.disabled = false;
    }
  }

  document.getElementById('applications-list').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    handleApplicationAction(btn.dataset.id, btn.dataset.action, btn);
  });

  document.getElementById('initiatives-list').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    handleInitiativeAction(btn.dataset.id, btn.dataset.action, btn);
  });

  // ── Tabs ───────────────────────────────────────────────────────────────

  document.querySelectorAll('.admin-tabs').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.admin-tab');
      if (!btn) return;
      group.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var target = group.dataset.target;
      var status = btn.dataset.status;
      if (target === 'applications') {
        state.applicationsStatus = status;
        loadApplications();
      } else if (target === 'initiatives') {
        state.initiativesStatus = status;
        loadInitiatives();
      }
    });
  });

  // ── Init ───────────────────────────────────────────────────────────────

  (async function init() {
    try {
      var me = await apiGet('/api/admin/me');
      document.getElementById('admin-email').textContent = me.email || '—';
    } catch (err) {
      document.getElementById('admin-email').textContent = 'No autenticado';
      toast('No autenticado. Configura Cloudflare Access para esta ruta.', 'error');
    }
    loadApplications();
    loadInitiatives();
  })();
})();
