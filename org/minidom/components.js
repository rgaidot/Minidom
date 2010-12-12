var Component = {};
Component.create = function(prototype) {
  var cls;
  cls = function() {
    var self = $E("div");
    var _debugKey;
    try {
      for (var key in this) {
        _debugKey = key;
        self[key] = this[key];
      } 
    } catch(e) {
      console.log("Key '"+_debugKey+"' is already a reserved DOM keyword");
    } 
    Object.extend(self, CallbackManager);
    self.initialize.apply(self, arguments);
    Element.addClassName(self,Component.getClassName(cls));
    return self;
  } 
  if (prototype) {
    Object.extend(cls.prototype,prototype);
  } 
  return cls;
} 

Component.getClassName = function(cls) {
  if (!cls.className) {
    for (var key in window) {

      if (window[key] == cls) {
        cls.className = key;
        break;
      } 
    } 
  } 
  return cls.className;
} 

var CallbackManager = {
  _listen: function(name, callback, clean){
    if (!this._callbacks)
      this._callbacks = $H();
    if(!this._callbacks[name] || clean){
      this._callbacks[name] = new Array();
    }
    this._callbacks[name].push(callback);
  },
  listen: function(){
    if(typeof(arguments[0]) == typeof("")){
      this._listen(arguments[0], arguments[1], arguments[2]);
    }else{
      $H(arguments[0]).each(function(pair){
        if (/^on/.test(pair.key))
          this._listen(pair.key, pair.value);
      }.bind(this));
    }
  },
  fire: function(name){
    if(this._callbacks && this._callbacks[name]){
      for(var i = 0; i < this._callbacks[name].length; i++){
        // passing trigger + arguments to callback function 
        var args = $A(arguments);
        args[0] = this; // replacing event name by trigger object
        if(this._callbacks[name][i].apply(this, args) == false) return false;
      }
    }
    return true;
  }
};

