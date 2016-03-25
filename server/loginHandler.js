Accounts.registerLoginHandler(function (loginRequest) {
  var token,
      hashedToken,
      fields,
      user,
      accessToken

  token = loginRequest['login-links/accessToken']

  if (!token)
    return undefined // don't handle

  user = LoginLinks._getUserByToken(token)

  for (hook in LoginLinks._tokenLoginHooks)
    hook(token, user)

  return {userId: user._id}
})
