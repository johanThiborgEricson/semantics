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
    
    expect(interpreter.program("jbj", true)).toBe("b");
  });
  
  it("fails if the trailing insignificant fails", function() {
    interpreter.fail = f.atom(/ia/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("ia")).toBe("failure");
  });
  
  it("fails if a leading insignificant fails", function() {
    interpreter.fail = f.atom(/ai/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("ai")).toBe("failure");
  });
  
});