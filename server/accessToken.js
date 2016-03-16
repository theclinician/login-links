class AccessToken {

  constructor(token) {
    if (!token.hashedToken || !token.when)
      throw new Meteor.Error('login-links error: access token is missing a field')

    _.extend(this, token)
  }

  get typeConfig() {
    return LoginLinks._accessTokenTypes[this.type]
  }

  // get isRestricted() {
  //   var typeConfig = this.typeConfig
  //   return !! (typeConfig.only || typeConfig.except)
  // }

  getExpirationInSeconds() {
    return this.expirationInSeconds ||
      this.typeConfig.expirationInSeconds ||
      LoginLinks._defaultExpirationInSeconds
  }

  get expiresAt() {
    let expirationInMilliseconds = this.getExpirationInSeconds() * 1000
    return this.when + expirationInMilliseconds
  }

  get isExpired() {
    let now = new Date()
    return this.expiresAt > now
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
