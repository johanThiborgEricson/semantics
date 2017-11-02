describe("The at least quantifier", function() {
  
  var f;
  var interpreter;
  
  beforeEach(function() {
    f = new InterpreterMethodFactory();
    interpreter = {
      a: f.terminal(/a/),
      atLeastZero: f.atLeast(0, "a"),
    };
    
  });
  
  it("can parse one child", function() {
    expect(interpreter.atLeastZero("a")).toEqual(["a"]);
  });
  
  it("runs the interpretation of its children as methods", function() {
    interpreter.charEater = f.terminal(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.charEaters = f.atLeast(0, "charEater");
    interpreter.charEaters("a");
    expect(interpreter.eatenChar).toBe("a");
  });
  
});
