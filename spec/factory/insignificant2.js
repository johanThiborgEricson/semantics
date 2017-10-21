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
  
  it("is parsed between children of a group", function() {
    interpreter.pairOfAs = f.group2("a", "a");
    interpreter.insignificant = f.insignificant2("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("is parsed between leading anonymous terminals", function() {
    interpreter.pairOfAs = f.group2(/a/, /a/);
    interpreter.insignificant = f.insignificant2("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai", true)).toEqual({});
  });
  
});
