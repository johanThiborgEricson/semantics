describe("The question mark quantifier", function() {
  
  it("should match the specified non terminal once", function() {
    var f = new InterpreterMethodFactory();
    var i = {};
    
    i.a = f.terminal(/a/, function() {});
    i.maybeA = f.nonTerminalQuestionMark("a");
    
    expect(function() {
      i.maybeA("a");
    }).not.toThrow();
    
  });
  
 it("should match the empty string", function() {
    var f = new InterpreterMethodFactory();
    var i = {};
    
    i.a = f.terminal(/a/, function() {});
    i.b = f.terminal(/b/, function() {});
    i.maybeA = f.nonTerminalQuestionMark("a");
    i.ab = f.nonTerminalSequence("maybeA", "b", function() {});
    
    expect(function() {
      i.ab("b");
    }).not.toThrow();
    
  });
  
  it("should return the result of the specified non terminal", function() {
    var f = new InterpreterMethodFactory();
    var i = {};
    
    i.a = f.terminal(/a/, function() {
      return "the result";
    });
    
    i.maybeA = f.nonTerminalQuestionMark("a");
    
    expect(i.maybeA("a")).toBe("the result");
  });
  
  it("should return the default value if it didn't match", function() {
    var f = new InterpreterMethodFactory();
    var i = {};
    
    i.a = f.terminal(/a/, function() {
      return "the result";
    });
    
    i.maybeA = f.nonTerminalQuestionMark("a", "the default value");
    
    expect(i.maybeA("")).toBe("the default value");
  });
  
});