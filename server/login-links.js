Meteor.users._ensureIndex(
  {'services.accessTokens.tokens.hashedToken': 1},
  {name: 'login-links:services.accessTokens'})


_.extend(LoginLinks, {

  generateAccessToken(user, opts) {
    let stampedToken,
        hashStampedToken,
        update

    check(user, Match.OneOf(String, Object))
    check(opts, Match.Optional(Object))

    if ('string' === typeof user) {
      user = {_id: user}
    } else if ('object' !== typeof user) {
      throw new Error ("login-links error: invalid user argument")
    }

    stampedToken = Accounts._generateStampedLoginToken()
    hashStampedToken = Accounts._hashStampedToken(stampedToken)

    if (opts)
      _.extend(hashStampedToken, opts)

    Meteor.users.update(user._id, {
      $push: {
        'services.accessTokens.tokens': hashStampedToken
      }
    })

    return stampedToken.token
  }, // end generateAccessToken

  _tokenLoginHooks: [],

  onTokenLogin(hook) {
    this._tokenLoginHooks.push(hook)
  },

  _connectionHooks: [],

  onConnectionLogin(hook) {
    this._connectionHooks.push(hook)
  },

  _lookupToken(token) {
    check(token, String)

    let hashedToken = Accounts._hashLoginToken(token)

    // $elemMatch projection doens't work on nested fields
    fields = {
      _id: 1,
      'services.accessTokens.tokens': 1
    }

    user = Meteor.users.findOne({
      'services.accessTokens.tokens.hashedToken': hashedToken
    }, {fields})

    if (!user)
      throw new Meteor.Error('login-links/token-not-found')

    let savedToken = _.findWhere(user.services.accessTokens.tokens, {hashedToken})
    let accessToken = new LoginLinks.AccessToken(savedToken)

    if (accessToken.isExpired)
      throw new Meteor.Error('login-links/token-expired',
                             accessToken.expirationReason)

    return {user, savedToken}
  } // end _lookupToken

}) // end _.extend(LoginLinks, ...)
