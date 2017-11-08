describe("An insignificant pattern", function() {
  
  var f;
  var interpreter;
  function fail() {
    return "failure";
  }
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      i: f.terminal(/i/),
    };
    
  });
  
  it("is parsed around a token", function() {
    interpreter.insignificant = f.insignificant("a", /i/);
    expect(interpreter.insignificant("iai")).toBe("a");
  });
  
  it("is parsed between children of a group", function() {
    interpreter.pairOfAs = f.group("a", "a");
    interpreter.insignificant = f.insignificant("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("is parsed between leading anonymous terminals", function() {
    interpreter.pairOfAs = f.group(/a/, /a/);
    interpreter.insignificant = f.insignificant("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual({});
  });
  
  it("fails a group if it can't be parsed between children", function() {
    interpreter.pairOfAs = f.group("a", "a");
    interpreter.insignificant = f.insignificant("pairOfAs", /i/);
    interpreter.fail = f.terminal(/iaai/, fail);
    interpreter.program = f.or("insignificant", "fail");
    expect(interpreter.program("iaai")).toBe("failure");
  });
  
  it("is parsed between many leading anonymous terminals", function() {
    interpreter.pairOfAs = f.group(/a/, /a/);
    interpreter.insignificant = f.insignificant("pairOfAs", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual({});
  });
  
  it("is parsed between middle anonymous terminals of a group", function() {
    interpreter.fourAs = f.group("a", /a/, /a/, "a");
    interpreter.insignificant = f.insignificant("fourAs", /i/);
    expect(interpreter.insignificant("iaiaiaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("may be a terminal", function() {
    interpreter.insignificant = f.insignificant("a", "i");
    expect(interpreter.insignificant("iai")).toBe("a");
  });
  
  it("may be a terminal between children", function() {
    interpreter.pairOfAs = f.group("a", "a");
    interpreter.insignificant = f.insignificant("pairOfAs", "i");
    expect(interpreter.insignificant("iaiai")).toEqual({a: ["a", "a"]});
  });
  
  it("only affects descendants", function() {
    interpreter.insignificant = f.insignificant("a", /i/);
    interpreter.b2 = f.group(/b/, /b/);
    interpreter.program = f.or("insignificant", "b2");
    expect(interpreter.program("bb")).toEqual({});
  });
  
  it("must be parsed before and after", function() {
    interpreter.insignificant = f.insignificant("a", /i/);
    interpreter.fail = f.terminal(/i?ai?/, fail);
    interpreter.program = f.or("insignificant", "fail");
    expect(interpreter.program("ai")).toBe("failure");
    expect(interpreter.program("ia")).toBe("failure");
  });
  
  it("must be parsed between leading anonymous terminals", function() {
    interpreter.doubleAs = f.group("a", "a");
    interpreter.insignificant = f.insignificant("doubleAs", /i/);
    interpreter.fail = f.terminal(/aa/, fail);
    interpreter.program = f.or("insignificant", "fail");
    expect(interpreter.program("aa")).toBe("failure");
  });
  
  it("is double padded when insignificant is changed", function() {
    interpreter = {
      a: f.terminal(/a/),
      jaj: f.insignificant("a", /j/),
      ajaja: f.group("a", "jaj", "a", function(a1, jaj, a2) {
        return a1 + jaj + a2;
      }),
      
      iaijajiai: f.insignificant("ajaja", /i/),
    };
    
    expect(interpreter.iaijajiai("iaijajiai")).toBe("aaa");
  });
  
  it("may be a quantifier", function() {
    interpreter.as = f.star("a");
    interpreter.ip = f.plus("i");
    interpreter.insignificant = f.insignificant("as", "ip");
    expect(interpreter.insignificant("iaiiai")).toEqual(["a", "a"]);
  });
  
});
