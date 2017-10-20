/**
 * @name butNotUnitTests
 */
describe("A but not specification of an terminal", function() {
  
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      
    };
    
  });
  
  it("may be empty", function() {
    interpreter.anything = f.terminal(/./, []);
    expect(interpreter.anything("a")).toBe("a");
  });
  
  it("may exclude one alternative", function() {
    interpreter.notA = f.terminal(/./, ["a"]);
    interpreter.alternativeA = f.terminal(/a/, function() {
      return "alternative a";
    });
    
    interpreter.program = f.or("notA", "alternativeA");
    
    expect(interpreter.program("a")).toBe("alternative a");
  });
  
  it("may exclude many alternatives", function() {
    interpreter.notAorB = f.terminal(/./, ["a", "b"]);
    interpreter.alternativeB = f.terminal(/b/, function() {
      return "alternative b";
    });
    
    interpreter.program = f.or("notAorB", "alternativeB");
    
    expect(interpreter.program("b")).toBe("alternative b");
  });
  
  it("may have an interpretation", function() {
    interpreter.aNotB = f.terminal(/a/, ["b"], function interpretation() {
      return "certainly not b";
    });
    
    expect(interpreter.aNotB("a")).toBe("certainly not b");
  });
  
});
