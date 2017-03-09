Tinytest.addAsync(
  'login-links - throws not found error',
  function (test, done) {
    resetLoginLinks()

    LoginLinks.connectionLogin('a', function (e, data) {
      test.equal(e.error, 'login-links/token-not-found')
      test.isUndefined(data)
      done()
    })
  }
)

Tinytest.addAsync(
  'login-links - updates Accounts.loggingIn()',
  function (test, done) {
    resetLoginLinks()

    test.isFalse(Accounts.loggingIn())
    LoginLinks.connectionLogin('a', function (e, data) {
      test.isFalse(Accounts.loggingIn())
      done()
    })
    test.isTrue(Accounts.loggingIn())
  }
)

Tinytest.addAsync(
  "login-links - expired token doesn't work",
  function (test, done) {
    resetLoginLinks()

    createUserAndExpiringToken(function(targetId, token) {
      setTimeout(function() {
        LoginLinks.connectionLogin(token, function (e, data) {
          test.equal(e.error, 'login-links/token-expired')
          test.isUndefined(data)
          done()
        })
      }, 2000)
    })
  }
)

Tinytest.addAsync(
  "login-links - expired token doesn't reconnect",
  function (test, done) {
    createUserAndExpiringToken(function(targetId, token) {
      LoginLinks.connectionLogin(token, function (e, data) {
        setTimeout(function(){
          // after reconnect, should be logged out
          Meteor.disconnect()

          // re-setup hook because might have been overwritten by
          // loginWithPassword in previous test
          Meteor.connection.onReconnect = null
          LoginLinks._setupHook()

          existingHook = Meteor.connection.onReconnect
          Meteor.connection.onReconnect = function() {
            existingHook()

            test.equal(Meteor.userId(), null)

            Meteor.call('whoami', function(e, serverUserId) {
              test.equal(serverUserId, null)

              done()
            })
          }

          Meteor.reconnect()
        }, 2000)
      })
    })
  }
)

Tinytest.addAsync(
  'login-links - connectionLogin logs out on logout',
  function (test, done) {
    createUserAndToken(function(targetId, token) {
      LoginLinks.connectionLogin(token, function (e, {userId}) {
        Meteor.logout(function (e) {
          test.isUndefined(e)
          test.isNull(Meteor.userId())
          test.isNull(localStorage.getItem('login-links/connectionToken'))

          Meteor.call('whoami', function(e, serverUserId) {
            test.isNull(serverUserId)

            done()
          })
        })
      })
    })
  }
)

Tinytest.addAsync(
  'login-links - connectionLogin works',
  function (test, done) {
    resetLoginLinks()
    createUserAndToken(function(targetId, token) {
      test.isNull(Meteor.userId())

      LoginLinks.connectionLogin(token, function (e, {userId}) {
        test.isUndefined(e)
        test.equal(userId, targetId)
        test.equal(Meteor.userId(), targetId)

        // didn't create a resume token
        test.equal(localStorage.getItem('Meteor.loginToken'), null)

        // also test server side of the connection
        Meteor.call('whoami', function(e, serverUserId) {
          test.equal(serverUserId, targetId)

          // after reconnect, should automatically connectionLogin
          Meteor.disconnect()

          // re-setup hook because might have been overwritten by
          // loginWithPassword in previous test
          Meteor.connection.onReconnect = null
          LoginLinks._setupHook()

          existingHook = Meteor.connection.onReconnect
          Meteor.connection.onReconnect = function() {
            existingHook()

            test.isTrue(Accounts.loggingIn())

            setTimeout(function(){
              test.equal(Meteor.userId(), targetId)

              Meteor.call('whoami', function(e, serverUserId) {
                test.equal(serverUserId, targetId)

                done()
              })
            }, 1000)
          }

          Meteor.reconnect()
        })
      })
    })
  }
)

Tinytest.addAsync(
    'login-links - additionalAuth is used properly',
    function (test, done) {
      resetLoginLinks()
      setAdditionalAuthAccessor('additionalAuth', 'additionalAuth')
      createUserAndToken(function(targetId, token) {
        test.isNull(Meteor.userId())

        LoginLinks.connectionLogin(token, function (e, {userId}) {
          test.isUndefined(e)
          test.equal(userId, targetId)
          test.equal(Meteor.userId(), targetId)

          // didn't create a resume token
          test.equal(localStorage.getItem('Meteor.loginToken'), null)

          // also test server side of the connection
          Meteor.call('whoami', function(e, serverUserId) {
            test.equal(serverUserId, targetId)

            // after reconnect, should automatically connectionLogin
            Meteor.disconnect()

            // re-setup hook because might have been overwritten by
            // loginWithPassword in previous test
            Meteor.connection.onReconnect = null
            LoginLinks._setupHook()

            existingHook = Meteor.connection.onReconnect
            Meteor.connection.onReconnect = function() {
              existingHook()

              test.isTrue(Accounts.loggingIn())

              setTimeout(function(){
                test.equal(Meteor.userId(), targetId)

                Meteor.call('whoami', function(e, serverUserId) {
                  test.equal(serverUserId, targetId)

                  done()
                })
              }, 1000)
            }

            Meteor.reconnect()
          })
        })
      })
    }
)

Tinytest.addAsync(
    'login-links - additionalAuth denies with wrong auth',
    function (test, done) {
      resetLoginLinks()
      setAdditionalAuthAccessor('additionalAuth', 'notAdditionalAuth')
      createUserAndToken(function(targetId, token) {
        setTimeout(function() {
          try {
            LoginLinks.connectionLogin(token, function (e, {userId}) {
              test.equal(e.error, 'login-links/token-expired')
              test.isUndefined(data)
              done()
            })
          }catch(err){
            done()
          }
      }, 2000)
    })
    }
)
