Meteor.users._ensureIndex(
  {'services.accessTokens.tokens.hashedToken': 1},
  {name: 'login-links:services.accessTokens'})


_.extend(LoginLinks, {

  _defaultExpirationInSeconds: 24 * 60 * 60, // 1 day

  setDefaultExpirationInSeconds (expiration) {
    this._defaultExpirationInSeconds = expiration
  },

  setTypes (types) {
    this._accessTokenTypes = types
  }, 

  generateAccessToken (user, opts) {
    let stampedToken,
        hashStampedToken,
        update

    check(user, Match.OneOf(String, Object))
    check(opts, Match.Optional(Object))

    if ('string' === typeof user) {
      user = Meteor.users.findOne(
               {_id: user},
               {fields: {
                 'services.accessTokens': 1}})
      if (!user)
        throw new Error ("login-links error: user not found")

    } else if ('object' !== typeof user) {
      throw new Error ("login-links error: invalid user argument")
    }

    stampedToken = Accounts._generateStampedLoginToken()
    hashStampedToken = Accounts._hashStampedToken(stampedToken)

    if (opts)
      _.extend(hashStampedToken, opts)

    if (user.services.accessTokens)
      update = {
        $push: {
          'services.accessTokens.tokens': hashStampedToken
        }
      }
    else
      update = {
        $set: {
          'services.accessTokens.tokens': [hashStampedToken]
        }
      }

    Meteor.users.update(user._id, update)

    return stampedToken.token
  }, // end generateAccessToken

  _getUserByToken(token) {
    check(token, String)

    hashedToken = Accounts._hashLoginToken(token)

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

    accessToken = new LoginLinks.AccessToken(user.services.accessTokens.tokens[0])

    if (accessToken.isExpired)
      throw new Meteor.Error('login-links/token-expired',
                             accessToken.expirationReason)

    // if (accessToken.isRestricted())
    //   Roles._restrictAccess(user, accessToken)

    return user
  } // end _getUserByToken

}) // end _.extend(LoginLinks, ...)
