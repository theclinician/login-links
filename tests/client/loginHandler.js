Tinytest.addAsync(
  'login-links - loginWithToken works',
  function (test, done) {
    createUserAndToken(function(targetId, token) {
      test.isNull(Meteor.userId())

      LoginLinks.loginWithToken(token, function (e) {
        test.isUndefined(e)
        test.equal(Meteor.userId(), targetId)
        
        // created a resume token
        test.equal(typeof localStorage.getItem('Meteor.loginToken'), 'string')

        // also test server side of the connection
        Meteor.call('whoami', function(e, serverUserId) {
          test.equal(serverUserId, targetId)

          // resume should happen after reconnect
          Meteor.disconnect()

          existingHook = Meteor.connection.onReconnect
          Meteor.connection.onReconnect = function() {
            existingHook()

            test.equal(Meteor.userId(), targetId)

            Meteor.call('whoami', function(e, serverUserId) {
              test.equal(serverUserId, targetId)
              
              done()
            })
          }

          Meteor.reconnect()
        })
      })
    })
  }
)
