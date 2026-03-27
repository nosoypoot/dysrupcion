(function () {
  'use strict';

  var container = document.getElementById('members-list');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var allMembers = [];
  var currentTrack = 'todos';

  var ORIGIN_COLORS = {
    local: 'cyan',
    foraneo: 'pink',
    extranjero: 'yellow'
  };

  function getInitials(name) {
    return name
      .split(' ')
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .slice(0, 2)
      .join('');
  }

  function renderMembers(members) {
    container.innerHTML = '';

    if (!members || members.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay miembros registrados aun.</p>';
      return;
    }

    members.forEach(function (member) {
      var originColor = ORIGIN_COLORS[member.origin] || 'cyan';
      var row = document.createElement('div');
      row.className = 'member-row';
      row.innerHTML =
        '<div class="member-avatar avatar-' + originColor + '">' +
          getInitials(member.name) +
        '</div>' +
        '<div class="member-info">' +
          '<span class="member-name">' + escapeHtml(member.name) + '</span>' +
          '<span class="member-role text-muted">' + escapeHtml(member.role || '') + '</span>' +
        '</div>' +
        '<span class="tag tag-' + originColor + '">' + escapeHtml(member.origin || '') + '</span>';

      container.appendChild(row);
    });
  }

  function filterMembers(track) {
    if (track === 'todos') {
      renderMembers(allMembers);
    } else {
      var filtered = allMembers.filter(function (m) {
        return m.track && m.track.toLowerCase() === track.toLowerCase();
      });
      if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay miembros en este track.</p>';
      } else {
        renderMembers(filtered);
      }
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Filter button clicks
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTrack = btn.getAttribute('data-track');
      filterMembers(currentTrack);
    });
  });

  // Fetch members on load
  fetch('/api/members')
    .then(function (res) {
      if (!res.ok) throw new Error('Error al cargar miembros');
      return res.json();
    })
    .then(function (data) {
      allMembers = data.members || data || [];
      filterMembers(currentTrack);
    })
    .catch(function () {
      container.innerHTML = '<p class="empty-state">No hay miembros registrados aun.</p>';
    });
})();
