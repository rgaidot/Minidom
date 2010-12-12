TestSuite.add("ExampleTest", {
	testFoo: function() {
		with(this) {
			assertEqual("foo", "foo");
		} 
	}
});

