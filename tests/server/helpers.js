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
  }

})
