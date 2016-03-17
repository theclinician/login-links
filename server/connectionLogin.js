Meteor.methods({

  'login-links/connectionLogin': function (token) {
    var userId

    user = LoginLinks._getUserByToken(token)
    l('connectionLogin user:', user._id)

    if (Meteor.userId() === user._id)
      throw new Meteor.Error('login-links/already-fully-logged-in')

    this.setUserId(user._id)

    return user._id
  }

})
