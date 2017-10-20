/**
 * @name wrapUnitTests
 */
describe("A wrapper", function() {
  
  var f;
  var interpreter;
  var fail = function() {
    return "failure";
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
    };
    
  });
  
  it("calls its interpretation with the result of its part", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.wrap = f.wrap("a", interpretation);
    
    interpreter.wrap("a");
    
    expect(interpretation).toHaveBeenCalledWith("a");
  });
  
  it("calls its interpretation as a method", function() {
    interpreter.charEater = f.wrap("a", function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.charEater("a");
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("calls its part as a method", function() {
    interpreter = {
      wrapper: f.wrap("charEater", function() {}),
      charEater: f.terminal(/./, function(theChar) {
        this.eatenChar = theChar;
      }),
      
    };
    
    interpreter.wrapper("a");
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("returns the result of its interpretation", function() {
    interpreter.wrapper = f.wrap("a", function() {
      return "result";
    });
    
    expect(interpreter.wrapper("a")).toBe("result");
  });
  
  it("fails to parse if its part fails to parse", function() {
    interpreter.wrapper = f.wrap("a", function() {});
    interpreter.fail = f.terminal(/b/, function() {
      return "failure";
    });
    
    interpreter.program = f.or("wrapper", "fail");
    
    expect(interpreter.program("b")).toBe("failure");
  });
  
  it("returns the result of its part if it has no interpretation", function() {
    interpreter.wrap = f.wrap("a");
    interpreter.a = f.terminal(/a/, function() {
      return "part result";
    });
    
    expect(interpreter.wrap("a")).toBe("part result");
  });
  
  it("fails to parse if its part fails to parse, even if it has no " +
  "interpretation", function() {
    interpreter.wrapper = f.wrap("a");
    interpreter.fail = f.terminal(/b/, function() {
      return "failure";
    });
    
    interpreter.program = f.or("wrapper", "fail");
    
    expect(interpreter.program("b")).toBe("failure");
  });
  
  it("may skip leading regexes", function() {
    interpreter.bca = f.wrap(/b/, /c/, "a");
    
    expect(interpreter.bca("bca")).toBe("a");
  });
  
  it("fails to parse if a leading regex fails to parse", function() {
    interpreter.ba = f.wrap(/b/, "a");
    interpreter.fail = f.terminal(/a/, fail);
    interpreter.program = f.or("ba", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
  it("may skip trailing regexes", function() {
    interpreter.abc = f.wrap("a", /b/, /c/);
    
    expect(interpreter.abc("abc")).toBe("a");
  });
  
  it("fails to parse if a leading regex fails to parse", function() {
    interpreter.ab = f.wrap("a", /b/);
    interpreter.fail = f.terminal(/a/, fail);
    interpreter.program = f.or("ab", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
  it("can have an interpretation after regexes", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.wrap = f.wrap("a", /b/, /c/, interpretation);
    
    interpreter.wrap("abc");
    
    expect(interpretation).toHaveBeenCalledWith("a");
  });
  
});
