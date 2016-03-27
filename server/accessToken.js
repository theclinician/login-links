class AccessToken {

  constructor(token) {
    if (!token.hashedToken || !token.when)
      throw new Meteor.Error('login-links error: access token is missing a field')

    _.extend(this, token)
  }

  get typeConfig() {
    let config
    
    if (this.type)
      config = LoginLinks._accessTokenTypes[this.type]
    
    return config || {}
  }

  getExpirationInSeconds() {
    // l('getExpirationInSeconds', this.type, LoginLinks._accessTokenTypes, this.typeConfig)
    return this.expirationInSeconds ||
      this.typeConfig.expirationInSeconds ||
      LoginLinks._defaultExpirationInSeconds
  }

  get expiresAt() {
    let expirationInMilliseconds = this.getExpirationInSeconds() * 1000
    return this.when.getTime() + expirationInMilliseconds
  }

  get isExpired() {
    return this.expiresAt < Date.now()
  }

  get expirationReason() {
    let reason = 'This '
          + this.type
          + ' access token has a '
          + this.getExpirationInSeconds()
          + '-second expiry, and expired at '
          + this.expiresAt
    return reason
  }

}

AccessToken.getCustomFields = function(token) {
  return _.omit(token, 'when', 'hashedToken')
}

LoginLinks.AccessToken = AccessToken
