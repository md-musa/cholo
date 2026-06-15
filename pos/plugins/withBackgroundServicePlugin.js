// withBackgroundServicePlugin.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withBackgroundServicePlugin(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];

    const serviceName = 'com.asterinet.react.bgactions.RNBackgroundActionsTask';
    const alreadyExists = app.service?.some(
      (s) => s.$['android:name'] === serviceName
    );

    if (!alreadyExists) {
      app.service = [
        ...(app.service || []),
        {
          $: {
            'android:name': serviceName,
            'android:foregroundServiceType': 'location',
          },
        },
      ];
    }

    return config;
  });
};
