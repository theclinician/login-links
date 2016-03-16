Meteor.users._ensureIndex(
  {'services.accessTokens.tokens.hashedToken': 1},
  {name: 'login-links:services.accessTokens'})


_.extend(LoginLinks, {

  _defaultExpirationInSeconds: 24 * 60 * 60, // 1 day

  setDefaultExpirationInSeconds (expiration) {
    this._defaultExpirationInSeconds = expiration
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
  } // end generateAccessToken

} // end _.extend(LoginLinks, ...)
