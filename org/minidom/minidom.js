/*  Minidom JavaScript framework, version 0.1
 *  (c) 2007 Exalead
 *
 *  Minidom is freely distributable under the terms of an MIT-style license.
 *  For details, see the Minidom web site: http://www.minidom.org/
/*--------------------------------------------------------------------------*/

Event.observe(window, "load", function() {
  Minidom.Browser.families().each(function(family) {
    Element.addClassName(document.body, family);
  });
});

var Minidom = {};

var $E = function(elt) {
  var node = document.createElement(elt);
  return $(node);
} 

var $T = function(str) {return document.createTextNode(str);};

var $S = function(str){ return $E("div").append(str).innerHTML; }; 


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
  hover:function(elt, targetElt) {
    Event.observe(elt, "mouseover", function() {$(targetElt || elt).addClassName("hover")});
    Event.observe(elt, "mouseout", function() {$(targetElt || elt).removeClassName("hover")});
  },
  checkEmail: function(email){
    return /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
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
  },
  append: function(element, obj){
    if(typeof obj == "string"){
      obj = document.createTextNode(obj); 
    }
    element.appendChild(obj);
    return element;
  },
  appendTitle: function(element, stringValue, length) {
    if(stringValue){
      if (length == undefined) length=20;
      element.setAttribute("title", stringValue);
      var exp = new RegExp("([^\\s]{" + length + "}).*", "g");
      element.append(stringValue.replace(exp, "$1 ..."));
    }
    return element;
  },
  fill: function(element, template, hash, pattern) {
    pattern = pattern || /#\{(.*?)\}/;
    var match;
    while (template.length > 0) {
      if (match = template.match(pattern)) {
        element.append(template.slice(0, match.index));

        element.append(hash[match[1]]);

        template = template.slice(match.index + match[0].length);
      } else {
        element.append(template);
        template = '';
      }
    }
    return element;
  }
});

Element.create = function(html) {
  Element.create.tmp.innerHTML = html;
  return $(Element.create.tmp.firstChild);
} 
Element.create.tmp = document.createElement("div");

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
    "safari3": /Version\/3.*safari/i,
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
    if (!cls.__type) {
      (Minidom.PREFIXES || $A([Minidom])).each(function(prefix) {
        for (var key in prefix) {
          if (prefix[key] == cls) {
            cls.__type = key;
            break;
          } 
        } 
      });
    } 
    node.addClassName(cls.__type);
    //Minidom.Util.hover(node);
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
  },
  protect: function(className){
    if(!this._shield) this._shield = $E("div");
    this._shield.className = "EventShield" + (className?" "+className:"");
    
    if(window.document.body.hasClassName("ie6")){
      var elementWidth = this.getWidth();
      var elementHeight = this.getHeight();
      this._shield.setStyle({width: elementWidth+"px", height: elementHeight+"px", position: "absolute", top: "0px", left: "0px", background: "white", opacity: "0.01", filter: "alpha(opacity=1)"});
    }
    
    this.appendChild(this._shield);
  },
  unProtect: function(){
    try{this.removeChild(this._shield);}catch(e){/* SILENT */ }
  }
});

/* Special Shield for IE (best performance) 
*  /!\ the css is special too
*/
if(/MSIE 7/i.test(navigator.userAgent)){
  Object.extend(Minidom.View.prototype, {
    protect: function(){
      if(!window.document.body._shield) window.document.body._shield = $E("div").addClassName("EventShield");
      window.document.body.appendChild(window.document.body._shield);
    },
    unProtect: function(){
      try{window.document.body.removeChild(window.document.body._shield);}catch(e){/* SILENT */ }
    }
  });
}



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
    if (this.onEvent) {
      this.onEvent(e);
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
    c.parent = this;
    this.children.push(c);
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
  },
  json: function(handler, options) {
    var opts = $H(options || {});
    var eventName = handler.underscore().dasherize().camelize();
    eventName = eventName.charAt(0).toUpperCase() + eventName.substring(1)
    opts.onSuccess = function(transport) {
      this.controller.fireEvent("Success"+eventName, eval("("+transport.responseText+")"));
    }.bind(this);
    opts.onException = function(transport) {
      this.controller.fireEvent("Exception"+eventName, transport.responseText);
    }.bind(this);
    opts.onFailure = opts.onException;
    new Ajax.Request(handler, opts);
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
  initialize: function(text, options) {
    with(this) {
      options = Object.extend({type: "submit" }, $H(options || {}));

      _button = Element.create("<button type='" + options.type + "'></button>");

      _text = $E("span").addClassName("Text");
      _text.appendChild($T(text));

      _left = $E("span").addClassName("ButtonLeft");
      _right = $E("span").addClassName("ButtonRight");

      _button.appendChild(_left);
      _button.appendChild(_text);
      _button.appendChild(_right);
      appendChild(_button);
      Event.observe(this, "click", function(event) {this.controller.fireEvent(this._eventName || "NavigationButtonClicked", this);}.bind(this));
    } 
  },
  setType: function(t) {
    with(this) {
      //won't work in IE
      _button.type = t;
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
      _button.type = "button";
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
  getDisabled: function() {
    with(this){
      return _button.disabled;
    }
  }
});

Minidom.SoftButton = Minidom.View(Minidom.Button.prototype);
Object.extend(Minidom.SoftButton.prototype, {
  initialize: function(){
    with(this){
      Minidom.Button.prototype.initialize.apply(this, arguments)
      addClassName("Button");
    }
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
   * eventName: the name of the Minidom.Event fired on select item (defaults to NavigationItemSelected)
   */
  _options: undefined, 
  initialize: function(options) {
    with(this){
      _options = $H(options || {});
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
   * itemClass: specific class
   */
  addItem: function(options) {
    with(this) {
      options = Object.extend({html: false}, options);
      var item = $E("div").addClassName("MenuItem");
      if (_options.itemClass) {
        Element.addClassName(item, _options.itemClass);
      } 
      if (options.itemClass) {
        Element.addClassName(item, options.itemClass);
      } 

      //add the item in the items dict
      _items[options.key] = item;

      if(options.itemClass != "Separator"){
        //build the html /!\ sometimes options.label can be a html string
        if(options.html){
            item.innerHTML = "<span>"+ (options.label || options.key) + "</span>";
        }
        else{
          item.innerHTML = "";
          var spanTitle = $E("span").append($T(options.label || options.key));
          item.appendChild(spanTitle); 
        }

        //fire "NavigationItemSelectedKey"
        Event.observe(item, "click", function() {
          var payload = {key: options.key, label: options.label, item: item,  menu: this}; 
          if (options.eventPayload) {
              $H(options.eventPayload).each(function (pair) {
                  payload[pair.key] = pair.value; 
              }); 
          }
          $A([options.eventName, _options.eventName, "NavigationItemSelected"]).each(function(name) {
            if (name) this.controller.fireEvent(new Minidom.Event(name, payload));
          }.bind(this));
        }.bind(this), false);
      }

      //position the item in the menu
      if(options.before && _items[options.before]){
        insertBefore(item, _items[options.before]);
      } else if (options.after && _items[options.after]) {
        var refNode = _items[options.after];
        if (refNode == lastChild) {
          appendChild(item);
        } else {
          insertBefore(item, refNode.nextSibling );
        } 
      } else if (options.top) {
        if (firstChild) {
          insertBefore(item, firstChild);
        } else {
          appendChild(item);
        } 
      } else {
        appendChild(item);
      } 
      return item;
    } 
  },
  addSeparator: function(options){
    options = $H(options || {});
    options.itemClass = "Separator";
    return this.addItem(options);
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
      removeChildren();
      _items = $H();
    }
  },
  removeItem: function(key) {
    with(this) {
      var item = _items[key];
      if(item){
        removeChild(item);
        _items.remove(key);
      }
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
    with(this) {
      if(length() == 0) return; // no items = no display

      //highlight
      _items.each(function(pair) {Minidom.Util.hover(pair.value); });
      Element.show(this);
      this.controller.fireEvent(new Minidom.Event("NavigationMenuOpened", this));
    } 
  },
  isOpen: function() {
    return Element.visible(this);
  } 
});

Minidom.Panel = Minidom.View({
  _title: undefined,
  _content: undefined,
  _closeButton: undefined,
  _separator: undefined,
  initialize: function(content) {
    with(this) {
      $A(["Left", "Top", "Bottom", "Right", "TopLeft", "TopRight", "BottomLeft", "BottomRight"]).each(function(key){
        var member = "_"+key.camelize();
        this[member] = this.appendChild($E("div").addClassName(key));
      }.bind(this));
      if (content) {
        setContent(content);
      }
      _separator = appendChild($E("div").addClassName("Separator"))
    }
  },
  clearContent: function() {
    with(this) {
      if (_content) {
        _content.removeClassName("Content");
        removeChild(_content);
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
      insertBefore(_content, _separator)
    } 
  },
  getContent: function() {
    return this._content;
  }, 
  clearTitle: function(){
    with(this){
      if(_title){
        _title.remove()
      }
    }
  },
  setTitle: function(text){
    with(this){
      clearTitle();
      _title = appendChild($E("h2").addClassName("Title"));
      _title.append(text);
    }
  }
});


Minidom.DropDown = Minidom.View({
  _name: undefined,
  _eventNameChange: "SelectFieldChanged",

  _frontRow: undefined,
  _list: undefined,
  _index: undefined,
  _selected: undefined,

  initialize: function(name){
    with(this){
      _name = name;
      if(name) addClassName(name + "DropDown");

      _frontRow = appendChild($E("div").addClassName("FrontRow"));
      _list = appendChild($E("ul").addClassName("List"));
      _index = {};
      _selected = {};

      Event.observe(_frontRow, "click", this.toggleOpen.bind(this));
      Event.observe(window.document, "click", function(event){
        if(!Element.descendantOf(Event.element(event), this)) this.close();
      }.bind(this));
    }
  },

  toggleOpen: function(){
    this.toggleClassName("OpennedDropDown");
    this._list.style.width = this._frontRow.getWidth() - 2 + "px";
    this._list.toggle();
  },

  open: function(){
    this.addClassName("OpennedDropDown");
    this._list.style.width = this._frontRow.getWidth() - 2 + "px";
    this._list.show();
  },

  close: function(){
    this.removeClassName("OpennedDropDown");
    this._list.hide();
  },

  clearOptions: function(){
    with(this){
      _list.innerHTML = "";
      _index = {};
      _selected = {};
    }
  },

  addOption: function(element, key){
    with(this){
      if(typeof element == "string") element = $T(element);

      var option = $E("li");
      option.key = key;
      option.content = option.appendChild(element);

      Event.observe(option, "click", function(){
        if(key != this._selected.key){
          this.setValue(key);
          this.onOptionSelected(option);
        }
       this.close();
      }.bind(this));

      _list.appendChild(option);
      _index[key] = option;

      if(!_selected.key) setValue(key);
    }
  },

  onOptionSelected: function(option){
    this.controller.fireEvent(this._eventNameChange, {fieldName: this._name, field: this, value: option.key});
  },

  setValue: function(key){
    with(this){
      if(_selected.key) _selected.removeClassName("selected");

      _selected = _index[key];
      _selected.addClassName("selected");

      _frontRow.innerHTML = "";
      _frontRow.appendChild(_selected.content.cloneNode(true));
      close();
    }
  },

  getValue: function(){
    return this._selected ? this._selected.key : undefined;
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
      _field = Element.create("<" + (fieldTagName || "input") +" id='"+fieldId+"' name='"+options.name+"' " + (inputType? "type='"+inputType+"'" : "" ) + (options.value ? " value='" + options.value + "'" : "") + (options.checked?" checked='checked'":"")+"/>");
      
      _label = Element.create("<label class='Label' for='"+fieldId+"'></label>");
      _label.innerHTML = options.label || "";

      _example = $E("span");
      _example.addClassName("Example");
      _example.innerHTML = options.example || "";

      _message = $E("span");
      _message.addClassName("Message");

      order();

      Event.observe(_field, "change", function(event) {
        this.controller.fireEvent(this._eventNameChange, {fieldName: this._field.name, field: this._field, value: this.getValue()});
      }.bind(this));

      Event.observe(_field, "keypress", function(event) {
        if (event.keyCode == Event.KEY_RETURN){
          this.controller.fireEvent("NavigationPressEnter", {fieldName: this._field.name, field: this._field});
        }
        /*
        // Shift key marker
        else if(event.keyCode == Event.KEY_TAB){
          this.__shiftKey__ = event.shiftKey;
        }
        */
      }.bind(this));

      /*
      // propagate focus down to field element
      Event.observe(this, "focus", function(event){ 
        if(Event.element(event) == this){
          if(this.__shiftKey__){
            try{ this.previousSibling.focus(); } 
            catch(e){
              // SILENT
            }
          }else{
            this._field.focus();
          }
        }
        this.__shiftKey__ = false;
      }.bind(this));
      */ 
    }
  },
  setEventNameChange: function(newName) {
    this._eventNameChange = newName;
    return this;
  }, 
  order: function() {
    with(this) {
      removeChildren();
      var _order = arguments[0] ? $A(arguments) : $A(defaultOrder);
      _order.each(function(tag){
        this.appendChild(this["_"+tag]);
      }.bind(this));
      return this;
    } 
  }, 
  setError: function(message) {
    with(this) {
      Element.show(_message);
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
    return this._field.value = val;
  },
  getValue: function() {
    return this._field.value;
  },
  select: function() {
    return this._field.select();
  },
  setInfo: function(message) {
    with(this) {
      Element.show(_message);
      _message.innerHTML = message;
      addClassName("Info");
      removeClassName("Error");
    } 
  },
  getField: function() {
    return this._field;
  }, 
  unsetMessage: function() {
    with(this){
      Element.hide(_message);
      removeClassName("Error");
      removeClassName("Info");
      _message.innerHTML = "";
    }
  } 
});

Minidom.CheckableField = {
  /**
   * Sets the 'checked' property on the field
   * IE gotcha: this method only works when the element is already appended to the DOM
   */
  setChecked: function(value){
    this._field.checked = (value ? "checked" : ""); 
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

Minidom.PasswordField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.PasswordField.prototype, {inputType:"password"});

Minidom.SelectField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.SelectField.prototype, {
  fieldTagName:"select",
  _eventNameChange: "SelectFieldChanged",
  addOption: function(label, value, selected){
    with(this) {
      var option = $E("option");
      option.innerHTML = label;
      option.setAttribute("value", value||label);
      _field.appendChild(option);
      if (selected) {
        option.selected = true;
      }
      return this;
    } 
  },
  getValue: function() {
    with(this) {
      var options = $A(_field.getElementsByTagName("option"));
      var selected = options.find(function(o) {return o.selected;});
      return selected.value || undefined;
    } 
  },
  clearOptions: function() {
    this._field.innerHTML = "";
  }, 
  selectOption: function(value, keepOthers) {
    with(this) {
      $A(_field.getElementsByTagName("option")).each(function(o){
        if (o.value == value) {
          o.selected = true;
        } else if (!keepOthers) {
          o.selected = false;
        }
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
        if(color == "transparent"){
          span.addClassName("Transparent");
        } else {
	        span.style.backgroundColor = color;
	      }
	      this._colors.appendChild(span);
        this._colorMap[color] = span;
        Event.observe(span, "click", this.selectColor.bind(this, color));
      }.bind(this));

      _colors.appendChild($E("div").addClassName("Separator"));

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

Minidom.DateField = Minidom.View(Minidom.Field.prototype);
Object.extend(Minidom.DateField.prototype, {
  _options: undefined,
  _listDays: undefined,
  _listMonths: undefined,
  _listYears: undefined,
  initialize: function(options) {
    with(this){
      d = new Date();
 
      _options = $H({
                      months: $R(1, 12).toArray(), 
                      labelMonth: "Month:",
                      labelDay: "Day:",
                      labelYear: "Year:",
                      fromYear: 1900,
                      toYear: d.getFullYear(),
                      order: "m/d/y"
                    }).merge(options||{});
     
      _field = appendChild($E("div").addClassName("Fields"));

      _listMonths = new Minidom.SelectField({label: "", name: _options.name + "Month"}).addClassName("Month");
      _listMonths.addOption(_options.labelMonth, "error");
      $A(_options.months).each(function(month, index) {
        _listMonths.addOption(month.toString(), (index+1).toString(), _options.value && _option.value.getMonth() == index)
      }.bind(this));
      
      _listDays = new Minidom.SelectField({label: "", name: _options.name + "Day"}).addClassName("Day");
      _listDays.addOption(_options.labelDay, "error");
      $R(1, 31).each(function(day) {
        _listDays.addOption(day.toString(), day.toString(), _options.value && _option.value.getDate() == day)
      }.bind(this));
      
      _listYears = new Minidom.SelectField({label: "", name: _options.name + "Year"}).addClassName("Year");
      _listYears.addOption(_options.labelYear, "error");
      $R(_options.fromYear, _options.toYear).each(function(year) {
        _listYears.addOption(year.toString(), year.toString(), _options.value && _option.value.getFullYear() == year)
      }.bind(this));
      
      addClassName("Field");
      var fieldId = options.fieldId || Minidom.Util.generateId();
      _label = Element.create("<label class='Label' for='"+fieldId+"'></label>");
      _label.innerHTML = options.label || "";

      _example = $E("span");
      _example.addClassName("Example");
      _example.innerHTML = options.example || "";

      _message = $E("span");
      _message.addClassName("Message");

     //append selects in order
     $A(_options.order.split("/")).each(function(elt){
      switch(elt){
        case "d":
          _field.appendChild(_listDays);
          break;
        case "m":
          _field.appendChild(_listMonths);
          break;
        case "y":
          _field.appendChild(_listYears);
          break;
      }
      _field.firstChild.id = fieldId;

      order();
     }.bind(this))

    }
  },
  setValue: function(date){
    with(this){
      _listDays.selectOption(date.getDate())
      _listMonths.selectOption(date.getMonth()+1)
      _listYears.selectOption(date.getFullYear())
    }
  }
});

Minidom.EditableSpan = Minidom.View({
  _editView: undefined,
  _dispView: undefined,
	_locked: false,
	
  _options: undefined,
  _value: undefined,

  initialize: function(options){
    with(this){
      _options = Object.extend({name:"EditableSpan"}, options);
      _value = _options.value;
      _editView = Element.create("<input type='text' name='"+_options.name+"' value='' />");
      _dispView = Element.create("<span></span>");
      appendChild(_editView);
      appendChild(_dispView);

      Event.observe(_editView, "keypress", this.onKeyPress.bind(this));
      Event.observe(_editView, "blur", this.save.bind(this));
      Event.observe(_dispView, "click", this.editMode.bind(this));
    }
  },
  onKeyPress: function(event){
    switch(event.keyCode){
      case Event.KEY_RETURN:
        this.save(); 
        break;
      case Event.KEY_ESC:
        this.dispMode(); 
        break;
    }
  },
  setValue: function(value){
    this._value = value;
    this.dispMode();
  },
  getValue: function(){
    return this._value;
  },
  save: function(){
    with(this){
      if(_editView.value != _value){
        _value = _editView.value;
        controller.fireEvent(_options.eventName || "NavigationEditableSpanEdited", _value);
      }
      dispMode();
    }
  },
  dispMode: function(){
    with(this){
      _dispView.innerHTML = "";
      _dispView.append(_value);
      Element.hide(_editView);
      Element.show(_dispView);
    }
  },
  editMode: function(){
    with(this){
    	if(_locked) return;
	    _editView.value = _value;
	    Element.hide(_dispView);
	    Element.show(_editView);
	    _editView.select();
	    _editView.focus();
    }
  },
  lock: function(){
  	this._locked = true;
  },
  unlock: function(){
  	this._locked = false;
  	}
});
