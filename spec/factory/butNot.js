/**
 * @name butNotUnitTests
 */
describe("A but not meta terminal", function() {
  
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      anything: f.terminal(/./),
    };
    
  });
  
  it("may disallow nothing", function() {
    interpreter.noRestriction = f.butNot("anything", []);
    expect(interpreter.noRestriction("a")).toBe("a");
  });
  
  it("may exclude one alternative", function() {
    interpreter.notA = f.butNot("anything", ["a"]);
    interpreter.alternativeA = f.terminal(/a/, function() {
      return "alternative a";
    });
    
    interpreter.program = f.or("notA", "alternativeA");
    
    expect(interpreter.program("a")).toBe("alternative a");
  });
  
  it("may exclude many alternatives", function() {
    interpreter.notAorB = f.butNot("anything", ["a", "b"]);
    interpreter.alternativeB = f.terminal(/b/, function() {
      return "alternative b";
    });
    
    interpreter.program = f.or("notAorB", "alternativeB");
    
    expect(interpreter.program("b")).toBe("alternative b");
  });
  
  it("does not include a leading or trailing insignificant", function() {
    interpreter = {
      ab: f.group(/a/, /b/),
      justChild: f.butNot("ab", ["iaib", "aibi", "iaibi"]),
      iaibi: f.insignificant("justChild", /i/),
    };
    
    expect(interpreter.iaibi("iaibi")).toEqual({});
  });
  
});
