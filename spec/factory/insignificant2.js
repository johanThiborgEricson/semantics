describe("An insignificant pattern", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal2(/a/),
    };
    
  });
  
  it("is parsed around a token", function() {
    interpreter.insignificant = f.insignificant2("a", /i/);
    expect(interpreter.insignificant("iai")).toBe("a");
  });
  
});
