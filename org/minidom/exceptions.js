window.MinidomException = Class.create();

/**
 * instance methods
 */
Object.extend(window.MinidomException.prototype, {
  initialize: function(name, message) {
    this.name = name;
    this.message = message;
  }
});
