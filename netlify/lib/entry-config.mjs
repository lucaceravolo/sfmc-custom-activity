/**
 * Configurazione della Custom Entry Source. Nessun segreto qui.
 * Per gli eventi la proprietà dataExtensionId viene passata da Postmonger
 * a livello ROOT in updateEvent; NON usare execute, che è per le Activities.
 */
export const entryTemplate = {
  key: '__ENTRY_KEY__',
  workflowApiVersion: '1.1',
  type: 'EVENT',
  metaData: {
    icon: '__BASE_URL__/entry-source-v1/images/icon.svg',
    isConfigured: false
  },
  lang: {
    'it-IT': {
      name: 'External API Entry Source',
      description: 'Sorgente evento API associata a una Data Extension esistente',
      deLabel: 'Data Extension (ObjectID)',
      sourceLabel: 'Sorgente'
    },
    'en-US': {
      name: 'External API Entry Source',
      description: 'API entry source linked to an existing Data Extension',
      deLabel: 'Data Extension (ObjectID)',
      sourceLabel: 'Source'
    }
  },
  arguments: {},
  configurationArguments: {
    applicationExtensionKey: '__ENTRY_KEY__'
  },
  userInterfaces: {
    configModal: {
      url: '__BASE_URL__/entry-source-v1/index.html'
    },
    summary: [
      { label: 'deLabel', valuePath: 'dataExtensionId' },
      { label: 'sourceLabel', valuePath: 'name' }
    ]
  }
};
