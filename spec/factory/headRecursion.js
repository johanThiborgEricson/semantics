describe("Head recursion", function() {
  
  var f;
  var instructionMaker;
  var interpreter;
  var add = function(a, b) {
    return a+b;
  };
  
  var id = function(x) {
    return x;
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
    f.noRecursion = function(instructionMaker) {
      return this.makeMethod(instructionMaker);
    };
    
  });
  
  beforeEach(function() {
    
    instructionMaker = jasmine.createSpy("instructionMaker")
    .and.returnValue(function instruction() {});
    
    interpreter = {
      noRecursion: f.noRecursion(instructionMaker), 
      a: f.terminal(/a/),
      b: f.terminal(/b/),
      c: f.terminal(/c/),
      as: f.or("as1", "ec"),
      as1: f.group("as", "a", add),
      ec: f.empty(function() {
        var i = 0;
        return function() {
          return "e"+i++;
        };
      }()),
      
      bas: f.or("bas1", "b"),
      bas1: f.group("bas", "a", add),
    };
    
  });
  
  it("doesn't look for recursive definitions if no head recursion is detected", 
  function() {
    interpreter.noRecursion("");
    
    expect(instructionMaker).toHaveBeenCalledTimes(1);
  });
  
  it("can return a base case", function() {
    expect(interpreter.bas("b")).toBe("b");
  });
  
  it("can recurse once", function() {
    expect(interpreter.bas("ba")).toBe("ba");
  });
  
  it("can have an empty base case", function() {
    expect(interpreter.as("")).toBe("e0");
  });
  
  it("can recurse twice", function() {
    expect(interpreter.bas("baa")).toBe("baa");
  });
  
  it("restores the state if its base case fails to parse", function() {
    interpreter.baseCase = f.terminal(/base case/);
    interpreter.recursionFail = f.or("recursionFail", "baseCase");
    interpreter.program = f.or("recursionFail", "a");
    
    expect(interpreter.program("a")).toBe("a");
  });
  
  it("forgets any recursive definitions before trying to parse a nonterminal", 
  function() {
    interpreter.abs = f.or("abs1", "a");
    interpreter.abs1 = f.group("abs", "b", add);
    interpreter.abscs = f.or("abscs1", "abs");
    interpreter.abscs1 = f.group("abscs", "c", add);
    
    expect(interpreter.abscs("abc")).toBe("abc");
  });
  
  it("can occur inside many nested nonterminals", function() {
    interpreter.abcs = f.or("abcs1", "a");
    interpreter.abcs1 = f.group("abcsb", "c", add);
    interpreter.abcsb = f.group("abcs", "b", add);
    
    expect(interpreter.abcs("abc")).toBe("abc");
  });
  
  it("can be nested", function() {
    interpreter = {
      e: f.empty(function(){
        return "";
      }),
      
      newline: f.terminal(/\n/),
      statements: f.or("statements1", "e"),
      statements1: f.group("statements", "statement", add),
      statement: f.group("expressions", "newline", add),
      expressions: f.or("expressions1", "e"),
      expressions1: f.group("expressions", "expression", add),
      expression: f.terminal(/e\d/),
    };
    
    expect(interpreter.statements("")).toBe("");
    expect(interpreter.statements("\n")).toBe("\n");
    expect(interpreter.statements("e1\n")).toBe("e1\n");
    expect(interpreter.statements("e1e2\ne3\n")).toBe("e1e2\ne3\n");
  });
  
  it("can recurse through multiple paths", function() {
    interpreter = {
      e: f.terminal(/(?:)/),
      b: f.terminal(/b/),
      c: f.terminal(/c/),
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
  
  it("can have recursive base cases", function() {
    j = {
      newExpression: f.terminal(/new/),
      args: f.terminal(/\(args\)/),
      qualifier: f.terminal(/\.q/),
    };
    
    j.call = f.or("call1", 
    "call2", "newExpression");
    
    j.call1 = f.group("call", "args", add);
    
    j.call2 = f.group("callQualifier", "args", add);
    
    j.callQualifier = f.longest("callQualifier1", 
    "callQualifier2");
    
    j.callQualifier1 = f.group("call", 
    "qualifier", add);
    
    j.callQualifier2 = f.group("callQualifier", 
    "qualifier", add);
    
    expect(j.call("new.q.q(args)")).toBe("new.q.q(args)");
    
  });
  
});
