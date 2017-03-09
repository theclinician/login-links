Meteor.users._ensureIndex(
  {'services.accessTokens.tokens.hashedToken': 1},
  {name: 'login-links:services.accessTokens'})


_.extend(LoginLinks, {

  _config: {},

  config(config){
    this._config = _.extend({}, config)
  },

  /**
   * Generate a token to send and later use for loginWithToken or connectionLogin
   * @param {string|object} user
   * @param {object} opts - `{type: String}` or `{expirationInSeconds: Integer}`. Any additional fields in `opts` will be copied to the stored token that is provided to any hooks.
   */
  generateAccessToken(user, opts) {
    let stampedToken,
        hashStampedToken,
        update

    check(user, Match.OneOf(String, Object), '`user` must be a string or basic object')
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

    //console.log({hashStampedToken})

    return stampedToken.token
  }, // end generateAccessToken

  /**
   * @callback loginHook
   * @param {string} token
   * @param {object} user - only contains `_id` and `services.accessTokens.tokens`
   */

  _tokenLoginHooks: [],

  /**
   * When loginWithToken is used to successfully login a user, this hook is called before completion.
   * @param {loginHook} hook
   */
  onTokenLogin(hook) {
    this._tokenLoginHooks.push(hook)
  },

  _connectionHooks: [],

  /**
   * When connectionLogin is used to successfully login a user, this hook is called before completion. If you return an object, the object's fields will be added to the `data` object that is passed to the client connectionLogin callback.
   * @param {loginHook} hook
   */
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
