describe("The insignificant meta instruction", function() {
  
  var interpreter;
  var f = new InterpreterMethodFactory();
  var fail = function() {
    return "failure";
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      ia: f.insignificant(/i/, "a"),
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
  
  it("fails to parse if its insignificant part fails to parse", function() {
    interpreter.fail = f.atom(/a/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
});
