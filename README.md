Meteor package for sending links that automatically log in the user.

The main use case is sending an email or sms to your user with a link to your app that contains an OTP (one-time password) that automatically logs them in (so they don't have to enter their username/password or do OAuth):

```
Josh Owens just commented on your blog post:
https://my-blog-app.com/post/abc?comment=3?token=A10F51nigkFsShxmvkLnlQ76Kzjh7h9pMuNxpVpO81a
```


- [Basic usage](#basic-usage)
  - [On server](#on-server)
  - [Then on client](#then-on-client)
- [API](#api)
  - [Expiration](#expiration)
    - [Global](#global)
    - [Types](#types)
    - [Per token](#per-token)
  - [generateAccessToken](#generateaccesstoken)
  - [Logging in](#logging-in)
    - [loginWithToken](#loginwithtoken)
    - [connectionLogin](#connectionlogin)
  - [Hooks](#hooks)
    - [onTokenLogin](#ontokenlogin)
    - [onConnectionLogin](#ontokenlogin)
- [Related packages](#related-packages)
- [Package dev](#package-dev)
  - [Testing](#testing)
- [Credits](#credits)


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

You could also use the token for all of your emails to users, adding it as a query parameter that works on any route:

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

You can configure expiration in three ways. A value of `0` is not supported.

#### Global

```javascript
LoginLinks.setDefaultExpirationInSeconds(60 * 60); // one hour
```

#### Types

```javascript
LoginLinks.setTypes({
  short: {expirationInSeconds: 10 * 60}, // ten minutes
  long: {expirationInSeconds: 30 * 24 * 60 * 60} // one month
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

There are two supported types of logging in. When you initiate a login, `Accounts.loggingIn()` is updated.

#### loginWithToken

`LoginLinks.loginWithToken(token, cb)` (client)

- `cb` is provided `error`

This is a full login: if it is called before expiration, the login will go through, and a resume token (different from an login-links access token) will be generated for the client. That means the client will continue to be logged in until your app's Accounts `loginExpirationInDays` (see http://docs.meteor.com/#/full/accounts_config).

#### connectionLogin

`LoginLinks.connectionLogin(token, cb)` (client)

- `cb` is provided `error, data`. `data` has a `userId` field as well as any custom fields on the `token` stored in the database or fields returned from [onConnectionLogin](#onConnectionLogin)

This is a temporary, connection-based login:
- When the connection is broken (eg if you reload the page or call `Meteor.disconnect()`), the user is no longer logged in.
- No resume tokens are created.
- Unlike full login, which is LocalStorage-based and works across tabs, `connectionLogin` is tab-specific - if you open a second tab that doesn't have the token in the URL, you won't be logged in.

### Hooks

#### onTokenLogin

`LoginLinks.onTokenLogin(function(token, user){});` (server)

When [loginWithToken](#loginwithtoken) is used to successfully login a user, this hook is called before completion. 

#### onConnectionLogin

`LoginLinks.onConnectionLogin(function(token, user){});` (server)

When [connectionLogin](#connectionlogin) is used to successfully login a user, this hook is called before completion. If you return an object, the object's fields will be added to the `data` object that is passed to the client [connectionLogin](#connectionLogin) callback.

## Related packages

- [loren:roles-restricted](https://github.com/lorensr/roles-restricted) - If you want to restrict the permissions that the automatically-logged-in browser has, use this package along with [alanning:roles](https://github.com/alanning/meteor-roles).

- [accounts-passwordless](https://github.com/acemtp/meteor-accounts-passwordless/)
  - full accounts system (creates new user accounts)
  - no timeout on tokens
  - tokens are 4 digits
  - only email-based
  - token generation is triggered client-side
  - no `connectionLogin` option

- [pascoual:otp](https://github.com/pascoual/meteor-otp/) - This is for TOTP (Time-based OTP), like Google Authenticator, usually used as 2FA (two-factor auth).

- [dburles:two-factor](http://meteorcapture.com/two-factor-authentication/) - Generates 2FA codes

## Package dev

ES6 without semicolons

### Testing

```bash
git clone git@github.com:lorensr/login-links.git
cd login-links
meteor test-packages ./
open localhost:3000
```

## Credits

Thanks to Share911 for sponsoring. [share911.com](https://share911.com/) - An emergency response system for your organization.

[Contributors](https://github.com/lorensr/roles-restricted/graphs/contributors)
