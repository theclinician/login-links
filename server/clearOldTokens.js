LoginLinks._expireTokens = function() {
  Meteor.users.find({
    'services.accessTokens.tokens': {
      $exists: true,
      $ne: []
    }
  }).forEach(function(user) {
    for (let token of user.services.accessTokens.tokens) {
      accessToken = new LoginLinks.AccessToken(token)
      if (accessToken.isExpired) {
        Meteor.users.update(user._id, {
          $pull: {
            'services.accessTokens.tokens': {
              hashedToken: token.hashedToken
            }
          }
        })
      }
    }
  })
}
  

Meteor.setInterval(function() {
  LoginLinks._expireTokens()
}, 60 * 60 * 1000) // 1 hour
