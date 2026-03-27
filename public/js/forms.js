(function () {
  'use strict';

  var forms = document.querySelectorAll('form[data-api]');

  forms.forEach(function (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var apiEndpoint = form.getAttribute('data-api');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Client-side validation: check required fields
      var requiredFields = form.querySelectorAll('[required]');
      var valid = true;
      requiredFields.forEach(function (field) {
        field.classList.remove('input-error');
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('input-error');
        }
      });

      if (!valid) {
        showAlert(form, 'error', 'Por favor completa todos los campos requeridos.');
        return;
      }

      // Disable button to prevent double-submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        submitBtn.textContent = 'Enviando...';
      }

      // Collect form data
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // POST to API
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (body) {
              throw new Error(body.error || 'Error al enviar. Intenta de nuevo.');
            });
          }
          return res.json();
        })
        .then(function () {
          showAlert(form, 'success', 'Enviado correctamente.');
          form.reset();
        })
        .catch(function (err) {
          showAlert(form, 'error', err.message);
        })
        .finally(function () {
          // Re-enable button after 2 seconds
          setTimeout(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Enviar';
            }
          }, 2000);
        });
    });
  });

  function showAlert(form, type, message) {
    // Remove existing alerts
    var existing = form.querySelector('.alert');
    if (existing) existing.remove();

    var alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;

    // Insert before submit button or at end of form
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(alert, submitBtn);
    } else {
      form.appendChild(alert);
    }

    // Auto-dismiss success alerts after 4 seconds
    if (type === 'success') {
      setTimeout(function () {
        if (alert.parentNode) alert.remove();
      }, 4000);
    }
  }
})();
