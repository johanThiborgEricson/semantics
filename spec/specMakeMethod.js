describe("InterpreterMethodFactory().makeMethod(instructionMaker)" + 
".call(interpreter, code)", function() {
  var CodePointer;
  var interpreter;
  var methodFactory;

  beforeEach(function() {
    interpreter = {};
    methodFactory = InterpreterMethodFactory();
    methodFactory.CodePointer = jasmine.createSpy("interpreter.CodePointer").and
    .returnValue(StubCodePointer(""));
    CodePointer = jasmine.createSpy("CodePointer").and
    .returnValue(StubCodePointer(""));
  });
  
  describe("if code is a codePointer,", function() {
    
    it("calls instructionMaker with code and interpreter and returns the " +
    "result", function() {
      var instructionMaker = jasmine.createSpy("instructionMaker").and
      .returnValue("instruction maker result");
      interpreter.method = methodFactory.makeMethod(instructionMaker);
      var codePointer = CodePointer();
      expect(interpreter.method(codePointer))
      .toEqual("instruction maker result");
      expect(instructionMaker).toHaveBeenCalledWith(codePointer, interpreter);
    });
    
  });
  
  it("calls CodePointer with code", function() {
    interpreter.method = methodFactory.makeMethod(function() {
      return function() {};
    });
    
    interpreter.method("code");
    expect(methodFactory.CodePointer).toHaveBeenCalledWith("code");
  });
  
  it("calls instructionMaker with the result of " + 
  "CodePointer(code) and the interpreter that the method was on", function() {
    var codePointer = {getUnparsed() {return "";}};
    methodFactory.CodePointer = function() {
      return codePointer;
    };
    
    var instructionMaker = jasmine.createSpy("instructionMaker").and
    .returnValue(function(){});
    interpreter.method = methodFactory.makeMethod(instructionMaker);
    interpreter.method();
    expect(instructionMaker)
    .toHaveBeenCalledWith(codePointer, interpreter);
  });
  
  it("throws an error if !instructionMaker(codePointer)", function() {
    var instructionMaker = function() {
      return null;
    };
    
    interpreter.method = methodFactory.makeMethod(instructionMaker);
    
    expect(interpreter.method.bind(interpreter)).toThrow();
  });
  
  it("throws an error if codePointer.getUnparsed() !== ''", function() {
    methodFactory.CodePointer = function() {
      return {
        getUnparsed() {
          return "trailing code";
        },
      };
    };
    
    interpreter.method = methodFactory.makeMethod(function() {
      return function() {};
    });
    
    expect(interpreter.method.bind(interpreter)).toThrow();
  });
  
  it("calls the result of instructionMaker with interpreter and returns " +
  "the result", function() {
    var instruction = jasmine.createSpy("instruction").and
    .returnValue("result");
    var instructionMaker = function() {
      return instruction;
    };
    
    interpreter.method = methodFactory.makeMethod(instructionMaker);
    
    expect(interpreter.method()).toEqual("result");
    expect(instruction).toHaveBeenCalledWith(interpreter);
  });
  
  it("if code is a CodePointer, calls backup on that codePointer before " +
  "instructionMaker is called, and calls restore with the result iff " +
  "instructionMaker returns null", function() {
    var successfulInstructionMaker = function() {
      return "instruction";
    };
    
    var failInstructionMaker = function() {
      return null;
    };
    
    interpreter.parseSuccessful = 
    methodFactory.makeMethod(successfulInstructionMaker);
    interpreter.parseFail = 
    methodFactory.makeMethod(failInstructionMaker);
    var codePointer = CodePointer();
    spyOn(codePointer, "backup").and.returnValue("backup");
    spyOn(codePointer, "restore");
    interpreter.parseSuccessful(codePointer);
    expect(codePointer.backup).toHaveBeenCalled();
    expect(codePointer.restore).not.toHaveBeenCalled();

    interpreter.parseFail(codePointer);
    expect(codePointer.restore).toHaveBeenCalledWith("backup");
  });
  
  it("throws the text returned by codePointer.getParseErrorDescription if " +
  "instructionMaker returns null", function() {
    var failInstructionMaker = function() {
      return null;
    };
    
    function ParseErrorDescriptionCodePointer() {
      var codePointer = CodePointer();
      spyOn(codePointer, "getParseErrorDescription").and
      .returnValue("parse error description");
      return codePointer;
    }
    
    
    methodFactory.CodePointer = ParseErrorDescriptionCodePointer;
    interpreter.parseFail = methodFactory.makeMethod(failInstructionMaker);
    
    expect(interpreter.parseFail.bind(interpreter, ""))
    .toThrowError("parse error description");
  });
  
  it("throws helpful message plus the text returned by " +
  "codePointer.getUnparsed if it is non-empty", function() {
    var instructionMaker = function() {
      return function() {};
    };
    
    function TrailingCodeCodePointer() {
      var codePointer = CodePointer();
      spyOn(codePointer, "getUnparsed").and
      .returnValue("trailing code");
      return codePointer;
    }
    
    
    methodFactory.CodePointer = TrailingCodeCodePointer;
    interpreter.cantParseAll = methodFactory.makeMethod(instructionMaker);
    
    expect(interpreter.cantParseAll.bind(interpreter, ""))
    .toThrowError("Trailing code: 'trailing code'.");
  });
  
  // this works if the user uses "use strict". My IDE complains about this test
  // (quite rightfully), so I commented it out.
  xit("calls instructionMaker with this bound to undefined if the returned " +
  "method is called like a function", function() {
    // "use strict";
    var stolenThis;
    function thisThief() {
      stolenThis = this;
    }
    
    var justFunction = methodFactory.makeMethod(thisThief);
    var codePointer = CodePointer();
    justFunction(codePointer);
    expect(stolenThis).toBe(undefined);
  });
  
});
