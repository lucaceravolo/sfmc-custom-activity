(() => {
  'use strict';

  const session = new Postmonger.Session();
  const deIdField = document.getElementById('deId');
  const blockField = document.getElementById('blockField');
  const blockValue = document.getElementById('blockValue');
  const errorField = document.getElementById('error');
  const guidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

  let payload = {};
  let initialized = false;

  // Se entrambe le caselle sono vuote, la regola e' disabilitata.
  // Se una e' valorizzata, entrambe sono obbligatorie.
  function ruleIsValid() {
    const field = blockField.value.trim();
    const value = blockValue.value.trim();
    return (!field && !value) || (!!field && !!value);
  }

  function valid() {
    return guidPattern.test(deIdField.value.trim()) && ruleIsValid();
  }

  function updateButton() {
    session.trigger('updateButton', {
      button: 'next',
      enabled: initialized && valid()
    });
  }

  session.on('initEvent', (data) => {
    payload = data || {};
    initialized = true;

    deIdField.value = payload.dataExtensionId || '';
    const rule = payload.configurationArguments?.entryBlockRule || {};
    blockField.value = rule.field || '';
    blockValue.value = rule.value || '';

    errorField.textContent = '';
    updateButton();
  });

  for (const input of [deIdField, blockField, blockValue]) {
    input.addEventListener('input', () => {
      errorField.textContent = '';
      updateButton();
    });
  }

  session.on('clickedNext', () => {
    if (!initialized || !guidPattern.test(deIdField.value.trim())) {
      errorField.textContent = 'Inserisci un ObjectID GUID valido della Data Extension.';
      session.trigger('ready');
      updateButton();
      return;
    }
    if (!ruleIsValid()) {
      errorField.textContent = 'Per la regola di esclusione devi indicare sia il nome del campo sia il valore.';
      session.trigger('ready');
      updateButton();
      return;
    }

    payload.name = payload.name || 'External API Entry Source';
    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;
    payload.dataExtensionId = deIdField.value.trim();
    payload.configurationArguments = payload.configurationArguments || {};

    const field = blockField.value.trim();
    const value = blockValue.value.trim();
    if (field && value) {
      // Persistenza della configurazione nel modello della Entry Source.
      // Questo non crea un filtro eseguibile in Journey Builder.
      payload.configurationArguments.entryBlockRule = {
        field,
        operator: 'notEquals',
        value
      };
    } else {
      delete payload.configurationArguments.entryBlockRule;
    }

    session.trigger('updateEvent', payload);
    session.trigger('nextStep');
  });

  session.on('clickedBack', () => session.trigger('prevStep'));
  session.trigger('ready');
})();
