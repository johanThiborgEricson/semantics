describe("The insignificant meta instruction", function() {
  
  var interpreter;
  var f = new InterpreterMethodFactory();
  var fail = function() {
    return "failure";
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      ia: f.insignificant(/i/, "a"),
      j: f.atom(/j/),
      ja: f.insignificant("j", "a"),
    };
  });
  
  it("can skip a leading regular expression", function() {
    expect(interpreter.ia("ia")).toBe("a");
  });
  
  it("only affects its descendants", function() {
    interpreter.ib = f.atom(/ib/);
    interpreter.iaib = f.or("ia", "ib");
    
    expect(interpreter.iaib("ib")).toEqual("ib");
  });
  
  it("fails to parse if its insignificant regex fails to parse", function() {
    interpreter.fail = f.atom(/a/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
  it("can be nested", function() {
    interpreter.program = f.or("ia", "b");
    interpreter.j = f.insignificant(/j/, "program");
    
    expect(interpreter.j("jb")).toBe("b");
  });
  
  it("can skip one nonterminal", function() {
    expect(interpreter.ja("ja")).toBe("a");
  });
  
  it("can skip many insignificant nonterminals", function() {
    interpreter.i = f.atom(/i/);
    interpreter.ias = f.insignificant("i", "as");
    interpreter.as = f.star("a");
    
    expect(interpreter.ias("iaia")).toEqual(["a", "a"]);
  });
  
  it("fails if its insignificant nonterminal fails", function() {
    interpreter.fail = f.atom(/a/, fail);
    interpreter.program = f.or("ja", "fail");
    
    expect(interpreter.program("a", true)).toBe("failure");
  });
  
  it("effects the delimiters of a list", function() {
    interpreter.as = f.star("a", /,/);
    interpreter.ap = f.plus("a", /,/);
    interpreter.ias = f.insignificant(/ /, "as");
    interpreter.iap = f.insignificant(/ /, "ap");
    
    expect(interpreter.ias(" a , a")).toEqual(["a", "a"]);
  });
  
});
