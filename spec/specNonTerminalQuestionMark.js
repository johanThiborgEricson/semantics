describe("The question mark quantifier", function() {
  
  var f = new InterpreterMethodFactory();
  var i;
  
  beforeEach(function() {
    i = {};
    i.a = f.atom(/a/);
    i.b = f.atom(/b/);
    i.ar = f.atom(/a/, function() {
      return "the result";
    });
    
  });
  
  it("matches its part once", function() {
    i.maybeA = f.nonTerminalQuestionMark("a");
    
    expect(function() {
      i.maybeA("a");
    }).not.toThrow();
    
  });
  
 it("matches the empty string", function() {
    i.maybeA = f.nonTerminalQuestionMark("a");
    i.ab = f.group("maybeA", "b", function() {});
    
    expect(function() {
      i.ab("b");
    }).not.toThrow();
    
  });
  
  it("returns the result of its part", function() {
    i.maybeA = f.nonTerminalQuestionMark("ar");
    
    expect(i.maybeA("a")).toBe("the result");
  });
  
  it("returns the default value if it didn't match", function() {
    i.maybeA = f.nonTerminalQuestionMark("ar", "the default value");
    
    expect(i.maybeA("")).toBe("the default value");
  });
  
  it("calls its part as a method of the interpreter", function() {
    i.charEater = f.atom(/./, function(char) {
      this.theChar = char;
    });
    
    i.opt = f.nonTerminalQuestionMark("charEater");
    
    i.opt("a");
    
    expect(i.theChar).toBe("a");
  });
  
});
