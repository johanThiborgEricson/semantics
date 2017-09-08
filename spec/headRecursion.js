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
    expect(interpreter.as("aa", true)).toBe("e0aa");
  });
  
});
