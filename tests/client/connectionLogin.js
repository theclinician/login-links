Tinytest.addAsync(
  'login-links: throws not found error',
  function (test, done) {
    LoginLinks.connectionLogin('a', function (e, userId) {
      test.equal(e.error, 'login-links/token-not-found')
      test.isUndefined(userId)
      done()
    })
  }
)

Tinytest.addAsync(
  "login-links: expired token doesn't work",
  function (test, done) {
    createUserAndExpiringToken(function(targetId, token) {
      setTimeout(function() {
        LoginLinks.connectionLogin(token, function (e, userId) {
          test.equal(e.error, 'login-links/token-expired')
          test.isUndefined(userId)
          done()
        })
      }, 2000)
    })
  }
)

Tinytest.addAsync(
  'login-links: connectionLogin works',
  function (test, done) {
    createUserAndToken(function(targetId, token) {
      test.isNull(Meteor.userId())

      LoginLinks.connectionLogin(token, function (e, userId) {
        test.isUndefined(e)
        test.equal(userId, targetId)
        test.equal(Meteor.userId(), targetId)
        
        // didn't create a resume token
        test.equal(localStorage.getItem('Meteor.loginToken'), null)

        // also test server side of the connection
        Meteor.call('whoami', function(e, serverUserId) {
          test.equal(serverUserId, targetId)

          // after reconnect, should be logged out
          Meteor.disconnect()

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
        })
      })
    })
  }
)
