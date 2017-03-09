Accounts.registerLoginHandler(function (loginRequest) {
  let token = loginRequest['login-links/accessToken']

  if (!token)
    return undefined // don't handle

  let {user, savedToken} = LoginLinks._lookupToken(token)

  const additionalAuth = loginRequest['login-links/additionalAuth']
  for (let hook of LoginLinks._tokenLoginHooks)
    hook(savedToken, user, additionalAuth)

  return {userId: user._id}
})
