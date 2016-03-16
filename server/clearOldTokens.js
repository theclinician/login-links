let expireTokens = function() {
  Meteor.users.find({
    'services.accessTokens.tokens': {
      $exists: true,
      $ne: []
    }
  }).forEach(function(user) {
    for (let token of user.services.accessTokens.tokens) {
      accessToken = new AccessToken(rawToken)
      if (accessToken.isExpired) {
        Meteor.users.update(user._id, {$pull: token})
      }
    }
  })
}
  

Meteor.setInterval(function() {
  expireTokens()
}, 60 * 60 * 1000 // 1 hour
