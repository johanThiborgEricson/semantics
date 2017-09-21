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
      j: f.atom(/j/),
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
  
  it("can be a nonterminal", function() {
    interpreter.ja = f.insignificant("j", "a");
    
    expect(interpreter.ja("jaj")).toBe("a");
  });
  
  it("becomes double padded on nesting", function() {
    interpreter.program = f.insignificant(/j/, "ia");
    
    expect(interpreter.program("jiaij")).toBe("a");
  });
  
  it("fails to parse if its outer double padding fails to parse", function() {
    interpreter.doublePadded = f.insignificant(/j/, "ia");
    interpreter.fail = f.atom(/iaij/, fail);
    interpreter.program = f.or("doublePadded", "fail");
    
    expect(interpreter.program("iaij")).toBe("failure");
  });
  
});