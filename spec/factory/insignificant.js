/**
 * @name insignificantUnitTests
 */
describe("The insignificant meta-nonterminal", function() {
  
  var f;
  var interpreter;
  var fail = function() {
    return "failure";
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal2(/a/),
      b: f.terminal2(/b/),
      j: f.terminal2(/j/),
      ia: f.insignificant2("a", /i/),
    };
    
  });
  
  it("can skip an insignificant regex before and after", function() {
    expect(interpreter.ia("iai")).toBe("a");
  });
  
  it("can be nested", function() {
    interpreter.program = f.insignificant2("iab", /j/);
    interpreter.iab = f.or("ia", "b");
    
    expect(interpreter.program("jbj")).toBe("b");
  });
  
  it("fails if the trailing insignificant fails", function() {
    interpreter.fail = f.terminal(/ia/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("ia")).toBe("failure");
  });
  
  it("fails if a leading insignificant fails", function() {
    interpreter.fail = f.terminal(/ai/, fail);
    interpreter.program = f.or("ia", "fail");
    
    expect(interpreter.program("ai")).toBe("failure");
  });
  
  it("can be a nonterminal", function() {
    interpreter.ja = f.insignificant2("a", "j");
    
    expect(interpreter.ja("jaj")).toBe("a");
  });
  
  it("becomes double padded on nesting", function() {
    interpreter.program = f.insignificant2("ia", /j/);
    
    expect(interpreter.program("jiaij")).toBe("a");
  });
  
  it("fails to parse if its outer double padding fails to parse", function() {
    interpreter.doublePadded = f.insignificant2("ia", /j/);
    interpreter.fail = f.terminal(/iaij/, fail);
    interpreter.program = f.or("doublePadded", "fail");
    
    expect(interpreter.program("iaij")).toBe("failure");
  });
  
});