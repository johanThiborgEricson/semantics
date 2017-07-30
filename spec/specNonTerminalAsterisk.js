describe("InterpreterMethodFactory()" +
".nonTerminalAsterisk(name, optional interpretation)" + 
".call(interpreter, CodePointer(lexeme1 + ... + lexemeN))", 
function() {
  var methodFactory = InterpreterMethodFactory();
  var interpreter;
  var noop;
  
  beforeEach(function() {
    noop = function() {};
    interpreter = {
      con: "",
      name: StubLexeme_dConcatenator(),
    };
    
  });
  
  it("with n = 0, calls name with codePointer once", 
  function() {
    spyOn(interpreter, "name").and.returnValue(null);
    interpreter.asterisk = methodFactory.nonTerminalAsterisk("name");
    var codePointer = CodePointer("");
    interpreter.asterisk(codePointer);
    expect(interpreter.name).toHaveBeenCalledWith(codePointer);
    expect(interpreter.name.calls.count()).toBe(1);
  });
  
  it("with n = 1, calls name twice", function() {
    spyOn(interpreter, "name").and.returnValues(noop, null);
    interpreter.sequence = methodFactory.nonTerminalAsterisk("name");
    var codePointer = CodePointer("lexeme 1");
    interpreter.sequence(codePointer);
    expect(interpreter.name.calls.count()).toBe(2);
  });
  
  it("returns an instruction that, when called with interpreter as " + 
  "argument, calls the instructions parsed by name with interpreter", 
  function() {
    var instruction = jasmine.createSpy("instruction");
    spyOn(interpreter, "name").and
    .returnValues(instruction, instruction, null);
    interpreter.asterisk = methodFactory.nonTerminalAsterisk("name");
    var asteriskInstruction = interpreter.asterisk(CodePointer());
    asteriskInstruction(interpreter);
    expect(instruction).toHaveBeenCalledWith(interpreter);
    expect(instruction.calls.count()).toBe(2);
  });
  
  it("if n = 0, returns a function that doesn't call instructions made " + 
    "by name", function() {
    var instruction = jasmine.createSpy("instruction");
    spyOn(interpreter, "name").and.returnValues(null, instruction);
    interpreter.asterisk = methodFactory.nonTerminalAsterisk("name");
    var asteriskInstruction = interpreter.asterisk(CodePointer(""));
    asteriskInstruction(interpreter);
    expect(instruction).not.toHaveBeenCalled();
  });
  
  describe("if interpretation isn't supplied,", function() {
    
    it("returns an instruction that, when called, returns an array with " + 
    "one element per pased lexeme that contains the result of calling the " + 
    "instructions returned by the elements", function(){
      var instruction1 = function() {
        return "instruction result 1";
      };
      
      var instruction2 = function() {
        return "instruction result 2";
      };
      
      spyOn(interpreter, "name").and.returnValues(instruction1, instruction2);
      interpreter.asterisk = methodFactory.nonTerminalAsterisk("name");
      var asteriskInstruction = interpreter.asterisk(CodePointer());
      expect(asteriskInstruction(interpreter)).toEqual([
        "instruction result 1",
        "instruction result 2"
      ]);
      
    });
    
  });

  describe("if interpretation is supplied,", function() {
    
    it("returns an instruction that, when called, calls interpretation with " + 
    "an array with one element per pased lexeme that contains the result of " + 
    "calling the instructions returned by the elements", function(){
      var instruction1 = function() {
        return "instruction result 1";
      };
      
      var instruction2 = function() {
        return "instruction result 2";
      };
      
      spyOn(interpreter, "name").and.returnValues(instruction1, instruction2);
      var interpretation = jasmine.createSpy("interpretation");
      interpreter.asterisk = methodFactory
      .nonTerminalAsterisk("name", interpretation);
      var codePointer = CodePointer();
      var asteriskInstruction = interpreter.asterisk(codePointer);
      asteriskInstruction(interpreter);
      expect(interpretation).toHaveBeenCalledWith([
        "instruction result 1",
        "instruction result 2"
      ]);
      
    });
    
    it("returns an instruction that, when called with interpreter, calls " + 
    "interpretation with this-binding bound to interpreter", 
    function(){
      var stolenThis;
      var thisThief = function() {
        stolenThis = this;
      };
      
      interpreter.asterisk = methodFactory
      .nonTerminalAsterisk("name", thisThief);
      spyOn(interpreter, "name").and.returnValue(null);
      var codePointer = CodePointer();
      var asteriskInstruction = interpreter.asterisk(codePointer);
      asteriskInstruction(interpreter);
      expect(stolenThis).toBe(interpreter);
    });
    
    it("returns an instruction that returns the result of interpretation",
    function() {
      var interpretation = function() {
        return "interpretation result";
      };
      
      interpreter.asterisk = methodFactory
      .nonTerminalAsterisk("name", interpretation);
      var codePointer = CodePointer();
      var asteriskInstruction = interpreter.asterisk(codePointer);
      expect(asteriskInstruction(interpreter))
      .toEqual("interpretation result");
    });
    
  });

});
