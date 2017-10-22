describe("An insignificant pattern", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  function fail() {
    return "failure";
  }
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal2(/a/),
      i: f.terminal2(/i/),
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
    expect(interpreter.insignificant("iaiai")).toEqual({});
  });
  
  it("fails a group if it can't be parsed between children", function() {
    interpreter.pairOfAs = f.group2("a", "a");
    interpreter.insignificant = f.insignificant2("pairOfAs", /i/);
    interpreter.fail = f.terminal2(/iaai/, fail);
    interpreter.program = f.or("insignificant", "fail");
    expect(interpreter.program("iaai")).toBe("failure");
  });
  
  it("is parsed between many leading anonymous terminals", function() {
    interpreter.pairOfAs = f.group2(/a/, /a/);
    interpreter.insignificant = f.insignificant2("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual({});
  });
  
  it("is parsed between middle anonymous terminals of a group", function() {
    interpreter.fourAs = f.group2("a", /a/, /a/, "a");
    interpreter.insignificant = f.insignificant2("fourAs", /i/);
    expect(interpreter.insignificant("iaiaiaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("may be a terminal", function() {
    interpreter.insignificant = f.insignificant2("a", "i");
    expect(interpreter.insignificant("iai")).toBe("a");
  });
  
  it("may be a terminal between children", function() {
    interpreter.pairOfAs = f.group2("a", "a");
    interpreter.insignificant = f.insignificant2("pairOfAs", "i");
    expect(interpreter.insignificant("iaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("only affects descendants", function() {
    interpreter.insignificant = f.insignificant2("a", /i/);
    interpreter.b2 = f.group2(/b/, /b/);
    interpreter.program = f.or("insignificant", "b2");
    expect(interpreter.program("bb")).toEqual({});
  });
  
});
