let getUserByToken = function(token) {
  check(token, String)

  hashedToken = Accounts._hashLoginToken token

  fields = {
    _id: 1,
    'services.accessTokens.tokens': {
      $elemMatch: {hashedToken}
    }
  }

  user = Meteor.users.findOne({
    'services.accessTokens.tokens.hashedToken': hashedToken
  }, fields)

  if (!user)
    throw new Meteor.Error('login-links/token-not-found')

  accessToken = new AccessToken(user.services.accessTokens.tokens[0])

  if (accessToken.isExpired)
    throw new Meteor.Error('login-links/token-expired',
                           accessToken.expirationReason)

  // if (accessToken.isRestricted())
  //   Roles._restrictAccess(user, accessToken)

  return user
}

Accounts.registerLoginHandler(function (loginRequest) {
  var token,
      hashedToken,
      fields,
      user,
      accessToken

  token = loginRequest['login-links/accessToken']

  if (!token)
    return undefined // don't handle

  user = getUserByToken(token)

  return {userId: user._id}
})



Meteor.methods({

  'login-links/connectionLogin': function (token) {
    var userId

    user = getUserByToken(token)

    this.setUserId(user._id)

    return userId
  }

})
