var BrowserClasses = Class.create();
Object.extend(BrowserClasses, {
  userAgents: $H({
    "ie6": /MSIE 6/i,
    "ie7": /MSIE 7/i,
    "ie": /MSIE/i,
    "nopng": /MSIE 6/i,
    "safari": /safari/i,
    "opera": /opera/i,
    "firefox": /firefox/i,
    "windows": /windows/i,
    "macintosh": /macintosh/i
  }),
  _userAgentCache: undefined,
  _languageCache: undefined,
  getLanguageClasses: function() {
    return [Locale.current.language, Locale.current.country, Locale.current.code];
  },
  getUserAgentClasses: function() {
    if (!BrowserClasses._cache) {
      var ua = Browser.userAgent();
      var result = $A();
      BrowserClasses.userAgents.each(function(pair){
        if (pair.value.test(ua,"i")) {
          result.push(pair.key);
        } 
      });
      BrowserClasses._cache = result;
    } 
    return BrowserClasses._cache;
  },
  setLanguageClasses: function(element) {
    BrowserClasses.getLanguageClasses().each(function(cls) {
      Element.addClassName(element,cls);
    });
  },
  setUserAgentClasses: function(element) {
    BrowserClasses.getUserAgentClasses().each(function(cls) {
      Element.addClassName(element,cls);
    });
  }  
});
