var TestSuite = {
  suite: $H(),
  add: function(suiteName, test) {
    TestSuite.suite[suiteName] = test;
  } 
};
Event.observe(window, "load", function() {
  //adding ?filter=foo in the query only runs tests matching foo
  var filter = undefined;
  var params = window.location.search.toString().toQueryParams();
  if (params["filter"]) {
    filter = params["filter"];
  } 

  //build the test suite by concatenating all tests
  var suiteCounter = 0;
	TestSuite.suite.each(function(suite) {
    var suiteName = suite.key;
    var suiteTests = suite.value;
    var filteredTests = {};
    var hasTests = false;
    //filter the test suite 
    $H(suiteTests).each(function(pair) {
      var name = pair.key+"_"+suiteName;
      if (/^test/.test(name)) {
        if (!filter || new RegExp(filter,"i").test(name)) {
          hasTests = true;
          filteredTests[name] = pair.value;
        }
      } else { //setup or teardown
        filteredTests[pair.key] = pair.value;
      } 
    });

    if (hasTests) {
      //move the old console
      var oldlog = $('testlog');
      if (oldlog) {
        oldlog.id = 'testlog'+(suiteCounter++);
      } 
      //create a new title and console
      var title = $E("h3");
      title.innerHTML = suiteName;
      var newlog = $E('div');
      newlog.id = 'testlog';
      document.body.appendChild(title);
      document.body.appendChild(newlog);
      //launch the tests
      new Test.Unit.Runner(filteredTests);
    } 
	}); 
});

//override _isVisible in scriptaculous: the original code returned true
//for an element with "display:none" and no parent

Test.Unit.Assertions.prototype._isVisible= function(element) {
    element = $(element);
    this.assertNotNull(element);
    if(element.style && Element.getStyle(element, 'display') == 'none')
      return false;
    
    if(!element.parentNode) return true;
    return this._isVisible(element.parentNode);
};
Test.Unit.Testcase.prototype._isVisible = Test.Unit.Assertions.prototype._isVisible;
