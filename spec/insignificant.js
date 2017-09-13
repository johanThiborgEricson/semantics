describe("The insignificant meta instruction", function() {
  
  var interpreter;
  var f = new InterpreterMethodFactory();
  var fail = function() {
    return "failure";
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
    };
  });
  
  it("can skip a leading regular expression", function() {
    interpreter.leadingRegExp = f.insignificant(/i/, "a");
    expect(interpreter.leadingRegExp("ia")).toBe("a");
  });
  
});
