var Locale = Class.create();
Object.extend(Locale.prototype, {
  initialize: function(language, country) {
    var toks = $A(language.split(/[-_]+/));
    if (toks.length > 1) {
      this.language = toks[0];
      this.country = toks[1];
    } else {
      this.language = language;
      this.country = country;
    }  
    this.code = this.language + (this.country?"_"+this.country:"");
  }  
});

Locale.setCurrent = function(language, country) {
  Locale.current = new Locale(language, country);
} 
