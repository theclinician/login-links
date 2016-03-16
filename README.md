Meteor package for sending links that automatically login the user with OTPs (one-time passwords).

1. [Basic usage](#basic-usage)
  1. [On server](#on-server)
  1. [Then on client](#then-on-client)
1. [API](#api)
  1. [Expiration](#expiration)
    1. [Global](#global)
    1. [Types](#types)
    1. [Per token](#per-token)
  1. [generateAccessToken](#generateaccesstoken)
  1. [Logging in](#logging-in)
    1. [loginWithToken](#loginwithtoken)
    1. [connectionLogin](#connectionlogin)
  1. [Hooks](#hooks)
    1. [onTokenLogin](#ontokenlogin)
    1. [onConnectionLogin](#ontokenlogin)
1. [Related packages](#related-packages)


## Basic usage

1. Generate an access token.
2. Put it in a secure HTTPS URL and send it to the user via email, sms, etc.
3. When the user clicks the link, get the token from the URL and use it to log the user in.

### On server

```javascript
token = LoginLinks.generateAccessToken(user);

Email.send({
  text: 'Click this: https://myapp.com/autologin/' + token,
  ...
});
```

You could also use the token for all your emails to users, adding it as a query parameter that works on any route:

`text: 'Josh Owens just commented on your post: https://myapp.com/anyroute?foo=bar&token=' + token`

### Then on client

```javascript
if (!Meteor.userId()) {
  token = get token from URL (depends on your router and link format)

  LoginLinks.loginWithToken(token, function(e, r) {
    if (!e)
      // logged in!
  });
}   
```

## API

### Expiration

When a login is attempted with a token that is expired, a `'login-links/token-expired'` error will be thrown. The default token expiration is one day. 

You can configure expiration in three ways:

#### Global

```javascript
LoginLinks.setDefaultExpirationInSeconds(60 * 60); // one hour
```

#### Types

```javascript
LoginLinks.setTypes({
  short: 10 * 60, // ten minutes
  long: 30 * 24 * 60 * 60 // one month
});

LoginLinks.generateAccessToken(user, {type: 'short'});  
```

#### Per token

```javascript
// on server
LoginLinks.generateAccessToken(user, {expiresInSeconds: 10 * 60}); // ten minutes
```

### generateAccessToken

`LoginLinks.generateAccessToken(user, opts)` (server)

- `user`: `userId` or user object
- `opts`: `{type: String}` or `{expirationInSeconds: Integer}`

Any additional fields in `opts` will be copied to the stored token that is provided to any [hooks](#hooks).

The token is 43 alphanumeric characters, and only the hashed version is stored in the DB.

### Logging in

There are two supported types of logging in:

#### loginWithToken

`LoginLinks.loginWithToken(token, cb)` (client)

This is a full login: if it is called before expiration, the login will go through, and a resume token (different from an login-links access token) will be generated for the client. That means the client will continue to be logged in until your app's Accounts `loginExpirationInDays` (see http://docs.meteor.com/#/full/accounts_config).

#### connectionLogin

`LoginLinks.connectionLogin(token, cb)` (client)

This is a temporary, connection-based login:
- When the connection is broken (eg if you reload the page or call Meteor.disconnect()), the user is no longer logged in.
- No resume tokens are created.
- Unlike full login, which is LocalStorage-based and works across tabs, `connectionLogin` is tab-specific - if you open a second tab that doesn't have the token in the URL, you won't be logged in.

### Hooks

#### onTokenLogin

`LoginLinks.onTokenLogin(function(token){});` (server)

When [loginWithToken](#loginwithtoken) is used to successfully login a user, this hook is called before completion. 

#### onConnectionLogin

`LoginLinks.onConnectionLogin(function(token){});` (server)

When [connectionLogin](#connectionlogin) is used to successfully login a user, this hook is called before completion. 

## Related packages

- [accounts-passwordless](https://github.com/acemtp/meteor-accounts-passwordless/)
  - no timeout on tokens
  - tokens are 4 digits
  - creates new user accounts
  - only email-based
  - token generation is triggered client-side
  - no `connectionLogin` option

- [pascoual:otp](https://github.com/pascoual/meteor-otp/)

This is for TOTP (Time-based OTP), like Google Authenticator, usually used as 2FA (two-factor auth).

- [dburles:two-factor](http://meteorcapture.com/two-factor-authentication/)

Generates 2FA codes.
