Position.cumulativeOffsetParent= function(element,parentElement) {
  Element.makePositioned(parentElement);
  var valueT = 0, valueL = 0;
  do {
    valueT += element.offsetTop  || 0;
    valueL += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element && element != parentElement);
  return [valueL, valueT];
}

Element.scrollToInParent= function(element, parentElement) {
  element = $(element);
  var pos = Position.cumulativeOffsetParent(element, parentElement);
  parentElement.scrollTop = pos[1];
  return element;
};

Element.toString = function(e){
  var div = $E("div");
  div.appendChild(e);
  return div.innerHTML;
};

Element.getPageSize = function() {
  var xScroll, yScroll;
  if (window.innerHeight && window.scrollMaxY) {  
    xScroll = document.body.scrollWidth;
    yScroll = window.innerHeight + window.scrollMaxY;
  } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
    xScroll = document.body.scrollWidth;
    yScroll = document.body.scrollHeight;
  } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
    xScroll = document.body.offsetWidth;
    yScroll = document.body.offsetHeight;
  }

  var windowWidth, windowHeight;
  if (self.innerHeight) { // all except Explorer
    windowWidth = self.innerWidth;
    windowHeight = self.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
    windowWidth = document.documentElement.clientWidth;
    windowHeight = document.documentElement.clientHeight;
  } else if (document.body) { // other Explorers
    windowWidth = document.body.clientWidth;
    windowHeight = document.body.clientHeight;
  } 

  // for small pages with total height less then height of the viewport
  var pageWidth, pageHeight;
  if(yScroll < windowHeight){
    pageHeight = windowHeight;
  } else { 
    pageHeight = yScroll;
  }

  // for small pages with total width less then width of the viewport
  if(xScroll < windowWidth){  
    pageWidth = windowWidth;
  } else {
    pageWidth = xScroll;
  }

  return  $H({pageWidth: pageWidth, pageHeight: pageHeight, windowWidth: windowWidth, windowHeight: windowHeight});

};

String.prototype.trim = function () {
  return this.replace(/^\s*/, "").replace(/\s*$/, "");
} 
