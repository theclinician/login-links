Tinytest.addAsync(
  'login-links: connectionLogin',
  function (test, done) {
    test.isNull(Meteor.userId())

    LoginLinks.connectionLogin('a', function (e, userId) {
      test.isFalse(e)
      test.equal(userId, 'foo')
      test.equal(Meteor.userId(), 'foo')
      done()
    })
  }
)
