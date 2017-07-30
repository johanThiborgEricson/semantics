function StubCodePointer(code) {
  var that = Object.create(StubCodePointer.prototype);
  that.parse = function() {
    
  };
  
  that.getUnparsed = function() {
    return code;
  };
  
  that.backup = function() {
    return code;
  };
  
  that.restore = function(backup) {
    code = backup;
  };
  
  return that;
}

StubCodePointer.prototype = CodePointer();