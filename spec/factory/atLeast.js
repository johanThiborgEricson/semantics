describe("The at least quantifier", function() {
  
  var f;
  var interpreter;
  var parseFail = function() {
    return "parse fail";
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal2(/a/),
      atLeastZero: f.atLeast(0, "a"),
      list: f.atLeast(0, "a", /d/),
    };
    
  });
  
  it("can parse one child", function() {
    expect(interpreter.atLeastZero("a")).toEqual(["a"]);
  });
  
  it("runs the interpretation of its children as methods", function() {
    interpreter.charEater = f.terminal(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.charEaters = f.atLeast(0, "charEater");
    interpreter.charEaters("a");
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("may parse no children", function() {
    expect(interpreter.atLeastZero("")).toEqual([]);
  });
  
  it("may parse many children", function() {
    expect(interpreter.atLeastZero("aaa")).toEqual(["a", "a", "a"]);
  });
  
  it("may have a delimiter", function() {
    expect(interpreter.list("ada")).toEqual(["a", "a"]);
  });
  
  it("must parse the delimiter", function() {
    interpreter.fail = f.terminal(/aa/, parseFail);
    interpreter.program = f.longest("list", "fail");
    expect(interpreter.program("aa")).toBe("parse fail");
  });
  
  it("can parse insignificants", function() {
    interpreter.insignificant = f.insignificant2("atLeastZero", /i/);
    expect(interpreter.insignificant("iaiai")).toEqual(["a", "a"]);
  });
  
  it("must parse the insignificant", function() {
    interpreter.fail = f.terminal(/iaai/, parseFail);
    interpreter.insignificant = f.insignificant2("atLeastZero", /i/);
    interpreter.program = f.longest("insignificant", "fail");
    expect(interpreter.program("iaai")).toBe("parse fail");
  });
  
});
