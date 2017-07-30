describe("InterpreterMethodFactory()" + 
".nonTerminalAlternative(name1, ..., nameN)" + 
".call(interpreter, lexemeK + code)", function() {
  
  var methodFactory;
  var interpreter;
  var parseFail;
  
  beforeEach(function() {
    parseFail = function() {
      return null;
    };
    interpreter = {};
    methodFactory = InterpreterMethodFactory();
  });
  
  it("if k = m = 1, calls name1 with codePointer and returns the result " +
  "(an instruction)", 
  function() {
    interpreter.name1 = jasmine.createSpy("name 1").and
    .returnValue("instruction 1");
    interpreter.alternative = methodFactory.nonTerminalAlternative("name1");
    var codePointer = CodePointer();
    expect(interpreter.alternative(codePointer)).toEqual("instruction 1");
    expect(interpreter.name1).toHaveBeenCalledWith(codePointer);
  });
  
  it("if k = m = 2, returns the reslut of calling name2", function() {
    interpreter.name1 = parseFail;
    interpreter.name2 = function(){return "instruction 2";};
    interpreter.alternative = methodFactory
    .nonTerminalAlternative("name1", "name2");
    var codePointer = CodePointer();
    expect(interpreter.alternative(codePointer)).toEqual("instruction 2");
  });
  
  it("returns null if all fails", function() {
    interpreter.name1 = parseFail;
    interpreter.name2 = parseFail;
    interpreter.alternative = methodFactory
    .nonTerminalAlternative("name1", "name2");
    var codePointer = CodePointer();
    expect(interpreter.alternative(codePointer)).toEqual(null);
  });
  
  it("returns the first match without trying the rest", function() {
    interpreter.name1 = parseFail;
    interpreter.name2 = function(){return "instruction 2";};
    interpreter.name3 = jasmine.createSpy("name3").and
    .returnValue("instruction 3");
    interpreter.alternative = methodFactory
    .nonTerminalAlternative("name1", "name2", "name3");
    var codePointer = CodePointer();
    expect(interpreter.alternative(codePointer)).toEqual("instruction 2");
    expect(interpreter.name3).not.toHaveBeenCalled();
  });
  
});
