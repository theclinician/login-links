Meteor.methods({

  cleardb() {
    Meteor.users.remove({})
  },

  whoami() {
    l('whoami: ', Meteor.userId())
    return Meteor.userId()
  },

  generateToken(userId, opts) {
    // l('generateToken', {userId, opts})
    return LoginLinks.generateAccessToken(userId, opts)
  },

  setAdditionalAuthCheck(authActual){
    LoginLinks.onConnectionLogin(function(savedToken, user, additionalAuth){
      if(additionalAuth !== authActual){
        throw new Meteor.Error("login-links/failed-extra-auth")
      }
    })
  },

  resetLoginLinks(){
    LoginLinks._connectionHooks = []
  }

})
