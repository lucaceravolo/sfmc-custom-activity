/* Configurazione della Custom Activity. Non inserire segreti in questo modulo. */
export const template = {
  "key": "__ACTIVITY_KEY__",
  "workflowApiVersion": "1.1",
  "type": "Rest",
  "metaData": {
    "category": "custom",
    "isConfigured": false,
    "configOnDrop": true,
    "icon": "__BASE_URL__/activity/images/icon.svg"
  },
  "lang": {
    "it-IT": {
      "name": "Node.js Demo Activity",
      "description": "Esempio di Custom Activity con Node.js"
    },
    "en-US": {
      "name": "Node.js Demo Activity",
      "description": "Example custom activity with Node.js"
    }
  },
  "arguments": {
    "execute": {
      "url": "__BASE_URL__/.netlify/functions/execute",
      "verb": "POST",
      "useJwt": true,
      "timeout": 10000,
      "retryCount": 0,
      "concurrentRequests": 4,
      "inArguments": [
        {
          "contactKey": "{{Contact.Key}}"
        },
        {
          "message": "Messaggio di esempio"
        }
      ],
      "outArguments": []
    }
  },
  "configurationArguments": {
    "applicationExtensionKey": "__ACTIVITY_KEY__",
    "save": {
      "url": "__BASE_URL__/.netlify/functions/lifecycle?event=save",
      "useJwt": true
    },
    "validate": {
      "url": "__BASE_URL__/.netlify/functions/lifecycle?event=validate",
      "useJwt": true
    },
    "publish": {
      "url": "__BASE_URL__/.netlify/functions/lifecycle?event=publish",
      "useJwt": true
    },
    "stop": {
      "url": "__BASE_URL__/.netlify/functions/lifecycle?event=stop",
      "useJwt": true
    },
    "unpublish": {
      "url": "__BASE_URL__/.netlify/functions/lifecycle?event=unpublish",
      "useJwt": true
    }
  },
  "userInterfaces": {
    "configModal": {
      "url": "__BASE_URL__/activity/index.html",
      "height": 420,
      "width": 620
    }
  },
  "wizardSteps": [
    {
      "label": "Configurazione",
      "key": "step1",
      "active": true
    }
  ],
  "schema": {
    "arguments": {
      "execute": {
        "inArguments": [
          {
            "contactKey": {
              "dataType": "Text",
              "isNullable": false,
              "direction": "in",
              "access": "visible"
            }
          },
          {
            "message": {
              "dataType": "Text",
              "isNullable": false,
              "direction": "in",
              "access": "visible"
            }
          }
        ],
        "outArguments": []
      }
    }
  }
};
