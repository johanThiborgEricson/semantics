/**
 * @name butNotUnitTests
 */
describe("A but not specification of an atom", function() {
  
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
    interpreter.anything = f.atom(/./, []);
    expect(interpreter.anything("a")).toBe("a");
  });
  
  it("may exclude one alternative", function() {
    interpreter.notA = f.atom(/./, ["a"]);
    interpreter.alternativeA = f.atom(/a/, function() {
      return "alternative a";
    });
    
    interpreter.program = f.or("notA", "alternativeA");
    
    expect(interpreter.program("a")).toBe("alternative a");
  });
  
  it("may exclude many alternatives", function() {
    interpreter.notAorB = f.atom(/./, ["a", "b"]);
    interpreter.alternativeB = f.atom(/b/, function() {
      return "alternative b";
    });
    
    interpreter.program = f.or("notAorB", "alternativeB");
    
    expect(interpreter.program("b")).toBe("alternative b");
  });
  
  it("may have an interpretation", function() {
    interpreter.aNotB = f.atom(/a/, ["b"], function interpretation() {
      return "certainly not b";
    });
    
    expect(interpreter.aNotB("a")).toBe("certainly not b");
  });
  
});
