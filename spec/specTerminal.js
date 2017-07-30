describe("InterpreterMethodFactory().terminal(token, interpretation)" + 
".call(interpreter, codePointer)(interpreter)", function() {
  var codePointer;
  var methodFactory;
  var interpreter;
  
  function StubCodePointer() {
    var that = Object.create(StubCodePointer.prototype);
    that.parse = function() {
      
    };
    
    return that;
  }
  
  StubCodePointer.prototype = CodePointer();
  
  beforeEach(function() {
    codePointer = StubCodePointer();
    codePointer.reportParseFail = function() {};
    methodFactory = InterpreterMethodFactory();
    interpreter = {};
  });
  
  it("calls codePointer.parse with token", function() {
    interpreter.method = methodFactory.terminal("token", "interpretation");
    spyOn(codePointer, "parse");
    interpreter.method(codePointer);
    expect(codePointer.parse).toHaveBeenCalledWith("token");
  });
  
  it("calls interpretation with all the elements in the result " + 
  "of codePointer.parse", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.method = methodFactory.terminal("token", interpretation);
    spyOn(codePointer, "parse").and.returnValue(["lexeme a", "lexeme b"]);
    var instruction = interpreter.method(codePointer);
    instruction();
    expect(interpretation).toHaveBeenCalledWith("lexeme a", "lexeme b");
  });
  
  it("calls interpretation with interpreter", 
  function() {
    var stolenThis;
    var thisThief = function() {
      stolenThis = this;
    };
    
    interpreter.method = methodFactory.terminal("token", thisThief);
    spyOn(codePointer, "parse").and.returnValue([]);
    var instruction = interpreter.method(codePointer);
    instruction(interpreter);
    expect(stolenThis).toBe(interpreter);
  });
  
  it("returns null if the result of parse is null", function() {
    interpreter.method = methodFactory.terminal("token", "interpretation");
    spyOn(codePointer, "parse").and.returnValue(null);
    expect(interpreter.method(codePointer)).toBe(null);
  });
  
});
