(function () {
  'use strict';
  var form = document.getElementById('register-form');
  if (!form) return;
  var message = document.getElementById('form-message');
  var submit = form.querySelector('button[type="submit"]');
  var sending = false;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (sending) return;
    // Trim before native validation so a space cannot satisfy a required field.
    form.querySelectorAll('input:not([type="checkbox"]), textarea').forEach(function (field) {
      field.value = field.value.trim();
    });
    if (!form.reportValidity()) return;

    sending = true;
    submit.disabled = true;
    submit.textContent = 'Enviando solicitud…';
    form.setAttribute('aria-busy', 'true');
    message.hidden = true;
    var data = Object.fromEntries(new FormData(form));
    data.contrato = form.elements.contrato.checked;
    data.directorio = form.elements.directorio.checked;
    try {
      var response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      var result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || 'No pudimos guardar tu solicitud. Intenta de nuevo.');
      }
      form.reset();
      form.hidden = true;
      var success = document.getElementById('registration-success');
      if (result.review === true) {
        success.querySelector('h2').textContent = 'Prueba completada.';
        success.querySelector('p').textContent = result.message;
      }
      success.hidden = false;
      success.focus();
    } catch (error) {
      message.textContent = error instanceof TypeError || error instanceof SyntaxError
        ? 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo; conservamos tus respuestas.'
        : error.message;
      message.className = 'form-message error';
      message.hidden = false;
      message.focus();
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Enviar mi solicitud ↗';
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
