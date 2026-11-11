(() => {
  'use strict';

  const session = new Postmonger.Session();
  const deIdField = document.getElementById('deId');
  const errorField = document.getElementById('error');
  const guidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
  let payload = {};
  let initialized = false;

  function valid() {
    return guidPattern.test(deIdField.value.trim());
  }

  function updateButton() {
    session.trigger('updateButton', {
      button: 'next',
      enabled: initialized && valid()
      // Le Custom Entry Source non devono modificare il testo del tasto Next.
    });
  }

  session.on('initEvent', (data) => {
    payload = data || {};
    initialized = true;
    deIdField.value = payload.dataExtensionId || '';
    errorField.textContent = '';
    updateButton();
  });

  deIdField.addEventListener('input', () => {
    errorField.textContent = '';
    updateButton();
  });

  session.on('clickedNext', () => {
    if (!initialized || !valid()) {
      errorField.textContent = 'Inserisci un ObjectID GUID valido della Data Extension.';
      session.trigger('ready');
      updateButton();
      return;
    }

    payload.name = payload.name || 'External API Entry Source';
    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;
    payload.dataExtensionId = deIdField.value.trim(); // REQUISITO: campo a livello ROOT

    // Salva la definizione dell'evento, poi lascia proseguire il wizard Salesforce.
    session.trigger('updateEvent', payload);
    session.trigger('nextStep');
  });

  session.on('clickedBack', () => session.trigger('prevStep'));
  session.trigger('ready');
})();
