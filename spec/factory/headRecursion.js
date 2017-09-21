describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  f.noRecursion = function(instructionMaker) {
    return this.makeMethod(instructionMaker);
  };
  
  var instructionMaker;
  var interpreter;
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    
    instructionMaker = jasmine.createSpy("instructionMaker")
    .and.returnValue(function instruction() {});
    
    interpreter = {
      noRecursion: f.noRecursion(instructionMaker), 
      a: f.atom(/a/),
      as: f.or("as1", "ec"),
      as1: f.group("as", "a", add),
      ec: f.empty(function() {
        var i = 0;
        return function() {
          return "e"+i++;
        };
      }()),
      
    };
    
  });
  
  it("doesn't look for recursive definitions if no head recursion is detected", 
  function() {
    interpreter.noRecursion("");
    
    expect(instructionMaker).toHaveBeenCalledTimes(1);
  });
  
  it("can return a base case", function() {
    expect(interpreter.as("")).toBe("e0");
  });
  
  it("can recurse once", function() {
    expect(interpreter.as("a")).toBe("e0a");
  });
  
  it("can recurse twice", function() {
    expect(interpreter.as("aa")).toBe("e0aa");
  });
  
  it("restores the state if its base case fails to parse", function() {
    interpreter.baseCase = f.atom(/base case/);
    interpreter.recursionFail = f.or("recursionFail", "baseCase");
    interpreter.program = f.or("recursionFail", "a");
    
    expect(interpreter.program("a")).toBe("a");
  });
  
  it("can be nested", function() {
    interpreter = {
      e: f.empty(function(){
        return "";
      }),
      
      newline: f.atom(/\n/),
      statements: f.or("statements1", "e"),
      statements1: f.group("statements", "statement", add),
      statement: f.group("expressions", "newline", add),
      expressions: f.or("expressions1", "e"),
      expressions1: f.group("expressions", "expression", add),
      expression: f.atom(/e\d/),
    };
    
    expect(interpreter.statements("")).toBe("");
    expect(interpreter.statements("\n")).toBe("\n");
    expect(interpreter.statements("e1\n")).toBe("e1\n");
    expect(interpreter.statements("e1e2\ne3\n")).toBe("e1e2\ne3\n");
  });
  
  it("can recurse through multiple paths", function() {
    interpreter = {
      e: f.atom(/(?:)/),
      b: f.atom(/b/),
      c: f.atom(/c/),
      bcs: f.or("bcs1", "e"),
      bcs1: f.or("bcsb", "bcsc"),
      bcsb: f.group("bcs", "b", add),
      bcsc: f.group("bcs", "c", add),
    };
    
    expect(interpreter.bcs("")).toBe("");
    expect(interpreter.bcs("b")).toBe("b");
    expect(interpreter.bcs("c")).toBe("c");
    expect(interpreter.bcs("bb")).toBe("bb");
    expect(interpreter.bcs("bc")).toBe("bc");
    expect(interpreter.bcs("cb")).toBe("cb");
    expect(interpreter.bcs("cc")).toBe("cc");
  });
  
});