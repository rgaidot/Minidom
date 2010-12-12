Object.impl = function(cls, interf) {
	var interfaceMembers = $H(interf).keys();
	var classMembers = $A();
	for (var m in cls.prototype) {
		classMembers.push(m);
	} 
	interfaceMembers.each(function(member){
		if (-1 == classMembers.indexOf(member)) {
			throw "Class [" + classMembers.inspect() + "] does not implement "+member;
		} 
	});

} 
