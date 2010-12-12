
var Minidom = {};

Event.observe(window, "load", function() {
  Minidom.Browser.families().each(function(family) {
    Element.addClassName(document.body, family);
  });
});


var $E = function(elt) {
  var node = document.createElement(elt);
  return $(node);
} 

Number.prototype.truncate = function(n) {
  return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
}


Minidom.Util = {
  _id_counter: 0,
  generateId: function() {
    with(this) {
      return "minidom_id_"+(_id_counter++);
    } 
  },
  loadStyle: function(url, doc) {
    with(this) {
      var tag = (doc||document).createElement("link");
      tag.rel = "stylesheet";
      tag.type = "text/css";
      tag.href = url;
      var head = (doc || document).getElementsByTagName("head")[0];
      head.appendChild(tag);
    } 
  },
  loadScript: function(url, doc) {
    with(this) {
      var tag = (doc||document).createElement("script");
      tag.type = "text/javascript";
      tag.src = url;

      var head = (doc || document).getElementsByTagName("head")[0];
      head.appendChild(tag);
    } 
  },
  hover:function(elt) {
    Event.observe(elt, "mouseover", function() {$(elt).addClassName("hover")});
    Event.observe(elt, "mouseout", function() {$(elt).removeClassName("hover")});
  } 
};

Element.addMethods({
  removeChildren: function(element) {
    var children = $A(element.childNodes);
    children.each(function(c) {Element.remove(c);});
    return element;
  } ,
  setId: function(element, idValue){
    element.id = idValue;
    return element;
  }
});

Element.create = function(html) {
  var tmp = document.createElement("div");
  tmp.innerHTML = html;
  return $(tmp.firstChild);
} 

Object.extend(String.prototype, {
  blank: function() {
    return this.match(/^\s*$/);
  }
});

Minidom.Browser = {
  _agentFamilies: $H({
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
  families: function() {
    with(this) {
      if (!Minidom.Browser._familyCache) {

        //add families from the user agent
        var ua = navigator.userAgent;
        var result = $A();
        _agentFamilies.each(function(pair){
          if (pair.value.test(ua,"i")) {
            result.push(pair.key);
          } 
        });

        Minidom.Browser._familyCache = result;
      } 
      return Minidom.Browser._familyCache;
    } 
  }
} 

Minidom.View = function(proto) {
  proto = proto || {};
  var cls;
  var tagName = proto.tagName || "div";
  if (proto.tagName) {
    delete proto.tagName;
  } 
  cls = function() {
    //create and attach the node
    var node = $E(tagName);
    if (!node.id) node.id = Minidom.Util.generateId();

    //add view class as css class
    (Minidom.PREFIXES || $A([Minidom])).each(function(prefix) {
      for (var key in prefix) {
        if (prefix[key] == cls) {
          node.addClassName(key);
        } 
      } 
    });
    Minidom.Util.hover(node);
    Object.extend(node, cls.prototype);
    //set a default controller
    node.controller = new Minidom.SimpleController();
    node.initialize.apply(node, arguments);
    return node;
  } 
  Object.extend(cls.prototype, Minidom.View.prototype);
  Object.extend(cls.prototype, proto);
  return cls;
} 

Object.extend(Minidom.View.prototype, {
  controller: undefined,
  initialize: function() {},
  attachHere: function() {
    var anchorId = Minidom.Util.generateId();
    document.write(new Template('<script type="text/javascript" id="#{id}"></script>').evaluate({id: anchorId}));
    var anchor = $(anchorId);
    anchor.parentNode.insertBefore(this,anchor);
    return this;
  }
});


Minidom.Event = Class.create();
Object.extend(Minidom.Event.prototype, {
  name: undefined,
  payload: undefined,
  initialize: function(name, payload) {
    this.name = name;
    this.payload = payload;
  },
  stopped: function() {return this._stopped;},
  stop: function() {this._stopped = true;}
});

Minidom.EventHandler = Class.create();
Object.extend(Minidom.EventHandler.prototype, {
  handleEvent: function() {
    var e;
    if (typeof arguments[0] == 'string') {
      e = new Minidom.Event(arguments[0],arguments[1]);
    } else {
      e = arguments[0];
    } 
    if (this["on"+e.name]) {
      this["on"+e.name](e);
    } 
  }
});

Minidom.Controller = function(proto) {
  var result;
  result = function() {
    this.children = $A();
    this.initialize.apply(this, arguments);
  } 
  Object.extend(result.prototype, Minidom.Controller.prototype);
  Object.extend(result.prototype, proto);
  return result;
} 

Object.extend(Minidom.Controller.prototype, {
  parent: undefined,
  model: undefined,
  view: undefined,
  initialize: function() {},
  addChild: function(c) {
    this.children.push(c);
    c.parent = this;
  }, 
  fireEvent: function() {
    var e;
    if (typeof arguments[0] == 'string') {
      e = new Minidom.Event(arguments[0],arguments[1]);
    } else {
      e = arguments[0];
    } 
    this.handleEvent(e);
    if (!e.stopped() && this.parent) {
      this.parent.fireEvent(e);
    } 
  },
  destroyChild: function(controller) {
    with(this) {
      if (controller.view && controller.view.parentNode) {
        controller.view.parentNode.removeChild(controller.view);
      } 
      if (controller.parent == this) {
        controller.parent = undefined;
        children = children.findAll(function(elt) {return elt!=controller;}.bind(this));
      } 
    } 
  }
});
Object.extend(Minidom.Controller.prototype, Minidom.EventHandler.prototype);

Minidom.SimpleController = Minidom.Controller({});

Minidom.Model = function(proto) {
  var result = Class.create();
  Object.extend(result.prototype, Minidom.Model.prototype);
  if (proto) Object.extend(result.prototype, proto);
  return result;
} 

Object.extend(Minidom.Model.prototype, Minidom.EventHandler.prototype);
Object.extend(Minidom.Model.prototype, {
  controller: undefined,
  view: undefined,
  initialize: function() {
  }
});

Minidom.SimpleModel = Minidom.Model({});

Minidom.Triad = Class.create();
Object.extend(Minidom.Triad.prototype, {
  initialize: function(model, view, controller, paren) {
    if (paren) {
      paren.addChild(controller);
      controller.parent = paren;
    } 

    model.controller = controller;
    model.view = view;
    view.controller = controller;

    controller.model = model;
    controller.view = view;
    
    if (model.initTriad) model.initTriad();
    if (controller.initTriad) controller.initTriad();
    if (view.initTriad) view.initTriad();
    this.model = model;
    this.view = view;
    this.controller = controller;
  } 
});


Minidom.Button = Minidom.View({
  _button: undefined,
  _eventName: undefined,
  _left: undefined,
  _right: undefined,
  _text: undefined,
  initialize: function(text) {
    with(this) {
      innerHTML = "<button type='submit'></button>";
      _button = firstChild;
      _button.setAttribute("type", "submit");

      _text = $E("span");
      _text.addClassName("Text");
      _text.innerHTML = text;

      _left = $E("span");
      _left.addClassName("ButtonLeft");

      _right = $E("span");
      _right.addClassName("ButtonRight");

      _button.appendChild(_left);
      _button.appendChild(_text);
      _button.appendChild(_right);
      appendChild(_button);
      Event.observe(this, "click", function() {this.controller.fireEvent(this._eventName || "NavigationButtonClicked", this);}.bind(this));
    } 
  },
  setType: function(t) {
    with(this) {
      _button.setAttribute("type", t);
      return this;
    } 
  }, 
  getType: function(t) {
    with(this) {
      return _button.type;
    } 
  }, 
  setEventName: function(name) {
    with(this) {
      _eventName = name;
      return this;
    } 
  }, 
  link: function(href) {
    with(this) {
      _button.setAttribute("type", "button");
      _button.setAttribute("onclick", "window.location='"+href+"';");
      return this;
    } 
  }, 
  unlink: function() {
    with(this) {
      _button.setAttribute("onclick", "");
      return this;
    } 
  }, 
  disable: function() {
    with(this) {
      _button.disabled = true;
      addClassName("Disabled");
      return this;
    } 
  },
  enable: function() {
    with(this) {
      _button.disabled = false;
      removeClassName("Disabled");
      return this;
    } 
  },
  isEnabled: function() {
    return !this._button.disabled;
  } 
});

Minidom.CloseButton = Minidom.View(Minidom.Button.prototype);
Object.extend(Minidom.CloseButton.prototype, {
  _nodeToClose: undefined,
  initialize: function(){
    with(this){
      Minidom.Button.prototype.initialize.apply(this, arguments);
      Event.observe(this, "click", onNavigationCloseButtonClicked.bind(this));
    }
  },
  onNavigationCloseButtonClicked: function(event){
    with(this){
      Element.hide(_nodeToClose || parentNode);
      controller.fireEvent("NavigationCloseButtonClicked", this);
    }
  },
  setNodeToClose: function(node){
    with(this){
      _nodeToClose = node;
    } 
    return this;
  }
});

Minidom.Menu = Minidom.View({
  _list: undefined,
  _items: undefined,
  /**
   * possible options are:
   * itemClass: the css class to be set on all menu items (optional)
   */
  _options: undefined, 
  initialize: function(options) {
    with(this){
      _list = $E("ul");
      appendChild(_list);
      _options = options || $H();
      _items = $H();
      close();
    }
  },
  /**
   * possible options are:
   * label: the text of the menu item
   * key: the unique identifer of the menu item (ex: Delete)
   * eventName: the name of the Minidom.Event fired on select item (defaults to NavigationItemSelected)
   * before: the key of an item before which the current item should be inserted
   * after: the key of an item after which the current item should be inserted
   * top: set to true if the item should be inserted in first position
   */
  addItem: function(options) {
    with(this) {
      var item = $E("li");
      if (_options.itemClass) {
        Element.addClassName(item, _options.itemClass);
      } 

      //add the item in the items dict
      _items[options.key] = item;

      //build the html
      item.innerHTML = "<span>"+ (options.label || options.key) + "</span>";

      //fire "NavigationItemSelectedKey"
      Event.observe(item, "click", function() {
          var payload = {key: options.key, item: item,  menu: this}; 
          if (options.eventPayload) {
              $H(options.eventPayload).each(function (pair) {
                  payload[pair.key] = pair.value; 
              }); 
          }
          $A([options.eventName, _options.eventName, "NavigationItemSelected"]).each(function(name) {
            if (name) this.controller.fireEvent(new Minidom.Event(name, payload));
          }.bind(this));
        }.bind(this),
        false);

      //highlight
      Minidom.Util.hover(item);

      //position the item in the menu
      if(options.before){
        _list.insertBefore(item, _items[options.before]);
      } else if (options.after) {
        var refNode = _items[options.after];
        if (refNode == _list.lastChild) {
          _list.appendChild(item);
        } else {
          _list.insertBefore(_list.nextSibling(refNode));
        } 
      } else if (options.top) {
        if (_list.firstChild) {
          _list.insertBefore(item, _list.firstChild);
        } else {
          _list.appendChild(item);
        } 
      } else {
        _list.appendChild(item);
      } 
      return item;
    } 
  },
  addMenu: function(menu, options){
    with(this) {
      var item = addItem(options);
      Element.addClassName(item, "SubMenu");
      item.appendChild(menu);
      Event.observe(item, "mouseover", function(){Element.show(menu);}, false);
      Event.observe(item, "mouseout", function(){Element.hide(menu);}, false);
      return item;
    } 
  },
  clear: function(){
    with(this){
      $(_list).removeChildren();
      _items = $H();
    }
  },
  removeItem: function(key) {
    with(this) {
      var item = _items[key];
      _list.removeChild(item);
      _items.remove(key);
      return item;
     }
  }, 
  length: function() {
    return this._items.keys().length;
  }, 
  toggle: function() {
    with(this) {
      if (isOpen()) {
        return close();
      } 
      return open();
    } 
  },
  close: function() {
    Element.hide(this);
    this.controller.fireEvent(new Minidom.Event("NavigationMenuClosed", this));
  },
  open: function() {
    Element.show(this);
    this.controller.fireEvent(new Minidom.Event("NavigationMenuOpened", this));
  },
  isOpen: function() {
    return Element.visible(this);
  } 
});

Minidom.Panel = Minidom.View({
  _container: undefined,
  _content: undefined,
  _closeButton: undefined,
  initialize: function(content) {
    with(this) {
      _container = $E("div");
      _container.addClassName("Container");
      appendChild(_container);
      $A(["Left", "Top", "Bottom", "Right", "TopLeft", "TopRight", "BottomLeft", "BottomRight"]).each(function(key){
        var member = "_"+key.camelize();
        this[member] = $E("span");
        this[member].addClassName(key);
        this._container.appendChild(this[member]);
      }.bind(this));
      if (content) {
        setContent(content);
      } 
    } 
  },
  clearContent: function() {
    with(this) {
      if (_content) {
        _content.removeClassName("Content");
        _container.removeChild(_content);
      } 
    } 
  }, 
  addCloseButton: function(text) {
    with(this){
      _closeButton = new Minidom.CloseButton(text);
      appendChild(_closeButton);
    }
    return this;
  },
  getCloseButton: function(){
    return this._closeButton;
  },
  setContent: function(content) {
    with(this) {
      clearContent();
      _content = content;
      _content.addClassName("Content");
      _container.appendChild(_content);
    } 
  } 
});

/**
 * valid options are:
 * name: the name of the field
 * label: the text to put in the field's label (optional)
 * example: the text to put in the field's example (optional)
 * value: the default value of the field (optional)
 * fieldId: the css ID of the field (optional)
 */

Minidom.Field = Minidom.View({
  _label: undefined,
  _example: undefined,
  _field: undefined,
  _message: undefined,
  _eventNameChange: "NavigationFieldChanged",
  fieldTagName: undefined,
  inputType: undefined,
  defaultOrder: $A(["label","field","message","example"]),
  initialize: function(options) {
    with(this) {
      options = options || {};
      addClassName("Field");
      var fieldId = options.fieldId || Minidom.Util.generateId();
      _field = Element.create("<" + (fieldTagName || "input") +" id='"+fieldId+"' name='"+options.name+"' type='"+inputType+"' value='"+ (options.value || "") +"' "+(options.checked?"checked='checked'":"")+"/>");

      _label = Element.create("<label class='Label' for='"+fieldId+"'></label>");
      _label.innerHTML = options.label || "";

      _example = $E("span");
      _example.addClassName("Example");
      _example.innerHTML = options.example || "";

      _message = $E("span");
      _message.addClassName("Message");

      order();

      Event.observe(_field, "change", function(event) {
        this.controller.fireEvent(this._eventNameChange, {fieldName: this.name, field: this._field, value: this.getValue()});
      }.bind(this));

      Event.observe(_field, "keypress", function(event) {
        if (event.keyCode == Event.KEY_RETURN)
          this.controller.fireEvent("NavigationPressEnter", {fieldName: this.name, field: this._field});
      }.bind(this));
      Event.observe(_field, "focus", function() {this.addClassName("Focus"); this.controller.fireEvent("NavigationFieldFocus", this)}.bind(this));
      Event.observe(_field, "blur", function() {this.removeClassName("Focus"); this.controller.fireEvent("NavigationFieldBlur", this)}.bind(this));
    }
  },
  setEventNameChange: function(newName) {
    this._eventNameChange = newName;
    return this;
  }, 
  order: function() {
    with(this) {
      removeChildren();
      var order;
      if (arguments[0]) order =  $A(arguments) 
      else  order = $A(defaultOrder);
      order.each(function(tag){
        this.appendChild(this["_"+tag]);
      }.bind(this));
      return this;
    } 
  }, 
  setError: function(message) {
    with(this) {
      _message.innerHTML = message;
      addClassName("Error");
      removeClassName("Info");
    } 
  }, 
  blur: function() {
    this._field.blur();
  }, 
  focus: function() {
    this._field.focus();
  }, 
  setValue: function(val) {
    this._field.value = val;
    return this;
  },
  getValue: function() {
    return this._field.value;
  },
  select: function() {
    return this._field.select();
  },
  setInfo: function(message) {
    with(this) {
      _message.innerHTML = message;
      addClassName("Info");
      removeClassName("Error");
    } 
  },
  getField: function() {
    return this._field;
  }, 
  unsetMessage: function() {
    this._message.innerHTML = "";
  } 
});

Minidom.CheckableField = {
  /**
   * Sets the 'checked' property on the field
   * IE gotcha: this method only works when the element is already appended to the DOM
   */
  setChecked: function(value){
    this._field.checked = value ? "checked" : ""; 
    return this;
  },
  isChecked: function(){
    return this._field.checked; 
  }
};

Minidom.CheckboxField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.CheckboxField.prototype, Minidom.CheckableField);
Object.extend(Minidom.CheckboxField.prototype, {
  inputType:"checkbox",
  defaultOrder: ["field", "label", "message", "example"]
});

Minidom.RadioField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.RadioField.prototype, Minidom.CheckableField);
Object.extend(Minidom.RadioField.prototype, {
  inputType:"radio",
  defaultOrder: ["field", "label", "message", "example"]
});

Minidom.TextField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.TextField.prototype, {inputType:"text"});

Minidom.SelectField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.SelectField.prototype, {
  fieldTagName:"select",
  _eventNameChange: "SelectFieldChanged",
  addOption: function(label, value, selected){
    with(this) {
      var option = $E("option");
      option.innerHTML = label;
      option.setAttribute("value", value||label);
      option.selected = selected;
      _field.appendChild(option);
      return this;
    } 
  },
  getValue: function() {
    with(this) {
      var options = $A(_field.getElementsByTagName("option"));
      var selected = options.find(function(o) {return o.selected;});
      if (selected && selected.value) return selected.value;
    } 
  },
  clearOptions: function() {
    this._field.innerHTML = "";
  }, 
  selectOption: function(value, keepOthers) {
    with(this) {
      $A(_field.getElementsByTagName("option")).each(function(o){
        if (o.value == value)
          o.selected = true;
        else if (!keepOthers)
          o.selected = false;
      });
    } 
    return this;
  }  
});

Minidom.TextArea = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.TextArea.prototype, {
  fieldTagName: "textarea"
})
Minidom.FileField = Minidom.View(Minidom.Field.prototype);
Object.extend( Minidom.FileField.prototype, { inputType: "file" });

Minidom.HiddenField = Minidom.View(Minidom.Field.prototype);
Object.extend( Minidom.HiddenField.prototype, { inputType: "hidden"});

Minidom.ColorField = Minidom.View(Minidom.HiddenField.prototype);
Object.extend(Minidom.ColorField.prototype, {
  defaultOrder: $A(["label","field","colors","message","example"]),
  _options: undefined,
  _colors: undefined,
  _colorMap: undefined,
  initialize: function(options) {
    with(this) {
      _options = $H({
                      colors: ["red", "green", "blue"],
                      label: "",
                      defaultValue: undefined
                    }).merge(options||{});

      //colors div
      _colors = $E("div").addClassName("Colors");
      _colorMap = $H();

      _options.colors.each(function(color) {
        var span = $E("span").addClassName("Color");
        span.style.backgroundColor = color;
        this._colors.appendChild(span);
        this._colorMap[color] = span;
        Event.observe(span, "click", this.selectColor.bind(this, color));
      }.bind(this));

      _colors.appendChild($E("div").addClassName("Break"));

      //call parent contructor
      Minidom.HiddenField.prototype.initialize.apply(this, [_options]);

      //default value selection
      if (_options.defaultValue!=undefined) selectColor(_options.defaultValue);

    } 
  },
  selectColor: function(color) {
    with(this) {
      setValue(color);
      _colorMap.values().each(function(node) {$(node).removeClassName("Selected");});
      $(_colorMap[color]).addClassName("Selected");
      controller.fireEvent(this._eventNameChange, {fieldName: this.name, field: this._field, value: this.getValue()});
    } 
  }
});
