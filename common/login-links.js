LoginLinks = {

  _defaultExpirationInSeconds: 24 * 60 * 60, // 1 day

  setDefaultExpirationInSeconds(expiration) {
    this._defaultExpirationInSeconds = expiration
  },

  _accessTokenTypes: {},

  setTypes(types) {
    this._accessTokenTypes = types
  },

  _additionalAuthAccessor: function(){ return null },

  setAdditionalAuthAccessor(additionalAuthAccessor){
    check(additionalAuthAccessor, Function)
    this._additionalAuthAccessor = additionalAuthAccessor
  }


}



l = function(){}

// uncomment while debugging:
// l = function(){
//   console.log(...arguments)
// }
