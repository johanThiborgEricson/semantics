describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var id = function(x) {
    return x;
  };
  
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    interpreter = {};
    interpreter.a = f.terminal(/(a)/, id);
    interpreter.b = f.terminal(/(b)/, id);
    interpreter.baaa = f.disjunction("baaa1", "b");
    interpreter.baaa1 = f.nonTerminalSequence("baaa", "a", add);
    interpreter.emptyCounter = f.terminalEmptyString((function() {
      var i = 1;
      return function() {
        return "e" + i++;
      };
      
    })());
    
  });
  
  it("can find a base case after a recursive case", function() {
    expect(interpreter.baaa("b")).toBe("b");
  });
  
  it("can recurse once", function() {
    expect(interpreter.baaa("ba")).toBe("ba");
  });
  
  it("can recurse twice", function() {
    expect(interpreter.baaa("baa")).toBe("baa");
  });
  
  it("can have empty base cases", function() {
    interpreter.as = f.disjunction("as0", "emptyCounter");
    interpreter.as0 = f.nonTerminalSequence("as", "a", add);

    expect(interpreter.as("")).toBe("e1");
  });
  
  it("doesn't recurse if the definition isn't recursive", function() {
    var calls = 0;
    interpreter.emptyCallCounter = f.terminalEmptyString(function() {
      calls++;
    });
    
    interpreter.disjunction = f.disjunction("emptyCallCounter");
    
    interpreter.disjunction("");
    
    expect(calls).toBe(1);
  });
  
  it("creates new base cases for each consequtive head recursion", function() {
    interpreter.as = f.disjunction("as0", "emptyCounter");
    interpreter.as0 = f.nonTerminalSequence("as", "a", add);
    interpreter.as3 = f.nonTerminalSequence("as", "as", "as", 
    function(as1, as2, as3) {
      return as1+as2+as3;
    });
    
    expect(interpreter.as3("", true)).toBe("e1e2e3");
  });
  
  it("can have many heads at the same position in the code", function() {
    interpreter.bsas = f.disjunction("bsas0", "bs");
    interpreter.bsas0 = f.nonTerminalSequence("bsas", "a", add);
    interpreter.bs = f.disjunction("bs0", "emptyCounter");
    interpreter.bs0 = f.nonTerminalSequence("bs", "b", add);
    
    expect(interpreter.bsas("a")).toBe("e1a");
  });
  
  it("can start at any point in the code", function() {
    interpreter.bas = f.nonTerminalSequence("b", "as", add);
    interpreter.as = f.disjunction("as0", "emptyCounter");
    interpreter.as0 = f.nonTerminalSequence("as", "a", add);
    
    expect(interpreter.bas("ba")).toBe("be1a");
  });
  
  it("can't parse a base case several times", function() {
    interpreter.bas = f.disjunction("bas0", "bBaseCase");
    interpreter.bas0 = f.nonTerminalSequence("bas", "a", add);
    interpreter.bBaseCase = f.terminal(/(b)/, function() {
      return "base";
    });
    
    interpreter.program = f.nonTerminalSequence("bas", "b", add);
    
    expect(interpreter.program("bb")).toBe("baseb");
  });
});
