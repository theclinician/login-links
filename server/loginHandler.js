Accounts.registerLoginHandler(function (loginRequest) {
  let token = loginRequest['login-links/accessToken']

  if (!token || LoginLinks._config.disableRegularLogin === true)
    return undefined // don't handle

  let {user, savedToken} = LoginLinks._lookupToken(token)

  for (let hook of LoginLinks._tokenLoginHooks)
    hook(savedToken, user)

  return {userId: user._id}
})
