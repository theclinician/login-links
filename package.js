Package.describe({
  name: 'loren:login-links',
  version: '0.1.0',
  summary: 'Send links that automatically login the user with OTPs (one-time passwords)',
  git: 'https://github.com/lorensr/login-links.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript',
           'underscore',
           'accounts-base',
           'mongo',
           'check']);

  api.addFiles('login-links.js');

  api.addFiles(['client/login-links.js'], 'client');

  api.addFiles(['server/accessToken.js',
                'server/login-links.js',
                'server/clearOldTokens.js',
                'server/connectionLogin.js',
                'server/loginHandler.js'], 'server');

  api.export('LoginLinks');
});

Package.onTest(function(api) {
  api.use(['loren:login-links',
           'ecmascript',
           'tinytest',
           'meteor-base',
           'accounts-password',
           'underscore']);

  api.addFiles('tests/helpers.js');

  api.addFiles(['tests/server/helpers.js',
                'tests/server/accessToken.js'], 'server');

  api.addFiles(['tests/client/helpers.js',
                'tests/client/loginHandler.js',
                'tests/client/connectionLogin.js'], 'client');
});
