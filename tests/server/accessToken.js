Tinytest.add(
  'login-links: setDefaultExpirationInSeconds',
  function (test) {
    let expiration = 10
    LoginLinks.setDefaultExpirationInSeconds(expiration)
    token = new LoginLinks.AccessToken({hashedToken: 'a', when: 1})
    test.equal(token.getExpirationInSeconds(), expiration)
  }
)

Tinytest.add(
  'login-links: types work',
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
  'login-links: token expiration works',
  function (test) {
    let month = 30 * 24 * 60 * 60 
    token = new LoginLinks.AccessToken({hashedToken: 'a', when: 1, expirationInSeconds: month})
    test.equal(token.getExpirationInSeconds(), month)
  }
)
    
