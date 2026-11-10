(() => {
  'use strict';
  const session = new Postmonger.Session();
  const field = document.getElementById('message');
  const error = document.getElementById('error');
  let payload = {};

  session.on('initActivity', (data) => {
    payload = data || {};
    const inputs = payload.arguments?.execute?.inArguments || [];
    const saved = inputs.find(item => item && Object.prototype.hasOwnProperty.call(item, 'message'));
    field.value = saved?.message || 'Attività di test';
    session.trigger('updateButton', { button: 'next', text: 'done', enabled: true });
  });

  function save() {
    const message = field.value.trim();
    if (!message) {
      error.textContent = 'Inserisci un messaggio prima di salvare.';
      session.trigger('ready');
      return;
    }
    error.textContent = '';
    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.arguments.execute.inArguments = [
      { contactKey: '{{Contact.Key}}' },
      { message }
    ];
    session.trigger('updateActivity', payload);
  }

  session.on('clickedNext', save);
  session.on('clickedDone', save);
  session.trigger('ready');
})();
