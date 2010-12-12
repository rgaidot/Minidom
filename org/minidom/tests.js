TestSuite.add("ColorPickerTest", {
	testView: function() {
		with(this) {
      var picker = new Minidom.ColorField({label: "test", colors: ["yellow", "blue", "#000", "red"], defaultValue: "red"});
      var firedEvent;
      picker.controller = new (Minidom.Controller({
        onNavigationFieldChanged: function(event) {
          firedEvent = event;
        } 
      }))();
      document.body.appendChild(picker);

      var colorSpans = document.getElementsByClassName("Color");
      assertEqual(4, colorSpans.length);

      //check default value
      assertEqual("red", picker.getValue());
      assert(!colorSpans[0].hasClassName("Selected"));
      assert(!colorSpans[1].hasClassName("Selected"));
      assert(!colorSpans[2].hasClassName("Selected"));
      assert(colorSpans[3].hasClassName("Selected"));

      //click on first
      Event.simulateMouse(colorSpans[0], "click");

      //check the value
      assertEqual("yellow", picker.getValue());

      //check the selection
      assert(colorSpans[0].hasClassName("Selected"));
      assert(!colorSpans[1].hasClassName("Selected"));
      assert(!colorSpans[2].hasClassName("Selected"));
      assert(!colorSpans[3].hasClassName("Selected"));

      //check the fired event
      assertEqual(firedEvent.name, "NavigationFieldChanged");
      assertEqual(firedEvent.payload.value, "yellow");
      firedEvent = undefined;

      //click on third
      Event.simulateMouse(colorSpans[2], "click");

      //check the value
      assertEqual("#000", picker.getValue());

      //check the selection
      assert(!colorSpans[0].hasClassName("Selected"));
      assert(!colorSpans[1].hasClassName("Selected"));
      assert(colorSpans[2].hasClassName("Selected"));
      assert(!colorSpans[3].hasClassName("Selected"));

      //check the fired event
      assertEqual(firedEvent.name, "NavigationFieldChanged");
      assertEqual(firedEvent.payload.value, "#000");
      firedEvent = undefined;

      picker.remove();
		} 
	}
});

