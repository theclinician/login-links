Accounts.registerLoginHandler(function (loginRequest) {
  let token = loginRequest['login-links/accessToken']

  if (!token)
    return undefined // don't handle

  if(LoginLinks._config.disableRegularLogin === true)
    return null // not allowed to use this login method

  let {user, savedToken} = LoginLinks._lookupToken(token)

  for (let hook of LoginLinks._tokenLoginHooks)
    hook(savedToken, user)

  return {userId: user._id}
})
