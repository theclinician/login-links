Tinytest.add(
  'login-links - setDefaultExpirationInSeconds',
  function (test) {
    let expiration = 10
    LoginLinks.setDefaultExpirationInSeconds(expiration)
    token = new LoginLinks.AccessToken({hashedToken: 'a', when: 1})
    test.equal(token.getExpirationInSeconds(), expiration)
  }
)

Tinytest.add(
  'login-links - types work',
  function (test) {
    let month = 30 * 24 * 60 * 60 
    LoginLinks.setTypes({
      short: {expirationInSeconds: 10 * 60},
      long: {expirationInSeconds: month}
    });
    token = new LoginLinks.AccessToken({hashedToken: 'a', when: 1, type: 'long'})
    test.equal(token.getExpirationInSeconds(), month)
  }
)
    
Tinytest.add(
  'login-links - token expiration works',
  function (test) {
    let month = 30 * 24 * 60 * 60 
    token = new LoginLinks.AccessToken({hashedToken: 'a', when: 1, expirationInSeconds: month})
    test.equal(token.getExpirationInSeconds(), month)
  }
)
    
Tinytest.addAsync(
  'login-links - old tokens are cleared',
  function (test, done) {
    let user = Meteor.users.findOne()
    LoginLinks.generateAccessToken(user._id, {expirationInSeconds: 0})
    Meteor.setTimeout(function() {
      LoginLinks._expireTokens()
      Meteor.setTimeout(function(){
        let beforeCount = user.services.accessTokens.tokens.length
        let afterCount = Meteor.users.findOne(user._id).services.accessTokens.tokens.length
        test.equal(beforeCount, afterCount) // one added, one cleaned up
        done()
      }, 2000)
    }, 1000)
  }
)
