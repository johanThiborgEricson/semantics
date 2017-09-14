describe("The insignificant meta-nonterminal", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var fail = function() {
    return "failure";
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      ia: f.insignificant(/i/, "a"),
    };
    
  });
  
  it("can skip an insignificant regex before and after", function() {
    expect(interpreter.ia("iai")).toBe("a");
  });
  
  it("can be nested", function() {
    interpreter.program = f.insignificant(/j/, "iab");
    interpreter.iab = f.or("ia", "b");
    
    expect(interpreter.program("jbj")).toBe("b");
  });
  
});