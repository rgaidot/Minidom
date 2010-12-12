TestSuite.add("LocaleTest", {
	testCreateLocale: function() {
		with(this) {
      var l  = new Locale("en_US");
      assertEqual("en", l.language);
      assertEqual("US", l.country);

      l  = new Locale("en","US");
      assertEqual("en", l.language);
      assertEqual("US", l.country);
		} 
	}
});

